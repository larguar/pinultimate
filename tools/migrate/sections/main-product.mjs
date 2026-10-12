// Combine "main-product" -> main-product (Bootstrap rebuild).
//
// Besides renaming settings, this untangles two layout tricks the store used in custom Liquid blocks:
// - `<div class="reviews-price">` … `</div>` blocks wrapped the price and the star rating app block
//   to put them on one line. The wrappers are dropped and the price block's "Show on one line with"
//   setting does the same job.
// - The "[LG] Custom Badges" Liquid after the closing `</div>` becomes a Badges block.
import { mapBlocks } from '../lib.mjs';

const OPEN_GROUP = /<div class="reviews-price">\s*$/;
const CLOSE_GROUP = /^\s*<\/div>/;

const LAYOUTS = { 'one-col scroll': 'stack', 'two-cols scroll': 'stack_2' };
const RATIOS = { 1: '1x1', '0.83333': '5x6', '0.8': '4x5', '0.75': '3x4' };
const isTransparent = (v) => !v || v === 'rgba(0,0,0,0)' || v === 'transparent';

function convertBlock(block) {
  const s = block.settings || {};
  if (block.type.startsWith('shopify://apps/')) return { type: block.type, settings: s };

  switch (block.type) {
    case 'vendor':
    case 'title':
    case 'badges':
    case 'description':
      return { type: block.type, settings: {} };
    case 'price':
      return { type: 'price', settings: { beside: 'none' } };
    case 'text':
      return {
        type: 'text',
        settings: {
          text: s.text ?? '',
          size: { 'text-size--small': 'small', 'text-size--large': 'large' }[s.text_size] ?? 'regular',
          uppercase: !!s.text_transform,
        },
      };
    case 'variant_picker':
      return {
        type: 'variant_picker',
        settings: {
          show_labels: s.variant_labels ?? true,
          unavailable: ['hide', 'disable', 'show'].includes(s.unavailable_variants) ? s.unavailable_variants : 'disable',
        },
      };
    case 'buy_buttons':
      return {
        type: 'buy_buttons',
        settings: { show_quantity: s.show_quantity_selector ?? true, show_payment_terms: true },
      };
    case 'collapsible_tab':
      return {
        type: 'collapsible_tab',
        settings: {
          heading: s.heading ?? '',
          content: s.content ?? '',
          ...(s.page ? { page: s.page } : {}),
          // [LG] The previous theme added the product details to the tab titled "Product Details".
          show_product_details: s.heading === 'Product Details',
        },
      };
    case 'custom_liquid':
      return { type: 'custom_liquid', settings: { custom_liquid: s.custom_liquid ?? '' } };
    default:
      // rating (replaced by the Growave app block), inventory, pickup, promotions, cross sell, share,
      // icons, size guide, SKU, tax info, dividers and images aren't used by the store.
      return null;
  }
}

export default function (section) {
  const s = section.settings || {};
  const { blocks, block_order } = mapBlocks(section, convertBlock);

  // Resolve the reviews-price wrapper trick.
  const order = [];
  let group = null; // ids inside an open wrapper
  for (const id of block_order) {
    const block = blocks[id];
    if (block.type === 'custom_liquid') {
      let code = block.settings.custom_liquid;
      if (group && CLOSE_GROUP.test(code)) {
        closeGroup(group, blocks);
        group = null;
        code = code.replace(CLOSE_GROUP, '').trim();
        if (/\[LG\] Custom Badges/.test(code)) {
          blocks[id] = { type: 'badges', settings: {}, ...(block.disabled && { disabled: true }) };
          order.push(id);
          continue;
        }
        // "1st Pin" style labels written for the old theme's option label class.
        code = code.replace(/class="product-variant__name text-size--small"/g, 'class="main-product__option-label d-block"');
      }
      if (OPEN_GROUP.test(code)) {
        code = code.replace(OPEN_GROUP, '').trim();
        group = [];
      }
      if (!code) {
        delete blocks[id];
        continue;
      }
      block.settings.custom_liquid = code;
      order.push(id);
      continue;
    }
    if (group && !block.disabled) group.push(id);
    order.push(id);
  }
  if (group) closeGroup(group, blocks);

  return {
    type: 'main-product',
    blocks,
    block_order: order,
    settings: {
      media_layout: LAYOUTS[s.gallery_layout] ?? 'slider',
      media_width: s.gallery_desktop_width === 'two-thirds' ? 'two_thirds' : 'half',
      media_ratio: RATIOS[s.gallery_aspect_ratio] ?? '5x6',
      media_fit: s.gallery_fit === false ? 'cover' : 'contain',
      media_tile: !isTransparent(s.gallery_background),
      video_loop: !!s.enable_video_looping,
      preselect_variant: s.default_to_first_variant ?? true,
      sticky_info: true,
    },
  };
}

// Two blocks shared a line: point the price block at its neighbour.
function closeGroup(ids, blocks) {
  if (ids.length < 2) return;
  const priceIndex = ids.findIndex((id) => blocks[id]?.type === 'price');
  if (priceIndex === 0) blocks[ids[0]].settings.beside = 'next';
  else if (priceIndex > 0) blocks[ids[priceIndex]].settings.beside = 'previous';
}
