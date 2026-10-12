// Combine "products-set" -> products-set (Bootstrap rebuild).
// Card blocks (title, price…) are dropped: the shared product card shows title and price.
const stripTags = (value = '') => value.replace(/<[^>]*>/g, '');

export default function (section) {
  const s = section.settings || {};
  return {
    type: 'products-set',
    settings: {
      heading: s.heading ?? '',
      subheading: stripTags(s.subheading),
      products: s.products ?? [],
      panel_title: s.panel_title ?? '',
      panel_subtitle: s.panel_subtitle ?? '',
      panel_bg_color: s.panel_bg_color || '#3E3E3E',
      panel_text_color: s.panel_text_color || '#F5F5F5',
      spacing: s.gutter_decrease ? 'small' : 'default',
    },
  };
}
