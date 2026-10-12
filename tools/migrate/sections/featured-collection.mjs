// Combine "featured-collection" (product card grid) -> featured-collection (cards style).
const columns = (layout = '', fallback) => layout.match(/^grid-(\d)/)?.[1] ?? fallback;

export default function (section) {
  const s = section.settings;
  const desktop = columns(s.layout, '4');
  return {
    type: 'featured-collection',
    settings: {
      collection: s.collection,
      heading: s.heading ?? '',
      // Combine allowed markup in the subheading; the new one is plain text.
      subheading: (s.subheading ?? '').replace(/<[^>]+>/g, ''),
      style: 'cards',
      products_count: s.products_number ?? 8,
      columns_desktop: ['3', '4', '5'].includes(desktop) ? desktop : '4',
      columns_mobile: s.layout_mobile === 'grid-palm-1' ? '1' : '2',
      show_button: s.show_view_all ?? true,
      button_label: 'Shop {collection}',
      spacing: s.gutter_decrease ? 'small' : 'default',
    },
  };
}
