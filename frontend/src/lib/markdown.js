import DOMPurify from "dompurify";
import { marked } from "marked";
import { resolveMediaUrl } from "./api";

// Imported HTML keeps original paragraph/heading/emphasis boundaries.
// Existing admin-created Markdown remains supported by the same safe renderer.
export function renderArticleContent(content = "", format = "markdown", prefix = "article-content") {
  const raw = format === "html" ? content : marked.parse(content, { async: false, gfm: true });
  const clean = DOMPurify.sanitize(raw, {
    ALLOWED_TAGS: ["p", "h1", "h2", "h3", "h4", "h5", "h6", "strong", "b", "em", "i", "u", "span", "mark", "ul", "ol", "li", "blockquote", "a", "img", "figure", "figcaption", "br", "hr", "pre", "code", "del", "sub", "sup", "table", "thead", "tbody", "tr", "th", "td"],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "width", "height", "class", "start", "colspan", "rowspan"],
    ALLOW_DATA_ATTR: false,
    FORBID_ATTR: ["style"],
  });
  const template = document.createElement("template");
  template.innerHTML = clean;
  template.content.querySelectorAll("*").forEach((element, index) => {
    element.dataset.testid = `${prefix}-${element.tagName.toLowerCase()}-${index}`;
    if (element.tagName === "IMG") {
      element.setAttribute("src", resolveMediaUrl(element.getAttribute("src") || ""));
      element.setAttribute("loading", "lazy");
      element.setAttribute("decoding", "async");
    }
  });
  return template.innerHTML;
}

export const renderMarkdown = (content = "") => renderArticleContent(content);