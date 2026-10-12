// Combine "featured-collection-more" (the agency's six-across image row) -> featured-collection (compact style).
const COLLECTION_TITLE = '{{ section.settings.collection.title }}';
const token = (value = '') => value.replaceAll(COLLECTION_TITLE, '{collection}');

export default function (section) {
  const s = section.settings;
  return {
    type: 'featured-collection',
    settings: {
      collection: s.collection,
      heading: token(s.heading),
      subheading: token(s.subheading),
      style: 'compact',
      products_count: s.products_number ?? 6,
      show_button: s.show_view_all ?? true,
      button_label: token(s['button-label'] || 'Shop {collection}'),
      // The homepage instances had a light background added in the custom stylesheet.
      background: 'light',
      spacing: 'small',
    },
  };
}
