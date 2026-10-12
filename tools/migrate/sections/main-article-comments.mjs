// Combine "main-article-comments" -> main-article-comments.
export default function (section) {
  const s = section.settings || {};
  return {
    type: 'main-article-comments',
    settings: { style: (s.style ?? 'primary') === 'primary' ? 'filled' : 'outline' },
  };
}
