from fastapi import FastAPI, APIRouter, HTTPException, Header, Depends, UploadFile, File
from fastapi.responses import Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import re
import base64
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

ALLOWED_IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".avif"}
ALLOWED_IMAGE_MIME = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".avif": "image/avif",
}
MAX_UPLOAD_BYTES = 8 * 1024 * 1024  # 8 MB

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ================== Admin credentials ==================
ADMIN_LOGIN = "gi888"
ADMIN_PASSWORD = "Giinova2020"


def _make_token(login: str, password: str) -> str:
    raw = f"{login}:{password}".encode("utf-8")
    return base64.urlsafe_b64encode(raw).decode("utf-8")


def _verify_token(token: str) -> bool:
    try:
        raw = base64.urlsafe_b64decode(token.encode("utf-8")).decode("utf-8")
        login, password = raw.split(":", 1)
        return login == ADMIN_LOGIN and password == ADMIN_PASSWORD
    except Exception:
        return False


def require_admin(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Não autenticado")
    if not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Token inválido")
    token = authorization.split(" ", 1)[1].strip()
    if not _verify_token(token):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    return True


# ================== Utils ==================
def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[àáâãäå]", "a", text)
    text = re.sub(r"[èéêë]", "e", text)
    text = re.sub(r"[ìíîï]", "i", text)
    text = re.sub(r"[òóôõö]", "o", text)
    text = re.sub(r"[ùúûü]", "u", text)
    text = re.sub(r"[ç]", "c", text)
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"\s+", "-", text)
    text = re.sub(r"-+", "-", text).strip("-")
    return text or str(uuid.uuid4())[:8]


# ================== Legacy Status ==================
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


# ================== Article Models ==================
class Article(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str
    title: str
    excerpt: str = ""
    content: str = ""  # markdown
    cover_image: Optional[str] = ""
    category: Optional[str] = ""
    author: Optional[str] = "Equipe Gi Inovações"
    read_time: Optional[str] = ""  # ex: "5 min"
    published: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ArticleCreate(BaseModel):
    title: str
    excerpt: Optional[str] = ""
    content: Optional[str] = ""
    cover_image: Optional[str] = ""
    category: Optional[str] = ""
    author: Optional[str] = "Equipe Gi Inovações"
    read_time: Optional[str] = ""
    slug: Optional[str] = ""
    published: Optional[bool] = True


class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    cover_image: Optional[str] = None
    category: Optional[str] = None
    author: Optional[str] = None
    read_time: Optional[str] = None
    slug: Optional[str] = None
    published: Optional[bool] = None


class LoginPayload(BaseModel):
    login: str
    senha: str


def _serialize(doc: dict) -> dict:
    if not doc:
        return doc
    doc.pop("_id", None)
    for k in ("created_at", "updated_at", "timestamp"):
        if k in doc and isinstance(doc[k], datetime):
            doc[k] = doc[k].isoformat()
    return doc


def _to_article(doc: dict) -> Article:
    for k in ("created_at", "updated_at"):
        if k in doc and isinstance(doc[k], str):
            try:
                doc[k] = datetime.fromisoformat(doc[k])
            except Exception:
                pass
    return Article(**doc)


# ================== Routes ==================
@api_router.get("/")
async def root():
    return {"message": "Hello World"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.model_dump())
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check.get('timestamp'), str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks


# ================== Admin auth ==================
@api_router.post("/admin/login")
async def admin_login(payload: LoginPayload):
    if payload.login == ADMIN_LOGIN and payload.senha == ADMIN_PASSWORD:
        return {"token": _make_token(payload.login, payload.senha)}
    raise HTTPException(status_code=401, detail="Login ou senha inválidos")


@api_router.get("/admin/verify")
async def admin_verify(_: bool = Depends(require_admin)):
    return {"ok": True}


# ================== Articles CRUD ==================
async def _ensure_unique_slug(base_slug: str, exclude_id: Optional[str] = None) -> str:
    slug = base_slug
    i = 2
    while True:
        query = {"slug": slug}
        if exclude_id:
            query["id"] = {"$ne": exclude_id}
        existing = await db.articles.find_one(query)
        if not existing:
            return slug
        slug = f"{base_slug}-{i}"
        i += 1


@api_router.get("/articles")
async def list_articles(only_published: bool = True, limit: int = 200):
    query = {"published": True} if only_published else {}
    docs = await db.articles.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)
    return [_serialize(d) for d in docs]


@api_router.get("/articles/{slug}")
async def get_article(slug: str):
    doc = await db.articles.find_one({"slug": slug}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Artigo não encontrado")
    return _serialize(doc)


@api_router.post("/articles")
async def create_article(payload: ArticleCreate, _: bool = Depends(require_admin)):
    base_slug = payload.slug.strip() if payload.slug else slugify(payload.title)
    if not base_slug:
        base_slug = slugify(payload.title)
    slug = await _ensure_unique_slug(slugify(base_slug))

    article = Article(
        slug=slug,
        title=payload.title,
        excerpt=payload.excerpt or "",
        content=payload.content or "",
        cover_image=payload.cover_image or "",
        category=payload.category or "",
        author=payload.author or "Equipe Gi Inovações",
        read_time=payload.read_time or "",
        published=payload.published if payload.published is not None else True,
    )
    doc = article.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["updated_at"] = doc["updated_at"].isoformat()
    await db.articles.insert_one(doc)
    return _serialize(doc)


@api_router.put("/articles/{article_id}")
async def update_article(article_id: str, payload: ArticleUpdate, _: bool = Depends(require_admin)):
    existing = await db.articles.find_one({"id": article_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Artigo não encontrado")

    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}

    if "slug" in update_data and update_data["slug"]:
        update_data["slug"] = await _ensure_unique_slug(slugify(update_data["slug"]), exclude_id=article_id)
    elif "title" in update_data and (not existing.get("slug") or existing.get("slug", "").startswith("untitled")):
        update_data["slug"] = await _ensure_unique_slug(slugify(update_data["title"]), exclude_id=article_id)

    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()

    await db.articles.update_one({"id": article_id}, {"$set": update_data})
    updated = await db.articles.find_one({"id": article_id}, {"_id": 0})
    return _serialize(updated)


@api_router.delete("/articles/{article_id}")
async def delete_article(article_id: str, _: bool = Depends(require_admin)):
    res = await db.articles.delete_one({"id": article_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Artigo não encontrado")
    return {"ok": True}


# ================== Uploads (armazenados no MongoDB) ==================
@api_router.post("/uploads")
async def upload_image(file: UploadFile = File(...), _: bool = Depends(require_admin)):
    filename = file.filename or "arquivo"
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_IMAGE_EXT:
        raise HTTPException(
            status_code=400,
            detail=f"Formato não suportado. Use: {', '.join(sorted(ALLOWED_IMAGE_EXT))}",
        )

    contents = await file.read()
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="Arquivo muito grande (máx. 8MB)")

    file_id = uuid.uuid4().hex
    mime = file.content_type or ALLOWED_IMAGE_MIME.get(ext, "application/octet-stream")

    await db.uploads.insert_one({
        "id": file_id,
        "ext": ext,
        "content_type": mime,
        "size": len(contents),
        "original_name": filename,
        "data_b64": base64.b64encode(contents).decode("ascii"),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    return {
        "url": f"/api/uploads/{file_id}{ext}",
        "filename": f"{file_id}{ext}",
        "size": len(contents),
        "content_type": mime,
    }


@api_router.get("/uploads/{name}")
async def get_upload(name: str):
    # name may include extension; strip it for lookup
    stem = name.rsplit(".", 1)[0]
    doc = await db.uploads.find_one({"id": stem}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Arquivo não encontrado")
    try:
        raw = base64.b64decode(doc["data_b64"])
    except Exception:
        raise HTTPException(status_code=500, detail="Arquivo inválido")
    return Response(
        content=raw,
        media_type=doc.get("content_type") or "application/octet-stream",
        headers={"Cache-Control": "public, max-age=31536000, immutable"},
    )


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
