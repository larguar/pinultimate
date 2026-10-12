// Combine "info-tabs" -> timeline (numbered steps, one open at a time, with an image per step).
// On /collections/custom it is "How It Works – Timeline".
import { mapBlocks } from '../lib.mjs';
import { headingSettings, topSpacing } from './_content-shared.mjs';

const POSITIONS = { left: 'left', right: 'right', 'no-image': 'none' };
const WIDTHS = { half: 'half', third: 'third', fourth: 'third' };
const RATIOS = { 1: 'square', 0.83333: 'portrait', 0.666667: 'tall' };

export default function (section, { key }) {
  const s = section.settings;
  if (s.autoplay_active) console.warn(`info-tabs ${key}: autoplay not carried over`);

  const converted = mapBlocks(section, (block) => {
    const b = block.settings || {};
    return {
      type: 'step',
      settings: {
        title: b.title ?? '',
        caption: b.subtitle ?? '',
        text: b.caption ?? '',
        ...(b.image && { image: b.image }),
      },
    };
  });

  const { heading, subheading, heading_alignment, heading_tag } = headingSettings(s);
  return {
    type: 'timeline',
    ...converted,
    settings: {
      heading,
      subheading,
      // The previous theme's custom stylesheet styled these headings 40px italic.
      heading_size: 'large',
      heading_italic: true,
      heading_alignment,
      heading_tag,
      show_numbers: s.style === 'list',
      image_position: POSITIONS[s.image_position] || 'right',
      image_width: WIDTHS[s.desktop_layout] || 'half',
      image_ratio: RATIOS[Number(s.image_aspect_ratio)] || 'portrait',
      spacing: topSpacing(s),
    },
  };
}
