import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLocale } from "./LocaleProvider";

const titles = {
  "/": ["Inovações para calçados", "Innovaciones para calzado"],
  "/empresa": ["Nossa história", "Nuestra historia"],
  "/gi-reboot": ["Gi Reboot® — E-TPU", "Gi Reboot® — E-TPU"],
  "/eva": ["Soluções em EVA", "Soluciones de EVA"],
  "/matrizes": ["Matrizes", "Matrices"],
  "/contato": ["Contato", "Contacto"],
  "/artigos": ["Artigos técnicos", "Artículos técnicos"],
};

export const LocaleMetadata = () => {
  const { pathname } = useLocation();
  const { locale } = useLocale();
  useEffect(() => {
    const spanish = locale === "es" && !pathname.startsWith("/admin");
    const title = titles[pathname] || (pathname.startsWith("/artigos/") ? titles["/artigos"] : ["Administração", "Administración"]);
    document.title = `${title[spanish ? 1 : 0]} | Gi Inovações`;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = spanish
      ? "Gi Inovações: matrices, suelas y compuestos de EVA y E-TPU Gi Reboot®. Ingeniería, confort y sostenibilidad para calzado y componentes industriales."
      : "Gi Inovações: matrizes, solados e compostos em EVA e E-TPU Gi Reboot®. Engenharia, conforto e sustentabilidade para calçados e componentes industriais.";
  }, [locale, pathname]);
  return null;
};