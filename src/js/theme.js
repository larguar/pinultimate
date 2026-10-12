// Theme script entry. Bundled to assets/theme.js by `npm run build:js`.
import Collapse from 'bootstrap/js/dist/collapse';
import Modal from 'bootstrap/js/dist/modal';
import Offcanvas from 'bootstrap/js/dist/offcanvas';
import './components/swiper-slider';

// Exposed for section scripts and the theme editor.
window.bootstrap = { Collapse, Modal, Offcanvas };
