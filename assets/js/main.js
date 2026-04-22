/* ============================================
   TECHIN 600 Process Book — Main JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  assignCardRotations();
  initScrollReveal();
  initStickyHeader();
  initLightbox();
  initSidebarNav();
  initReadingProgress();
});

/* --- Assign slight random tilt to each card (scattered-notes effect) --- */
function assignCardRotations() {
  const cards = document.querySelectorAll('.project-card');
  // Small rotations: alternating positive/negative, each card slightly different
  const rotations = [-1.2, 0.8, -0.6, 1.4, -1.0, 0.5];
  cards.forEach((card, i) => {
    const r = rotations[i % rotations.length];
    card.style.setProperty('--enter-rotate', `${r}deg`);
  });
}

/* --- Scroll Reveal --- */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal, .reveal-children');
  const sections = document.querySelectorAll('.content-section');
  const steps    = document.querySelectorAll('.step');
  const cards    = document.querySelectorAll('.project-card');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      if (entry.target.classList.contains('project-card')) {
        // stagger cards
        const siblings = Array.from(entry.target.parentElement.children);
        const idx = siblings.indexOf(entry.target);
        setTimeout(() => entry.target.classList.add('visible'), idx * 90);
      } else if (entry.target.classList.contains('step')) {
        // stagger steps
        const siblings = Array.from(entry.target.parentElement.children);
        const idx = siblings.indexOf(entry.target);
        setTimeout(() => entry.target.classList.add('visible'), idx * 70);
      } else {
        entry.target.classList.add('visible');
      }

      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -36px 0px' });

  [...reveals, ...sections, ...steps, ...cards].forEach(el => observer.observe(el));
}

/* --- Sticky Header Shadow --- */
function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* --- Lightbox --- */
function initLightbox() {
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = `
    <button class="lightbox-close" aria-label="Close">✕</button>
    <img class="lightbox-img" src="" alt="" />
    <span class="lightbox-caption"></span>
  `;
  document.body.appendChild(lb);

  const lbImg     = lb.querySelector('.lightbox-img');
  const lbCaption = lb.querySelector('.lightbox-caption');
  const lbClose   = lb.querySelector('.lightbox-close');

  function openLightbox(src, caption) {
    lbImg.src = src;
    lbImg.alt = caption || '';
    lbCaption.textContent = caption || '';
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { lbImg.src = ''; }, 350);
  }

  document.addEventListener('click', (e) => {
    const item = e.target.closest('.photo-item');
    if (item) {
      const img = item.querySelector('img');
      const caption = item.dataset.caption || (img && img.alt) || '';
      if (img) openLightbox(img.src, caption);
    }
  });

  lbClose.addEventListener('click', closeLightbox);
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lb.classList.contains('open')) closeLightbox();
  });
}

/* --- Sidebar Nav Active State (project pages) --- */
function initSidebarNav() {
  const navLinks = document.querySelectorAll('.sidebar-nav a');
  if (!navLinks.length) return;

  const sections = Array.from(navLinks)
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(a => a.classList.remove('active'));
        const link = document.querySelector(`.sidebar-nav a[href="#${entry.target.id}"]`);
        if (link) link.classList.add('active');
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });

  sections.forEach(s => observer.observe(s));
}

/* --- Reading Progress Bar --- */
function initReadingProgress() {
  const bar = document.querySelector('.reading-progress-bar');
  if (!bar) return;

  const onScroll = () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = docHeight > 0
      ? `${Math.min((window.scrollY / docHeight) * 100, 100)}%`
      : '0%';
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
