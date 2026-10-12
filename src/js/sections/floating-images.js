/**
 * <floating-images>: parallax for the floating items of sections/floating-images.liquid.
 *
 * Items with data-speed move by (distance between the section's center and the screen's
 * center) x speed / 2, on landscape screens from 768px wide, as in the previous theme.
 * Visitors who prefer reduced motion see the items still.
 */
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

class FloatingImages extends HTMLElement {
  connectedCallback() {
    this.items = [...this.querySelectorAll('[data-speed]')];
    if (!this.items.length) return;

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
    const width = document.documentElement.clientWidth;
    const height = document.documentElement.clientHeight;
    const active = !reducedMotion.matches && width >= 768 && width > height;
    const rect = this.getBoundingClientRect();
    const distance = rect.top - (height - rect.height) / 2;
    const visible = rect.bottom > -height && rect.top < height * 2;

    this.items.forEach((item) => {
      if (!active) {
        item.style.transform = '';
      } else if (visible) {
        const offset = (distance * Number(item.dataset.speed)) / 2;
        if (Math.abs(offset) < height) item.style.transform = `translateY(${offset.toFixed(1)}px)`;
      }
    });
  }
}

if (!customElements.get('floating-images')) customElements.define('floating-images', FloatingImages);
