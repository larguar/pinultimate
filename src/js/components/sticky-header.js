/**
 * Hides the header section while scrolling down and brings it back when scrolling up.
 * Add data-disabled to keep it in normal flow (it then scrolls away with the page).
 */
class StickyHeader extends HTMLElement {
  connectedCallback() {
    this.section = this.closest('.shopify-section');
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
