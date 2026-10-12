/**
 * <recommended-products data-url="…"> loads its products from the recommendations endpoint
 * (rendered by this same section through the Section Rendering API) when it nears the viewport.
 */
class ProductRecommendations extends HTMLElement {
  connectedCallback() {
    if (this.loaded || !this.dataset.url) return;
    this.observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        this.observer.disconnect();
        this.load();
      },
      { rootMargin: '0px 0px 400px 0px' },
    );
    this.observer.observe(this);
  }

  disconnectedCallback() {
    this.observer?.disconnect();
  }

  async load() {
    this.loaded = true;
    try {
      const response = await fetch(this.dataset.url);
      if (!response.ok) return;
      const html = new DOMParser().parseFromString(await response.text(), 'text/html');
      const fresh = html.querySelector('recommended-products');
      if (fresh?.innerHTML.trim()) this.innerHTML = fresh.innerHTML;
    } catch (error) {
      // Recommendations are optional; leave the section empty.
    }
  }
}

if (!customElements.get('recommended-products')) customElements.define('recommended-products', ProductRecommendations);
