/**
 * <products-bundle>: bundle builder. Clicking a product tile puts it in the next empty slot of the
 * bundle panel; when every slot is filled the panel's button adds the whole bundle to the cart.
 *
 * Options (data attributes on the element):
 * - data-minimum: number of slots
 * - data-once-per-product: a product can only be added once
 * - data-allow-more: more items than the slots can be added (extra slots are created)
 */

class ProductsBundle extends HTMLElement {
  connectedCallback() {
    this.minimum = Number(this.dataset.minimum) || 2;
    this.slotList = this.querySelector('[data-bundle-slots]');
    this.slotTemplate = this.slotList?.querySelector('[data-bundle-slot]')?.cloneNode(true);
    this.submitButton = this.querySelector('[data-bundle-submit]');
    this.error = this.querySelector('[data-bundle-error]');
    this.status = this.querySelector('[data-bundle-status]');

    this.onClick = this.onClick.bind(this);
    this.onChange = this.onChange.bind(this);
    this.addEventListener('click', this.onClick);
    this.addEventListener('change', this.onChange);
    this.update();
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.onClick);
    this.removeEventListener('change', this.onChange);
  }

  get slots() {
    return [...this.querySelectorAll('[data-bundle-slot]')];
  }

  onClick(event) {
    const add = event.target.closest('[data-bundle-add]');
    if (add) return this.add(add.closest('[data-bundle-product]'), add);

    const remove = event.target.closest('[data-bundle-remove]');
    if (remove) return this.clear(remove.closest('[data-bundle-slot]'));

    const toggle = event.target.closest('[data-bundle-toggle]');
    if (toggle) {
      const open = !this.classList.contains('is-open');
      this.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      return;
    }

    if (event.target.closest('[data-bundle-submit]')) this.submit();
  }

  // A product's variant select sets which variant its tile adds.
  onChange(event) {
    const select = event.target.closest('[data-bundle-variant]');
    if (!select) return;
    const button = select.closest('[data-bundle-product]').querySelector('[data-bundle-add]');
    button.dataset.variantId = select.value;
    button.dataset.variantTitle = select.selectedOptions[0]?.textContent.trim() || '';
  }

  add(tile, button) {
    let slot = this.slots.find((s) => s.classList.contains('is-empty'));
    if (!slot && this.hasAttribute('data-allow-more') && this.slotTemplate) {
      slot = this.slotTemplate.cloneNode(true);
      this.slotList.appendChild(slot);
    }
    if (!slot) return;

    const title = tile.dataset.title;
    const variantTitle = button.dataset.variantTitle;
    slot.classList.remove('is-empty');
    slot.dataset.variantId = button.dataset.variantId;
    slot.dataset.productId = tile.dataset.productId;

    const image = slot.querySelector('[data-bundle-slot-image]');
    image.innerHTML = '';
    if (tile.dataset.image) {
      const img = document.createElement('img');
      img.src = tile.dataset.image;
      img.srcset = `${tile.dataset.image} 1x, ${tile.dataset.image2x} 2x`;
      img.alt = '';
      img.width = 60;
      img.height = 60;
      image.appendChild(img);
    }

    const text = slot.querySelector('[data-bundle-slot-text]');
    text.innerHTML = '';
    const name = document.createElement('span');
    name.className = 'products-bundle__slot-title';
    name.textContent = title;
    text.appendChild(name);
    if (variantTitle) {
      const variant = document.createElement('span');
      variant.className = 'products-bundle__slot-variant';
      variant.textContent = variantTitle;
      text.appendChild(variant);
    }

    const remove = slot.querySelector('[data-bundle-remove]');
    remove.hidden = false;
    slot.querySelector('[data-bundle-remove-label]').textContent = this.submitButton.dataset.labelRemove.replace('[title]', title);

    this.classList.add('is-open');
    this.update();
  }

  clear(slot) {
    if (this.slots.length > this.minimum) {
      slot.remove();
    } else {
      slot.classList.add('is-empty');
      delete slot.dataset.variantId;
      delete slot.dataset.productId;
      slot.querySelector('[data-bundle-slot-image]').innerHTML = '';
      const text = slot.querySelector('[data-bundle-slot-text]');
      text.innerHTML = '';
      const hidden = document.createElement('span');
      hidden.className = 'visually-hidden';
      hidden.textContent = this.slotTemplate?.querySelector('.visually-hidden')?.textContent || '';
      text.appendChild(hidden);
      slot.querySelector('[data-bundle-remove]').hidden = true;
    }
    // Filled slots first.
    this.slots.filter((s) => s.classList.contains('is-empty')).forEach((s) => this.slotList.appendChild(s));
    this.update();
  }

  update() {
    const filled = this.slots.filter((s) => !s.classList.contains('is-empty'));
    const full = filled.length >= this.minimum;
    const closed = full && !this.hasAttribute('data-allow-more');
    const bundled = new Set(filled.map((s) => s.dataset.productId));
    this.classList.toggle('is-full', full);

    this.querySelectorAll('[data-bundle-product]').forEach((tile) => {
      const button = tile.querySelector('[data-bundle-add]');
      if (!button) return;
      const inBundle = bundled.has(tile.dataset.productId);
      const locked = tile.classList.contains('is-unavailable') || closed || (inBundle && this.hasAttribute('data-once-per-product'));
      tile.classList.toggle('is-bundled', inBundle);
      tile.classList.toggle('is-locked', locked && !tile.classList.contains('is-unavailable'));
      button.disabled = locked;
      button.setAttribute('aria-pressed', String(inBundle));
      const select = tile.querySelector('[data-bundle-variant]');
      if (select) select.disabled = locked;
    });

    if (this.submitButton) this.submitButton.disabled = !full;
    if (this.status) {
      this.status.textContent = this.submitButton.dataset.labelProgress
        .replace('[count]', filled.length)
        .replace('[total]', this.minimum);
    }
  }

  async submit() {
    const items = [];
    this.slots.forEach((slot) => {
      if (!slot.dataset.variantId) return;
      const id = Number(slot.dataset.variantId);
      const line = items.find((item) => item.id === id);
      line ? line.quantity++ : items.push({ id, quantity: 1 });
    });
    if (!items.length) return;

    this.submitButton.disabled = true;
    this.submitButton.setAttribute('aria-busy', 'true');
    if (this.error) this.error.hidden = true;
    try {
      await window.theme.cart.addItems(items);
      this.slots.forEach((slot) => this.clear(slot));
      if (window.matchMedia('(max-width: 767.98px)').matches) this.classList.remove('is-open');
    } catch (error) {
      if (this.error) {
        this.error.textContent = error.message;
        this.error.hidden = false;
      }
    } finally {
      this.submitButton.removeAttribute('aria-busy');
      this.update();
    }
  }
}

if (!customElements.get('products-bundle')) customElements.define('products-bundle', ProductsBundle);
