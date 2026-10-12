/**
 * <marquee-scroller data-speed="60">: continuous scrolling row (sections/marquee.liquid).
 *
 * The section renders the items twice; this adds copies until they cover the screen twice over,
 * and sets the CSS animation length so the row moves at `data-speed` pixels per second.
 * The scrolling itself is a CSS animation (src/scss/sections/marquee.scss).
 */
class MarqueeScroller extends HTMLElement {
  connectedCallback() {
    this.template = this.querySelector('.marquee__group');
    if (!this.template) return;

    this.update = this.update.bind(this);
    this.resizeObserver = new ResizeObserver(this.update);
    this.resizeObserver.observe(this);
    this.resizeObserver.observe(this.template);
  }

  disconnectedCallback() {
    this.resizeObserver?.disconnect();
  }

  update() {
    const groupWidth = this.template.getBoundingClientRect().width;
    if (!groupWidth) return;

    const needed = Math.ceil(this.clientWidth / groupWidth) + 1;
    const groups = this.querySelectorAll('.marquee__group');
    for (let i = groups.length; i < needed; i++) {
      const copy = this.template.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      copy.querySelectorAll('[data-shopify-editor-block]').forEach((el) => el.removeAttribute('data-shopify-editor-block'));
      this.append(copy);
    }

    const speed = Number(this.dataset.speed) || 60;
    this.style.setProperty('--marquee-duration', `${(groupWidth / speed).toFixed(2)}s`);
  }
}

if (!customElements.get('marquee-scroller')) customElements.define('marquee-scroller', MarqueeScroller);
