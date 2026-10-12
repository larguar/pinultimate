/**
 * <slideshow-pause>: the slideshow's pause/play button (sections/slideshow.liquid).
 * Controls the autoplay of the surrounding <swiper-slider>, and starts paused for visitors
 * who prefer reduced motion.
 */
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

class SlideshowPause extends HTMLElement {
  connectedCallback() {
    this.button = this.querySelector('button');
    this.button.addEventListener('click', () => this.setPaused(!this.paused));
    // <swiper-slider> creates its Swiper when it connects; wait a frame so it exists.
    requestAnimationFrame(() => this.setPaused(reducedMotion.matches));
  }

  get swiper() {
    return this.closest('swiper-slider')?.swiper;
  }

  setPaused(paused) {
    const autoplay = this.swiper?.autoplay;
    if (!autoplay) return;
    this.paused = paused;
    if (paused) autoplay.stop();
    else autoplay.start();
    this.button.toggleAttribute("data-paused", paused);
    this.button.setAttribute('aria-label', paused ? this.button.dataset.labelPlay : this.button.dataset.labelPause);
  }
}

if (!customElements.get('slideshow-pause')) customElements.define('slideshow-pause', SlideshowPause);
