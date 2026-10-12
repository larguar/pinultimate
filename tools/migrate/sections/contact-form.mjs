// Combine "contact-form" -> contact-form (Bootstrap form controls, contact information blocks).
import { mapBlocks } from '../lib.mjs';

const HEADING_TAGS = { h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h3', span: 'p' };

export default function (section) {
  const s = section.settings || {};
  return {
    type: 'contact-form',
    settings: {
      heading: s.heading ?? 'Drop us a line',
      heading_style: 'italic',
      heading_tag: HEADING_TAGS[s.seo_h_tag] || 'h2',
      show_phone: s.show_phone ?? false,
      show_subject: s.show_subject ?? false,
      spacing: s.gutter_decrease ? 'small' : 'default',
    },
    ...mapBlocks(section, (block) => ({
      type: 'text',
      settings: {
        title: block.settings?.title ?? 'Contact information',
        content: block.settings?.content ?? '',
      },
    })),
  };
}
