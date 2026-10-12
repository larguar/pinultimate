// Combine "product-recommendations" -> product-recommendations. Card blocks become card settings.
// The previous theme collapsed "grid-lap-2" grids to one column below 475px (custom stylesheet),
// so recommendations showed one column on phones.
export default function (section) {
  const s = section.settings;
  const order = section.block_order || Object.keys(section.blocks || {});
  const blocks = order.map((id) => section.blocks[id]);
  const types = blocks.map((block) => block.type);
  const link = blocks.find((block) => block.type === 'product_link');
  const inline = (s.section_heading_layout || 'section-heading--left section-heading--one-row').includes('one-row');

  return {
    type: 'product-recommendations',
    settings: {
      heading: s.heading ?? '',
      subheading: s.subheading ?? '',
      heading_style: inline ? 'inline' : 'center',
      intent: 'related',
      products_to_show: 4,
      columns_desktop: s.layout_desktop === 'three-columns' ? '3' : '4',
      columns_mobile: '1',
      one_row: s.layout_mobile_less_items ?? true,
      show_vendor: types.includes('vendor'),
      show_price: types.includes('price'),
      price_first: types.includes('price') && types.indexOf('price') < types.indexOf('title'),
      show_quick_add: types.includes('quick_buy'),
      button_label: link ? link.settings.button_label || 'View product' : '',
    },
  };
}
