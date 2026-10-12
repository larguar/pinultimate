// Combine "media-with-text-overlay" -> image-banner (one image with overlaid text blocks).
// Combine allowed several image blocks side by side; every live instance has one, so the first
// image block becomes the banner and its caption / title / subtitle / button become text blocks.
import { topSpacing } from './_content-shared.mjs';

const TITLE_SIZES = { 'heading-size--small': 'small', 'heading-size--regular': 'medium', 'heading-size--large': 'large' };
const POSITIONS = { top: 'top', middle: 'middle', bottom: 'bottom' };
const HEIGHTS = { small: 'small', regular: 'medium', large: 'large' };

export default function (section, { key }) {
  const s = section.settings;
  const order = section.block_order || Object.keys(section.blocks || {});
  const imageBlocks = order.map((id) => [id, section.blocks[id]]).filter(([, b]) => b.type === 'image');
  if (imageBlocks.length > 1) console.warn(`media-with-text-overlay ${key}: only the first of ${imageBlocks.length} images kept`);
  const [firstId, first] = imageBlocks[0] || [];
  const b = first?.settings || {};
  if (b.video) console.warn(`media-with-text-overlay ${key}: video not carried over`);

  const blocks = {};
  const block_order = [];
  const add = (suffix, block) => {
    const id = `${firstId}_${suffix}`;
    blocks[id] = block;
    block_order.push(id);
  };
  if (b.caption) add('eyebrow', { type: 'eyebrow', settings: { text: b.caption } });
  if (b.title) {
    add('heading', {
      type: 'heading',
      settings: {
        heading: b.title,
        size: TITLE_SIZES[s.title_size] || 'small',
        heading_tag: ['h1', 'h2', 'h3'].includes(b.seo_h_tag) ? b.seo_h_tag : 'h2',
      },
    });
  }
  if (b.subtitle) add('text', { type: 'text', settings: { text: `<p>${b.subtitle}</p>` } });
  if (b.button_label) {
    add('button', {
      type: 'button',
      settings: {
        label: b.button_label,
        link: b.link ?? '',
        style: s.button_style === 'outline' ? 'outline' : 'solid',
        new_tab: b.open_in_new_window === true,
      },
    });
  }

  // "horizontal-center align-content--vertical-middle" -> "middle-center"
  const alignment = s.alignment || '';
  const horizontal = alignment.match(/horizontal-(left|center|right)/)?.[1] || 'center';
  const vertical = POSITIONS[alignment.match(/vertical-(top|middle|bottom)/)?.[1]] || 'middle';

  return {
    type: 'image-banner',
    blocks,
    block_order,
    settings: {
      ...(b.image && { image: b.image }),
      height: HEIGHTS[s.height] || 'medium',
      full_width: s.layout === 'full',
      overlay_opacity: 0,
      content_position: `${vertical}-${horizontal}`,
      content_width: s.width === '90%' ? 90 : 60,
      text_color: 'light',
      content_box: false,
      spacing: topSpacing(s),
    },
  };
}
