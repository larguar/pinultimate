/**
 * Search-as-you-type for the search drawer. Results are rendered by
 * sections/predictive-search.liquid through the Section Rendering API.
 */
class PredictiveSearch extends HTMLElement {
  connectedCallback() {
    if (this.hasAttribute('data-disabled')) return;

    this.input = this.querySelector('input[type="search"]');
    this.results = this.querySelector('#predictive-search-results');
    this.cache = new Map();

    let timer;
    this.input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => this.search(this.input.value.trim()), 250);
    });

    // Focus the field as soon as the drawer opens.
    this.closest('.offcanvas')?.addEventListener('shown.bs.offcanvas', () => this.input.focus());
  }

  async search(terms) {
    if (!terms) {
      this.render('');
      return;
    }
    if (this.cache.has(terms)) {
      this.render(this.cache.get(terms));
      return;
    }

    this.abort?.abort();
    this.abort = new AbortController();
    const params = new URLSearchParams({
      q: terms,
      section_id: 'predictive-search',
      'resources[limit]': 6,
      'resources[options][unavailable_products]': 'last',
    });

    try {
      const response = await fetch(`${window.theme.routes.predictiveSearch}?${params}`, { signal: this.abort.signal });
      const html = new DOMParser()
        .parseFromString(await response.text(), 'text/html')
        .querySelector('#predictive-search-results-content')?.outerHTML ?? '';
      this.cache.set(terms, html);
      this.render(html);
    } catch (error) {
      if (error.name !== 'AbortError') throw error;
    }
  }

  render(html) {
    this.results.innerHTML = html;
    this.input.setAttribute('aria-expanded', html ? 'true' : 'false');
  }
}

customElements.define('predictive-search', PredictiveSearch);
