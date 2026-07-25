// Blog helpers for the customer content reader.
//
// Consumes the public endpoints in backend/src/routes/blog.js:
//   GET /blog             -> list (content field is stripped server-side)
//   GET /blog/categories
//   GET /blog/:slug       -> full post including `content`
//   POST /blog/:id/view   -> view counter
//
// The list endpoint `.select('-content')`, so summaries never carry the body —
// hence the separate summary and detail shapes below.

export interface BlogPostSummary {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  category: string;
  publishedAt: string;
  readMinutes: number;
}

export interface BlogPostDetail extends BlogPostSummary {
  content: string;
  authorName: string;
}

const WORDS_PER_MINUTE = 200;

function str(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

/** Estimated read time in whole minutes, minimum 1 for any non-empty text. */
export function readingTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  if (words === 0) return 0;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/**
 * Strip HTML/markdown to readable text.
 *
 * The blog body is authored as HTML on the web. Rendering it raw in a React
 * Native <Text> would show tags, and injecting it into a WebView would be an
 * XSS surface for a screen that does not need one — so it is flattened to text.
 */
export function toPlainText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<\/(p|div|h[1-6]|li|br)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function normalizeSummary(raw: unknown): BlogPostSummary {
  const p = (raw ?? {}) as Record<string, unknown>;
  const excerpt = str(p.excerpt) || str(p.summary);
  return {
    _id: str(p._id),
    slug: str(p.slug),
    title: str(p.title) || 'Untitled',
    excerpt,
    coverImage: str(p.coverImage) || str(p.image),
    category: str(p.category),
    publishedAt: str(p.publishedAt) || str(p.createdAt),
    readMinutes: typeof p.readMinutes === 'number' ? p.readMinutes : readingTime(excerpt),
  };
}

export function normalizePostList(raw: unknown): BlogPostSummary[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeSummary).filter((p) => p.slug || p._id);
}

export function normalizePostDetail(raw: unknown): BlogPostDetail {
  const p = (raw ?? {}) as Record<string, unknown>;
  const summary = normalizeSummary(p);
  const content = toPlainText(str(p.content));
  const author = (p.author ?? {}) as Record<string, unknown>;
  return {
    ...summary,
    content,
    authorName: str(author.name),
    readMinutes: content ? readingTime(content) : summary.readMinutes,
  };
}

/** Human date for a post, or '' when the date is missing or unparseable. */
export function formatPublishedDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
