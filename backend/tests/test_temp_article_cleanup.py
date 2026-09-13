import os

import pytest
import requests
from dotenv import load_dotenv


# Cleanup utility test: remove temporary authored records created during QA runs.
load_dotenv("/app/frontend/.env")
BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")


@pytest.fixture(scope="session")
def base_url():
    assert BASE_URL, "REACT_APP_BACKEND_URL is required"
    return BASE_URL.rstrip("/")


def test_cleanup_temp_articles(base_url):
    session = requests.Session()
    login = session.post(
        f"{base_url}/api/admin/login",
        json={"login": "gi888", "senha": "Giinova2020"},
        timeout=20,
    )
    assert login.status_code == 200
    token = login.json().get("token")
    assert token

    headers = {"Authorization": f"Bearer {token}"}
    listed = session.get(
        f"{base_url}/api/articles", params={"only_published": "false"}, headers=headers, timeout=20
    )
    assert listed.status_code == 200
    items = listed.json() or []

    temp_items = [
        a for a in items
        if str(a.get("title", "")).startswith("TEMP_") or str(a.get("title", "")).startswith("TEST_")
    ]

    for article in temp_items:
        response = session.delete(
            f"{base_url}/api/articles/{article['id']}", headers=headers, timeout=20
        )
        assert response.status_code in (200, 404)
