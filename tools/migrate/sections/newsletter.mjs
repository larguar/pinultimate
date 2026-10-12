// Combine "newsletter" (heading, email form, small text below) -> newsletter.

// The password page's text was saved without its closing </p>; richtext settings need valid HTML.
const closeParagraphs = (html) => {
  const open = (html.match(/<p[\s>]/g) || []).length;
  const closed = (html.match(/<\/p>/g) || []).length;
  return html + '</p>'.repeat(Math.max(0, open - closed));
};

export default function (section) {
  const s = section.settings;
  return {
    type: 'newsletter',
    settings: {
      heading: s.title ?? 'Your best promotion yet',
      ...(s.text !== undefined && { text: closeParagraphs(s.text) }),
      heading_tag: ['h2', 'h3', 'h4'].includes(s.seo_h_tag) ? s.seo_h_tag : 'h2',
      // Combine's newsletter was a card on a light gray background (its default, and the
      // value used on every template); the theme's "light" color is the closest match.
      background: 'light',
      full_width: Boolean(s.is_fullwidth),
      spacing: s.remove_margin ? 'none' : s.gutter_decrease ? 'small' : 'default',
    },
  };
}
