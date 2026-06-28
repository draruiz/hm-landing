/**
 * Client-side i18n engine.
 *
 * Strategy: English is the source of truth and ships in the HTML. When a
 * visitor selects Spanish, we walk the rendered DOM and replace each visible
 * English string (text nodes + a few translatable attributes) with its
 * Spanish counterpart from the `es` dictionary. The choice is stored in
 * localStorage and applied on every subsequent page load.
 *
 * Switching back to English simply reloads the page without translating, so we
 * never need a reverse map and can't drift out of sync.
 */
import { es } from "./es";

export type Lang = "en" | "es";

const STORAGE_KEY = "hm-lang";
const ATTR_KEYS = ["placeholder", "title", "aria-label", "alt"] as const;

export function getLang(): Lang {
  try {
    return localStorage.getItem(STORAGE_KEY) === "es" ? "es" : "en";
  } catch {
    return "en";
  }
}

/**
 * Normalize a string for dictionary lookup: collapse whitespace and unify
 * curly quotes/apostrophes to straight ones, so the dictionary matches
 * regardless of how the source happens to write a quote.
 */
function normalizeKey(s: string): string {
  return s
    .replace(/\s+/g, " ")
    .replace(/[‘’‚‛]/g, "'")
    .replace(/[“”„‟]/g, '"')
    .trim();
}

// Precompute a normalized lookup once so curly/straight and whitespace
// variations all resolve to the same entry.
const lookup: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const k in es) {
    const nk = normalizeKey(k);
    if (nk) map[nk] = es[k];
  }
  return map;
})();

function setLang(lang: Lang): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* ignore (private mode, etc.) */
  }
  location.reload();
}

/**
 * Translate a raw string while preserving surrounding whitespace.
 *
 * DOM text nodes keep the source's newlines/indentation, so we collapse
 * internal whitespace to single spaces to build the lookup key. Dictionary
 * keys are therefore stored as single-line, single-spaced strings.
 * Returns null when there's no translation for the normalized content.
 */
function translate(value: string): string | null {
  const m = value.match(/^(\s*)([\s\S]*?)(\s*)$/);
  if (!m) return null;
  const [, lead, core, trail] = m;
  if (!core) return null;
  const key = normalizeKey(core);
  const hit = lookup[key];
  if (hit === undefined || hit === key) return null;
  return lead + hit + trail;
}

/**
 * The browser tab title is "<Page Title> | Healthy Mind Specialists". Translate
 * each " | "-separated segment so the page part localizes and the brand stays.
 */
function translateTitle(): void {
  const parts = document.title.split(" | ");
  let changed = false;
  const out = parts.map((p) => {
    const t = translate(p);
    if (t !== null) {
      changed = true;
      return t;
    }
    return p;
  });
  if (changed) document.title = out.join(" | ");
}

function translateTextNode(node: Text): void {
  const next = translate(node.nodeValue || "");
  if (next !== null) node.nodeValue = next;
}

function translateElementAttrs(el: Element): void {
  if (el.closest("[data-no-i18n]")) return;
  for (const attr of ATTR_KEYS) {
    const v = el.getAttribute(attr);
    if (!v) continue;
    const next = translate(v);
    if (next !== null) el.setAttribute(attr, next);
  }
}

function translateTree(root: Node): void {
  // Text nodes — skip script/style/noscript and opted-out subtrees.
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = (node as Text).parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      const tag = parent.tagName;
      if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT")
        return NodeFilter.FILTER_REJECT;
      if (parent.closest("[data-no-i18n]")) return NodeFilter.FILTER_REJECT;
      if (!node.nodeValue || !node.nodeValue.trim())
        return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const textNodes: Text[] = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode as Text);
  for (const node of textNodes) translateTextNode(node);

  // Attributes on the root (if element) and all descendants.
  if (root instanceof Element) translateElementAttrs(root);
  const scope = root instanceof Element ? root : document.body;
  scope.querySelectorAll("*").forEach(translateElementAttrs);

  // Document title (per " | " segment).
  translateTitle();
}

/** Translate nodes that get injected after initial render (async content). */
function watchDynamic(): void {
  const obs = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((n) => {
        if (n.nodeType === Node.ELEMENT_NODE) translateTree(n);
        else if (n.nodeType === Node.TEXT_NODE) translateTextNode(n as Text);
      });
    }
  });
  obs.observe(document.body, { childList: true, subtree: true });
}

function wireToggle(current: Lang): void {
  const btn = document.getElementById("lang-toggle");
  if (!btn) return;
  const label = btn.querySelector<HTMLElement>(".lang-toggle__label");
  // Show the language you'd switch TO.
  if (label) label.textContent = current === "es" ? "English" : "Español";
  btn.setAttribute(
    "aria-label",
    current === "es" ? "Switch to English" : "Cambiar a Español",
  );
  btn.addEventListener("click", () => setLang(current === "es" ? "en" : "es"));
}

export function initI18n(): void {
  const lang = getLang();
  if (lang === "es") {
    translateTree(document.body);
    watchDynamic();
  }
  // Reveal content (the head script hides <body> for Spanish to avoid a flash).
  document.documentElement.classList.remove("i18n-pending");
  wireToggle(lang);
}
