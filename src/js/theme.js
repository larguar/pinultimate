// Theme script entry. Bundled to assets/theme.js by `npm run build:js`.
import Collapse from 'bootstrap/js/dist/collapse';
import Modal from 'bootstrap/js/dist/modal';
import Offcanvas from 'bootstrap/js/dist/offcanvas';
import { addItems, openDrawer } from './components/cart';
import './components/predictive-search';
import './components/quantity-stepper';
import './components/reveal';
import './components/sticky-header';
import './components/swiper-slider';

// Exposed for section scripts and the theme editor.
window.bootstrap = { Collapse, Modal, Offcanvas };
window.theme.cart = { addItems, openDrawer };
