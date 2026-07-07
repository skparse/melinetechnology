/* =========================================================
   MPTECH ENGINEERING SERVICES — SCRIPT
   Vanilla JS: nav, scroll effects, animations, form validation
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* Footer year set below; no global "js-ready" class needed —
     reveal hiding is applied inline per-element (see below), so
     content is never hidden purely by CSS/class state. */

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Back to top button (declared early: onScroll below needs it) ---------- */
  const backToTop = document.getElementById('backToTop');

  function toggleBackToTop() {
    if (!backToTop) return;
    backToTop.classList.toggle('show', window.scrollY > 500);
  }

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Sticky header on scroll ---------- */
  const header = document.getElementById('header');
  const onScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    toggleBackToTop();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- Active link highlighting on scroll ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-link');

  const setActiveLink = () => {
    let currentId = sections[0]?.id;
    const scrollPos = window.scrollY + window.innerHeight * 0.3;

    sections.forEach(sec => {
      if (scrollPos >= sec.offsetTop) currentId = sec.id;
    });

    navAnchors.forEach(a => {
      a.classList.toggle('active-link', a.getAttribute('href') === `#${currentId}`);
    });
  };
  window.addEventListener('scroll', setActiveLink, { passive: true });
  setActiveLink();

  /* ---------- Scroll reveal animation (IntersectionObserver) ---------- */
  const revealTargets = document.querySelectorAll('[data-aos]');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          entry.target.style.opacity = '';
          entry.target.style.transform = '';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealTargets.forEach(el => {
      /* Hide via inline style set right here, in the same pass that
         arms the observer — never hidden without something in place
         to reveal it again. */
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      observer.observe(el);
    });

    /* Safety net: if any element is somehow never intersected
       (e.g. a future layout change), force-reveal everything after
       a short delay so content is never stuck invisible. */
    window.setTimeout(() => {
      revealTargets.forEach(el => {
        if (!el.classList.contains('in-view')) {
          el.classList.add('in-view');
          el.style.opacity = '';
          el.style.transform = '';
        }
      });
    }, 4000);
  }
  /* If IntersectionObserver isn't supported, elements simply stay at
     their default visible styling — nothing to reveal. */

  /* ---------- Animated stat counters ---------- */
  const statNums = document.querySelectorAll('.stat-num');
  let countersStarted = false;

  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute('data-count'), 10) || 0;
    const duration = 1400;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); /* ease-out cubic */
      el.textContent = Math.floor(eased * target);
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target;
      }
    };
    requestAnimationFrame(tick);
  };

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats && 'IntersectionObserver' in window) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !countersStarted) {
          countersStarted = true;
          statNums.forEach(animateCounter);
          statsObserver.disconnect();
        }
      });
    }, { threshold: 0.4 });
    statsObserver.observe(heroStats);
  } else {
    statNums.forEach(animateCounter);
  }

  /* ---------- Testimonial dots / scroll sync ---------- */
  const track = document.querySelector('.testimonial-track');
  const dotsWrap = document.getElementById('testimonialDots');

  if (track && dotsWrap) {
    const cards = track.querySelectorAll('.testimonial-card');
    cards.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('role', 'button');
      dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
      dot.addEventListener('click', () => {
        cards[i].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
      });
      dotsWrap.appendChild(dot);
    });

    const dots = dotsWrap.querySelectorAll('.dot');

    const syncDots = () => {
      const trackCenter = track.scrollLeft + track.clientWidth / 2;
      let closestIdx = 0;
      let closestDist = Infinity;

      cards.forEach((card, i) => {
        const cardCenter = card.offsetLeft + card.clientWidth / 2;
        const dist = Math.abs(cardCenter - trackCenter);
        if (dist < closestDist) {
          closestDist = dist;
          closestIdx = i;
        }
      });

      dots.forEach((d, i) => d.classList.toggle('active', i === closestIdx));
    };

    track.addEventListener('scroll', () => {
      window.requestAnimationFrame(syncDots);
    }, { passive: true });
  }

  /* ---------- Contact form validation (client-side only) ---------- */
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  if (form) {
    const validators = {
      name: (v) => v.trim().length >= 2,
      email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
      message: (v) => v.trim().length >= 10
    };

    const setFieldState = (input, valid) => {
      const group = input.closest('.form-group');
      if (!group) return;
      group.classList.toggle('invalid', !valid);
    };

    ['name', 'email', 'message'].forEach(fieldName => {
      const input = form.elements[fieldName];
      if (!input) return;
      input.addEventListener('blur', () => {
        setFieldState(input, validators[fieldName](input.value));
      });
      input.addEventListener('input', () => {
        if (input.closest('.form-group').classList.contains('invalid')) {
          setFieldState(input, validators[fieldName](input.value));
        }
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      let isValid = true;
      ['name', 'email', 'message'].forEach(fieldName => {
        const input = form.elements[fieldName];
        const valid = validators[fieldName](input.value);
        setFieldState(input, valid);
        if (!valid) isValid = false;
      });

      if (!isValid) {
        status.textContent = 'Please correct the highlighted fields.';
        status.className = 'form-status error';
        return;
      }

      /* GitHub Pages serves static files only — there is no server here to
         receive this form. Instead, hand off to the visitor's own email
         app with everything pre-filled, addressed to us. */
      const submitBtn = form.querySelector('button[type="submit"]');
      const btnText = submitBtn.querySelector('.btn-text');
      const originalText = btnText.textContent;

      const name = form.elements.name.value.trim();
      const email = form.elements.email.value.trim();
      const phone = form.elements.phone ? form.elements.phone.value.trim() : '';
      const serviceEl = form.elements.service;
      const service = serviceEl && serviceEl.selectedIndex > 0 ? serviceEl.options[serviceEl.selectedIndex].text : '';
      const message = form.elements.message.value.trim();

      const destination = 'info@melinetech.com';
      const subject = `Website enquiry from ${name}${service ? ' — ' + service : ''}`;
      const bodyLines = [
        `Name: ${name}`,
        `Email: ${email}`,
        phone ? `Phone: ${phone}` : null,
        service ? `Service Required: ${service}` : null,
        '',
        'Project Details:',
        message
      ].filter(Boolean);

      const mailtoUrl = `mailto:${destination}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;

      submitBtn.disabled = true;
      btnText.textContent = 'Opening email...';

      window.location.href = mailtoUrl;

      setTimeout(() => {
        status.textContent = 'Your email app should now be open with your message pre-filled — just hit send.';
        status.className = 'form-status success';
        submitBtn.disabled = false;
        btnText.textContent = originalText;
      }, 600);
    });
  }

  /* ---------- Image Lightbox (click a diagram to open it animated) ---------- */
  const galleryGrid = document.getElementById('galleryGrid');
  const lightbox = document.getElementById('lightbox');

  if (galleryGrid && lightbox) {
    const items = Array.from(galleryGrid.querySelectorAll('.gallery-item'));
    const lbImg = document.getElementById('lightboxImg');
    const lbCaption = document.getElementById('lightboxCaption');
    const lbBackdrop = document.getElementById('lightboxBackdrop');
    const lbClose = document.getElementById('lightboxClose');
    const lbPrev = document.getElementById('lightboxPrev');
    const lbNext = document.getElementById('lightboxNext');

    let currentIndex = 0;
    let lastFocusedEl = null;

    const showAt = (index) => {
      currentIndex = (index + items.length) % items.length;
      const item = items[currentIndex];
      const img = item.querySelector('img');
      const caption = item.querySelector('figcaption');

      /* Restart the reveal animation each time a new image is shown */
      const figure = lightbox.querySelector('.lightbox-figure');
      figure.style.transition = 'none';
      figure.style.opacity = '0';
      figure.style.transform = 'scale(0.85) translateY(18px)';

      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lbCaption.textContent = caption ? caption.textContent : '';

      requestAnimationFrame(() => {
        figure.style.transition = '';
        figure.style.opacity = '';
        figure.style.transform = '';
      });
    };

    const openLightbox = (index, triggerEl) => {
      lastFocusedEl = triggerEl || document.activeElement;
      showAt(index);
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      lbClose.focus();
    };

    const closeLightbox = () => {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocusedEl) lastFocusedEl.focus();
    };

    items.forEach((item, index) => {
      item.addEventListener('click', () => openLightbox(index, item));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(index, item);
        }
      });
    });

    lbClose.addEventListener('click', closeLightbox);
    lbBackdrop.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', () => showAt(currentIndex - 1));
    lbNext.addEventListener('click', () => showAt(currentIndex + 1));

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showAt(currentIndex - 1);
      if (e.key === 'ArrowRight') showAt(currentIndex + 1);
    });
  }

});
