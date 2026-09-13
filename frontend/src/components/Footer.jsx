import { useLocale } from "../i18n/LocaleProvider";
export default function Footer() {
  const { tr } = useLocale();
  return (
    <footer className="gi-footer" data-testid="gi-footer">
      <div className="shell">
        <div className="footer-grid">
          {/* Marca */}
          <div className="footer-col footer-brand">
            <img data-testid="footer-img-1"
              src="/brand/logo-full-tight.png"
              alt={tr("Gi Inovações para calçados")}
              className="gi-logo-full"
              loading="lazy"
              decoding="async"
            />
            <p data-testid="footer-p-2" className="footer-brand-city">{tr("Parobé, Rio Grande do Sul")}</p>
            <p data-testid="footer-p-3" className="footer-brand-since">{tr("Desde 2001")}</p>
          </div>

          {/* Atendimento */}
          <div className="footer-col">
            <h5 data-testid="footer-h5-4">{tr("Atendimento")}</h5>
            <a href="tel:+555135436151" data-testid="footer-phone-1">51 3543.6151</a>
            <a href="tel:+555135436151" data-testid="footer-phone-2">51 3543.6151</a>
            <a
              href="mailto:gicompany@gicompany.ind.br"
              data-testid="footer-email"
            >{tr("gicompany@gicompany.ind.br")}</a>

            {/* Redes sociais — agora abaixo do email */}
            <div className="footer-socials" aria-label={tr("Redes sociais da Gi")}>
              <a
                href="https://www.instagram.com/gicompanyoficial/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={tr("Instagram da Gi")}
                data-testid="footer-social-instagram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/gicompanyoficial"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={tr("Facebook da Gi")}
                data-testid="footer-social-facebook"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com/company/gicompanyoficial"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={tr("LinkedIn da Gi")}
                data-testid="footer-social-linkedin"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              {/* WhatsApp — link ativo */}
              <a
                href={`https://web.whatsapp.com/send?phone=555135436151&text=${encodeURIComponent(tr("Olá! Acessei o site e gostaria de mais informações sobre"))}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={tr("Conversar com a Gi no WhatsApp")}
                data-testid="footer-social-whatsapp"
                title={tr("Fale conosco no WhatsApp")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Nos encontre */}
          <div className="footer-col">
            <h5 data-testid="footer-h5-5">{tr("Nos encontre")}</h5>
            <p data-testid="footer-p-6">{tr("RS 239, 5075 — bairro Colina do Leão — Parobé/RS")}</p>
            <p data-testid="footer-p-7">{tr("RS 239, 8080 — bairro Integração — Parobé/RS")}</p>
            <p data-testid="footer-p-8" className="footer-hours">
              <span data-testid="footer-span-9">{tr("2ª a 5ª: 7:00 às 11:30 / 13:00 às 17:30")}</span>
              <span data-testid="footer-span-10">{tr("6ª: 7:00 às 11:30 / 13:00 às 16:30")}</span>
            </p>
          </div>

          {/* Selo Origem Sustentável */}
          <div className="footer-col footer-seal">
            <h5 data-testid="footer-h5-11">{tr("Certificação")}</h5>
            <img
              src="/assets/selo-origem-sustentavel.png"
              alt={tr("Selo Origem Sustentável")}
              className="footer-seal-img"
              loading="lazy"
              decoding="async"
              data-testid="footer-seal"
            />
          </div>
        </div>

        <div className="footer-bottom">
          <span data-testid="footer-span-12">{tr("© 2026 Gi Inovações. Todos os direitos reservados.")}</span>
          <span data-testid="footer-span-13" style={{ color: "var(--cor-texto-dim)" }}>{tr("Parobé / RS · Brasil")}</span>
        </div>
      </div>
    </footer>
  );
}
