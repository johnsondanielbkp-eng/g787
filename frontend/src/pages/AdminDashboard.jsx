import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  listAllArticlesAdmin,
  createArticle,
  updateArticle,
  deleteArticle,
  adminVerify,
  clearToken,
  getToken,
  uploadImage,
  resolveMediaUrl,
} from "../lib/api";
import { renderMarkdown } from "../lib/markdown";

const EMPTY = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  cover_image: "",
  category: "",
  author: "Equipe Gi Inovações",
  read_time: "",
  published: true,
};

export default function AdminDashboard() {
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // article being edited or null
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);
  const [insertingImage, setInsertingImage] = useState(false);
  const coverInputRef = useRef(null);
  const contentImgInputRef = useRef(null);
  const contentTextareaRef = useRef(null);

  const previewHtml = useMemo(() => renderMarkdown(form.content), [form.content]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await listAllArticlesAdmin();
      setItems(data || []);
    } catch (e) {
      if (e?.response?.status === 401) {
        clearToken();
        nav("/admin/login", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!getToken()) {
      nav("/admin/login", { replace: true });
      return;
    }
    adminVerify()
      .then(() => load())
      .catch(() => {
        clearToken();
        nav("/admin/login", { replace: true });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startNew = () => {
    setEditing(null);
    setForm(EMPTY);
    setPreview(false);
    setMsg(""); setErr("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startEdit = (a) => {
    setEditing(a);
    setForm({
      title: a.title || "",
      slug: a.slug || "",
      excerpt: a.excerpt || "",
      content: a.content || "",
      cover_image: a.cover_image || "",
      category: a.category || "",
      author: a.author || "Equipe Gi Inovações",
      read_time: a.read_time || "",
      published: a.published !== false,
    });
    setPreview(false);
    setMsg(""); setErr("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onChange = (k) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setMsg("");
    if (!form.title.trim()) {
      setErr("Título é obrigatório");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form };
      if (editing) {
        await updateArticle(editing.id, payload);
        setMsg("Artigo atualizado.");
      } else {
        await createArticle(payload);
        setMsg("Artigo publicado.");
        setForm(EMPTY);
        setEditing(null);
      }
      await load();
    } catch (e2) {
      setErr(e2?.response?.data?.detail || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (a) => {
    if (!window.confirm(`Excluir o artigo "${a.title}"?`)) return;
    try {
      await deleteArticle(a.id);
      if (editing?.id === a.id) startNew();
      await load();
    } catch (e2) {
      setErr(e2?.response?.data?.detail || "Erro ao excluir");
    }
  };

  // ============ Upload da capa ============
  const onCoverFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr(""); setMsg("");
    setUploadingCover(true);
    try {
      const res = await uploadImage(file);
      setForm((f) => ({ ...f, cover_image: res.url }));
      setMsg("Capa enviada.");
    } catch (e2) {
      setErr(e2?.response?.data?.detail || "Falha ao enviar imagem");
    } finally {
      setUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  const clearCover = () => setForm((f) => ({ ...f, cover_image: "" }));

  // ============ Upload de imagem inline no conteúdo ============
  const onContentImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr(""); setMsg("");
    setInsertingImage(true);
    try {
      const res = await uploadImage(file);
      const alt = file.name.replace(/\.[^.]+$/, "");
      const snippet = `\n\n![${alt}](${res.url})\n\n`;

      const ta = contentTextareaRef.current;
      if (ta) {
        const start = ta.selectionStart ?? form.content.length;
        const end = ta.selectionEnd ?? form.content.length;
        const before = form.content.slice(0, start);
        const after = form.content.slice(end);
        const next = before + snippet + after;
        setForm((f) => ({ ...f, content: next }));
        // reposicionar cursor após a inserção
        requestAnimationFrame(() => {
          ta.focus();
          const pos = (before + snippet).length;
          ta.setSelectionRange(pos, pos);
        });
      } else {
        setForm((f) => ({ ...f, content: (f.content || "") + snippet }));
      }
      setMsg("Imagem inserida no conteúdo.");
    } catch (e2) {
      setErr(e2?.response?.data?.detail || "Falha ao enviar imagem");
    } finally {
      setInsertingImage(false);
      if (contentImgInputRef.current) contentImgInputRef.current.value = "";
    }
  };

  const logout = () => {
    clearToken();
    nav("/admin/login", { replace: true });
  };

  return (
    <main className="page page-admin" lang="pt-BR" data-testid="admin-dashboard">
      <section className="section admin-hero">
        <div className="shell">
          <div className="admin-topbar">
            <div>
              <span className="eyebrow">Painel Gi Inovações</span>
              <h1 className="h-section" style={{ marginTop: ".4rem" }} data-testid="admin-dashboard-title">Gerenciar artigos</h1>
            </div>
            <div className="admin-topbar-actions">
              <button className="btn-ghost" onClick={startNew} data-testid="admin-new-article">+ Novo artigo</button>
              <button className="btn-ghost" onClick={logout} data-testid="admin-logout">Sair</button>
            </div>
          </div>
        </div>
      </section>

      <section className="section admin-editor-section">
        <div className="shell admin-layout">
          {/* ================== EDITOR ================== */}
          <form className="admin-editor" onSubmit={onSubmit} data-testid="admin-article-form">
            <div className="admin-editor-head">
              <h2 className="h-tag" data-testid="admin-editor-title">{editing ? "Editar artigo" : "Novo artigo"}</h2>
              <div className="admin-editor-tabs">
                <button type="button" className={!preview ? "active" : ""} onClick={() => setPreview(false)} data-testid="admin-editor-tab">
                  Editar
                </button>
                <button type="button" className={preview ? "active" : ""} onClick={() => setPreview(true)} data-testid="admin-preview-tab">
                  Preview
                </button>
              </div>
            </div>

            {!preview ? (
              <div className="admin-editor-grid">
                <label className="admin-field admin-field-full">
                  <span>Título *</span>
                  <input type="text" value={form.title} onChange={onChange("title")} required data-testid="admin-article-title" />
                </label>
                <label className="admin-field">
                  <span>Slug (URL)</span>
                  <input
                    type="text"
                    value={form.slug}
                    data-testid="admin-article-slug"
                    onChange={onChange("slug")}
                    placeholder="gerado a partir do título"
                  />
                </label>
                <label className="admin-field">
                  <span>Categoria</span>
                  <input type="text" value={form.category} onChange={onChange("category")} placeholder="Ex: E-TPU, Matrizes" data-testid="admin-article-category" />
                </label>
                <label className="admin-field">
                  <span>Autor</span>
                  <input type="text" value={form.author} onChange={onChange("author")} data-testid="admin-article-author" />
                </label>
                <label className="admin-field">
                  <span>Tempo de leitura</span>
                  <input type="text" value={form.read_time} onChange={onChange("read_time")} placeholder="Ex: 5 min" data-testid="admin-article-read-time" />
                </label>
                <label className="admin-field admin-field-full">
                  <span>Imagem de capa</span>
                  <div className="admin-upload-row">
                    <input
                      ref={coverInputRef}
                      data-testid="admin-cover-file"
                      type="file"
                      accept="image/*"
                      onChange={onCoverFile}
                      hidden
                    />
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => coverInputRef.current?.click()}
                      data-testid="admin-cover-upload"
                      disabled={uploadingCover}
                    >
                      {uploadingCover ? "Enviando…" : form.cover_image ? "Trocar imagem" : "Enviar do computador"}
                    </button>
                    <input
                      type="text"
                      value={form.cover_image}
                      data-testid="admin-cover-url"
                      onChange={onChange("cover_image")}
                      placeholder="ou cole a URL (/api/uploads/... ou https://...)"
                      className="admin-upload-url"
                    />
                    {form.cover_image ? (
                      <button type="button" className="btn-ghost btn-sm btn-danger" onClick={clearCover} data-testid="admin-cover-remove">
                        Remover
                      </button>
                    ) : null}
                  </div>
                  {form.cover_image ? (
                    <div className="admin-cover-preview">
                      <img src={resolveMediaUrl(form.cover_image)} alt="Capa" data-testid="admin-cover-image" />
                    </div>
                  ) : null}
                </label>
                <label className="admin-field admin-field-full">
                  <span>Resumo</span>
                  <textarea rows={3} value={form.excerpt} onChange={onChange("excerpt")} data-testid="admin-article-excerpt" />
                </label>
                <label className="admin-field admin-field-full">
                  <span>
                    Conteúdo (Markdown)
                    <small style={{ marginLeft: ".6rem", color: "var(--cor-texto-muted)", fontWeight: 400 }}>
                      Use # títulos, **negrito**, listas, [links](url), ![img](url)
                    </small>
                  </span>
                  <div className="admin-content-toolbar">
                    <input
                      ref={contentImgInputRef}
                      data-testid="admin-content-image-file"
                      type="file"
                      accept="image/*"
                      onChange={onContentImageFile}
                      hidden
                    />
                    <button
                      type="button"
                      className="btn-ghost btn-sm"
                      onClick={() => contentImgInputRef.current?.click()}
                      data-testid="admin-content-image-upload"
                      disabled={insertingImage}
                    >
                      {insertingImage ? "Enviando…" : "+ Inserir imagem"}
                    </button>
                  </div>
                  <textarea
                    ref={contentTextareaRef}
                    data-testid="admin-article-content"
                    rows={20}
                    value={form.content}
                    onChange={onChange("content")}
                    placeholder={"# Introdução\n\nEscreva o conteúdo aqui usando Markdown..."}
                  />
                </label>
                <label className="admin-checkbox admin-field-full">
                  <input type="checkbox" checked={form.published} onChange={onChange("published")} data-testid="admin-article-published" />
                  <span>Publicado (visível no site)</span>
                </label>
              </div>
            ) : (
              <div className="admin-preview" data-testid="admin-preview">
                {form.cover_image ? (
                  <div className="admin-preview-cover">
                    <img src={resolveMediaUrl(form.cover_image)} alt={form.title} />
                  </div>
                ) : null}
                {form.category ? <span className="artigo-card-cat">{form.category}</span> : null}
                <h1 style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", margin: ".4rem 0 .6rem" }}>
                  {form.title || "(sem título)"}
                </h1>
                {form.excerpt ? (
                  <p style={{ color: "var(--cor-texto-muted)", fontSize: "1.08rem" }}>{form.excerpt}</p>
                ) : null}
                <div className="artigo-prose" dangerouslySetInnerHTML={{ __html: previewHtml }} />
              </div>
            )}

            {err ? <div className="admin-error" role="alert" data-testid="admin-error">{err}</div> : null}
            {msg ? <div className="admin-success" role="status" data-testid="admin-success">{msg}</div> : null}

            <div className="admin-editor-actions">
              <button type="submit" className="btn-big" disabled={saving} data-cursor="Salvar" data-testid="admin-article-save">
                {saving ? "Salvando…" : editing ? "Salvar alterações" : "Publicar artigo"} <span aria-hidden>→</span>
              </button>
              {editing ? (
                <button type="button" className="btn-ghost" onClick={startNew} data-testid="admin-editor-cancel">
                  Cancelar edição
                </button>
              ) : null}
            </div>
          </form>

          {/* ================== LISTA ================== */}
          <aside className="admin-list">
            <div className="admin-list-head">
              <h3 className="h-tag" data-testid="admin-articles-count">Artigos ({items.length})</h3>
            </div>
            {loading ? (
              <p className="body-md" style={{ color: "var(--cor-texto-muted)" }} data-testid="admin-articles-loading">Carregando…</p>
            ) : items.length === 0 ? (
              <p className="body-md" style={{ color: "var(--cor-texto-muted)" }} data-testid="admin-articles-empty">Nenhum artigo cadastrado ainda.</p>
            ) : (
              <ul className="admin-list-items">
                {items.map((a) => (
                  <li key={a.id} className={`admin-list-item ${editing?.id === a.id ? "is-editing" : ""}`} data-testid={`admin-article-${a.id}`}>
                    <div className="admin-list-item-info">
                      <strong>{a.title}</strong>
                      <small>
                        {a.category ? `${a.category} · ` : ""}/{a.slug}
                        {a.published === false ? " · rascunho" : ""}
                      </small>
                    </div>
                    <div className="admin-list-item-actions">
                      <button className="btn-ghost btn-sm" onClick={() => startEdit(a)} data-testid={`admin-article-edit-${a.id}`}>Editar</button>
                      <button className="btn-ghost btn-sm btn-danger" onClick={() => onDelete(a)} data-testid={`admin-article-delete-${a.id}`}>Excluir</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
