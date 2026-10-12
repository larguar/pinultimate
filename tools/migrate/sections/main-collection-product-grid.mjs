// Combine "main-collection-product-grid" -> main-collection-product-grid.
// The old card blocks (title, vendor, price, quick buy) become card settings.
// Previous-theme quirks carried over as settings:
// - a custom stylesheet rule hid prices on the wholesale collection (body#wholesale);
// - another collapsed every grid without a sidebar to one column below 475px.
export default function (section, { template }) {
  const s = section.settings;
  const types = Object.values(section.blocks || {}).map((block) => block.type);
  const hasFacets = (s.enable_filtering ?? true) || (s.enable_sorting ?? true);
  const sidebar = hasFacets && (s.filters_position ?? 'sidebar') === 'sidebar';
  let mobile = s.layout_mobile === 'grid-palm-1' ? '1' : '2';
  if (!sidebar && s.layout_desktop !== 'three-columns') mobile = '1';

  return {
    type: 'main-collection-product-grid',
    settings: {
      products_per_page: s.products_number ?? 24,
      enable_filtering: s.enable_filtering ?? true,
      enable_sorting: s.enable_sorting ?? true,
      filters_layout: s.filters_position === 'top' ? 'top' : 'sidebar',
      columns_desktop: s.layout_desktop === 'three-columns' ? '3' : '4',
      columns_mobile: mobile,
      show_vendor: types.includes('vendor'),
      show_price: types.includes('price') && !template.includes('wholesale'),
      show_quick_add: types.includes('quick_buy'),
    },
  };
}
