/* =========================================================
   MELINE TECHNOLOGY — v2 script
   nav · reveal · counters · lightbox · mailto form · back-to-top
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* year */
  const yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* back-to-top (declared early: onScroll references it) */
  const toTop = document.getElementById('toTop');
  const syncToTop = () => { if (toTop) toTop.classList.toggle('show', window.scrollY > 500); };
  if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  window.addEventListener('scroll', syncToTop, { passive: true });
  syncToTop();

  /* mobile nav */
  const navBtn = document.getElementById('navBtn');
  const nav = document.getElementById('nav');
  if (navBtn && nav) {
    navBtn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      navBtn.classList.toggle('open', open);
      navBtn.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open');
      navBtn.classList.remove('open');
      navBtn.setAttribute('aria-expanded', 'false');
    }));
  }

  /* scroll reveal (visible by default; JS hides then reveals) */
  const targets = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          en.target.style.opacity = '';
          en.target.style.transform = '';
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });

    targets.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      io.observe(el);
    });

    window.setTimeout(() => {
      targets.forEach(el => {
        if (!el.classList.contains('in')) {
          el.classList.add('in');
          el.style.opacity = '';
          el.style.transform = '';
        }
      });
    }, 4000);
  }

  /* stat counters */
  const counters = document.querySelectorAll('[data-count]');
  const runCount = (el) => {
    const target = parseInt(el.getAttribute('data-count'), 10) || 0;
    const dur = 1200, t0 = performance.now();
    const step = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(e * target);
      if (p < 1) requestAnimationFrame(step); else el.textContent = target;
    };
    requestAnimationFrame(step);
  };
  if (counters.length && 'IntersectionObserver' in window) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { runCount(en.target); co.unobserve(en.target); } });
    }, { threshold: 0.5 });
    counters.forEach(el => co.observe(el));
  }

  /* lightbox */
  const grid = document.getElementById('dwgGrid');
  const lb = document.getElementById('lb');
  if (grid && lb) {
    const items = Array.from(grid.querySelectorAll('.dwg'));
    const img = document.getElementById('lbImg');
    const cap = document.getElementById('lbCap');
    const bg = document.getElementById('lbBg');
    const x = document.getElementById('lbX');
    const prev = document.getElementById('lbPrev');
    const next = document.getElementById('lbNext');
    const fig = lb.querySelector('.lb-fig');
    let idx = 0, lastFocus = null;

    const showAt = (i) => {
      idx = (i + items.length) % items.length;
      const el = items[idx];
      const im = el.querySelector('img');
      const fc = el.querySelector('figcaption');
      fig.style.transition = 'none';
      fig.style.opacity = '0';
      fig.style.transform = 'scale(.9) translateY(14px)';
      img.src = im.src;
      img.alt = im.alt;
      cap.textContent = fc ? fc.textContent.trim() : '';
      requestAnimationFrame(() => { fig.style.transition = ''; fig.style.opacity = ''; fig.style.transform = ''; });
    };
    const open = (i, trigger) => {
      lastFocus = trigger || document.activeElement;
      showAt(i);
      lb.classList.add('open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      x.focus();
    };
    const close = () => {
      lb.classList.remove('open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    };

    items.forEach((el, i) => {
      el.addEventListener('click', () => open(i, el));
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i, el); }
      });
    });
    x.addEventListener('click', close);
    bg.addEventListener('click', close);
    prev.addEventListener('click', () => showAt(idx - 1));
    next.addEventListener('click', () => showAt(idx + 1));
    document.addEventListener('keydown', (e) => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') showAt(idx - 1);
      if (e.key === 'ArrowRight') showAt(idx + 1);
    });
  }

  /* contact form -> mailto (GitHub Pages is static, no backend) */
  const form = document.getElementById('enquiryForm');
  const note = document.getElementById('formNote');
  if (form) {
    const rules = {
      name: (v) => v.trim().length >= 2,
      email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
      message: (v) => v.trim().length >= 10
    };
    const mark = (input, ok) => {
      const f = input.closest('.field');
      if (f) f.classList.toggle('invalid', !ok);
    };
    ['name', 'email', 'message'].forEach(n => {
      const input = form.elements[n];
      if (!input) return;
      input.addEventListener('blur', () => mark(input, rules[n](input.value)));
      input.addEventListener('input', () => {
        if (input.closest('.field').classList.contains('invalid')) mark(input, rules[n](input.value));
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = true;
      ['name', 'email', 'message'].forEach(n => {
        const input = form.elements[n];
        const valid = rules[n](input.value);
        mark(input, valid);
        if (!valid) ok = false;
      });
      if (!ok) {
        note.textContent = 'Please correct the highlighted fields.';
        note.className = 'form-note no';
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      const bt = btn.querySelector('.btn-t');
      const original = bt.textContent;

      const name = form.elements.name.value.trim();
      const email = form.elements.email.value.trim();
      const phone = form.elements.phone ? form.elements.phone.value.trim() : '';
      const sel = form.elements.service;
      const service = sel && sel.selectedIndex > 0 ? sel.options[sel.selectedIndex].text : '';
      const message = form.elements.message.value.trim();

      const subject = `Website enquiry from ${name}${service ? ' — ' + service : ''}`;
      const body = [
        `Name: ${name}`,
        `Email: ${email}`,
        phone ? `Phone: ${phone}` : null,
        service ? `Scope: ${service}` : null,
        '',
        'Project Details:',
        message
      ].filter(Boolean).join('\n');

      const mailto = `mailto:info@melinetech.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      btn.disabled = true;
      bt.textContent = 'Opening email…';
      window.location.href = mailto;

      setTimeout(() => {
        note.textContent = 'Your email app should now be open with your message pre-filled — just hit send.';
        note.className = 'form-note ok';
        btn.disabled = false;
        bt.textContent = original;
      }, 600);
    });
  }

});
