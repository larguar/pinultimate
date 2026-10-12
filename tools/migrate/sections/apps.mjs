// Combine "apps" -> apps. App blocks are carried over unchanged (type, settings, ids, order).
export default function (section) {
  const s = section.settings || {};
  return {
    type: 'apps',
    settings: {
      subheading: (s.subheading || '').replace(/<[^>]+>/g, ''),
      heading: s.heading || '',
      heading_alignment: (s.section_heading_layout || '').includes('center') ? 'center' : 'left',
      full_width: s.full_width ?? false,
      // The previous theme's "remove margin" reduced the top spacing.
      spacing: s.remove_margin ? 'small' : 'default',
    },
    blocks: section.blocks || {},
    block_order: section.block_order || Object.keys(section.blocks || {}),
  };
}
