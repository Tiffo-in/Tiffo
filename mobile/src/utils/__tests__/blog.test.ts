import {
  formatPublishedDate,
  normalizePostDetail,
  normalizePostList,
  readingTime,
  toPlainText,
} from '../blog';

describe('readingTime', () => {
  it('rounds to whole minutes at 200 wpm', () => {
    expect(readingTime(new Array(400).fill('word').join(' '))).toBe(2);
  });

  it('returns at least 1 minute for short non-empty text', () => {
    expect(readingTime('a few words here')).toBe(1);
  });

  it('returns 0 for empty content', () => {
    expect(readingTime('')).toBe(0);
    expect(readingTime('   ')).toBe(0);
  });
});

describe('toPlainText', () => {
  it('strips tags and keeps the text', () => {
    expect(toPlainText('<p>Hello <strong>world</strong></p>')).toBe('Hello world');
  });

  it('removes script and style blocks entirely', () => {
    // The body is authored as HTML on the web; scripts must never survive into
    // the reader, which is exactly why this is flattened rather than WebViewed.
    expect(toPlainText('<script>alert(1)</script>Safe')).toBe('Safe');
    expect(toPlainText('<style>.a{}</style>Safe')).toBe('Safe');
  });

  it('turns block endings into line breaks', () => {
    expect(toPlainText('<p>One</p><p>Two</p>')).toBe('One\nTwo');
  });

  it('decodes common entities', () => {
    expect(toPlainText('Tom &amp; Jerry &quot;quoted&quot; &#39;x&#39;')).toBe(
      'Tom & Jerry "quoted" \'x\'',
    );
  });

  it('collapses excessive blank lines', () => {
    expect(toPlainText('A<br><br><br><br>B')).toBe('A\n\nB');
  });
});

describe('normalizePostList', () => {
  it('maps a list of posts', () => {
    const posts = normalizePostList([{ _id: '1', slug: 'a', title: 'A' }]);
    expect(posts).toHaveLength(1);
    expect(posts[0].title).toBe('A');
  });

  it('returns empty for a non-array', () => {
    expect(normalizePostList(null)).toEqual([]);
    expect(normalizePostList('nope')).toEqual([]);
  });

  it('drops entries with neither slug nor id, which cannot be opened', () => {
    expect(normalizePostList([{ title: 'Orphan' }])).toEqual([]);
  });

  it('falls back to Untitled rather than rendering blank', () => {
    expect(normalizePostList([{ slug: 'a' }])[0].title).toBe('Untitled');
  });

  it('accepts the image and summary aliases', () => {
    const p = normalizePostList([{ slug: 'a', image: 'u', summary: 's' }])[0];
    expect(p.coverImage).toBe('u');
    expect(p.excerpt).toBe('s');
  });
});

describe('normalizePostDetail', () => {
  it('flattens content and recomputes read time from the body', () => {
    const detail = normalizePostDetail({
      slug: 'a',
      title: 'A',
      content: `<p>${new Array(200).fill('word').join(' ')}</p>`,
    });
    expect(detail.content).not.toContain('<p>');
    expect(detail.readMinutes).toBe(1);
  });

  it('reads the populated author name', () => {
    expect(normalizePostDetail({ slug: 'a', author: { name: 'Ravi' } }).authorName).toBe('Ravi');
  });

  it('survives a missing payload', () => {
    const d = normalizePostDetail(undefined);
    expect(d.title).toBe('Untitled');
    expect(d.content).toBe('');
  });
});

describe('formatPublishedDate', () => {
  it('formats a valid ISO date', () => {
    expect(formatPublishedDate('2026-07-25T00:00:00Z')).toContain('2026');
  });

  it('returns empty for missing or unparseable dates', () => {
    expect(formatPublishedDate('')).toBe('');
    expect(formatPublishedDate('not-a-date')).toBe('');
  });
});
