/**
 * Filtering and sorting for collection and search results without a page reload.
 *
 * <collection-facets data-section-id="…"> wraps the section. Changing any input in a
 * [data-facets-form] re-renders the section through the Section Rendering API, swaps in the
 * new results and forms, and updates the address bar (history.replaceState). Links marked
 * [data-facets-link] (clear all, reset) do the same. Without JavaScript the forms are plain
 * GET forms with an Apply button.
 *
 * Long filter lists ([data-show-more]) are cut off at 200px with a "Show more" button.
 */
const COLLAPSED_HEIGHT = 200;

class CollectionFacets extends HTMLElement {
  connectedCallback() {
    this.sectionId = this.dataset.sectionId;
    this.onChange = this.onChange.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.addEventListener('change', this.onChange);
    this.addEventListener('click', this.onClick);
    this.addEventListener('submit', this.onSubmit);
    document.addEventListener('click', this.onClick);
    this.enhance();
  }

  disconnectedCallback() {
    this.removeEventListener('change', this.onChange);
    this.removeEventListener('click', this.onClick);
    this.removeEventListener('submit', this.onSubmit);
    document.removeEventListener('click', this.onClick);
  }

  /** Progressive enhancements applied after every render. */
  enhance() {
    this.querySelectorAll('[data-facets-submit]').forEach((button) => (button.hidden = true));
    this.querySelectorAll('[data-show-more]').forEach((list) => {
      const toggle = this.querySelector(`[aria-controls="${list.id}"]`);
      if (!toggle || list.scrollHeight <= COLLAPSED_HEIGHT + 20) return;
      const expanded = this.expandedLists?.has(list.id);
      list.classList.toggle('is-collapsed', !expanded);
      toggle.setAttribute('aria-expanded', String(Boolean(expanded)));
      toggle.textContent = expanded ? toggle.dataset.labelLess : toggle.dataset.labelMore;
      toggle.hidden = false;
    });
  }

  onChange(event) {
    const form = event.target.closest('[data-facets-form]');
    if (!form) return;
    clearTimeout(this.timer);
    // Typing a price waits a little longer than ticking a box.
    const delay = event.target.type === 'number' ? 600 : 100;
    this.timer = setTimeout(() => this.render(this.paramsFrom(form)), delay);
  }

  onSubmit(event) {
    const form = event.target.closest('[data-facets-form]');
    if (!form) return;
    event.preventDefault();
    this.render(this.paramsFrom(form));
  }

  onClick(event) {
    // Close open filter dropdowns when clicking elsewhere.
    this.querySelectorAll('[data-facets-details][open]').forEach((details) => {
      if (!details.contains(event.target)) details.open = false;
    });
    if (event.currentTarget === document) return;

    const toggle = event.target.closest('[data-show-more-toggle]');
    if (toggle) {
      const list = this.querySelector(`#${CSS.escape(toggle.getAttribute('aria-controls'))}`);
      const expand = list.classList.contains('is-collapsed');
      list.classList.toggle('is-collapsed', !expand);
      toggle.setAttribute('aria-expanded', String(expand));
      toggle.textContent = expand ? toggle.dataset.labelLess : toggle.dataset.labelMore;
      return;
    }

    const link = event.target.closest('a[data-facets-link]');
    if (link) {
      event.preventDefault();
      this.render(new URL(link.href, window.location.origin).searchParams);
    }
  }

  paramsFrom(form) {
    const params = new URLSearchParams();
    for (const [name, value] of new FormData(form)) {
      if (value !== '') params.append(name, value);
    }
    return params;
  }

  async render(params) {
    params.delete('page');
    params.delete('section_id');
    const query = params.toString();
    const results = this.querySelectorAll('[data-facets-results]');
    results.forEach((element) => element.classList.add('is-loading'));

    try {
      const url = `${window.location.pathname}?${query}${query ? '&' : ''}section_id=${this.sectionId}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(response.statusText);
      const html = new DOMParser().parseFromString(await response.text(), 'text/html');
      this.swap(html);
      window.history.replaceState({}, '', `${window.location.pathname}${query ? `?${query}` : ''}`);
    } catch (error) {
      // Fall back to a normal page load.
      window.location.search = query;
    } finally {
      this.querySelectorAll('[data-facets-results]').forEach((element) => element.classList.remove('is-loading'));
    }
  }

  swap(html) {
    // Remember what the visitor had open so the re-rendered forms look the same.
    const focusedId = document.activeElement?.id;
    const openDetails = [...this.querySelectorAll('[data-facets-details][open]')].map((d) => d.id);
    this.expandedLists = new Set(
      [...this.querySelectorAll('[data-show-more]:not(.is-collapsed)')].map((list) => list.id),
    );

    const fresh = html.querySelector('collection-facets');
    if (!fresh) throw new Error('Section not found');

    // Results areas and forms are matched by their attribute value ("products", "sidebar"…).
    for (const attribute of ['data-facets-results', 'data-facets-container']) {
      this.querySelectorAll(`[${attribute}]`).forEach((element) => {
        const match = fresh.querySelector(`[${attribute}="${element.getAttribute(attribute)}"]`);
        if (match) element.innerHTML = match.innerHTML;
      });
    }

    // Paginated links come back with the section_id parameter; drop it.
    this.querySelectorAll('[data-facets-results] a[href*="section_id="]').forEach((link) => {
      const url = new URL(link.href, window.location.origin);
      url.searchParams.delete('section_id');
      link.href = url.pathname + url.search;
    });

    openDetails.forEach((id) => {
      const details = this.querySelector(`#${CSS.escape(id)}`);
      if (details) details.open = true;
    });
    this.enhance();
    if (focusedId) document.getElementById(focusedId)?.focus({ preventScroll: true });
  }
}

if (!customElements.get('collection-facets')) customElements.define('collection-facets', CollectionFacets);
