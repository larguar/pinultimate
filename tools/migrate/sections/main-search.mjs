// Combine "main-search" -> main-search. Card blocks become card settings.
// The previous theme collapsed "grid-lap-2" grids to one column below 475px (custom stylesheet).
export default function (section) {
  const s = section.settings;
  const types = Object.values(section.blocks || {}).map((block) => block.type);
  const layout = (s.layout || '').split(' ');
  let mobile = s.layout_mobile === 'grid-palm-1' ? '1' : '2';
  if (layout.includes('grid-lap-2')) mobile = '1';

  return {
    type: 'main-search',
    settings: {
      results_per_page: s.results_number ?? 48,
      enable_filtering: s.enable_filtering ?? true,
      enable_sorting: s.enable_sorting ?? true,
      columns_desktop: layout.includes('grid-3') ? '3' : '4',
      columns_mobile: mobile,
      show_vendor: types.includes('vendor'),
      show_price: types.includes('price'),
      show_quick_add: types.includes('quick_buy'),
    },
  };
}
