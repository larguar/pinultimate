// Combine "main-article" -> main-article. Blocks keep their ids and order.
import { mapBlocks } from '../lib.mjs';

const RATIOS = { natural: 'natural', '1.33333': '4/3', 1: '1/1', '1': '1/1', '0.83333': '5/6' };

export default function (section) {
  return {
    type: 'main-article',
    settings: {},
    ...mapBlocks(section, (block) => {
      const b = block.settings || {};
      switch (block.type) {
        case 'featured_image':
          return {
            type: 'featured_image',
            settings: { aspect_ratio: RATIOS[b.aspect_ratio ?? 'natural'] || 'natural', image_radius: b.image_border_radius ?? 0 },
          };
        case 'title':
          return {
            type: 'title',
            settings: {
              show_date: b.blog_show_date ?? true,
              show_author: b.blog_show_author ?? true,
              show_comments: b.blog_show_comments ?? false,
              show_tags: b.blog_show_title_tags ?? false,
            },
          };
        case 'content':
          return {
            type: 'content',
            settings: {
              show_back: b.blog_show_content_back ?? true,
              show_share: b.has_social_buttons ?? true,
              show_tags: b.blog_show_content_tags ?? false,
            },
          };
        case 'cross_sell': {
          const settings = { heading: b.heading ?? 'Recommended product', style: b.style === 'primary' ? 'filled' : 'outline' };
          if (b.product) settings.product = b.product;
          return { type: 'product', settings };
        }
        default:
          return null;
      }
    }),
  };
}
