// "maker-list" (agency-written) -> maker-list.
// The old heading was a Liquid setting that counted the maker collections; the new section
// counts them itself and replaces {count} in a plain text heading.
const RATIOS = { '1.33333': '4x3', '1': '1x1', '0.83333': '5x6', '0.666667': '2x3' };

export default function (section) {
  const s = section.settings;
  let heading = s.heading ?? '';
  if (heading.includes('{%')) heading = heading.replace(/[\s\S]*\{\{\s*count\s*\}\}/, '{count}').trim();
  const columns = (s.layout || '').match(/\bgrid-(\d)\b/)?.[1] ?? '6';

  return {
    type: 'maker-list',
    settings: {
      heading,
      subheading: s.subheading ?? '',
      columns_desktop: ['4', '5', '6'].includes(columns) ? columns : '6',
      image_ratio: RATIOS[s.image_aspect_ratio] ?? '5x6',
      show_view_all: s.show_view_all ?? false,
      compact_spacing: s.gutter_decrease ?? true,
    },
  };
}
