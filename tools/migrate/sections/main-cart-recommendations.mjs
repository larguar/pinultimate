// Combine "main-cart-recommendations" -> cart-recommendations.
// The product-card blocks (title, vendor, price, quick buy) become the shared product card.
export default function (section) {
  const s = section.settings;
  return {
    type: 'cart-recommendations',
    settings: {
      heading: s.heading ?? 'Recommendations',
      subheading: s.subheading ?? 'You may also <strong>like</strong> these products',
      products_count: 4,
      columns_desktop: s.layout_desktop === 'three-columns' ? '3' : '4',
    },
  };
}
