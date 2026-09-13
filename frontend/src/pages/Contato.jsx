import { useLocale } from "../i18n/LocaleProvider";
import { useState } from "react";
import { useReveal, splitWords } from "../lib/useReveal";

const FAQ = [
  {
    q: "Qual é o prazo de entrega padrão para os pedidos da Gi?",
    a: "Os prazos variam conforme o tipo de produto (matriz, solado, composto) e o volume do pedido. Em geral, o prazo é definido na proposta comercial, considerando capacidade produtiva e complexidade do projeto. Em casos específicos, nossa equipe técnica e comercial pode avaliar alternativas para atender necessidades de prazo mais apertadas.",
  },
  {
    q: "A Gi disponibiliza um catálogo de modelos de solados abertos para o mercado?",
    a: "Sim, a Gi possui linhas de solados em EVA e chinelos em EVA já desenvolvidas, que podem ser utilizadas como base para novos projetos. Além disso, é possível desenvolver modelos sob medida, de acordo com o desenho e as especificações da marca.",
  },
  {
    q: "Qual é a quantidade mínima de pares de solados por pedido?",
    a: "A quantidade mínima depende da linha de produto e do tipo de solado. Em geral, trabalhamos com volumes industriais, mas a equipe comercial pode informar o mínimo específico para cada caso e avaliar possibilidades conforme o projeto.",
  },
  {
    q: "Quais são os principais benefícios ao escolher o solado de E-TPU da Gi (Gi Reboot®)?",
    a: "Os solados em E-TPU Gi Reboot® oferecem alto retorno de energia, leveza, excelente resistência à fadiga e estabilidade dimensional em produção. São indicados para linhas que buscam maior conforto, durabilidade e diferenciação de produto, como calçados esportivos, de segurança e outras aplicações que exigem impacto controlado.",
  },
  {
    q: "A Gi trabalha com compostos em EVA sustentáveis?",
    a: "Sim. Além dos compostos convencionais, a Gi desenvolve linhas com conteúdo reciclado (como a linha Recovery) e com polímeros de origem renovável (como a linha Green), sempre avaliando o equilíbrio entre desempenho técnico e responsabilidade ambiental.",
  },
  {
    q: "A Gi desenvolve projetos sob medida ou apenas trabalha com linhas prontas?",
    a: "A Gi trabalha tanto com linhas já consolidadas de solados, chinelos e compostos quanto com projetos sob medida. Em projetos específicos, a equipe técnica atua junto com o cliente desde o conceito até os testes em produção.",
  },
  {
    q: "Como funciona o suporte técnico da Gi durante o desenvolvimento de um novo produto?",
    a: "O suporte inclui análise de projeto, recomendações de material (EVA, E-TPU, compostos), ajustes de matriz, acompanhamento de testes e orientações de processo. O objetivo é reduzir retrabalho e garantir estabilidade na produção.",
  },
];

const TABS = [
  { id: "contato", label: "Contato" },
  { id: "trabalhe", label: "Trabalhe Conosco" },
  { id: "ouvidoria", label: "Ouvidoria" },
];

const ASSUNTOS = [
  "Matrizes",
  "Solados em EVA",
  "Gi Reboot® (E-TPU)",
  "Chinelos em EVA",
  "Compostos em EVA",
  "Linhas sustentáveis",
  "Outros",
];

const VAGAS = [
  "Banco de talentos",
  "Produção / Operação",
  "Matrizaria / CNC",
  "P&D e Desenvolvimento",
  "Comercial",
  "Administrativo",
];

export default function Contato() {
  const { tr } = useLocale();
  useReveal("contato");
  const [openIdx, setOpenIdx] = useState(-1);
  const [tab, setTab] = useState("contato");
  const [sent, setSent] = useState(false);
  const [aceite, setAceite] = useState(false);
  const [notRobot, setNotRobot] = useState(false);
  const [fileName, setFileName] = useState("");

  // Estado de cada aba (independentes)
  const [contatoForm, setContatoForm] = useState({
    nome: "", email: "", telefone: "", assunto: "Matrizes", mensagem: "",
  });
  const [trabalheForm, setTrabalheForm] = useState({
    nome: "", telefone: "", cidade: "", vaga: "Banco de talentos", mensagem: "",
  });
  const [ouvidoriaForm, setOuvidoriaForm] = useState({
    nome: "", email: "", telefone: "", mensagem: "",
  });

  const change = (setter) => (e) => setter((s) => ({ ...s, [e.target.name]: e.target.value }));

  const onFile = (e) => {
    const f = e.target.files && e.target.files[0];
    setFileName(f ? f.name : "");
  };

  const switchTab = (id) => {
    setTab(id);
    setSent(false);
    setAceite(false);
    setNotRobot(false);
    setFileName("");
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!aceite || !notRobot) return;
    let subject = "";
    let body = "";
    if (tab === "contato") {
      subject = `[Site Gi] ${tr("Contato")} · ${tr(contatoForm.assunto)} — ${contatoForm.nome}`;
      body =
`Tipo: ${tr("Contato")}
${tr("Nome")}: ${contatoForm.nome}
${tr("E-mail")}: ${contatoForm.email}
${tr("Telefone")}: ${contatoForm.telefone}
${tr("Assunto")}: ${tr(contatoForm.assunto)}
${tr("Anexo")}: ${fileName || tr("(nenhum)")}

${tr("Mensagem")}:
${contatoForm.mensagem}
`;
    } else if (tab === "trabalhe") {
      subject = `[Site Gi] ${tr("Trabalhe Conosco")} · ${tr(trabalheForm.vaga)} — ${trabalheForm.nome}`;
      body =
`Tipo: ${tr("Trabalhe Conosco")}
${tr("Nome")}: ${trabalheForm.nome}
${tr("Telefone")}: ${trabalheForm.telefone}
${tr("Cidade")}: ${trabalheForm.cidade}
${tr("Vaga")}: ${tr(trabalheForm.vaga)}
${tr("Currículo")}: ${fileName || tr("(nenhum)")}

${tr("Mensagem")}:
${trabalheForm.mensagem}
`;
    } else {
      subject = `[Site Gi] ${tr("Ouvidoria")} — ${ouvidoriaForm.nome || tr("Anônimo")}`;
      body =
`Tipo: ${tr("Ouvidoria")}
${tr("Nome")}: ${ouvidoriaForm.nome}
${tr("E-mail")}: ${ouvidoriaForm.email}
${tr("Telefone")}: ${ouvidoriaForm.telefone}
${tr("Anexo")}: ${fileName || tr("(nenhum)")}

${tr("Mensagem")}:
${ouvidoriaForm.mensagem}
`;
    }
    const to = tab === "trabalhe" ? "rh@giinovacoes.com.br" : "contato@giinovacoes.com.br";
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  const canSubmit = aceite && notRobot;

  return (
    <main data-testid="contato-page">
      {/* SEÇÃO 2 — FORMULÁRIO DE CONTATO */}
      <section className="section pessoas-hero-inverted" style={{ paddingTop: "8rem" }}>
        <div className="shell contact-grid">
          <div>
            <h2 data-testid="contato-h2-1" className="h-section text-reveal" style={{ maxWidth: "20ch" }}>
              {splitWords(tr("Vamos conversar?"))}
            </h2>
            <p data-testid="contato-p-2" className="body-lg reveal mt-lg" style={{ maxWidth: "48ch", color: "var(--cor-texto-muted)" }}>{tr("Preencha os campos ao lado com as informações básicas do seu projeto ou dúvida. Nossa equipe retorna o contato para entender melhor a necessidade e indicar o melhor caminho.")}</p>
          </div>

          <div className="reveal">
            <div className="contact-tabs" data-testid="contact-tabs">
              {TABS.map((t, localeIndex0) => (
                <button
                  key={t.id}
                  type="button"
                  className={`contact-tab ${tab === t.id ? "is-active" : ""}`}
                  onClick={() => switchTab(t.id)}
                  data-testid={`tab-${t.id}`}
                  data-cursor={tr(tab === t.id ? "" : "Selecionar")}
                >
                  {tr(t.label)}
                </button>
              ))}
            </div>

            <form
              onSubmit={onSubmit}
              className="contact-form contact-form--tabbed"
              data-testid="contact-form"
              key={tab}
            >
              {tab === "contato" && (
                <>
                  <label data-testid="contato-label-3">
                    <span data-testid="contato-span-4">{tr("Nome *")}</span>
                    <input name="nome" type="text" required value={contatoForm.nome} onChange={change(setContatoForm)} data-testid="form-nome" />
                  </label>
                  <label data-testid="contato-label-5">
                    <span data-testid="contato-span-6">{tr("E-mail *")}</span>
                    <input name="email" type="email" required value={contatoForm.email} onChange={change(setContatoForm)} data-testid="form-email" />
                  </label>
                  <label data-testid="contato-label-7">
                    <span data-testid="contato-span-8">{tr("Telefone *")}</span>
                    <input name="telefone" type="tel" required value={contatoForm.telefone} onChange={change(setContatoForm)} data-testid="form-telefone" />
                  </label>
                  <label data-testid="contato-label-9">
                    <span data-testid="contato-span-10">{tr("Assunto *")}</span>
                    <select name="assunto" value={contatoForm.assunto} onChange={change(setContatoForm)} data-testid="form-assunto">
                      <option data-testid="contato-option-11" disabled value="">{tr("Selecione um assunto")}</option>
                      {ASSUNTOS.map((a, localeIndex1) => <option data-testid={`contato-option-12-${localeIndex1}`} key={a} value={a}>{tr(a)}</option>)}
                    </select>
                  </label>
                  <label data-testid="contato-label-13" className="file-field">
                    <span data-testid="contato-span-14">{tr("Anexar seu arquivo")}</span>
                    <div className="file-input-wrap">
                      <input type="file" onChange={onFile} data-testid="form-file" />
                      <span data-testid="contato-span-15" className="file-name">{tr(fileName || "Nenhum arquivo selecionado")}</span>
                    </div>
                  </label>
                  <label data-testid="contato-label-16">
                    <span data-testid="contato-span-17">{tr("Mensagem *")}</span>
                    <textarea
                      name="mensagem"
                      rows={5}
                      required
                      placeholder={tr("Escrever detalhes do que necessita, informações adicionais, etc.")}
                      value={contatoForm.mensagem}
                      onChange={change(setContatoForm)}
                      data-testid="form-mensagem"
                    />
                  </label>
                </>
              )}

              {tab === "trabalhe" && (
                <>
                  <label data-testid="contato-label-18">
                    <span data-testid="contato-span-19">{tr("Nome *")}</span>
                    <input name="nome" type="text" required value={trabalheForm.nome} onChange={change(setTrabalheForm)} data-testid="form-nome" />
                  </label>
                  <label data-testid="contato-label-20">
                    <span data-testid="contato-span-21">{tr("Telefone *")}</span>
                    <input name="telefone" type="tel" required value={trabalheForm.telefone} onChange={change(setTrabalheForm)} data-testid="form-telefone" />
                  </label>
                  <label data-testid="contato-label-22">
                    <span data-testid="contato-span-23">{tr("Cidade *")}</span>
                    <input name="cidade" type="text" required value={trabalheForm.cidade} onChange={change(setTrabalheForm)} data-testid="form-cidade" />
                  </label>
                  <label data-testid="contato-label-24">
                    <span data-testid="contato-span-25">{tr("Vaga *")}</span>
                    <select name="vaga" value={trabalheForm.vaga} onChange={change(setTrabalheForm)} data-testid="form-vaga">
                      <option data-testid="contato-option-26" disabled value="">{tr("Escolha a vaga")}</option>
                      {VAGAS.map((v, localeIndex2) => <option data-testid={`contato-option-27-${localeIndex2}`} key={v} value={v}>{tr(v)}</option>)}
                    </select>
                  </label>
                  <label data-testid="contato-label-28" className="file-field">
                    <span data-testid="contato-span-29">{tr("Anexar seu currículo *")}</span>
                    <div className="file-input-wrap">
                      <input type="file" required onChange={onFile} accept=".pdf,.doc,.docx" data-testid="form-cv" />
                      <span data-testid="contato-span-30" className="file-name">{tr(fileName || "Nenhum arquivo selecionado")}</span>
                    </div>
                  </label>
                  <label data-testid="contato-label-31">
                    <span data-testid="contato-span-32">{tr("Mensagem *")}</span>
                    <textarea
                      name="mensagem"
                      rows={5}
                      required
                      placeholder={tr("Escrever alguma informação adicional ao currículo.")}
                      value={trabalheForm.mensagem}
                      onChange={change(setTrabalheForm)}
                      data-testid="form-mensagem"
                    />
                  </label>
                </>
              )}

              {tab === "ouvidoria" && (
                <>
                  <label data-testid="contato-label-33">
                    <span data-testid="contato-span-34">{tr("Nome completo")}</span>
                    <input name="nome" type="text" value={ouvidoriaForm.nome} onChange={change(setOuvidoriaForm)} data-testid="form-nome" />
                  </label>
                  <label data-testid="contato-label-35">
                    <span data-testid="contato-span-36">{tr("E-mail")}</span>
                    <input name="email" type="email" value={ouvidoriaForm.email} onChange={change(setOuvidoriaForm)} data-testid="form-email" />
                  </label>
                  <label data-testid="contato-label-37">
                    <span data-testid="contato-span-38">{tr("Telefone")}</span>
                    <input name="telefone" type="tel" value={ouvidoriaForm.telefone} onChange={change(setOuvidoriaForm)} data-testid="form-telefone" />
                  </label>
                  <label data-testid="contato-label-39" className="file-field">
                    <span data-testid="contato-span-40">{tr("Anexar arquivo")}</span>
                    <div className="file-input-wrap">
                      <input type="file" onChange={onFile} data-testid="form-file" />
                      <span data-testid="contato-span-41" className="file-name">{tr(fileName || "Nenhum arquivo selecionado")}</span>
                    </div>
                  </label>
                  <label data-testid="contato-label-42">
                    <span data-testid="contato-span-43">{tr("Mensagem *")}</span>
                    <textarea
                      name="mensagem"
                      rows={5}
                      required
                      placeholder={tr("Escrever detalhes do que necessita, informações adicionais, etc.")}
                      value={ouvidoriaForm.mensagem}
                      onChange={change(setOuvidoriaForm)}
                      data-testid="form-mensagem"
                    />
                  </label>
                </>
              )}

              <div className="contact-recaptcha">
                <label data-testid="contato-label-44" className="recaptcha-box">
                  <input
                    type="checkbox"
                    checked={notRobot}
                    onChange={(e) => setNotRobot(e.target.checked)}
                    data-testid="form-notrobot"
                  />
                  <span className="recaptcha-check" aria-hidden />
                  <span data-testid="contato-span-45" className="recaptcha-label">{tr("Não sou um robô")}</span>
                  <span className="recaptcha-logo" aria-hidden>
                    <span data-testid="contato-span-46" className="rl-title">{tr("reCAPTCHA")}</span>
                    <span data-testid="contato-span-47" className="rl-sub">{tr("Privacidade · Termos")}</span>
                  </span>
                </label>
              </div>

              <label data-testid="contato-label-48" className="contact-consent">
                <input
                  type="checkbox"
                  checked={aceite}
                  onChange={(e) => setAceite(e.target.checked)}
                  data-testid="form-consent"
                />
                <span data-testid="contato-span-49">{tr("Li e concordo com a ")}<a data-testid="contato-a-50" href="#" onClick={(e)=>e.preventDefault()}><strong>{tr("Política de Privacidade")}</strong></a>.</span>
              </label>

              <button
                type="submit"
                className="btn-big"
                data-cursor={tr("Enviar")}
                data-testid="form-submit"
                disabled={!canSubmit}
                style={!canSubmit ? { opacity: 0.55, cursor: "not-allowed" } : undefined}
              >
                {tr(sent ? "Abrindo seu cliente de e-mail…" : "Enviar")} <span aria-hidden>→</span>
              </button>

              <p data-testid="contato-p-51" className="contact-privacy">{tr("As informações enviadas serão usadas apenas para retorno do seu contato e atendimento da sua solicitação.")}</p>
            </form>
          </div>
        </div>
      </section>

      {/* SEÇÃO 3 — INFORMAÇÕES DE CONTATO E ENDEREÇOS */}
      <section className="section section-atendimento matrizes-encaixe-hero-bg">
        <div className="shell">
          <h2 data-testid="contato-h2-52" className="h-section text-reveal" style={{ maxWidth: "22ch" }}>
            {splitWords(tr("Atendimento e unidades"))}
          </h2>

          <div className="atendimento-grid mt-xl">
            {/* Coluna 1 — Atendimento */}
            <div className="reveal">
              <h3 data-testid="contato-h3-53" className="how-col-title">{tr("Atendimento")}</h3>
              <div className="contact-card" style={{ marginTop: "1.5rem" }}>
                <span data-testid="contato-span-54" className="lbl">{tr("Telefone")}</span>
                <a data-testid="contato-a-55" href="tel:+555135436151" data-cursor={tr("Ligar")}>+55 (51) 3543.6151</a>
              </div>
              <div className="contact-card">
                <span data-testid="contato-span-56" className="lbl">{tr("E-mail")}</span>
                <a data-testid="contato-a-57" href="mailto:contato@giinovacoes.com.br" data-cursor={tr("Enviar")}>{tr("contato@giinovacoes.com.br")}</a>
              </div>
              <div className="contact-card">
                <span data-testid="contato-span-58" className="lbl">{tr("Horário de atendimento")}</span>
                <p data-testid="contato-p-59">{tr("De segunda a sexta, das 7h30 às 17h30")}</p>
              </div>
            </div>

            {/* Coluna 2 — Endereços */}
            <div className="reveal">
              <h3 data-testid="contato-h3-60" className="how-col-title">{tr("Endereços")}</h3>
              <div className="contact-card" style={{ marginTop: "1.5rem" }}>
                <span data-testid="contato-span-61" className="lbl">{tr("Unidade 1 - Matrizaria e solados")}</span>
                <p data-testid="contato-p-62">{tr("RS 239, 5075 - bairro Colina do Leão - Parobé - RS - Brasil")}</p>
                <div className="map-embed">
                  <iframe data-testid="contato-iframe-63"
                    title={tr("Mapa Unidade 1 — Gi Inovações")}
                    src="https://www.google.com/maps?q=RS%20239%2C%205075%20-%20Colina%20do%20Le%C3%A3o%2C%20Parob%C3%A9%20-%20RS%2C%20Brasil&output=embed"
                    width="100%"
                    height="220"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    style={{ border: 0, borderRadius: "12px", display: "block" }}
                    allowFullScreen
                  />
                  <a data-testid="contato-a-64"
                    className="map-link"
                    href="https://www.google.com/maps/dir/?api=1&destination=RS%20239%2C%205075%20-%20Colina%20do%20Le%C3%A3o%2C%20Parob%C3%A9%20-%20RS%2C%20Brasil"
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor={tr("Rotas")}
                  >{tr("Traçar rota até a Unidade 1 ")}<span aria-hidden>→</span>
                  </a>
                </div>
              </div>
              <div className="contact-card">
                <span data-testid="contato-span-65" className="lbl">{tr("Unidade 2 - Compostos e E-TPU")}</span>
                <p data-testid="contato-p-66">{tr("RS 239, 8080 - bairro Integração - Parobé - RS - Brasil")}</p>
                <div className="map-embed">
                  <iframe data-testid="contato-iframe-67"
                    title={tr("Mapa Unidade 2 — Gi Inovações")}
                    src="https://www.google.com/maps?q=RS%20239%2C%208080%20-%20Integra%C3%A7%C3%A3o%2C%20Parob%C3%A9%20-%20RS%2C%20Brasil&output=embed"
                    width="100%"
                    height="220"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    style={{ border: 0, borderRadius: "12px", display: "block" }}
                    allowFullScreen
                  />
                  <a data-testid="contato-a-68"
                    className="map-link"
                    href="https://www.google.com/maps/dir/?api=1&destination=RS%20239%2C%208080%20-%20Integra%C3%A7%C3%A3o%2C%20Parob%C3%A9%20-%20RS%2C%20Brasil"
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor={tr("Rotas")}
                  >{tr("Traçar rota até a Unidade 2 ")}<span aria-hidden>→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 4 — PERGUNTAS FREQUENTES (FAQ) */}
      <section className="section sec-cool">
        <div className="shell">
          <h2 data-testid="contato-h2-69" className="h-section text-reveal" style={{ maxWidth: "26ch" }}>
            {splitWords(tr("Perguntas frequentes"))}
          </h2>
          <p data-testid="contato-p-70" className="body-lg reveal mt-lg" style={{ maxWidth: "68ch", color: "var(--cor-texto-muted)" }}>{tr("Antes de enviar sua mensagem, veja se alguma das respostas abaixo já ajuda no que você precisa.")}</p>

          <div className="accordion mt-xl">
            {FAQ.map((item, i) => (
              <div
                className={`acc-item ${openIdx === i ? "open" : ""}`}
                key={item.q}
                data-testid={`faq-${i}`}
              >
                <button data-testid={`contato-button-71-${i}`}
                  type="button"
                  className="acc-trigger"
                  onClick={() => setOpenIdx(openIdx === i ? -1 : i)}
                  aria-expanded={openIdx === i}
                  data-cursor={tr(openIdx === i ? "Fechar" : "Abrir")}
                >
                  <span data-testid={`contato-span-72-${i}`}>{tr(item.q)}</span>
                  <span className="plus" aria-hidden>+</span>
                </button>
                <div className="acc-content">
                  <div className="acc-content-inner">{tr(item.a)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
