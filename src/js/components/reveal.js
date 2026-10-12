/**
 * Fade-up on scroll: adds .is-revealed to [data-reveal] elements once they come within
 * 120px of entering the viewport (the previous theme used AOS "fade-up" for this).
 * Elements added later (theme editor re-renders) are picked up by a MutationObserver.
 */
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-revealed');
      observer.unobserve(entry.target);
    }
  },
  { rootMargin: '0px 0px -120px 0px' }
);

function watch(root = document) {
  root.querySelectorAll('[data-reveal]:not(.is-revealed)').forEach((el) => {
    // In the theme editor show everything immediately so merchants can edit it.
    if (window.Shopify?.designMode) el.classList.add('is-revealed');
    else observer.observe(el);
  });
}

watch();
new MutationObserver(() => watch()).observe(document.body, { childList: true, subtree: true });
