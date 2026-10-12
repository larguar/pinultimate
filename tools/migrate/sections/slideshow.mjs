// Combine "slideshow" -> slideshow (Swiper). Every instance is disabled on the live site.
import { isUnsetColor, mapBlocks } from '../lib.mjs';

const HEIGHT = (value) => {
  const n = parseInt(value, 10);
  return [40, 50, 60, 80, 100].includes(n) ? String(n) : '60';
};
// "horizontal-left align-content--vertical-bottom" -> "bottom-left"
const POSITION = (value = '') => {
  const h = value.match(/horizontal-(left|center|right)/)?.[1] || 'left';
  const v = value.match(/vertical-(top|middle|bottom)/)?.[1] || 'bottom';
  return `${v}-${h}`;
};

export default function (section) {
  const s = section.settings;
  return {
    type: 'slideshow',
    settings: {
      autoplay: s.autorotate_enable ?? false,
      autoplay_interval: Math.min(15, Math.max(3, s.autorotate_interval ?? 6)),
      text_position: POSITION(s.alignment),
      // The custom stylesheet put every slideshow's text in a white box.
      text_box: true,
      full_width: s.is_fullwidth ?? true,
      height: s.is_auto_height ? 'adapt' : HEIGHT(s.desktop_height),
      height_mobile: HEIGHT(s.mobile_height),
      spacing: s.remove_margin ? 'none' : 'default',
    },
    ...mapBlocks(section, (block) => {
      const b = block.settings;
      return {
        type: 'slide',
        settings: {
          image: b.image,
          mobile_image: b.mobile_image,
          // A solid overlay color darkened the image; keep a light shade of it.
          overlay: isUnsetColor(b.color_background_main) ? 0 : 30,
          caption: b.caption ?? '',
          title: b.title ?? '',
          button_label: b.button_label ?? '',
          link: b.link || undefined,
          open_in_new_window: b.open_in_new_window ?? false,
        },
      };
    }),
  };
}
