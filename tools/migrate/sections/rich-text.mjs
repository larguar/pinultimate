// Combine "rich-text" -> rich-text (eyebrow / heading / text / button blocks with an optional side image).
import { mapBlocks, isUnsetColor } from '../lib.mjs';

const POSITIONS = { left: 'left', right: 'right', top: 'top', 'top no-image': 'none' };
// Combine's "small" height was overridden to "fit content" for every rich text in the custom stylesheet.
const HEIGHTS = { small: 'auto', regular: 'medium', large: 'large' };
const TITLE_SIZES = { 'heading-size--small': 'small', 'heading-size--regular': 'medium', 'heading-size--large': 'large' };
const ALIGNMENTS = { 'horizontal-left': 'left', 'horizontal-center': 'center', 'horizontal-right': 'right' };
const BACKGROUNDS = { '#f4f3f2': 'light', '#ededed': 'light', '#feff86': 'yellow', '#8ed6cf': 'blue', '#ddc7e8': 'purple', '#c6cc3d': 'green', '#14452f': 'primary', '#696969': 'dark', '#1e1e1e': 'dark' };

// Per-instance tweaks the previous theme made in its custom stylesheet (assets/style.css.liquid).
const INSTANCE = {
  // Homepage intro: 42px under the heading, eyebrow wraps at 220px on phones.
  rich_text_HrEAqK: { button_spacing: 42, eyebrow_max_width_mobile: 220 },
  // "Celebrating the Makers": extra space below the section.
  rich_text_Rq767t: { bottom_spacing: true },
};

const stripParagraph = (html = '') => html.replace(/^\s*<p>([\s\S]*?)<\/p>\s*$/, '$1');

export default function (section, { key }) {
  const s = section.settings;
  const tweaks = INSTANCE[key] || {};
  const spacing = s.spacing ?? 24;

  const converted = mapBlocks(section, (block) => {
    const b = block.settings || {};
    switch (block.type) {
      case 'title':
        return {
          type: 'title',
          settings: {
            title: b.title ?? '',
            size: TITLE_SIZES[b.title_size] || 'medium',
            heading_tag: ['h1', 'h2', 'h3', 'h4'].includes(b.seo_h_tag) ? b.seo_h_tag : 'h2',
          },
        };
      case 'text':
        // "Large" text was styled as the small uppercase eyebrow by the custom stylesheet.
        if (b.text_size === 'large') {
          return {
            type: 'eyebrow',
            settings: { text: stripParagraph(b.text), max_width_mobile: tweaks.eyebrow_max_width_mobile ?? 0 },
          };
        }
        return { type: 'text', settings: { text: b.text ?? '' } };
      case 'button':
        return {
          type: 'button',
          settings: {
            label: b.button_label ?? '',
            link: b.link ?? '',
            style: b.button_style === 'outline' ? 'outline' : 'solid',
            new_tab: b.open_in_new_window === true,
          },
        };
      case 'custom_liquid':
        console.warn(`rich-text ${key}: custom liquid block dropped`);
        return null;
      default:
        return null;
    }
  });

  const background = isUnsetColor(s.color_background_main)
    ? 'none'
    : BACKGROUNDS[s.color_background_main.toLowerCase()] || 'light';

  if (s.video) console.warn(`rich-text ${key}: background video not carried over`);

  let top = 'default';
  if (s.remove_margin) top = 'none';
  else if (s.gutter_decrease) top = 'compact';

  return {
    type: 'rich-text',
    ...converted,
    settings: {
      ...(s.image && { image: s.image }),
      image_position: s.image ? POSITIONS[s.image_position] || 'right' : 'none',
      image_fit: s.image_crop === false ? 'contain' : 'cover',
      height: HEIGHTS[s.height] || 'medium',
      text_alignment: ALIGNMENTS[s.text_alignment] || 'left',
      content_spacing: spacing,
      button_spacing: tweaks.button_spacing ?? Math.round((spacing * 1.5) / 2) * 2,
      background,
      full_width: s.is_fullwidth === true,
      spacing: top,
      bottom_spacing: tweaks.bottom_spacing === true,
    },
  };
}
