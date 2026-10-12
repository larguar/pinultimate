// Combine "main-blog" -> main-blog.
// The old card content blocks (title / info / summary / button / tags) become on/off settings.
const RATIOS = { '1.33333': '4x3', 1: '1x1', '1': '1x1', '0.83333': '5x6', '0.666667': '2x3' };

export function cardSettings(section) {
  const s = section.settings || {};
  const blocks = Object.values(section.blocks || {}).filter((b) => !b.disabled);
  const find = (type) => blocks.find((b) => b.type === type);
  const info = find('info');
  const summary = find('summary');
  const button = find('button');
  const tags = find('tags');
  return {
    show_image: s.blog_show_image ?? true,
    image_ratio: RATIOS[s.image_aspect_ratio ?? '1.33333'] || '4x3',
    image_radius: s.image_border_radius ?? 0,
    show_date: info ? info.settings?.show_date ?? true : false,
    show_author: info ? info.settings?.show_author ?? false : false,
    show_comments: info ? info.settings?.show_comments_number ?? false : false,
    show_excerpt: Boolean(summary),
    excerpt_limit: summary?.settings?.excerpt_limit ?? 15,
    show_card_tags: Boolean(tags),
    tags_limit: tags?.settings?.tags_limit ?? 3,
    show_button: Boolean(button),
    button_label: button?.settings?.button_label ?? 'Read more',
  };
}

export default function (section) {
  const s = section.settings || {};
  return {
    type: 'main-blog',
    settings: {
      layout: (s.layout || 'grid-1').startsWith('grid-2') ? 'two_columns' : 'one_column',
      posts_per_page: s.post_limit ?? 6,
      show_tags: s.enable_tags ?? false,
      ...cardSettings(section),
    },
  };
}
