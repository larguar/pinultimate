// Combine "products-bundle" -> products-bundle (bundle builder, Bootstrap rebuild).
// Card blocks (title, price…) are dropped: the tiles show the product image only, as the
// agency's styling of the previous theme did.
export default function (section) {
  const s = section.settings || {};
  return {
    type: 'products-bundle',
    settings: {
      heading: s.heading ?? '',
      subheading: s.subheading ?? '',
      ...(s.select_collection ? { collection: s.select_collection } : {}),
      collection_limit: s.collection_limit ?? 12,
      products: s.select_products ?? [],
      once_per_product: s.limit_bundles ?? true,
      bundle_size: s.discount_items ?? 2,
      allow_more: !!s.limit_maximum,
      discount_title: s.discount_title ?? '',
      panel_bg_color: s.panel_bg_color || '#3E3E3E',
      panel_text_color: s.panel_text_color || '#F5F5F5',
      open_on_mobile: s.discount_opened ?? true,
      button_label: s.cta_label ?? '',
      button_link: s.cta_url ?? '',
      spacing: s.gutter_decrease ? 'small' : 'default',
    },
  };
}
