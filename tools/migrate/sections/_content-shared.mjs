// Helpers shared by the content group's mappings (multicolumn, testimonials, timeline, image-banner).
// Not an old section type itself: run.mjs only loads files named after one.
import { isUnsetColor } from '../lib.mjs';

const BACKGROUNDS = {
  '#f4f3f2': 'light',
  '#ededed': 'light',
  '#feff86': 'yellow',
  '#8ed6cf': 'blue',
  '#ddc7e8': 'purple',
  '#c6cc3d': 'green',
};

/** Combine section background colour -> background select value. */
export function background(color) {
  if (isUnsetColor(color)) return 'none';
  return BACKGROUNDS[color.toLowerCase()] || 'light';
}

/** Combine "decrease top margin" / "remove top margin" -> spacing select value. */
export function topSpacing(s) {
  if (s.remove_top_margin) return 'none';
  if (s.gutter_decrease) return 'compact';
  return 'default';
}

const HEADING_TAGS = ['h2', 'h3', 'h4'];

/** Combine section heading settings -> multicolumn-heading settings. */
export function headingSettings(s) {
  const layout = s.section_heading_layout || '';
  return {
    heading: s.heading ?? '',
    subheading: s.subheading ?? '',
    // Combine's "regular" heading was 22px, its "large" one 36px.
    heading_size: s.section_heading_size === 'text-size--large' ? 'medium' : 'small',
    heading_layout: layout.includes('one-row') ? 'inline' : 'stacked',
    heading_alignment: layout.includes('center') ? 'center' : 'left',
    heading_tag: HEADING_TAGS.includes(s.seo_h_tag) ? s.seo_h_tag : 'h2',
  };
}

/** Combine grid classes ("grid-5 grid-portable-4 grid-lap-3 grid-palm-2") -> column counts. */
export function gridColumns(layout = '') {
  const count = (name) => Number(layout.match(new RegExp(`(?:^|\\s)grid-${name ? `${name}-` : ''}(\\d)`))?.[1]);
  const desktop = count('') || 4;
  const tablet = Math.min(count('portable') || desktop, 4);
  const mobile = Math.min(count('palm') || 1, 2);
  return { columns_desktop: desktop, columns_tablet: tablet, columns_mobile: String(mobile) };
}
