// Combine "slider" (vertical slider: a heading with images floating around it) -> floating-images.
import { isUnsetColor, mapBlocks } from '../lib.mjs';

const POSITION = (value = '') => {
  const h = value.match(/horizontal-(left|center|right)/)?.[1] || 'center';
  const v = value.match(/vertical-(top|middle|bottom)/)?.[1] || 'middle';
  return `${v}-${h}`;
};
const SIZE = { 'heading-size--regular': 'regular', 'heading-size--large': 'large', 'heading-size--xlarge': 'xlarge' };
const BACKGROUNDS = { '#F4F3F2': 'light', '#FEFF86': 'yellow', '#8ED6CF': 'blue', '#DDC7E8': 'purple', '#14452F': 'primary' };
const round5 = (n) => Math.round(n / 5) * 5;
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

export default function (section, { key }) {
  const s = section.settings;
  const blocks = Object.values(section.blocks || {});

  // The old slider grew to fit its lowest item; estimate that from the offsets.
  const lowest = (prop, width) => Math.max(0, ...blocks.map((b) => (b.settings[prop] ?? 0) + (b.settings[width] ?? 25)));
  let height = clamp(round5(lowest('offset_y', 'offset_width')), 100, 200);
  let heightMobile = clamp(round5(lowest('offset_y_mobile', 'offset_width_mobile')), 100, 200);
  // The homepage instance was cut to 70% of the screen in the custom stylesheet. (It was 40% below
  // 1064px too, which hid most of its mobile images; the full screen height shows them.)
  if (key === '1662457455386507d1') {
    height = 70;
    heightMobile = 100;
  }

  const color = String(s.color_background_main || '').toUpperCase();
  const textWhite = String(s.color_text_main || '').toLowerCase() === '#ffffff';
  const place = (b) => ({
    width: clamp(round5(b.offset_width ?? 25), 5, 100),
    x: clamp(round5(b.offset_x ?? 30), -20, 100),
    y: clamp(round5(b.offset_y ?? 40), -20, 200),
    hide_on_desktop: b.hide_on_desk ?? false,
    width_mobile: clamp(round5(b.offset_width_mobile ?? b.offset_width ?? 25), 5, 100),
    x_mobile: clamp(round5(b.offset_x_mobile ?? 30), -20, 100),
    y_mobile: clamp(round5(b.offset_y_mobile ?? 40), -20, 200),
    hide_on_mobile: b.hide_on_mobile ?? false,
    speed: clamp(b.scroll_speed ?? 0, -10, 10),
  });

  return {
    type: 'floating-images',
    settings: {
      caption: s.caption ?? '',
      title: s.title ?? '',
      title_size: SIZE[s.title_size] || 'regular',
      button_label: s.button_label ?? '',
      button_link: s.button_link || undefined,
      button_style: s.button_style === 'outline' ? 'outline-dark' : 'primary',
      text_position: POSITION(s.alignment),
      background: isUnsetColor(s.color_background_main) ? 'none' : BACKGROUNDS[color] || 'light',
      text_color: textWhite ? 'white' : 'dark',
      invert_text: ['exclusion', 'difference'].includes(s.blend_mode),
      height,
      height_mobile: heightMobile,
      spacing: s.add_top_margin ? 'default' : 'none',
    },
    ...mapBlocks(section, (block) => {
      const b = block.settings;
      if (block.type === 'image') {
        return { type: 'image', settings: { image: b.image, link: b.link || undefined, ...place(b) } };
      }
      if (block.type === 'text') {
        const white = String(b.content_color || '').toLowerCase() === '#ffffff';
        return {
          type: 'text',
          settings: {
            text: b.content ?? '',
            color: white ? 'white' : 'dark',
            background: isUnsetColor(b.content_background) ? 'none' : 'white',
            ...place(b),
          },
        };
      }
      return null;
    }),
  };
}
