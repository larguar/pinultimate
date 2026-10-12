// Combine "shape" (the agency's decorative shape) -> shape.
const SHAPES = { arch: 'arch', circle: 'circle', flower: 'flower', halfcircle: 'half-circle', leaf: 'leaf' };
const COLORS = {
  '#F6786C': 'red',
  '#FEFF86': 'yellow',
  '#C6CC3D': 'green',
  '#14452F': 'primary',
  '#8ED6CF': 'blue',
  '#DDC7E8': 'purple',
};
const SIZES = { 14: 'small', 15: 'medium', 16: 'large' };

export default function (section) {
  const s = section.settings;
  return {
    type: 'shape',
    settings: {
      shape: SHAPES[s.shape] || 'circle',
      color: COLORS[String(s.color).toUpperCase()] || 'blue',
      size: SIZES[s.dimensions] || 'medium',
      speed: String(s.speed ?? '-2'),
      layer: String(s.position) === '-1' ? 'behind' : 'front',
      side: s.side || 'left',
      x_offset: s['x-offset'] ?? 0,
      y_offset: s['y-offset'] ?? 0,
      x_offset_mobile: s['x-offset-mobile'] ?? 0,
      y_offset_mobile: s['y-offset-mobile'] ?? 0,
    },
  };
}
