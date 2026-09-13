import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { adminLogin, getToken } from "../lib/api";

export default function AdminLogin() {
  const nav = useNavigate();
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  if (getToken()) return <Navigate to="/admin" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await adminLogin(login.trim(), senha);
      nav("/admin", { replace: true });
    } catch (e2) {
      setErr(e2?.response?.data?.detail || "Falha ao entrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page page-admin-login" lang="pt-BR" data-testid="admin-login-page">
      <section className="section">
        <div className="shell shell-narrow">
          <div className="admin-login-card">
            <span className="eyebrow">Área restrita</span>
            <h1 className="h-section" style={{ maxWidth: "22ch" }} data-testid="admin-login-title">Acesso ao painel de artigos</h1>
            <p className="body-md" style={{ color: "var(--cor-texto-muted)" }}>
              Entre com suas credenciais para gerenciar os conteúdos técnicos.
            </p>
            <form onSubmit={onSubmit} className="admin-login-form" autoComplete="off" data-testid="admin-login-form">
              <label className="admin-field">
                <span>Login</span>
                <input
                  type="text"
                  data-testid="admin-login-username"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  required
                  autoFocus
                />
              </label>
              <label className="admin-field">
                <span>Senha</span>
                <input
                  type="password"
                  data-testid="admin-login-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
              </label>
              {err ? <div className="admin-error" role="alert" data-testid="admin-login-error">{err}</div> : null}
              <button type="submit" className="btn-big" disabled={loading} data-cursor="Entrar" data-testid="admin-login-submit">
                {loading ? "Entrando…" : "Entrar"} <span aria-hidden>→</span>
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
