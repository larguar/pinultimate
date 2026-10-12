/**
 * Minus / plus buttons around a number input. Dispatches a native `change` event on the
 * input so listeners (cart.js, product forms) only need to watch the input.
 */
class QuantityStepper extends HTMLElement {
  connectedCallback() {
    this.input = this.querySelector('input');
    this.addEventListener('click', (event) => {
      const button = event.target.closest('button[name]');
      if (!button) return;

      const previous = this.input.value;
      button.name === 'plus' ? this.input.stepUp() : this.input.stepDown();
      if (previous !== this.input.value) {
        this.input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  }
}

customElements.define('quantity-stepper', QuantityStepper);
