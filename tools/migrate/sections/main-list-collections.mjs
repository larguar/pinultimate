// Combine "main-list-collections" -> main-list-collections.
import { mapBlocks } from '../lib.mjs';

const COLUMNS = { 'grid-2': '2', 'grid-3': '3', 'grid-4': '4' };
const RATIOS = { '1.33333': '4x3', '1': '1x1', '0.83333': '5x6', '0.666667': '2x3' };

export default function (section) {
  const s = section.settings;
  const columns = Object.entries(COLUMNS).find(([cls]) => (s.layout || '').split(' ').includes(cls))?.[1] ?? '3';
  return {
    type: 'main-list-collections',
    settings: {
      title: 'Collections',
      display_type: s.display_type === 'selected' ? 'selected' : 'all',
      sort: s.sort ?? 'alphabetical',
      columns_desktop: columns,
      image_ratio: RATIOS[s.image_aspect_ratio] ?? '1x1',
    },
    ...mapBlocks(section, (block) => ({
      type: 'collection',
      settings: { collection: block.settings.collection, image: block.settings.image },
    })),
  };
}
