// Renderizador leve de markdown -> HTML (sem dependências)
// Suporta: # H1..H6, **bold**, *italic*, `code`, ```block```, listas -/*/+ e 1., links [txt](url),
// imagens ![alt](src), blockquote >, hr ---, parágrafos, quebras de linha duplas.

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inline(text) {
  let s = escapeHtml(text);
  // imagens ![alt](src)
  s = s.replace(/!\[([^\]]*)\]\(([^\)\s]+)(?:\s+"([^"]*)")?\)/g,
    '<img alt="$1" src="$2" title="$3" loading="lazy" />');
  // links [txt](url)
  s = s.replace(/\[([^\]]+)\]\(([^\)\s]+)(?:\s+"([^"]*)")?\)/g,
    '<a href="$2" title="$3" target="_blank" rel="noopener noreferrer">$1</a>');
  // code inline
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  // bold
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // italic
  s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  return s;
}

export function renderMarkdown(md = "") {
  if (!md) return "";
  const lines = md.replace(/\r\n?/g, "\n").split("\n");
  const out = [];
  let i = 0;
  let inCode = false;
  let codeBuf = [];
  let listType = null; // 'ul' | 'ol'
  let listBuf = [];
  let paraBuf = [];

  const flushPara = () => {
    if (paraBuf.length) {
      out.push(`<p>${inline(paraBuf.join(" "))}</p>`);
      paraBuf = [];
    }
  };
  const flushList = () => {
    if (listBuf.length) {
      const tag = listType;
      out.push(`<${tag}>` + listBuf.map((it) => `<li>${inline(it)}</li>`).join("") + `</${tag}>`);
      listBuf = [];
      listType = null;
    }
  };

  while (i < lines.length) {
    const line = lines[i];
    if (inCode) {
      if (/^```/.test(line)) {
        out.push(`<pre><code>${escapeHtml(codeBuf.join("\n"))}</code></pre>`);
        codeBuf = [];
        inCode = false;
      } else {
        codeBuf.push(line);
      }
      i++;
      continue;
    }
    if (/^```/.test(line)) {
      flushPara();
      flushList();
      inCode = true;
      i++;
      continue;
    }
    // headings
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      flushPara(); flushList();
      const level = h[1].length;
      out.push(`<h${level}>${inline(h[2].trim())}</h${level}>`);
      i++; continue;
    }
    // hr
    if (/^\s*---+\s*$/.test(line)) {
      flushPara(); flushList();
      out.push("<hr />");
      i++; continue;
    }
    // blockquote
    if (/^>\s?/.test(line)) {
      flushPara(); flushList();
      const quote = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quote.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      out.push(`<blockquote>${inline(quote.join(" "))}</blockquote>`);
      continue;
    }
    // unordered list
    const ul = /^\s*[-*+]\s+(.*)$/.exec(line);
    if (ul) {
      flushPara();
      if (listType && listType !== "ul") flushList();
      listType = "ul";
      listBuf.push(ul[1]);
      i++; continue;
    }
    // ordered list
    const ol = /^\s*\d+\.\s+(.*)$/.exec(line);
    if (ol) {
      flushPara();
      if (listType && listType !== "ol") flushList();
      listType = "ol";
      listBuf.push(ol[1]);
      i++; continue;
    }
    // blank line -> flush paragraph
    if (/^\s*$/.test(line)) {
      flushPara();
      flushList();
      i++; continue;
    }
    // paragraph accumulator
    flushList();
    paraBuf.push(line.trim());
    i++;
  }
  flushPara();
  flushList();
  if (inCode && codeBuf.length) {
    out.push(`<pre><code>${escapeHtml(codeBuf.join("\n"))}</code></pre>`);
  }
  return out.join("\n");
}
