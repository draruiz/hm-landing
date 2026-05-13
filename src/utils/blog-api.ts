import { blogPosts, getPostBySlug } from "./blog-data";

const API_BASE = import.meta.env.PUBLIC_HM_CMS_URL?.trim();

export interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string | null;
  publishedAt: string;
  createdAt: string;
}

export interface BlogArticleDetail extends BlogArticle {
  content: string;
  status: string;
  createdBy: string;
  updatedBy: string | null;
  updatedAt: string;
  deletedAt: string | null;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=1200&h=630&fit=crop&q=80";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatInlineMarkdown(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function markdownToHtml(markdown: string): string {
  const blocks: string[] = [];
  const lines = markdown.trim().split(/\r?\n/);
  let paragraphLines: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (paragraphLines.length === 0) return;
    blocks.push(`<p>${formatInlineMarkdown(paragraphLines.join(" "))}</p>`);
    paragraphLines = [];
  };

  const flushList = () => {
    if (!listType || listItems.length === 0) return;
    blocks.push(
      `<${listType}>${listItems
        .map((item) => `<li>${formatInlineMarkdown(item)}</li>`)
        .join("")}</${listType}>`,
    );
    listType = null;
    listItems = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      const headingLevel = headingMatch[1].length;
      blocks.push(
        `<h${headingLevel}>${formatInlineMarkdown(headingMatch[2])}</h${headingLevel}>`,
      );
      continue;
    }

    const unorderedMatch = trimmed.match(/^[-*]\s+(.*)$/);
    if (unorderedMatch) {
      flushParagraph();
      if (listType === "ol") flushList();
      listType = "ul";
      listItems.push(unorderedMatch[1]);
      continue;
    }

    const orderedMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (orderedMatch) {
      flushParagraph();
      if (listType === "ul") flushList();
      listType = "ol";
      listItems.push(orderedMatch[1]);
      continue;
    }

    flushList();
    paragraphLines.push(trimmed);
  }

  flushParagraph();
  flushList();

  return blocks.join("\n");
}

function fallbackArticles(): BlogArticle[] {
  return blogPosts.map((post) => ({
    id: post.slug,
    title: post.title,
    slug: post.slug,
    excerpt: post.description,
    coverImageUrl: post.heroImage ?? FALLBACK_IMAGE,
    publishedAt: post.publishedDate,
    createdAt: post.publishedDate,
  }));
}

function fallbackArticleDetail(slug: string): BlogArticleDetail | null {
  const post = getPostBySlug(slug);

  if (!post) return null;

  return {
    id: post.slug,
    title: post.title,
    slug: post.slug,
    excerpt: post.description,
    coverImageUrl: post.heroImage ?? FALLBACK_IMAGE,
    publishedAt: post.publishedDate,
    createdAt: post.publishedDate,
    content: markdownToHtml(post.content),
    status: "published",
    createdBy: post.author,
    updatedBy: null,
    updatedAt: post.modifiedDate,
    deletedAt: null,
  };
}

async function fetchJson<T>(path: string): Promise<T | null> {
  if (!API_BASE) return null;

  try {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export function getCoverImage(url: string | null): string {
  return url ?? FALLBACK_IMAGE;
}

export async function fetchBlogArticles(): Promise<BlogArticle[]> {
  const remoteArticles = await fetchJson<BlogArticle[]>("/blog/articles");

  return remoteArticles ?? fallbackArticles();
}

export async function fetchBlogArticleBySlug(
  slug: string,
): Promise<BlogArticleDetail | null> {
  const remoteArticle = await fetchJson<BlogArticleDetail>(
    `/blog/articles/${encodeURIComponent(slug)}`,
  );

  return remoteArticle ?? fallbackArticleDetail(slug);
}
