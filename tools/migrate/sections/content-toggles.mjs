// Combine "content-toggles" (FAQ toggles with an optional contact form) -> collapsible-content.
import { mapBlocks } from '../lib.mjs';

const HEADING_TAGS = { h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h3', span: 'p' };
// The previous theme's icon pack, mapped to the closest available icon.
const ICONS = {
  'shipping-truck': 'truck', delivery: 'truck', 'delivery-time': 'truck',
  box: 'box-seam', 'open-box': 'box-seam', 'archive-box': 'box-seam', giftbox: 'box-seam', 'paper-bag': 'box-seam',
  'map-marker': 'geo-alt', store: 'geo-alt', 'earth-globe': 'geo-alt', flag: 'geo-alt',
  helpline: 'telephone', 'like-hand': 'heart', star: 'star', 'security-shield': 'check-circle',
  label: 'info-circle', time: 'info-circle', 'time-limit': 'info-circle', 'open-24-hours': 'info-circle',
  appointment: 'info-circle', 'checkout-cart': 'box-seam', currency: 'info-circle', wallet: 'info-circle',
};
const stripTags = (v = '') => v.replace(/<[^>]+>/g, '');

export default function (section) {
  const s = section.settings || {};
  const settings = {
    subheading: stripTags(s.subheading),
    heading: s.heading ?? 'FAQ',
    heading_alignment: (s.section_heading_layout || '').includes('center') ? 'center' : 'left',
    heading_tag: HEADING_TAGS[s.seo_h_tag] || 'h2',
    open_first: s.open_first ?? false,
    one_at_a_time: true,
    button_label: s.cta_label || '',
    show_form: s.form_enable ?? false,
    form_title: s.form_title ?? 'Contact form',
    form_style: s.style === 'primary' ? 'filled' : 'outline',
    background: 'none',
    spacing: s.gutter_decrease ? 'small' : 'default',
  };
  if (s.cta_url) settings.button_link = s.cta_url;
  return {
    type: 'collapsible-content',
    settings,
    ...mapBlocks(section, (block) => {
      const b = block.settings || {};
      const out = {
        title: b.title ?? 'Question title',
        subtitle: b.subtitle ?? '',
        icon: ICONS[b.icon] || 'none',
        body: b.body ?? '',
        button_label: b.button_label || '',
        hide_if_empty: b.hide_block_if ?? false,
      };
      if (b.image) out.image = b.image;
      if (b.button_link) out.button_link = b.button_link;
      return { type: 'text', settings: out };
    }),
  };
}
