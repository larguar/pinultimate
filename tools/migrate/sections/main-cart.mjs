// Combine "main-cart" (cart items + subtotal; optional shipping calculator) -> main-cart.
// The previous theme showed the cart note ("Gift Note") on the cart page and had no
// express checkout buttons (theme settings cart_notes_enable / cart_additional_buttons).
export default function () {
  return {
    type: 'main-cart',
    settings: {
      show_note: true,
      show_additional_checkout_buttons: false,
    },
  };
}
