import { useLocale } from "../i18n/LocaleProvider";
import { Link } from "react-router-dom";
import { useReveal, splitWords } from "../lib/useReveal";

// Cópia 100% fiel ao .txt aprovado pelo cliente — página "Nossas Matrizes"

export default function Matrizes() {
  const { tr } = useLocale();
  useReveal("matrizes");

  return (
    <main data-testid="matrizes-page" className="prod-page">
      {/* HERO */}
      <section className="prod-hero">
        <div className="shell prod-hero-grid">
          <div className="prod-hero-text">
            <span data-testid="matrizes-span-1" className="label-mini reveal">{tr("Soluções · Matrizaria")}</span>
            <h1 data-testid="matrizes-h1-2" className="h-hero text-reveal">
              {splitWords(
                tr("Matrizes para solados e componentes com foco em encaixe e repetibilidade")
              )}
            </h1>
            <p data-testid="matrizes-p-3" className="body-lg reveal prod-lead">{tr("Matrizes para solados e componentes de calçados, projetadas para garantir encaixe, repetibilidade e estabilidade de processo em escala industrial.")}</p>
          </div>
          <div className="prod-hero-feature reveal">
            <img data-testid="matrizes-img-4" src="/assets/solucoes/Fabrica-Matriz.webp" alt={tr("Matrizes da Gi")} loading="lazy" decoding="async" />
            <span data-testid="matrizes-span-5" className="prod-split-tag">{tr("Matrizaria")}</span>
          </div>
        </div>
      </section>

      {/* BLOCO 1 · ENCAIXE */}
      <section className="section prod-block matrizes-encaixe-hero-bg">
        <div className="shell shell-narrow">
          <h2 data-testid="matrizes-h2-6" className="h-section text-reveal">
            {splitWords(tr("Onde as matrizes da Gi se encaixam melhor"))}
          </h2>
          <p data-testid="matrizes-p-7" className="body-lg reveal mt-md">{tr("Atendemos diferentes tipos de projetos no setor calçadista e em aplicações correlatas.")}</p>
          <ul className="prod-bullets reveal mt-md">
            <li>{tr("Solados em EVA e E-TPU (Gi Reboot®).")}</li>
            <li>{tr("Bases e solados de chinelos em EVA.")}</li>
            <li>{tr("Componentes técnicos ligados ao calçado e projetos especiais com maior exigência dimensional.")}</li>
          </ul>
        </div>
      </section>

      {/* BLOCO 2 · COMO TRABALHAMOS */}
      <section className="section prod-block prod-block--alt">
        <div className="shell shell-narrow">
          <h2 data-testid="matrizes-h2-8" className="h-section text-reveal">
            {splitWords(tr("Como trabalhamos o desenvolvimento de matrizes"))}
          </h2>
          <p data-testid="matrizes-p-9" className="body-lg reveal mt-md">{tr("O desenvolvimento é conduzido de forma integrada, do desenho inicial ao teste em produção, em diálogo com a equipe técnica do cliente.")}</p>
          <ul className="prod-bullets reveal mt-md">
            <li>{tr("Análise do projeto e das exigências de uso do produto final.")}</li>
            <li>{tr("Modelagem 3D e validação de medidas e encaixes.")}</li>
            <li>{tr("Usinagem com controle de tolerâncias e acabamento para facilitar o processo.")}</li>
            <li>{tr("Ajustes finos e acompanhamento técnico em testes e início de produção.")}</li>
          </ul>
        </div>
      </section>

      {/* BLOCO 3 · MATRIZ ALINHADA AO SOLADO E AO PROCESSO */}
      <section className="section prod-block matrizes-encaixe-hero-bg matrizes-alinhada-bg">
        <div className="shell shell-narrow">
          <h2 data-testid="matrizes-h2-10" className="h-section text-reveal">
            {splitWords(tr("Matriz alinhada ao solado e ao processo"))}
          </h2>
          <p data-testid="matrizes-p-11" className="body-lg reveal mt-md">{tr("A matrizaria da Gi está integrada à injeção de solados e ao desenvolvimento de compostos, o que reduz retrabalho e aumenta a previsibilidade em desenvolvimento.")}</p>
          <ul className="prod-bullets reveal mt-md">
            <li>{tr("A mesma equipe que projeta a matriz acompanha o comportamento do solado em produção.")}</li>
            <li>{tr("Ajustes de desenho são feitos com base em dados reais de processo.")}</li>
            <li>{tr("Menos “jogo de empurra” entre fornecedor de matriz, injetora e composto.")}</li>
          </ul>
        </div>
      </section>

      {/* BLOCO FINAL · CHAMADA ESTRATÉGICA */}
      <section className="section prod-cta">
        <div className="shell shell-narrow text-center">
          <h2 data-testid="matrizes-h2-12" className="h-section text-reveal">
            {splitWords(tr("Quer discutir um novo projeto de matriz?"))}
          </h2>
          <p data-testid="matrizes-p-13" className="body-lg reveal mt-md" style={{ maxWidth: "68ch", margin: "1.2rem auto 2rem" }}>{tr("Se você está avaliando um novo solado ou componente e precisa discutir desenho de matriz, encaixe e requisitos de processo, a equipe técnica da Gi pode apoiar da fase de conceito ao início de produção.")}</p>
          <Link to="/contato" className="btn-outline reveal" data-testid="matrizes-cta-contato">{tr("Falar com a equipe técnica")}</Link>
        </div>
      </section>
    </main>
  );
}
