/* ============================================================
   vaxdue explained — scroll-driven narrative.
   No network, no libraries. IntersectionObserver reveals scenes;
   the demo timeline animates in when it enters the viewport.

   The date arithmetic that produced the illustrative dates in the
   demo is the SAME clamp-aware logic vaxdue uses. It is exported for
   node --test (see test/dates.test.js) so the shown dates are proven,
   never fabricated.
   ============================================================ */

/* ---- pure, testable calendar arithmetic (mirrors vaxdue's engine) ---- */

function addDays(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().slice(0, 10);
}

function addWeeks(iso, w) { return addDays(iso, w * 7); }

// month add with month-end clamping + leap-year correctness
function addMonths(iso, months) {
  const [y, m, d] = iso.split('-').map(Number);
  const targetMonthIndex = (m - 1) + months;
  const ty = y + Math.floor(targetMonthIndex / 12);
  const tm = ((targetMonthIndex % 12) + 12) % 12;         // 0..11
  const lastDay = new Date(Date.UTC(ty, tm + 1, 0)).getUTCDate(); // day 0 of next month
  const cd = Math.min(d, lastDay);                          // clamp
  const dt = new Date(Date.UTC(ty, tm, cd));
  return dt.toISOString().slice(0, 10);
}

// dueDate: apply an {weeks} or {months} offset to a DOB
function dueDate(offset, dob) {
  if (offset && typeof offset.weeks === 'number') return addWeeks(dob, offset.weeks);
  if (offset && typeof offset.months === 'number') return addMonths(dob, offset.months);
  return dob;
}

/* dual-export guard so node --test can require this file */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { addDays, addWeeks, addMonths, dueDate };
}

/* ---- browser-only presentation below ---- */
if (typeof document !== 'undefined') {
  document.documentElement.classList.add('js');

  const reduce = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1) reveal scenes + trigger the demo timeline
  const reveals = document.querySelectorAll('.reveal');
  const demo = document.querySelector('.demo');

  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
    if (demo) demo.classList.add('is-live');
  } else {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        if (entry.target === demo) demo.classList.add('is-live');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

    reveals.forEach(function (el) { io.observe(el); });
    if (demo && !demo.classList.contains('reveal')) io.observe(demo);
  }

  // 2) reading-progress birch trunk
  const fill = document.getElementById('progressFill');
  if (fill) {
    let ticking = false;
    const paint = function () {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? Math.min(100, (h.scrollTop / max) * 100) : 0;
      fill.style.height = pct.toFixed(2) + '%';
      ticking = false;
    };
    paint();
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(paint); ticking = true; }
    }, { passive: true });
    window.addEventListener('resize', paint, { passive: true });
  }
}
