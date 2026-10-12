/**
 * Loads product recommendations for the first cart item into the section, and reloads
 * them when the cart page changes (e.g. the first item is removed).
 */
class CartRecommendations extends HTMLElement {
  connectedCallback() {
    this.onCartUpdated = this.onCartUpdated.bind(this);
    document.addEventListener('cart:updated', this.onCartUpdated);
    if (this.dataset.url) this.load(this.dataset.url);
  }

  disconnectedCallback() {
    document.removeEventListener('cart:updated', this.onCartUpdated);
  }

  onCartUpdated(event) {
    const productId = event.detail?.items?.[0]?.product_id;
    if (!productId) {
      this.innerHTML = '';
      return;
    }
    if (!this.dataset.url) return;
    const url = new URL(this.dataset.url, window.location.origin);
    if (url.searchParams.get('product_id') === String(productId)) return;
    url.searchParams.set('product_id', productId);
    this.dataset.url = url.pathname + url.search;
    this.load(this.dataset.url);
  }

  async load(url) {
    try {
      const response = await fetch(url);
      const html = await response.text();
      const fresh = new DOMParser().parseFromString(html, 'text/html').querySelector('cart-recommendations');
      this.innerHTML = fresh ? fresh.innerHTML : '';
    } catch {
      this.innerHTML = '';
    }
  }
}

if (!customElements.get('cart-recommendations')) customElements.define('cart-recommendations', CartRecommendations);
