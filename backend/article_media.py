"""Public, allowlisted article images backed by Emergent Object Storage."""
import os
import threading

import requests
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from starlette.concurrency import run_in_threadpool

_storage_key = None
_key_lock = threading.Lock()


def storage_url():
    return os.environ["INTEGRATION_PROXY_URL"].rstrip("/") + "/objstore/api/v1/storage"


def init_storage(force=False):
    global _storage_key
    with _key_lock:
        if _storage_key and not force:
            return _storage_key
        response = requests.post(
            f"{storage_url()}/init",
            json={"emergent_key": os.environ["EMERGENT_LLM_KEY"]}, timeout=30,
        )
        response.raise_for_status()
        _storage_key = response.json()["storage_key"]
        return _storage_key


def storage_request(method, path, **kwargs):
    headers = kwargs.pop("headers", {})
    for attempt in range(2):
        response = requests.request(
            method, f"{storage_url()}/objects/{path}",
            headers={**headers, "X-Storage-Key": init_storage(force=attempt == 1)},
            timeout=120, **kwargs,
        )
        if response.status_code != 404 or attempt:
            response.raise_for_status()
            return response


def put_object(path, data, content_type):
    return storage_request("PUT", path, data=data, headers={"Content-Type": content_type}).json()


def get_object(path):
    return storage_request("GET", path).content


def create_media_router(db):
    router = APIRouter()

    @router.get("/article-media/{media_id}")
    async def article_media(media_id: str):
        record = await db.article_media.find_one(
            {"id": media_id, "is_deleted": False, "public": True}, {"_id": 0}
        )
        if not record:
            raise HTTPException(status_code=404, detail="Imagem não encontrada")
        try:
            data = await run_in_threadpool(get_object, record["storage_path"])
        except (requests.RequestException, KeyError):
            raise HTTPException(status_code=503, detail="Imagem temporariamente indisponível")
        return Response(data, media_type=record["content_type"], headers={
            "Cache-Control": "public, max-age=31536000, immutable",
            "ETag": f'"{record["sha256"]}"',
            "X-Content-Type-Options": "nosniff",
        })

    return router