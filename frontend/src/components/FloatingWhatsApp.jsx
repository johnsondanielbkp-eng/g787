import { useLocale } from "../i18n/LocaleProvider";
/**
 * FloatingWhatsApp — botão flutuante fixo no canto inferior direito.
 * Aparece em todas as páginas via App.js.
 * Ao clicar, abre o WhatsApp (web ou mobile app) com mensagem pré-preenchida.
 */
const WHATSAPP_URL =
  "https://web.whatsapp.com/send?phone=555135436151&text=Ol%C3%A1%21+Acessei+o+site+e+gostaria+de+mais+informa%C3%A7%C3%B5es+sobre";

export default function FloatingWhatsApp() {
  const { tr } = useLocale();
  return (
    <a
      className="floating-whatsapp"
      href={`${WHATSAPP_URL.split("&text=")[0]}&text=${encodeURIComponent(tr("Olá! Acessei o site e gostaria de mais informações sobre"))}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={tr("Conversar com a Gi no WhatsApp")}
      data-testid="floating-whatsapp"
      data-cursor={tr("Conversar")}
      title={tr("Fale conosco no WhatsApp")}
    >
      <span className="floating-whatsapp__pulse" aria-hidden="true" />
      <span className="floating-whatsapp__pulse floating-whatsapp__pulse--2" aria-hidden="true" />
      <svg
        className="floating-whatsapp__icon"
        width="28"
        height="28"
        viewBox="0 0 32 32"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.796 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.777 2.735.777.72 0 2.14-.5 2.417-1.238.13-.373.13-.673.13-.746 0-.257-.03-.286-.315-.415-.288-.157-1.318-.657-1.762-.898-.11-.055-.238-.09-.36-.09zM15.2 5.4A10.6 10.6 0 0 0 6.4 21.63l-1.4 5.16 5.28-1.38A10.6 10.6 0 1 0 15.2 5.4zm0 19.35a8.68 8.68 0 0 1-4.44-1.22l-.32-.19-3.28.86.88-3.22-.21-.33a8.72 8.72 0 1 1 7.37 4.1z" />
      </svg>
      <span data-testid="floating-whats-app-span-1" className="floating-whatsapp__label">{tr("Fale conosco")}</span>
    </a>
  );
}
