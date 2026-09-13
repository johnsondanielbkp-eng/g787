"""One-time, repeatable import of the three user-approved public articles.

Run `python import_articles.py` to download source snapshots without publishing.
Run `python import_articles.py --apply` to store original images and publish only
these three articles. Other records become drafts (never deleted).
"""
import argparse
import hashlib
import io
import json
import math
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from PIL import Image
from pymongo import MongoClient

from article_media import put_object

ROOT = Path(__file__).parent
SOURCES = ROOT / "content_sources"
SLUGS = [
    "usinagem-5-eixos-precisao-para-designs-complexos",
    "solados-nuvem-transformam-o-conforto-personalizado",
    "solado-e-tpu-inovacao-alta-performance-para-calcados",
]
ORIGIN = "https://gicompany.ind.br/"
SESSION = requests.Session()
SESSION.headers.update({
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
})


def fetch(url):
    response = SESSION.get(url, timeout=60)
    response.raise_for_status()
    return response.content


def extract(slug):
    url = urljoin(ORIGIN, slug + "/")
    raw = fetch(url)
    (SOURCES / f"{slug}.source.html").write_bytes(raw)
    soup = BeautifulSoup(raw, "html.parser")
    post = soup.select_one('[data-elementor-type="single-post"]')
    widget = post.select_one('.elementor-widget-theme-post-content') if post else None
    if not widget or not post.h1:
        raise ValueError(f"Artigo não encontrado na página: {url}")
    body = widget.select_one('.elementor-widget-container') or widget
    cover = post.select_one('.elementor-widget-image img')
    if not cover or len(body.get_text(strip=True)) < 1000:
        raise ValueError(f"Conteúdo incompleto: {url}")
    # Remove executable/non-editorial elements, preserve text and inline emphasis.
    for tag in body.select('script, style, iframe, noscript'):
        tag.decompose()
    for img in body.select('img'):
        img['src'] = urljoin(url, img.get('data-lazy-src') or img.get('src', ''))
        for attr in ('srcset', 'data-lazy-src', 'data-lazy-srcset', 'data-lazy-sizes'):
            img.attrs.pop(attr, None)
    for link in body.select('a[href]'):
        link['href'] = urljoin(url, link['href'])
    content = body.decode_contents().strip()
    (SOURCES / f"{slug}.body.html").write_text(content, encoding="utf-8")
    date = soup.select_one('meta[property="article:published_time"]')
    if not date:
        raise ValueError(f"Data original não encontrada: {url}")
    description = soup.select_one('meta[name="description"]')
    categories = [c.removeprefix('category-') for c in post.get('class', []) if c.startswith('category-')]
    cover_url = urljoin(url, cover.get('data-lazy-src') or cover['src'])
    return {
        "id": str(uuid.uuid5(uuid.NAMESPACE_URL, url)), "slug": slug,
        "title": post.h1.get_text(), "excerpt": description['content'] if description else "",
        "content": content, "content_format": "html", "source_url": url,
        "cover_image": cover_url, "cover_alt": cover.get('alt', ''),
        "category": (categories[0].replace('-', ' ').capitalize() if categories else ''),
        "author": "Gi Inovações", "read_time": f"{math.ceil(len(body.get_text().split()) / 200)} min",
        "created_at": date['content'], "updated_at": datetime.now(timezone.utc).isoformat(),
        "published": True,
    }


def store_image(db, url):
    data = fetch(url)
    image = Image.open(io.BytesIO(data))
    image.verify()
    mime = Image.MIME[image.format]
    if mime not in {"image/webp", "image/png", "image/jpeg", "image/gif"}:
        raise ValueError(f"Formato de imagem inesperado: {mime}")
    digest = hashlib.sha256(data).hexdigest()
    media_id = str(uuid.uuid5(uuid.NAMESPACE_URL, f"{url}#{digest}"))
    existing = db.article_media.find_one({"id": media_id, "is_deleted": False}, {"_id": 0})
    if not existing:
        ext = {"image/webp": ".webp", "image/png": ".png", "image/jpeg": ".jpg", "image/gif": ".gif"}[mime]
        result = put_object(f"{os.environ['ARTICLE_STORAGE_PREFIX']}/imports/{uuid.uuid4()}{ext}", data, mime)
        db.article_media.update_one({"id": media_id}, {"$set": {
            "id": media_id, "source_url": url, "storage_path": result['path'],
            "sha256": digest, "content_type": mime, "size": len(data),
            "width": image.width, "height": image.height,
            "original_filename": Path(urlparse(url).path).name,
            "is_deleted": False, "public": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }}, upsert=True)
    return f"/api/article-media/{media_id}"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()
    load_dotenv(ROOT / '.env')
    SOURCES.mkdir(exist_ok=True)
    articles = [extract(slug) for slug in SLUGS]
    (SOURCES / 'source_articles.json').write_text(json.dumps(articles, ensure_ascii=False, indent=2), encoding='utf-8')
    if args.apply:
        with MongoClient(os.environ['MONGO_URL']) as client:
            db = client[os.environ['DB_NAME']]
            # Back up all records before any publication changes; no BSON in JSON.
            backup = list(db.articles.find({}, {'_id': 0}))
            stamp = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
            (SOURCES / f'articles-backup-{stamp}.json').write_text(json.dumps(backup, ensure_ascii=False, indent=2, default=str), encoding='utf-8')
            # Complete ALL media uploads before modifying publication state.
            for article in articles:
                article['cover_image'] = store_image(db, article['cover_image'])
                body = BeautifulSoup(article['content'], 'html.parser')
                for img in body.select('img[src]'):
                    img['src'] = store_image(db, img['src'])
                article['content'] = body.decode_contents()
            for article in articles:
                current = db.articles.find_one({'slug': article['slug']}, {'_id': 0})
                if current:
                    article['id'] = current['id']
                db.articles.update_one({'slug': article['slug']}, {'$set': article}, upsert=True)
            db.articles.update_many({'slug': {'$nin': SLUGS}, 'published': True}, {'$set': {'published': False}})
            print('Publicados:', db.articles.count_documents({'published': True}))
    for article in articles:
        print(article['slug'], len(article['content']), article['cover_image'])


if __name__ == '__main__':
    main()