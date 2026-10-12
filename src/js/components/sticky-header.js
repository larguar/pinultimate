/**
 * Hides the header section while scrolling down and brings it back when scrolling up.
 * Add data-disabled to keep it in normal flow (it then scrolls away with the page).
 *
 * Also publishes the header group's height (announcement bar + header) as the
 * --header-height custom property on <html>, for sections that size against it.
 */
class StickyHeader extends HTMLElement {
  connectedCallback() {
    this.section = this.closest('.shopify-section');
    this.publishHeight();

    if (this.hasAttribute('data-disabled')) {
      this.section.style.position = 'relative';
      return;
    }

    this.lastScrollY = window.scrollY;
    this.onScroll = this.onScroll.bind(this);
    window.addEventListener('scroll', this.onScroll, { passive: true });
  }

  disconnectedCallback() {
    window.removeEventListener('scroll', this.onScroll);
    this.resizeObserver?.disconnect();
  }

  publishHeight() {
    const sections = document.querySelectorAll('.shopify-section-group-header-group');
    const update = () => {
      const height = [...sections].reduce((total, section) => total + section.offsetHeight, 0);
      document.documentElement.style.setProperty('--header-height', `${height}px`);
    };
    this.resizeObserver = new ResizeObserver(update);
    sections.forEach((section) => this.resizeObserver.observe(section));
    update();
  }

  onScroll() {
    const scrollY = window.scrollY;
    const pastHeader = scrollY > this.section.offsetTop + this.offsetHeight;
    // Keep it visible while a drawer or menu inside it is open.
    const hidden = pastHeader && scrollY > this.lastScrollY && !document.body.classList.contains('offcanvas-open');

    this.section.classList.toggle('is-hidden', hidden);
    this.lastScrollY = scrollY;
  }
}

customElements.define('sticky-header', StickyHeader);
