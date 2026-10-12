// Combine "text-columns-images" -> multicolumn (full-width images). On /collections/wholesale it
// has no columns and only shows its "Catalog" heading above the product grid.
import { mapBlocks } from '../lib.mjs';
import { headingSettings, topSpacing, background, gridColumns } from './_content-shared.mjs';

const RATIOS = { 1: 'square', 1.33333: 'standard', 1.5: 'landscape' };

export default function (section) {
  const s = section.settings;
  const converted = mapBlocks(section, (block) => {
    const b = block.settings || {};
    return {
      type: 'column',
      settings: {
        ...(b.image && { image: b.image }),
        icon: 'none',
        title: b.title ?? '',
        text: b.caption ?? '',
        link: b.link ?? '',
        link_label: '',
      },
    };
  });

  return {
    type: 'multicolumn',
    ...converted,
    settings: {
      ...headingSettings(s),
      layout: s.style === 'grid' ? 'grid' : 'carousel',
      ...gridColumns(s.layout),
      media_style: 'image',
      image_ratio: RATIOS[Number(s.image_aspect_ratio)] || 'square',
      card_style: 'bordered',
      text_alignment: s.text_alignment === 'text-align--left' ? 'left' : 'center',
      background: background(s.section_background_color),
      spacing: topSpacing(s),
    },
  };
}
