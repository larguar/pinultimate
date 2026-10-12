// Combine "text-columns-icons" -> multicolumn (logo style). On /collections/custom it is the
// "Brands We've Worked With" logo carousel.
import { mapBlocks } from '../lib.mjs';
import { headingSettings, topSpacing, background, gridColumns } from './_content-shared.mjs';

// Combine icon names -> the closest icon in this theme (used only when a column has no image).
const ICONS = {
  delivery: 'truck',
  'delivery-time': 'truck',
  'shipping-truck': 'truck',
  box: 'box-seam',
  'open-box': 'box-seam',
  'archive-box': 'box-seam',
  giftbox: 'box-seam',
  'paper-bag': 'bag',
  store: 'bag',
  'checkout-cart': 'cart',
  wallet: 'cart',
  currency: 'cart',
  star: 'star',
  label: 'star',
  'like-hand': 'heart',
  'map-marker': 'geo-alt',
  'earth-globe': 'geo-alt',
  flag: 'geo-alt',
  helpline: 'telephone',
  'security-shield': 'check-circle',
  'time-limit': 'check-circle',
  time: 'info-circle',
  appointment: 'info-circle',
  'open-24-hours': 'info-circle',
};

export default function (section) {
  const s = section.settings;
  const converted = mapBlocks(section, (block) => {
    const b = block.settings || {};
    return {
      type: 'column',
      settings: {
        ...(b.image && { image: b.image }),
        icon: b.image ? 'none' : ICONS[b.icon] || 'none',
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
      media_style: 'logo',
      image_ratio: 'square',
      card_style: s.hide_borders === false ? 'bordered' : 'card',
      text_alignment: 'center',
      background: background(s.section_background_color),
      spacing: topSpacing(s),
    },
  };
}
