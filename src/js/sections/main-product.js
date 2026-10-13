/**
 * <main-product>: variant selection on the product page.
 *
 * - Option selects pick the variant. The section is re-rendered for that variant
 *   (`?variant=…&section_id=…`) and every [data-main-product-update="key"] element is swapped
 *   for its fresh copy, so price, badges and the button text come from Liquid.
 * - Updates the hidden `id` inputs (add to cart and Shop Pay installments), the URL and the
 *   gallery position. Option values that would make a combination that doesn't exist are
 *   disabled or hidden, following the variant picker's setting.
 * - Adding to cart is handled globally by components/cart.js ([data-add-to-cart] forms).
 */
class MainProduct extends HTMLElement {
  connectedCallback() {
    this.variants = JSON.parse(this.querySelector('[data-main-product-variants]')?.textContent || '[]');
    this.selects = [...this.querySelectorAll('.main-product__select')];
    this.gallery = this.querySelector('[data-main-product-gallery]');
    this.onChange = this.onChange.bind(this);
    this.addEventListener('change', this.onChange);
    this.updateOptionStates();
  }

  disconnectedCallback() {
    this.removeEventListener('change', this.onChange);
    this.controller?.abort();
  }

  onChange(event) {
    if (!event.target.matches('.main-product__select')) return;
    this.updateOptionStates();

    const selected = this.selects.map((select) => select.value);
    if (selected.some((value) => !value)) return; // Still choosing (no preselected variant).

    const variant = this.variants.find((v) => v.options.every((value, i) => value === selected[i]));
    this.removeAttribute('data-variant-required');

    if (!variant) {
      this.setButton(window.theme.strings.unavailable, true);
      return;
    }

    this.setVariantId(variant.id);
    const url = new URL(window.location.href);
    url.searchParams.set('variant', variant.id);
    window.history.replaceState(window.history.state, '', url);
    if (variant.featured_media) this.showMedia(variant.featured_media.id);
    this.render(variant.id);
  }

  /** Disable (or hide) option values that can't make an existing variant with the other choices. */
  updateOptionStates() {
    const selected = this.selects.map((select) => select.value);
    this.selects.forEach((select, position) => {
      const mode = select.dataset.unavailable;
      if (mode === 'show') return;
      [...select.options].forEach((option) => {
        if (!option.value) return;
        const exists = this.variants.some((variant) =>
          variant.options.every((value, i) => (i === position ? value === option.value : !selected[i] || value === selected[i]))
        );
        option.disabled = !exists;
        option.hidden = !exists && mode === 'hide';
      });
    });
  }

  setVariantId(id) {
    this.querySelectorAll('form input[name="id"]').forEach((input) => {
      input.value = id;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  setButton(label, disabled) {
    const button = this.querySelector('[data-main-product-update="button"]');
    if (!button) return;
    button.textContent = label;
    button.disabled = disabled;
  }

  showMedia(mediaId) {
    const slides = [...this.querySelectorAll('[data-media-id]')];
    const index = slides.findIndex((slide) => slide.dataset.mediaId === String(mediaId));
    if (index < 0) return;

    const swiper = this.gallery?.swiper;
    if (swiper?.enabled) {
      swiper.slideTo(index);
    } else if (index > 0 || window.scrollY > 0) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      slides[index].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
  }

  async render(variantId) {
    this.controller?.abort();
    this.controller = new AbortController();
    const button = this.querySelector('[data-main-product-update="button"]');
    button?.setAttribute('aria-busy', 'true');

    try {
      const response = await fetch(`${this.dataset.url}?variant=${variantId}&section_id=${this.dataset.sectionId}`, {
        signal: this.controller.signal,
      });
      const html = new DOMParser().parseFromString(await response.text(), 'text/html');
      this.querySelectorAll('[data-main-product-update]').forEach((element) => {
        const key = element.dataset.mainProductUpdate;
        const fresh = html.querySelector(`[data-main-product-update="${key}"]`);
        if (!fresh) return;
        if (key === 'button') {
          // Keep the element (and its listeners); copy its label and state.
          element.textContent = fresh.textContent;
          element.disabled = fresh.disabled;
        } else {
          element.innerHTML = fresh.innerHTML;
        }
      });
    } catch (error) {
      if (error.name !== 'AbortError') console.error(error);
    } finally {
      button?.removeAttribute('aria-busy');
    }
  }
}

if (!customElements.get('main-product')) customElements.define('main-product', MainProduct);

/**
 * <custom-pins-fields>: project questions for custom pin orders (snippets/custom-pins-fields.liquid).
 *
 * - Checkbox groups ([data-checkbox-group]) save their ticked answers, comma-separated, in one
 *   hidden `properties[…]` input, so the order shows them as one line.
 * - [data-show-when="Group"][data-show-values="a|b"] fields show while that group has one of
 *   those answers ticked. Hidden fields are disabled so they aren't sent.
 * - The form has `novalidate`; on submit this checks the fields before components/cart.js
 *   adds to cart (a capturing listener runs first) and marks what's missing.
 */
class CustomPinsFields extends HTMLElement {
  connectedCallback() {
    this.form = this.closest('form');
    if (!this.form) return;
    this.update = this.update.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.addEventListener('change', this.update);
    this.addEventListener('input', this.update);
    this.form.addEventListener('submit', this.onSubmit, true);

    // The page may be cached: don't allow a "needed by" date before today in the shopper's time.
    const date = this.querySelector('input[type="date"]');
    if (date) {
      const today = new Date();
      date.min = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
    }
    this.update();
  }

  disconnectedCallback() {
    this.removeEventListener('change', this.update);
    this.removeEventListener('input', this.update);
    this.form?.removeEventListener('submit', this.onSubmit, true);
  }

  /** Ticked, enabled answers of a checkbox group. */
  answers(name) {
    const group = this.querySelector(`[data-checkbox-group="${name}"]`);
    return group ? [...group.querySelectorAll('input[type="checkbox"]:checked:not(:disabled)')].map((input) => input.value) : [];
  }

  update() {
    // In document order, so a field that depends on a hidden group hides too.
    this.querySelectorAll('[data-checkbox-group], [data-show-when]').forEach((element) => {
      if (element.dataset.showWhen) {
        const ticked = this.answers(element.dataset.showWhen);
        const show = element.dataset.showValues.split('|').some((value) => value && ticked.includes(value));
        element.hidden = !show;
        element.querySelectorAll('input, textarea, select').forEach((input) => (input.disabled = !show));
      }
      if (element.dataset.checkboxGroup) {
        const value = element.querySelector('[data-group-value]');
        if (value) value.value = this.answers(element.dataset.checkboxGroup).join(', ');
        const first = element.querySelector('input[type="checkbox"]');
        if (first && element.hasAttribute('data-required')) first.setCustomValidity(value?.value ? '' : 'required');
      }
    });
    if (this.validated) this.markInvalid();
  }

  /** Red borders and messages on the questions that still need an answer. */
  markInvalid() {
    let firstInvalid = null;
    this.querySelectorAll('.custom-pins__field').forEach((field) => {
      const controls = [...field.querySelectorAll('input:not([type="hidden"]), textarea')].filter((input) => !input.disabled);
      const invalid = controls.some((input) => !input.checkValidity());
      field.classList.toggle('is-invalid', invalid);
      controls.forEach((input) => input.classList.toggle('is-invalid', invalid));
      if (invalid && !firstInvalid) firstInvalid = controls.find((input) => !input.checkValidity());
    });
    return firstInvalid;
  }

  onSubmit(event) {
    this.update();
    if (this.form.checkValidity()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    this.validated = true;
    this.markInvalid()?.focus();
  }
}

if (!customElements.get('custom-pins-fields')) customElements.define('custom-pins-fields', CustomPinsFields);

/**
 * <custom-pins-estimate>: price per pin, delivery date and deadline warning for the custom pins
 * product (buy buttons block, sections/main-product.liquid).
 *
 * - The pin count comes from the quantity option ("300 pins"), the weeks from the timeline
 *   option ("4-6 Weeks"). The standard (first) timeline reads "Delivery by …", others give a range.
 * - A "needed by" date before the earliest delivery gets a warning; the order can still be placed.
 */
class CustomPinsEstimate extends HTMLElement {
  connectedCallback() {
    this.product = this.closest('main-product');
    this.form = this.closest('form');
    if (!this.product || !this.form) return;

    this.variants = JSON.parse(this.product.querySelector('[data-main-product-variants]')?.textContent || '[]');
    this.qtyIndex = Number(this.dataset.quantityIndex);
    this.timelineIndex = Number(this.dataset.timelineIndex);
    this.update = this.update.bind(this);
    // The variant id input changes when an option is picked (main-product dispatches "change").
    this.product.addEventListener('change', this.update);
    this.form.addEventListener('input', this.update);
    this.update();
  }

  disconnectedCallback() {
    this.product?.removeEventListener('change', this.update);
    this.form?.removeEventListener('input', this.update);
  }

  update() {
    const variantId = Number(this.form.querySelector('input[name="id"]')?.value);
    const variant = this.variants.find((v) => v.id === variantId);
    this.renderTotal(variant);
    this.renderDelivery(variant);
    this.checkDeadline(variant);
  }

  /** Pins in a variant ("300 pins" → 300). */
  pins(variant) {
    return parseInt(variant?.options[this.qtyIndex], 10) || 0;
  }

  /** Weeks of a variant's timeline ("4-6 Weeks" → [4, 6]). */
  weeks(variant) {
    const match = String(variant?.options[this.timelineIndex] || '').match(/(\d+)\s*[-–]\s*(\d+)/);
    return match ? [Number(match[1]), Number(match[2])] : null;
  }

  money(cents) {
    const currency = window.Shopify?.currency?.active || 'USD';
    return new Intl.NumberFormat(document.documentElement.lang || undefined, { style: 'currency', currency }).format(cents / 100);
  }

  renderTotal(variant) {
    const total = this.querySelector('[data-estimate-total]');
    const perPin = this.querySelector('[data-estimate-per-pin]');
    if (!variant) {
      // No variant chosen yet: the lowest price per pin.
      const lowest = Math.min(...this.variants.filter((v) => this.pins(v)).map((v) => v.price / this.pins(v)));
      total.textContent = '';
      perPin.textContent = Number.isFinite(lowest) ? this.dataset.fromPerPin.replace('[price]', this.money(Math.round(lowest))) : '';
      return;
    }
    total.textContent = this.money(variant.price);
    const pins = this.pins(variant);
    perPin.textContent = pins ? this.dataset.perPin.replace('[price]', this.money(Math.round(variant.price / pins))) : '';
  }

  /** Midnight today plus a number of weeks. */
  static weeksFromToday(weeks) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + weeks * 7);
    return date;
  }

  formatDate(date) {
    return date.toLocaleDateString(document.documentElement.lang || undefined, { month: 'long', day: 'numeric' });
  }

  renderDelivery(variant) {
    const element = this.querySelector('[data-estimate-delivery]');
    const weeks = this.weeks(variant);
    if (!weeks) {
      element.innerHTML = '';
      return;
    }
    const [earliest, latest] = weeks.map((w) => this.formatDate(CustomPinsEstimate.weeksFromToday(w)));
    element.innerHTML =
      variant.options[this.timelineIndex] === this.dataset.standardTimeline
        ? this.dataset.deliveryBy.replace('[date]', `<strong>${latest}</strong>`)
        : this.dataset.deliveryBetween.replace('[start]', `<strong>${earliest}</strong>`).replace('[end]', `<strong>${latest}</strong>`);
  }

  checkDeadline(variant) {
    const warning = this.querySelector('[data-estimate-warning]');
    const field = this.form.querySelector('[name="properties[Needed By]"]');
    const match = field?.value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const deadline = match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
    const weeks = this.weeks(variant);

    let message = '';
    if (deadline && weeks) {
      const today = CustomPinsEstimate.weeksFromToday(0);
      const earliest = CustomPinsEstimate.weeksFromToday(weeks[0]);
      if (deadline < today) message = this.dataset.deadlinePast;
      else if (deadline.getTime() === earliest.getTime()) message = this.dataset.deadlineSameDay;
      else if (deadline < earliest) message = this.dataset.deadlineTooSoon.replace('[weeks]', weeks[0]);
    }
    warning.innerHTML = message;
    warning.hidden = !message;
  }
}

if (!customElements.get('custom-pins-estimate')) customElements.define('custom-pins-estimate', CustomPinsEstimate);
