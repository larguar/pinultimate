/**
 * <products-set>: "buy a set" picker. Every product in the set needs a chosen, available variant;
 * then one button adds them all to the cart (one of each) and the cart drawer opens.
 *
 * Items: [data-set-item] with either data-variant-id (single-variant products) or
 * [data-set-option] selects plus a [data-set-variants] JSON script.
 */

class ProductsSet extends HTMLElement {
  connectedCallback() {
    this.items = [...this.querySelectorAll('[data-set-item]')].map((element) => ({
      element,
      selects: [...element.querySelectorAll('[data-set-option]')],
      variants: JSON.parse(element.querySelector('[data-set-variants]')?.textContent || '[]'),
      fixedId: element.dataset.variantId || null,
      required: !element.classList.contains('products-set__item--unavailable'),
    }));
    this.button = this.querySelector('[data-set-submit]');
    this.error = this.querySelector('[data-set-error]');

    this.onChange = (event) => {
      const item = this.items.find((i) => i.selects.includes(event.target));
      if (item) this.updateItem(item);
    };
    this.onSubmit = () => this.submit();
    this.addEventListener('change', this.onChange);
    this.button?.addEventListener('click', this.onSubmit);
    this.items.forEach((item) => this.updateItem(item));
  }

  disconnectedCallback() {
    this.removeEventListener('change', this.onChange);
    this.button?.removeEventListener('click', this.onSubmit);
  }

  /** Hide option values with no available variant for the other choices, and record the variant. */
  updateItem(item) {
    if (item.selects.length) {
      const selected = item.selects.map((s) => s.value);
      item.selects.forEach((select, position) => {
        [...select.options].forEach((option) => {
          if (!option.value) return;
          const possible = item.variants.some(
            (v) => v.available && v.options.every((value, i) => (i === position ? value === option.value : !selected[i] || value === selected[i]))
          );
          option.disabled = !possible;
          option.hidden = !possible;
        });
      });
      const complete = selected.every(Boolean);
      const variant = complete && item.variants.find((v) => v.available && v.options.every((value, i) => value === selected[i]));
      item.variantId = variant ? String(variant.id) : null;
    } else {
      item.variantId = item.fixedId;
    }

    const isSelected = Boolean(item.variantId);
    item.element.classList.toggle('is-selected', isSelected);
    const status = item.element.querySelector('[data-set-status]');
    if (status) status.textContent = isSelected ? this.dataset.selectedLabel || '' : '';
    this.updateButton();
  }

  updateButton() {
    if (!this.button) return;
    const required = this.items.filter((i) => i.required);
    const ready = required.length > 0 && required.every((i) => i.variantId);
    this.button.disabled = !ready;
    this.button.textContent = ready ? this.button.dataset.labelReady : this.button.dataset.labelEmpty;
    this.classList.toggle('is-ready', ready);
  }

  reset() {
    this.items.forEach((item) => {
      item.selects.forEach((select) => (select.selectedIndex = 0));
      this.updateItem(item);
    });
  }

  async submit() {
    const items = this.items.filter((i) => i.variantId).map((i) => ({ id: Number(i.variantId), quantity: 1 }));
    if (!items.length) return;

    this.button.disabled = true;
    this.button.setAttribute('aria-busy', 'true');
    if (this.error) this.error.hidden = true;

    try {
      await window.theme.cart.addItems(items);
      this.reset();
    } catch (error) {
      if (this.error) {
        this.error.textContent = error.message;
        this.error.hidden = false;
      }
      this.updateButton();
    } finally {
      this.button.removeAttribute('aria-busy');
    }
  }
}

if (!customElements.get('products-set')) customElements.define('products-set', ProductsSet);
