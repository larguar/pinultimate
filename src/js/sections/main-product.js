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
