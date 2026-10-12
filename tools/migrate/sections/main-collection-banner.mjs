// Combine "main-collection-banner" -> main-collection-banner.
export default function (section) {
  const s = section.settings;
  return {
    type: 'main-collection-banner',
    settings: {
      show_collection_description: s.show_collection_description ?? true,
      show_collection_image: s.show_collection_image ?? false,
      image_height: s.height === 'regular' ? 'regular' : 'small',
    },
  };
}
