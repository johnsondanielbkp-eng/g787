# PRD — Gi Inovações

## Sessão atual — clonagem fiel de gi55 (2026-09-13)
- Pedido original: “implemente fielemente, sem alterar NADA, o repositorio abaixo, nao faça perguntas, apenas clone https://github.com/firmadoads3-ux/gi55”. Confirmação: “Sim, conforme solicitado”.
- Origem: branch `main`, commit `fb9c650f6d46c74a1334f606b5c096a1e2f99b2b`.
- Escopo estático: reproduzir os arquivos versionados e executar o projeto, sem redesenhar, criar recursos ou modificar a lógica existente.
- Frontend/backend e recursos versionados copiados integralmente; `.env` atuais preservados. Metadados locais do ambiente não substituídos.
- Arquitetura, personas e requisitos herdados descritos abaixo; não houve implementação ou alteração de autenticação, integrações ou armazenamento.
- Dependências instaladas a partir dos manifestos originais, sem editar versões.
- Banco de dados original não acompanha o Git; não inventar conteúdo editorial nem substituir os dados ausentes.
- O arquivo `frontend/public/assets/3d/GI014.glb` consta no `.gitignore` da origem e não está versionado. O código referencia esse arquivo, mas a clonagem não pode recuperá-lo. Não substituir por outro modelo nem alterar o carrossel.
- Validação final: 222 arquivos versionados de frontend/backend comparados por SHA-256 com o clone de referência, sem divergências. Nenhum código, estilo, manifesto de dependências ou arquivo de mídia foi editado.
- Build `yarn build` concluído (36,99s); log em `test_reports/gi55-build.log`. Serviços frontend/backend em execução.
- Backend: 9/9 testes existentes aprovados. Navegação pública, idiomas com persistência, painel administrativo e CRUD temporário aprovados. Registros editoriais de teste removidos.
- Capturas em 1920×800 e 390×844; os elementos fora dos limites são faixas animadas recortadas pelos ancestrais. Largura de rolagem mobile igual à largura visível (390px).
- Diagnóstico complementar ao relatório `test_reports/iteration_1.json`: o navegador automatizado `HeadlessChrome/145.0.7632.0` retorna vazio em `canPlayType('video/mp4; codecs="avc1.42E01E"')` e `canPlayType('video/mp4; codecs="avc1.640028"')`, enquanto WebM/VP9 retorna `probably`. Os três MP4 questionados contêm trilhas `avc1` e são servidos com HTTP 200. As falhas registradas nesse navegador não comprovam corrupção dos arquivos: o ambiente de testes não dispõe do codec H.264. Não recodificar os vídeos originais. Reprodução MP4 em navegador com H.264 não foi validada nesta sessão.
- Visualizadores GI015/GI019/GI020 validados com interação; GI014 segue sem arquivo original, conforme Git de origem.
- P0: clonagem e execução concluídas, sem regressão de código identificada. Limitação de validação de MP4 documentada acima.
- P1: arquivo original GI014 e conteúdo do banco de origem ausentes; reposição apenas se fornecidos, sem alterações de código.
- P2: nenhuma evolução funcional autorizada; manter o original.
- Próximas tarefas desta sessão: nenhuma alteração autorizada. Se o usuário fornecer o GI014 original ou conteúdo editorial do banco de origem, estes poderão ser restaurados. O histórico abaixo descreve sessões da origem e não representa solicitações novas deste usuário.

## Problema original
Implementar fielmente o repositório público https://github.com/treedbkp-art/gi2-09 no workspace `/app`.

## Solicitações incrementais aprovadas
- Menu “Soluções” de Gi Reboot com padrão visual e comportamento idênticos à Home.
- 2026-09-11 — “agora quero que tenha a versao espanhol do site, e em algum lugar que fique bom no menu, a opcao de trocar para espanhol ou brasileiro, com bandeira”.
- Usuário aprovou traduzir as páginas públicas, seletor 🇧🇷 Português (Brasil) / 🇪🇸 Español no menu, preferência salva e preservação do visual original. Revisão de autenticação fora do escopo.

## Decisões de arquitetura
- React 19 com React Router, GSAP/ScrollTrigger, Lenis e Three.js no frontend.
- FastAPI com MongoDB via `MONGO_URL` e `DB_NAME` existentes no ambiente.
- Artigos e uploads persistidos no MongoDB; mídia institucional permanece em `frontend/public`.
- Rotas administrativas protegidas pelo token compatível com o repositório original.
- Internacionalização local via React Context (`src/i18n/LocaleProvider.jsx`) e dicionários estáticos `src/i18n/es/{common,pages}.json`; textos originais em português são as chaves. Sem API de tradução, sem alteração de conteúdo pelo DOM.
- Português do Brasil por padrão; `gi-locale` no localStorage aceita apenas `pt-BR`/`es`; funciona sem armazenamento disponível, sincroniza entre abas e mantém estados dos componentes ao trocar idioma.
- Seletor acessível com Radix DropdownMenu no cabeçalho, bandeiras SVG locais, rótulos por extenso, suporte a teclado, Escape e clique externo. Cores seguem cabeçalho imersivo/sólido.
- `html.lang`, títulos e descrição da página acompanham o idioma; `useReveal` reaplica animações aos textos traduzidos sem remontar formulários.

## Personas
- Profissional de P&D e desenvolvimento de produtos para calçados.
- Cliente industrial buscando matrizes, EVA, E-TPU ou compostos.
- Administrador responsável por artigos técnicos.

## Requisitos principais
- Home cinematográfica com vídeo, soluções, sustentabilidade, artigos e contato.
- Páginas Empresa, Gi Reboot, EVA, Matrizes, Contato, Artigos e detalhe de artigo.
- Navegação desktop/mobile, menu de soluções, cursor customizado, mouse trail e viewers 3D.
- Login administrativo, CRUD de artigos e upload de imagens.
- Tradução das páginas públicas Home, Empresa, Gi Reboot, EVA, Matrizes, Contato, Artigos e interface de detalhe de artigo; navegação, FAQ, rodapé, controles 3D, mensagens de e-mail/WhatsApp e textos acessíveis.

## Implementado
- 2026-09-08 — Código, componentes, páginas, estilos e assets sincronizados do repositório público.
- 2026-09-08 — Dependências frontend instaladas e build de produção validado.
- 2026-09-08 — Credenciais administrativas registradas para validação dos fluxos.
- Sessão anterior — Gi Reboot recebeu IntersectionObserver para `body.hero-immersive`; dropdown Soluções compartilhado com a Home, com estilo translúcido no hero e sólido fora dele.
- 2026-09-11 — Versão espanhola e seletor 🇧🇷/🇪🇸 implementados. Rotas, âncoras, marca, materiais e modelos preservados; alternância sem recarregar ou apagar os dados preenchidos.
- 2026-09-11 — Infográfico Gi Reboot ganhou versão espanhola local em `public/versatilidade-es.jpg`, editada a partir da imagem original; português continua usando `versatilidade.jpg`. Logos e selo de certificação mantidos como marcas originais.
- 2026-09-11 — Formulário preserva valores internos dos assuntos/vagas; labels e composição do mailto seguem idioma. Mensagem pré-preenchida do WhatsApp também traduzida.
- 2026-09-11 — Adicionados identificadores de teste em textos/controles públicos e administrativos; componentes 3D repetidos usam prefixos de instância únicos. Administração segue em português, sem mudança na lógica de autenticação.
- 2026-09-11 — Corrigido aviso React de `defaultMuted` (agora propriedade do elemento de vídeo, não prop JSX).
- 2026-09-11 — Investigação confirmou `GI014.glb` ausente tanto localmente quanto na pasta original no GitHub. Não foi inventado ou substituído por outro modelo. GI014 permanece listado como indisponível; carrossel abre GI015 e pula o indisponível. GI015/GI019/GI020 renderizam e navegam normalmente.

## Validação atual
- Relatório abrangente: `/app/test_reports/iteration_1.json`.
- Backend: **9/9 testes aprovados**, incluindo login correto/incorreto, artigos públicos, CRUD autenticado, proteção de rotas, envio/recuperação de PNG e rejeições. Testes em `backend/tests/test_public_api_regression.py`; resultado em `test_reports/pytest/pytest_results.xml`.
- Frontend: seletor, retorno ao português, persistência/reload, valor inválido, âncoras, todas as páginas públicas, formulários sem perda de estado, FAQ, mailto em espanhol, WhatsApp, menu mobile e dropdown imersivo validados. Larguras 320/768/1024/1440 sem problemas de layout reportados.
- Login/admin CRUD e upload validados; artigos temporários removidos pelos testes.
- Reteste após correções: GI015 → GI019 → GI020 → GI015, controles e cor em espanhol, GI014 desabilitado sem requisições falhas, vídeo sem `defaultMuted`, login/preview/logout via novos seletores. **Nenhum erro de console capturado.**
- Build final aprovado; avisos anteriores de minificação CSS `postcss-calc` permanecem, sem regressão visual detectada. Logs em `test_reports/frontend-build.log`.
- Usuário ainda não confirmou visualmente a versão espanhola.

## Limitações preservadas do original
- Conteúdo editorial novo escrito no painel permanece no idioma de publicação; não existe tradução automática de artigos nem editor bilíngue. A interface e os teasers estáticos existentes estão traduzidos.
- Banco de artigos estava vazio; Home/Artigos usam **MOCKED: teasers estáticos de demonstração**. As respectivas páginas de detalhe exibem “artigo não encontrado” enquanto não houver artigo publicado, como no original.
- Contato utiliza `mailto:` para abrir o aplicativo de e-mail, não entrega pelo servidor. Anexos precisam ser incluídos manualmente no e-mail; o formulário apenas referencia o nome do arquivo.
- **MOCKED:** antirrobô é apenas checkbox local (não validação reCAPTCHA real). Link de privacidade ainda não possui documento/destino funcional.
- Credenciais/token administrativos fixos herdados do repositório; não houve alterações ou novas contas. Referência: `memory/test_credentials.md`.

## Backlog priorizado
- P0: nenhum bloqueio conhecido na tradução/seletor solicitado.
- P1: validação visual do usuário da versão espanhola e do seletor.
- P1: obter arquivo 3D original do GI014 para reativá-lo (ausente também no repositório de referência).
- P1: publicar conteúdo real dos artigos no lugar dos teasers demonstrativos.
- P2: editor de artigos com versões pt-BR/es e conteúdo editorial aprovado nos dois idiomas.
- P2: envio real de contato/anexos, antirrobô e política de privacidade, mediante autorização para evoluir o comportamento original.
- P2: revisão de autenticação administrativa mediante autorização; nenhuma revisão de segurança foi solicitada nesta sessão.
- P2: resolver avisos de minificação CSS e ampliar automação contínua dos viewers.

## Próximas tarefas
1. Usuário conferir o seletor ao lado de Contato e alternar entre Português (Brasil) e Español.
2. Se fornecido o modelo GI014 correto, reativar a entrada e validar renderização.
3. Melhoria sugerida: publicação bilíngue de artigos técnicos para atender clientes de língua espanhola.