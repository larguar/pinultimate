/**
 * <parallax-shape data-speed="-2">: moves a decorative shape vertically as the page scrolls.
 *
 * The offset is (scroll position - (shape's page offset - half the viewport height)) / speed / 5,
 * applied while the shape is within a viewport of the screen, as in the previous theme.
 * A speed of 0, or the visitor's reduced-motion preference, keeps the shape still.
 */
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

class ParallaxShape extends HTMLElement {
  connectedCallback() {
    this.speed = Number(this.dataset.speed) || 0;
    this.ticking = false;
    this.onScroll = this.onScroll.bind(this);
    this.update = this.update.bind(this);

    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('resize', this.onScroll, { passive: true });
    reducedMotion.addEventListener('change', this.onScroll);
    this.update();
  }

  disconnectedCallback() {
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onScroll);
    reducedMotion.removeEventListener('change', this.onScroll);
  }

  onScroll() {
    if (this.ticking) return;
    this.ticking = true;
    requestAnimationFrame(this.update);
  }

  update() {
    this.ticking = false;
    if (!this.speed || reducedMotion.matches) {
      this.style.transform = '';
      return;
    }

    // Page offset of the shape without its transform: its positioned parent plus its own top.
    const parent = this.offsetParent || document.body;
    const top = parent.getBoundingClientRect().top + window.scrollY + this.offsetTop;
    const scroll = window.scrollY;
    const half = window.innerHeight / 2;

    if (scroll > top - half * 2 && scroll < top + half) {
      const offset = (scroll - (top - half)) / this.speed / 5;
      this.style.transform = `translateY(${offset.toFixed(1)}px)`;
    }
  }
}

if (!customElements.get('parallax-shape')) customElements.define('parallax-shape', ParallaxShape);
