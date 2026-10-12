// Combine "hero-bounce" (the agency's bouncing-title hero) -> hero-bounce.
// The old section needed a hand-measured box (text height, span offsets) for the title to
// bounce inside; the new one measures the title itself, so only its width carries over.
const HEIGHT = (value) => {
  const n = parseInt(value, 10);
  return [40, 50, 60, 80, 100].includes(n) ? String(n) : '60';
};
const STYLE = { solid: 'primary', outline: 'outline-light' };

export default function (section, { key }) {
  const s = section.settings;
  // The homepage hero had its height set in the custom stylesheet: 85% of the screen minus the
  // header, at least 500px. It's the first section under the header, so it has no space above.
  const fit = key === 'hero_bounce_jxXn9F';
  return {
    type: 'hero-bounce',
    settings: {
      image: s.image,
      image_2: s.image2,
      image_3: s.image3,
      title: s.title ?? '',
      title_color: s.color_text_main || '#FEFF86',
      text_transform: s.text_transform || 'lowercase',
      font_size: s.font_size ?? 160,
      text_width: s.text_width ?? 1000,
      speed: Math.min(30, Math.max(2, s.bounce_interval ?? 5)),
      button_label: s.button_label ?? '',
      link: s.link || undefined,
      open_in_new_window: s.open_in_new_window ?? false,
      button_style: STYLE[s.button_style] || 'primary',
      font_size_mobile: s.mobile_font_size ?? 120,
      text_width_mobile: s.mobile_text_width ?? 460,
      full_width: s.is_fullwidth ?? true,
      height: fit ? 'fit' : HEIGHT(s.desktop_height),
      height_mobile: fit ? 'fit' : HEIGHT(s.mobile_height),
      spacing: fit || s.remove_margin ? 'none' : 'default',
    },
  };
}
