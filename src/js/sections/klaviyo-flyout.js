/**
 * Agency flyout (ported from the previous theme's script.js): five seconds after the page
 * loads the sticker slides in and bounces; clicking it tucks it away, opens the Klaviyo
 * form named by its id ("klaviyo-<formId>") and brings it back ten seconds later.
 */
class KlaviyoFlyout extends HTMLElement {
  connectedCallback() {
    this.trigger = this.querySelector('.klaviyo_form_trigger');
    if (!this.trigger) return;

    const reveal = () => {
      this.timer = setTimeout(() => {
        this.trigger.style.right = '-100px';
        setTimeout(() => this.trigger.classList.add('is-bouncing'), 500);
      }, 5000);
    };
    document.readyState === 'complete' ? reveal() : window.addEventListener('load', reveal, { once: true });

    this.trigger.addEventListener('click', () => {
      this.trigger.style.right = '-160px';
      window._klOnsite = window._klOnsite || [];
      window._klOnsite.push(['openForm', this.trigger.id.split('-')[1]]);
      setTimeout(() => (this.trigger.style.right = '-100px'), 10000);
    });
  }

  disconnectedCallback() {
    clearTimeout(this.timer);
  }
}

customElements.define('klaviyo-flyout', KlaviyoFlyout);
