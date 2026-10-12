// Combine "marquee" (scrolling text, with the agency's shape blocks) -> marquee.
import { isUnsetColor, mapBlocks } from '../lib.mjs';

const COLORS = {
  '#F6786C': 'red',
  '#FEFF86': 'yellow',
  '#C6CC3D': 'green',
  '#14452F': 'primary',
  '#8ED6CF': 'blue',
  '#DDC7E8': 'purple',
  '#F4F3F2': 'light',
  '#E9E9E9': 'light',
};
// The marquee's "half circle" was its own drawing, kept as the "wedge" shape.
const SHAPES = { halfcircle: 'wedge', triangle: 'triangle' };
const SIZES = { 'text-size--small': 'small', 'text-size--large': 'large', 'text-size--xlarge': 'xlarge' };

export default function (section) {
  const s = section.settings;
  const background = isUnsetColor(s.color_background_main)
    ? 'none'
    : COLORS[String(s.color_background_main).toUpperCase()] || 'light';
  return {
    type: 'marquee',
    settings: {
      direction: s.scroll_direction === 'rtl' ? 'right' : 'left',
      speed: s.speed ?? 60,
      pause_on_hover: s.pause_on_hover ?? true,
      text_size: SIZES[s.text_size] || 'xlarge',
      background,
      // "Unset" text color fell back to the theme's text color; the brand foreground is black.
      text_color: isUnsetColor(s.color_text_main) ? 'default' : 'dark',
      spacing: s.remove_top_margin ? 'none' : 'default',
      pull_next_section_up: s.remove_bottom_margin ?? false,
    },
    ...mapBlocks(section, (block) => {
      if (block.type === 'text') return { type: 'text', settings: { text: block.settings.marquee_text ?? '' } };
      if (block.type === 'image') {
        return {
          type: 'shape',
          settings: {
            shape: SHAPES[block.settings.shape] || 'wedge',
            color: COLORS[String(block.settings.color).toUpperCase()] || 'blue',
          },
        };
      }
      return null;
    }),
  };
}
