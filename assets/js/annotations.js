/* ============================================
   Handwritten Annotation System
   Requires: rough-notation.js loaded before this file

   HTML API:
     <span class="mark-circle">text</span>
     <span class="mark-highlight">text</span>
     <span class="mark-underline">text</span>
     <span class="mark-wave">text</span>
     <span class="mark-box">text</span>
     <span class="mark-strike">text</span>
     <span class="mark-bracket">text</span>

   Color override:
     <span class="mark-circle" data-mark-color="#6B9FD4">text</span>
   ============================================ */

const MARK_DEFAULT_COLOR = '#E07A5F';
const MARK_DURATION      = 500;
const MARK_STAGGER       = 150;

const MARK_CONFIG = {
  'mark-circle':    { type: 'circle',         strokeWidth: 2,   padding: [2, 4]             },
  'mark-highlight': { type: 'highlight',       strokeWidth: 0,   padding: 2,  alpha: 0.35   },
  'mark-underline': { type: 'underline',       strokeWidth: 2.2, padding: 4                  },
  'mark-wave':      { type: 'underline',       strokeWidth: 2,   padding: 4,  roughness: 3.5 },
  'mark-box':       { type: 'box',             strokeWidth: 1.8, padding: 8                  },
  'mark-strike':    { type: 'strike-through',  strokeWidth: 2,   padding: 3                  },
  'mark-bracket':   { type: 'bracket',         strokeWidth: 2,   padding: 4,  brackets: ['left','right'] },
};

function hexToRgba(hex, a) {
  const h = hex.replace('#', '');
  return `rgba(${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)},${a})`;
}

function initAnnotations() {
  if (!window.RoughNotation) {
    console.warn('RoughNotation not loaded');
    return;
  }
  const { annotate } = window.RoughNotation;
  const selector = Object.keys(MARK_CONFIG).map(c => `.${c}`).join(',');
  const elements = Array.from(document.querySelectorAll(selector));
  if (!elements.length) return;

  // Build annotation instances
  const entries = elements.map((el, idx) => {
    const cls  = Object.keys(MARK_CONFIG).find(c => el.classList.contains(c));
    const cfg  = MARK_CONFIG[cls];
    const baseColor = el.dataset.markColor || MARK_DEFAULT_COLOR;
    const color     = cfg.alpha ? hexToRgba(baseColor, cfg.alpha) : baseColor;

    const ann = annotate(el, {
      type:              cfg.type,
      color,
      strokeWidth:       cfg.strokeWidth,
      padding:           cfg.padding,
      roughness:         cfg.roughness ?? 1.8,
      iterations:        1,
      multiline:         true,
      animationDuration: MARK_DURATION,
      brackets:          cfg.brackets,
    });

    return { el, ann, delay: idx * MARK_STAGGER };
  });

  // Trigger each annotation when it enters the viewport
  const seen = new Set();
  const io = new IntersectionObserver(
    (obs) => {
      obs.forEach(entry => {
        if (!entry.isIntersecting || seen.has(entry.target)) return;
        seen.add(entry.target);
        const rec = entries.find(e => e.el === entry.target);
        if (rec) setTimeout(() => rec.ann.show(), rec.delay);
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.2, rootMargin: '0px 0px -40px 0px' }
  );

  entries.forEach(({ el }) => io.observe(el));
}

document.addEventListener('DOMContentLoaded', initAnnotations);
