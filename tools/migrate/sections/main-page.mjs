// Combine "main-page" -> main-page (page title + page content).
// The cover-image-from-metafield option was unused (blank on every template) and is not carried over.
export default function (section) {
  const s = section.settings || {};
  return {
    type: 'main-page',
    settings: {
      show_title: true,
      content_width: s.center ? 'narrow' : 'full',
    },
  };
}
