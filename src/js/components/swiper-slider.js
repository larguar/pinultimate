import Swiper from 'swiper';
import { A11y, Autoplay, Navigation, Pagination } from 'swiper/modules';

/**
 * <swiper-slider data-options='{"slidesPerView": 2}'>
 *   <div class="swiper"><div class="swiper-wrapper"><div class="swiper-slide">…</div></div></div>
 *   <button class="swiper-button-prev"></button> <button class="swiper-button-next"></button>
 *   <div class="swiper-pagination"></div>
 * </swiper-slider>
 *
 * Options are passed straight to Swiper. Navigation and pagination are enabled
 * when their elements exist inside the component. Being a custom element, it
 * re-initialises when the theme editor re-renders a section.
 */
class SwiperSlider extends HTMLElement {
  connectedCallback() {
    const options = JSON.parse(this.dataset.options || '{}');
    const prev = this.querySelector('.swiper-button-prev');
    const next = this.querySelector('.swiper-button-next');
    const pagination = this.querySelector('.swiper-pagination');

    this.swiper = new Swiper(this.querySelector('.swiper'), {
      modules: [A11y, Autoplay, Navigation, Pagination],
      watchOverflow: true,
      ...(prev && next && { navigation: { prevEl: prev, nextEl: next } }),
      ...(pagination && { pagination: { el: pagination, clickable: true } }),
      ...options,
    });
  }

  disconnectedCallback() {
    this.swiper?.destroy(true, true);
  }
}

customElements.define('swiper-slider', SwiperSlider);
