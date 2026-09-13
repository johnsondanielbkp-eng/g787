import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "@/App.css";
import "./styles/blog.css";

import Nav from "./components/Nav";
import { LocaleProvider } from "./i18n/LocaleProvider";
import { LocaleMetadata } from "./i18n/LocaleMetadata";
import Footer from "./components/Footer";
import CustomCursor from "./components/CustomCursor";
import FloatingWhatsApp from "./components/FloatingWhatsApp";
import { useSmoothScroll } from "./lib/useSmoothScroll";

import Home from "./pages/Home";
import Empresa from "./pages/Empresa";
import GiReboot from "./pages/GiReboot";
import Contato from "./pages/Contato";
import Eva from "./pages/Eva";
import Matrizes from "./pages/Matrizes";
import Artigos from "./pages/Artigos";
import ArtigoDetail from "./pages/ArtigoDetail";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    // Se houver hash (#sol-01 etc.), tenta rolar até o elemento.
    // Usa o Lenis se disponível para scroll suave, senão fallback nativo.
    if (hash) {
      const tryScroll = (attempt = 0) => {
        const el = document.querySelector(hash);
        if (el) {
          const lenis = window.__lenis;
          const top = el.getBoundingClientRect().top + window.scrollY - 100;
          if (lenis) {
            lenis.scrollTo(top, { duration: 1.2 });
          } else {
            window.scrollTo({ top, behavior: "smooth" });
          }
        } else if (attempt < 10) {
          // Pode ser que a página ainda esteja montando; tenta novamente
          setTimeout(() => tryScroll(attempt + 1), 80);
        }
      };
      setTimeout(() => tryScroll(0), 80);
      return;
    }
    // Sem hash: força o topo ao trocar de rota.
    // Lenis intercepta window.scrollTo, então precisamos avisá-lo também.
    const scrollToTopNow = () => {
      const lenis = window.__lenis;
      if (lenis) {
        lenis.scrollTo(0, { immediate: true, force: true });
      }
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    // Executa imediatamente e novamente no próximo frame (após o Lenis
    // sincronizar com o DOM montado da nova página).
    scrollToTopNow();
    requestAnimationFrame(scrollToTopNow);
  }, [pathname, hash]);
  return null;
}

function Shell() {
  useSmoothScroll();
  return (
    <div className="gi-app">
      <div className="bg-texture" aria-hidden="true" />
      <CustomCursor />
      <Nav />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/empresa" element={<Empresa />} />
        <Route path="/gi-reboot" element={<GiReboot />} />
        <Route path="/eva" element={<Eva />} />
        <Route path="/matrizes" element={<Matrizes />} />
        <Route path="/contato" element={<Contato />} />
        <Route path="/artigos" element={<Artigos />} />
        <Route path="/artigos/:slug" element={<ArtigoDetail />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <LocaleProvider>
      <LocaleMetadata />
      <Shell />
      </LocaleProvider>
    </BrowserRouter>
  );
}

export default App;
