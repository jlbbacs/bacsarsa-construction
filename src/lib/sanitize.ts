import DOMPurify from "dompurify";

// Matches exactly what the admin RichTextEditor's configured Tiptap
// extensions can emit (StarterKit, Underline, Link, Image, TextAlign,
// TaskList/TaskItem, Table*, Highlight) -- defense-in-depth for
// dangerouslySetInnerHTML in BlogPost.tsx. Today's practical exposure is "a
// compromised admin account" (posts are admin-authored behind auth, with no
// public submission path), but there's otherwise zero server-side
// sanitization on stored content.
const ALLOWED_TAGS = [
  "p", "br", "hr",
  "h1", "h2", "h3", "h4",
  "strong", "em", "s", "u", "mark", "code", "pre",
  "blockquote",
  "ul", "ol", "li",
  "a", "img",
  "table", "thead", "tbody", "tr", "th", "td",
  "input",
];

const ALLOWED_ATTR = [
  "href", "target", "rel",
  "src", "alt", "title",
  "class", "style",
  "type", "checked", "disabled",
  "data-type", "data-checked",
  "colspan", "rowspan",
];

// TextAlign is the only extension that emits inline `style`, so the style
// attribute is scoped to just that -- strips anything else (e.g. a
// background-image/url() or position-based clickjacking payload) even if it
// somehow ended up in stored content_html.
DOMPurify.addHook("uponSanitizeAttribute", (_node, data) => {
  if (data.attrName === "style") {
    const match = data.attrValue.match(/text-align\s*:\s*(left|right|center|justify)/i);
    data.attrValue = match ? match[0] : "";
  }
});

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
}
