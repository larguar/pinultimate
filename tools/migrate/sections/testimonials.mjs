// Combine "testimonials" -> testimonials (Swiper carousel of quote cards).
import { mapBlocks } from '../lib.mjs';
import { headingSettings, topSpacing, background } from './_content-shared.mjs';

// Combine had no rating field; the merchant typed stars into the author title.
const STARS = /^\s*([★☆]+)\s*$/;

export default function (section) {
  const s = section.settings;
  const converted = mapBlocks(section, (block) => {
    const b = block.settings || {};
    const stars = (b.author_title || '').match(STARS);
    return {
      type: 'testimonial',
      settings: {
        author_name: b.author_name ?? '',
        rating: stars ? String([...stars[1]].filter((c) => c === '★').length) : '0',
        author_title: stars ? '' : b.author_title ?? '',
        quote: b.quote ?? '',
        ...(b.image && { image: b.image }),
      },
    };
  });

  return {
    type: 'testimonials',
    ...converted,
    settings: {
      ...headingSettings(s),
      layout: s.layout_mode === 'grid' ? 'grid' : 'carousel',
      columns_desktop: 3,
      text_alignment: s.content_alignment === 'center' ? 'center' : 'left',
      show_border: s.color_hide_borders !== true,
      background: background(s.section_background_color),
      spacing: topSpacing(s),
    },
  };
}
