import Offcanvas from 'bootstrap/js/dist/offcanvas';

/**
 * Cart behaviour shared by the drawer, the cart page and product forms.
 *
 * - Forms with [data-add-to-cart] are submitted with fetch. With the drawer enabled the
 *   drawer is refreshed and opened; otherwise the visitor is sent to the cart page.
 * - Inside the drawer: [data-cart-quantity="<line>"] inputs, [data-cart-remove="<line>"]
 *   buttons and the [data-cart-note] textarea update the cart in place.
 * - [data-cart-count] elements show the item count after every change.
 *
 * Fires `cart:updated` on document with the cart JSON as `detail`.
 */

const SECTIONS = ['cart-drawer'];
const drawerElement = () => document.getElementById('cart-drawer');

async function request(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ ...body, sections: SECTIONS, sections_url: window.location.pathname }),
  });
  const data = await response.json();
  if (!response.ok || data.status) throw new Error(data.description || data.message || window.theme.strings.cartError);
  return data;
}

function renderSections(sections) {
  const html = sections?.['cart-drawer'];
  const target = document.querySelector('[data-cart-drawer-content]');
  if (!html || !target) return;

  const fresh = new DOMParser().parseFromString(html, 'text/html');
  target.innerHTML = fresh.querySelector('.shopify-section')?.innerHTML ?? fresh.body.innerHTML;

  const count = target.querySelector('[data-cart-count-source]')?.dataset.cartCountSource;
  if (count !== undefined) {
    document.querySelectorAll('[data-cart-count]').forEach((el) => (el.textContent = count));
  }
}

async function refresh(cart) {
  if (!cart?.sections) {
    const response = await fetch(`${window.location.pathname}?sections=${SECTIONS.join(',')}`);
    cart = { ...cart, sections: await response.json() };
  }
  renderSections(cart.sections);
  document.dispatchEvent(new CustomEvent('cart:updated', { detail: cart }));
}

export function openDrawer() {
  const element = drawerElement();
  if (element) Offcanvas.getOrCreateInstance(element).show();
}

async function changeLine(line, quantity) {
  const drawer = drawerElement();
  drawer?.classList.add('is-loading');
  try {
    await refresh(await request(window.theme.routes.cartChange + '.js', { line, quantity }));
  } catch (error) {
    alert(error.message);
    await refresh();
  } finally {
    drawer?.classList.remove('is-loading');
  }
}

// Add to cart
document.addEventListener('submit', async (event) => {
  const form = event.target.closest('form[data-add-to-cart]');
  if (!form || window.theme.settings.cartType !== 'drawer') return;

  event.preventDefault();
  const submit = form.querySelector('[type="submit"]');
  const error = form.querySelector('[data-add-to-cart-error]');
  submit?.setAttribute('aria-busy', 'true');
  submit?.setAttribute('disabled', '');
  if (error) error.hidden = true;

  try {
    const formData = Object.fromEntries(new FormData(form));
    const properties = {};
    for (const [key, value] of Object.entries(formData)) {
      const match = key.match(/^properties\[(.+)\]$/);
      if (match && value !== '') properties[match[1]] = value;
    }
    const added = await request(window.theme.routes.cartAdd + '.js', {
      items: [
        {
          id: formData.id,
          quantity: Number(formData.quantity || 1),
          ...(formData.selling_plan && { selling_plan: formData.selling_plan }),
          ...(Object.keys(properties).length && { properties }),
        },
      ],
    });
    await refresh(added);
    openDrawer();
  } catch (e) {
    if (error) {
      error.textContent = e.message;
      error.hidden = false;
    }
  } finally {
    submit?.removeAttribute('aria-busy');
    submit?.removeAttribute('disabled');
  }
});

// Quantity and remove inside the drawer
document.addEventListener('change', (event) => {
  const input = event.target.closest('[data-cart-quantity]');
  if (input) changeLine(Number(input.dataset.cartQuantity), Number(input.value));
});

document.addEventListener('click', (event) => {
  const remove = event.target.closest('[data-cart-remove]');
  if (remove) changeLine(Number(remove.dataset.cartRemove), 0);
});

// Cart note, saved shortly after typing stops
let noteTimer;
document.addEventListener('input', (event) => {
  const note = event.target.closest('[data-cart-note]');
  if (!note) return;
  clearTimeout(noteTimer);
  noteTimer = setTimeout(() => {
    fetch(window.theme.routes.cartUpdate + '.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: note.value }),
    });
  }, 400);
});

// Keep the sticky header visible while any drawer is open.
document.addEventListener('show.bs.offcanvas', () => document.body.classList.add('offcanvas-open'));
document.addEventListener('hidden.bs.offcanvas', () => document.body.classList.remove('offcanvas-open'));
