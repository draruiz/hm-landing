const API_BASE = import.meta.env.PUBLIC_HM_CMS_URL;

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

export function getCoverImage(url: string | null): string {
  return url ?? FALLBACK_IMAGE;
}

export async function fetchBlogArticles(): Promise<BlogArticle[]> {
  const res = await fetch(`${API_BASE}/blog/articles`);
  if (!res.ok) {
    throw new Error(`Failed to fetch blog articles: ${res.status}`);
  }
  return res.json() as Promise<BlogArticle[]>;
}

export async function fetchBlogArticleBySlug(
  slug: string,
): Promise<BlogArticleDetail | null> {
  const res = await fetch(
    `${API_BASE}/blog/articles/${encodeURIComponent(slug)}`,
  );
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to fetch article "${slug}": ${res.status}`);
  }
  return res.json() as Promise<BlogArticleDetail>;
}
