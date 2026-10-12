/**
 * Cart page: quantity and remove update the cart in place.
 *
 * Changes go to /cart/change.js with the Section Rendering API, which returns this
 * section's fresh HTML (and the cart drawer's) in the same response. The page keeps
 * working without JavaScript through the regular cart form.
 *
 * The shared quantity stepper marks its input with [data-cart-quantity], which the global
 * cart script (drawer) also listens for; events are stopped here so only this script
 * handles the cart page's lines.
 */
const DRAWER_SECTION = 'cart-drawer';

class MainCart extends HTMLElement {
  connectedCallback() {
    this.timers = new Map();
    this.onChange = this.onChange.bind(this);
    this.onClick = this.onClick.bind(this);
    this.addEventListener('change', this.onChange);
    this.addEventListener('click', this.onClick);
  }

  disconnectedCallback() {
    this.removeEventListener('change', this.onChange);
    this.removeEventListener('click', this.onClick);
  }

  get sectionId() {
    return this.dataset.sectionId;
  }

  onChange(event) {
    const input = event.target.closest('[data-cart-quantity]');
    if (!input) return;
    event.stopPropagation();

    // Debounce per line so several clicks on the stepper make a single request.
    const line = Number(input.dataset.cartQuantity);
    clearTimeout(this.timers.get(line));
    this.timers.set(
      line,
      setTimeout(() => this.update(line, Math.max(0, Number(input.value) || 0), input.id), 350)
    );
  }

  onClick(event) {
    const remove = event.target.closest('[data-main-cart-remove]');
    if (!remove) return;
    event.preventDefault();
    event.stopPropagation();
    this.update(Number(remove.dataset.mainCartRemove), 0);
  }

  async update(line, quantity, focusId) {
    const error = this.querySelector('[data-main-cart-error]');
    const status = this.querySelector('[data-main-cart-status]');
    if (error) error.hidden = true;
    this.classList.add('is-loading');
    this.setAttribute('aria-busy', 'true');

    try {
      const response = await fetch(`${window.theme?.routes?.cartChange || '/cart/change'}.js`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          line,
          quantity,
          sections: [this.sectionId, DRAWER_SECTION],
          sections_url: window.location.pathname,
        }),
      });
      const cart = await response.json();
      if (!response.ok || cart.status) throw new Error(cart.description || cart.message);

      this.render(cart.sections?.[this.sectionId]);
      this.renderDrawer(cart.sections?.[DRAWER_SECTION]);
      this.updateCount(cart.item_count);
      if (status) status.textContent = this.dataset.updatedText || '';
      document.dispatchEvent(new CustomEvent('cart:updated', { detail: cart }));

      if (focusId) document.getElementById(focusId)?.focus();
    } catch (e) {
      // Restore the true state (e.g. a quantity above the available stock).
      await this.reload();
      const message = e.message || window.theme?.strings?.cartError;
      const freshError = this.querySelector('[data-main-cart-error]');
      if (freshError && message) {
        freshError.textContent = message;
        freshError.hidden = false;
      }
    } finally {
      this.classList.remove('is-loading');
      this.removeAttribute('aria-busy');
    }
  }

  async reload() {
    try {
      const response = await fetch(`${window.location.pathname}?sections=${this.sectionId},${DRAWER_SECTION}`);
      const sections = await response.json();
      this.render(sections[this.sectionId]);
      this.renderDrawer(sections[DRAWER_SECTION]);
    } catch {
      // Leave the page as it is; a refresh shows the real state.
    }
  }

  /** Swap the cart contents with the freshly rendered section. */
  render(html) {
    if (!html) return;
    const fresh = new DOMParser().parseFromString(html, 'text/html');
    const content = fresh.querySelector('[data-main-cart-content]');
    const current = this.querySelector('[data-main-cart-content]');
    if (content && current) current.replaceWith(content);
    this.updateCount(content?.dataset.cartCountSource);
  }

  renderDrawer(html) {
    const target = document.querySelector('[data-cart-drawer-content]');
    if (!html || !target) return;
    const fresh = new DOMParser().parseFromString(html, 'text/html');
    target.innerHTML = fresh.querySelector('.shopify-section')?.innerHTML ?? fresh.body.innerHTML;
  }

  updateCount(count) {
    if (count === undefined || count === null) return;
    document.querySelectorAll('[data-cart-count]').forEach((el) => {
      el.textContent = count;
    });
  }
}

if (!customElements.get('main-cart')) customElements.define('main-cart', MainCart);
