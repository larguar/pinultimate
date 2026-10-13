/**
 * <before-after-slider>: before/after comparison (sections/before-after.liquid).
 *
 * The range input covers the images; its value is mirrored into --before-after-position,
 * which clips the "after" image and places the handle (src/scss/sections/before-after.scss).
 */
class BeforeAfterSlider extends HTMLElement {
  connectedCallback() {
    this.range = this.querySelector('.before-after__range');
    if (!this.range) return;

    this.update = this.update.bind(this);
    this.range.addEventListener('input', this.update);
    this.update();
  }

  disconnectedCallback() {
    this.range?.removeEventListener('input', this.update);
  }

  update() {
    this.style.setProperty('--before-after-position', `${this.range.value}%`);
  }
}

if (!customElements.get('before-after-slider')) customElements.define('before-after-slider', BeforeAfterSlider);
