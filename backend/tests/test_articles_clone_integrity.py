import hashlib
import json
import os
import re
from pathlib import Path

import pytest
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from pymongo import MongoClient


# Articles clone regression: content integrity, media integrity, and public API hardening.
ROOT = Path("/app")
load_dotenv(ROOT / "frontend" / ".env")
BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")

SOURCE_PATH = ROOT / "backend" / "content_sources" / "source_articles.json"
SOURCE_ARTICLES = json.loads(SOURCE_PATH.read_text(encoding="utf-8"))
EXPECTED_SLUGS = {
    "usinagem-5-eixos-precisao-para-designs-complexos",
    "solados-nuvem-transformam-o-conforto-personalizado",
    "solado-e-tpu-inovacao-alta-performance-para-calcados",
}
SOURCE_BY_SLUG = {item["slug"]: item for item in SOURCE_ARTICLES}


@pytest.fixture(scope="session")
def base_url():
    assert BASE_URL, "REACT_APP_BACKEND_URL is required"
    return BASE_URL.rstrip("/")


@pytest.fixture(scope="session")
def api_client():
    session = requests.Session()
    session.headers.update({
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
    })
    return session


@pytest.fixture(scope="session")
def admin_token(api_client, base_url):
    response = api_client.post(
        f"{base_url}/api/admin/login",
        json={"login": "gi888", "senha": "Giinova2020"},
        timeout=20,
    )
    if response.status_code != 200:
        pytest.skip("Admin login unavailable; skipping temp CRUD format tests")
    token = response.json().get("token")
    assert isinstance(token, str) and token
    return token


@pytest.fixture
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


def _normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text or "").strip()


def _extract_structure(html: str) -> dict:
    soup = BeautifulSoup(html or "", "html.parser")
    return {
        "text": _normalize_text(soup.get_text(" ", strip=True)),
        "heading_tags": [h.name for h in soup.find_all(["h2", "h3", "h4"])],
        "heading_texts": [_normalize_text(h.get_text(" ", strip=True)) for h in soup.find_all(["h2", "h3", "h4"])],
        "strong_texts": [_normalize_text(s.get_text(" ", strip=True)) for s in soup.find_all("strong")],
        "hrefs": [a.get("href") for a in soup.find_all("a")],
        "img_count": len(soup.find_all("img")),
    }


def _sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def test_get_articles_has_exact_three_expected_published(api_client, base_url):
    response = api_client.get(f"{base_url}/api/articles", timeout=30)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 3

    slugs = {item.get("slug") for item in data}
    assert slugs == EXPECTED_SLUGS
    assert all(item.get("published") is True for item in data)


@pytest.mark.parametrize("slug", sorted(EXPECTED_SLUGS))
def test_article_detail_exact_title_and_html_format(api_client, base_url, slug):
    response = api_client.get(f"{base_url}/api/articles/{slug}", timeout=30)
    assert response.status_code == 200
    article = response.json()
    source = SOURCE_BY_SLUG[slug]

    assert article["slug"] == source["slug"]
    assert article["title"] == source["title"]
    assert article["content_format"] == "html"
    assert isinstance(article.get("content"), str) and len(article["content"]) > 1000


@pytest.mark.parametrize("slug", sorted(EXPECTED_SLUGS))
def test_article_dom_matches_source_snapshot(api_client, base_url, slug):
    response = api_client.get(f"{base_url}/api/articles/{slug}", timeout=30)
    assert response.status_code == 200
    api_article = response.json()
    source_article = SOURCE_BY_SLUG[slug]

    api_struct = _extract_structure(api_article["content"])
    source_struct = _extract_structure(source_article["content"])

    assert api_struct["text"] == source_struct["text"]
    assert api_struct["heading_tags"] == source_struct["heading_tags"]
    assert api_struct["heading_texts"] == source_struct["heading_texts"]
    assert api_struct["strong_texts"] == source_struct["strong_texts"]
    assert api_struct["hrefs"] == source_struct["hrefs"]


@pytest.mark.parametrize("slug", sorted(EXPECTED_SLUGS))
def test_article_body_has_no_inline_images(api_client, base_url, slug):
    response = api_client.get(f"{base_url}/api/articles/{slug}", timeout=30)
    assert response.status_code == 200
    article = response.json()
    struct = _extract_structure(article["content"])
    assert struct["img_count"] == 0


@pytest.mark.parametrize("slug", sorted(EXPECTED_SLUGS))
def test_cover_media_webp_and_sha_matches_origin(api_client, base_url, slug):
    article_response = api_client.get(f"{base_url}/api/articles/{slug}", timeout=30)
    assert article_response.status_code == 200
    article = article_response.json()
    cover = article.get("cover_image", "")
    assert cover.startswith("/api/article-media/")

    media_id = cover.rsplit("/", 1)[-1]
    media_response = api_client.get(f"{base_url}{cover}", timeout=60)
    assert media_response.status_code == 200
    assert media_response.headers.get("content-type", "").startswith("image/webp")

    source_cover = SOURCE_BY_SLUG[slug]["cover_image"]
    source_response = api_client.get(source_cover, timeout=60)
    assert source_response.status_code == 200

    assert _sha256(media_response.content) == _sha256(source_response.content)
    etag = media_response.headers.get("etag", "").strip('"')
    assert etag == _sha256(media_response.content)


def test_article_media_collection_has_metadata_only_for_three_covers():
    load_dotenv(ROOT / "backend" / ".env")
    mongo_url = os.environ.get("MONGO_URL")
    db_name = os.environ.get("DB_NAME")
    assert mongo_url and db_name, "MONGO_URL and DB_NAME are required"

    with MongoClient(mongo_url) as client:
        db = client[db_name]
        records = list(db.article_media.find({"public": True, "is_deleted": False}, {"_id": 0}))

    assert len(records) == 3
    for record in records:
        assert isinstance(record.get("id"), str) and record["id"]
        assert isinstance(record.get("storage_path"), str) and record["storage_path"]
        assert isinstance(record.get("sha256"), str) and len(record["sha256"]) == 64
        assert record.get("content_type") == "image/webp"
        assert "data" not in record and "data_b64" not in record


def test_article_media_invalid_ids_return_404(api_client, base_url):
    r1 = api_client.get(f"{base_url}/api/article-media/nonexistent-id", timeout=20)
    assert r1.status_code == 404

    r2 = api_client.get(f"{base_url}/api/article-media/..%2Fsecret", timeout=20)
    assert r2.status_code == 404


def test_upload_not_public_and_no_secret_leak(api_client, base_url):
    files = {"file": ("x.png", b"not-real-png", "image/png")}
    upload = requests.post(f"{base_url}/api/uploads", files=files, timeout=20)
    assert upload.status_code == 401

    articles = api_client.get(f"{base_url}/api/articles", timeout=20)
    detail = api_client.get(
        f"{base_url}/api/articles/{sorted(EXPECTED_SLUGS)[0]}", timeout=20
    )
    combined = json.dumps({"articles": articles.json(), "detail": detail.json()}, ensure_ascii=False)

    assert "MONGO_URL" not in combined
    assert "EMERGENT_LLM_KEY" not in combined
    assert "storage_key" not in combined
    assert "Authorization" not in combined


def test_temp_crud_preserves_html_content_format(api_client, base_url, auth_headers):
    payload = {
        "title": "TEMP_HTML_FORMAT_QA",
        "excerpt": "temp",
        "content": "<h2><strong>HTML bloco</strong></h2><p>Corpo <a href=\"https://example.com\">link</a></p>",
        "content_format": "html",
        "published": False,
    }
    created = api_client.post(
        f"{base_url}/api/articles", json=payload, headers=auth_headers, timeout=20
    )
    assert created.status_code == 200
    doc = created.json()
    article_id = doc["id"]

    try:
        fetched = api_client.get(f"{base_url}/api/articles/{doc['slug']}", timeout=20)
        assert fetched.status_code == 200
        assert fetched.json()["content_format"] == "html"

        updated = api_client.put(
            f"{base_url}/api/articles/{article_id}",
            json={"excerpt": "temp-updated"},
            headers=auth_headers,
            timeout=20,
        )
        assert updated.status_code == 200
        assert updated.json()["content_format"] == "html"
    finally:
        api_client.delete(f"{base_url}/api/articles/{article_id}", headers=auth_headers, timeout=20)


def test_temp_crud_preserves_markdown_content_format(api_client, base_url, auth_headers):
    payload = {
        "title": "TEMP_MARKDOWN_FORMAT_QA",
        "excerpt": "temp",
        "content": "# Heading\n\nTexto **forte**",
        "content_format": "markdown",
        "published": False,
    }
    created = api_client.post(
        f"{base_url}/api/articles", json=payload, headers=auth_headers, timeout=20
    )
    assert created.status_code == 200
    doc = created.json()
    article_id = doc["id"]

    try:
        fetched = api_client.get(f"{base_url}/api/articles/{doc['slug']}", timeout=20)
        assert fetched.status_code == 200
        assert fetched.json()["content_format"] == "markdown"

        updated = api_client.put(
            f"{base_url}/api/articles/{article_id}",
            json={"title": "TEMP_MARKDOWN_FORMAT_QA_EDIT"},
            headers=auth_headers,
            timeout=20,
        )
        assert updated.status_code == 200
        assert updated.json()["content_format"] == "markdown"
    finally:
        api_client.delete(f"{base_url}/api/articles/{article_id}", headers=auth_headers, timeout=20)
