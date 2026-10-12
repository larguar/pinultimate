// Combine "custom-liquid" -> custom-liquid.
//
// The code is carried over as written, apart from markup that relied on the previous theme's
// CSS (its .grid / .card layout classes and animation classes), which is rewritten to
// Bootstrap. Section-level custom CSS added in the theme editor is kept.
const HEADING_TAGS = { h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h3', span: 'p' };

function modernise(code = '') {
  return (
    code
      // Three-column grid (one column on small screens) of plain cards.
      .replace(/<div class="grid grid--layout grid-3 grid-lap-1[^"]*"[^>]*>/g, '<div class="row row-cols-1 row-cols-md-3 gx-1 gy-2 gy-md-0">')
      .replace(/<div(?: id="[^"]*")? class="card card--no-borders[^"]*">/g, '<div class="col">')
      // Animation/caption classes from another theme that have no styles here.
      .replace(/<p class="rich-text__caption[^"]*"[^>]*>/g, '<p>')
      .replace(/<h3 class="inline-richtext">/g, '<h3>')
  );
}

export default function (section) {
  const s = section.settings || {};
  const out = {
    type: 'custom-liquid',
    settings: {
      custom_liquid: modernise(s.custom_liquid),
      subheading: (s.subheading || '').replace(/<[^>]+>/g, ''),
      heading: s.heading || '',
      heading_alignment: (s.section_heading_layout || '').includes('center') ? 'center' : 'left',
      heading_tag: HEADING_TAGS[s.seo_h_tag] || 'h2',
      button_label: s.cta_label || '',
      button_link: s.cta_url || '',
      full_width: s.full_width ?? false,
      background: 'none',
      spacing: s.remove_margin ? 'none' : 'default',
    },
  };
  if (!out.settings.button_link) delete out.settings.button_link;
  if (section.custom_css) out.custom_css = section.custom_css;
  return out;
}
