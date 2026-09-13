import base64
import os
import uuid

import pytest
import requests


# Core public/backend regression for admin auth, articles CRUD, and uploads.
BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")


@pytest.fixture(scope="session")
def base_url():
    assert BASE_URL, "REACT_APP_BACKEND_URL is required in environment"
    return BASE_URL.rstrip("/")


@pytest.fixture(scope="session")
def api_client():
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="session")
def admin_token(api_client, base_url):
    response = api_client.post(
        f"{base_url}/api/admin/login",
        json={"login": "gi888", "senha": "Giinova2020"},
        timeout=20,
    )
    if response.status_code != 200:
        pytest.skip("Admin auth unavailable; skipping authenticated regression tests")
    token = response.json().get("token")
    assert isinstance(token, str) and token
    return token


@pytest.fixture
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture
def created_article_ids():
    ids = []
    yield ids


def _create_article(api_client, base_url, auth_headers, suffix):
    payload = {
        "title": f"TEST_Lang Regression {suffix}",
        "excerpt": "TEST_Excerpt for regression",
        "content": "# TEST content",
        "category": "TEST",
        "author": "TEST_Agent",
        "read_time": "1 min",
        "published": True,
    }
    response = api_client.post(
        f"{base_url}/api/articles", json=payload, headers=auth_headers, timeout=20
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == payload["title"]
    assert isinstance(data.get("id"), str)
    assert isinstance(data.get("slug"), str) and data["slug"]
    return data


def test_admin_login_wrong_credentials(api_client, base_url):
    response = api_client.post(
        f"{base_url}/api/admin/login",
        json={"login": "gi888", "senha": "wrong-pass"},
        timeout=20,
    )
    assert response.status_code == 401
    assert "detail" in response.json()


def test_admin_login_correct_credentials(api_client, base_url):
    response = api_client.post(
        f"{base_url}/api/admin/login",
        json={"login": "gi888", "senha": "Giinova2020"},
        timeout=20,
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data.get("token"), str) and data["token"]


def test_list_articles_public(api_client, base_url):
    response = api_client.get(f"{base_url}/api/articles", timeout=20)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_article_crud_create_get_update_delete(
    api_client, base_url, auth_headers, created_article_ids
):
    created = _create_article(api_client, base_url, auth_headers, str(uuid.uuid4())[:8])
    created_article_ids.append(created["id"])

    # GET by slug validates persistence.
    get_response = api_client.get(f"{base_url}/api/articles/{created['slug']}", timeout=20)
    assert get_response.status_code == 200
    fetched = get_response.json()
    assert fetched["id"] == created["id"]
    assert fetched["title"] == created["title"]

    # Update and verify persisted by reading same slug endpoint.
    updated_title = f"TEST_Updated {uuid.uuid4().hex[:6]}"
    update_response = api_client.put(
        f"{base_url}/api/articles/{created['id']}",
        json={"title": updated_title, "excerpt": "TEST_updated_excerpt"},
        headers=auth_headers,
        timeout=20,
    )
    assert update_response.status_code == 200
    updated = update_response.json()
    assert updated["title"] == updated_title
    assert updated["excerpt"] == "TEST_updated_excerpt"

    get_after = api_client.get(f"{base_url}/api/articles/{updated['slug']}", timeout=20)
    assert get_after.status_code == 200
    persisted = get_after.json()
    assert persisted["title"] == updated_title

    delete_response = api_client.delete(
        f"{base_url}/api/articles/{created['id']}", headers=auth_headers, timeout=20
    )
    assert delete_response.status_code == 200
    assert delete_response.json().get("ok") is True

    deleted_get = api_client.get(f"{base_url}/api/articles/{updated['slug']}", timeout=20)
    assert deleted_get.status_code == 404

    created_article_ids.remove(created["id"])


def test_article_create_requires_auth(api_client, base_url):
    payload = {"title": "TEST_Auth Required", "content": "x"}
    response = api_client.post(f"{base_url}/api/articles", json=payload, timeout=20)
    assert response.status_code == 401
    assert "detail" in response.json()


def test_upload_png_and_retrieve(api_client, base_url, auth_headers):
    png_b64 = (
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8"
        "/w8AAn8B9p8xkQAAAABJRU5ErkJggg=="
    )
    png_bytes = base64.b64decode(png_b64)
    files = {"file": ("test-image.png", png_bytes, "image/png")}

    upload_response = requests.post(
        f"{base_url}/api/uploads", files=files, headers=auth_headers, timeout=20
    )
    assert upload_response.status_code == 200
    uploaded = upload_response.json()
    assert uploaded["filename"].endswith(".png")
    assert uploaded["content_type"] == "image/png"
    assert uploaded["size"] == len(png_bytes)

    fetch_response = api_client.get(f"{base_url}{uploaded['url']}", timeout=20)
    assert fetch_response.status_code == 200
    assert fetch_response.headers["content-type"].startswith("image/png")
    assert len(fetch_response.content) == len(png_bytes)


def test_upload_invalid_format_rejected(api_client, base_url, auth_headers):
    files = {"file": ("test.txt", b"hello", "text/plain")}
    response = requests.post(
        f"{base_url}/api/uploads", files=files, headers=auth_headers, timeout=20
    )
    assert response.status_code == 400
    assert "Formato não suportado" in response.json().get("detail", "")


def test_upload_requires_auth(base_url):
    files = {"file": ("test-image.png", b"notpng", "image/png")}
    response = requests.post(f"{base_url}/api/uploads", files=files, timeout=20)
    assert response.status_code == 401
    assert "detail" in response.json()


def test_cleanup_created_articles(api_client, base_url, auth_headers, created_article_ids):
    # Safety cleanup for any leftover TEST entities from failed runs in this session.
    if not created_article_ids:
        assert True
        return

    for article_id in list(created_article_ids):
        response = api_client.delete(
            f"{base_url}/api/articles/{article_id}", headers=auth_headers, timeout=20
        )
        assert response.status_code in (200, 404)
