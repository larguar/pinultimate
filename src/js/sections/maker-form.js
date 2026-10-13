/**
 * <maker-form>: sends the maker application to its Google Form in the background
 * (sections/maker-form.liquid) and shows the thank-you message in place of the form.
 *
 * Google Forms doesn't allow cross-origin reads, so the request goes out as `no-cors`: the
 * response can't be inspected and only a network failure counts as an error. Without
 * JavaScript the form posts to Google in a new tab instead.
 */
class MakerForm extends HTMLElement {
  connectedCallback() {
    this.form = this.querySelector('form');
    this.success = this.querySelector('[data-maker-form-success]');
    this.error = this.querySelector('[data-maker-form-error]');
    this.onSubmit = this.onSubmit.bind(this);
    this.form?.addEventListener('submit', this.onSubmit);
  }

  disconnectedCallback() {
    this.form?.removeEventListener('submit', this.onSubmit);
  }

  async onSubmit(event) {
    event.preventDefault();
    const button = this.form.querySelector('[type="submit"]');
    button.disabled = true;
    this.error.hidden = true;

    try {
      await fetch(this.form.action, {
        method: 'POST',
        mode: 'no-cors',
        body: new URLSearchParams(new FormData(this.form)),
      });
      this.form.hidden = true;
      this.success.hidden = false;
      this.success.focus();
    } catch {
      this.error.hidden = false;
      this.error.focus();
    } finally {
      button.disabled = false;
    }
  }
}

if (!customElements.get('maker-form')) customElements.define('maker-form', MakerForm);
