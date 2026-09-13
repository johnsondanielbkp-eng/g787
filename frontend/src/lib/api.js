import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

const TOKEN_KEY = "gi_admin_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const authHeaders = () => {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
};

// ============ Auth ============
export async function adminLogin(login, senha) {
  const { data } = await axios.post(`${API}/admin/login`, { login, senha });
  if (data?.token) setToken(data.token);
  return data;
}

export async function adminVerify() {
  const { data } = await axios.get(`${API}/admin/verify`, {
    headers: authHeaders(),
  });
  return data;
}

// ============ Articles ============
export async function listArticles({ onlyPublished = true } = {}) {
  const { data } = await axios.get(`${API}/articles`, {
    params: { only_published: onlyPublished },
    headers: onlyPublished ? {} : authHeaders(),
  });
  return data;
}

export async function listAllArticlesAdmin() {
  const { data } = await axios.get(`${API}/articles`, {
    params: { only_published: false },
    headers: authHeaders(),
  });
  return data;
}

export async function getArticle(slug) {
  const { data } = await axios.get(`${API}/articles/${slug}`);
  return data;
}

export async function createArticle(payload) {
  const { data } = await axios.post(`${API}/articles`, payload, {
    headers: authHeaders(),
  });
  return data;
}

export async function updateArticle(id, payload) {
  const { data } = await axios.put(`${API}/articles/${id}`, payload, {
    headers: authHeaders(),
  });
  return data;
}

export async function deleteArticle(id) {
  const { data } = await axios.delete(`${API}/articles/${id}`, {
    headers: authHeaders(),
  });
  return data;
}

// ============ Uploads ============
export async function uploadImage(file, onProgress) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await axios.post(`${API}/uploads`, form, {
    headers: { ...authHeaders() },
    onUploadProgress: (evt) => {
      if (onProgress && evt.total) {
        onProgress(Math.round((evt.loaded / evt.total) * 100));
      }
    },
  });
  return data; // { url, filename, size, content_type }
}

// Resolve URL relativa para o backend (upload retorna /api/uploads/...)
export function resolveMediaUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/api/")) return `${process.env.REACT_APP_BACKEND_URL}${url}`;
  return url;
}
