/**
 * <timeline-steps>: numbered steps that open one at a time (Bootstrap Collapse with
 * data-bs-parent), showing the open step's image. The open step can't be closed by
 * clicking it again, so one step is always showing. On phones every step's text is
 * visible in a horizontal scroller and tapping a step just highlights it.
 */
class TimelineSteps extends HTMLElement {
  connectedCallback() {
    this.switching = false;
    this.onShow = this.onShow.bind(this);
    this.onHide = this.onHide.bind(this);
    this.onBlockSelect = this.onBlockSelect.bind(this);
    this.addEventListener('show.bs.collapse', this.onShow);
    this.addEventListener('hide.bs.collapse', this.onHide);
    document.addEventListener('shopify:block:select', this.onBlockSelect);
  }

  disconnectedCallback() {
    document.removeEventListener('shopify:block:select', this.onBlockSelect);
  }

  onShow(event) {
    const step = event.target.closest('.timeline__step');
    if (!step) return;
    // Bootstrap hides the previously open step right after this event; let that through.
    this.switching = true;
    setTimeout(() => (this.switching = false));
    this.activate(step.dataset.step);
  }

  onHide(event) {
    if (!this.switching && event.target.closest('.timeline__step')) event.preventDefault();
  }

  activate(index) {
    this.querySelectorAll('.timeline__step').forEach((step) => {
      step.classList.toggle('is-active', step.dataset.step === index);
    });
    const images = this.querySelectorAll('.timeline__image');
    if (![...images].some((image) => image.dataset.step === index)) return;
    images.forEach((image) => image.classList.toggle('is-active', image.dataset.step === index));
  }

  onBlockSelect(event) {
    const step = event.target.closest?.('.timeline__step');
    if (!step || !this.contains(step)) return;
    const body = step.querySelector('.collapse');
    if (body && window.bootstrap) window.bootstrap.Collapse.getOrCreateInstance(body, { toggle: false }).show();
  }
}

if (!customElements.get('timeline-steps')) customElements.define('timeline-steps', TimelineSteps);
