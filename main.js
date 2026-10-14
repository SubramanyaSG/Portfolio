/* ============================================================
   PORTFOLIO — main.js
   Interactive animations: cursor, particles, typing, tilt,
   scroll reveal, skill bars, stat counters, navbar, mobile nav
   ============================================================ */

(function () {
  'use strict';

  /* ──────────────────────────────────────────────
     0. THEME TOGGLE
  ────────────────────────────────────────────── */
  const themeToggleBtn = document.getElementById('themeToggle');
  const html = document.documentElement;

  // Apply saved theme on load
  const savedTheme = localStorage.getItem('theme') || 'dark';
  html.setAttribute('data-theme', savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      // Rotate animation feedback
      themeToggleBtn.style.transform = 'rotate(360deg) scale(1.1)';
      setTimeout(() => { themeToggleBtn.style.transform = ''; }, 400);
    });
  }

  /* ──────────────────────────────────────────────
     1. CUSTOM CURSOR
  ────────────────────────────────────────────── */
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  let mx = -100, my = -100;
  let rx = -100, ry = -100;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  // Ring follows with lag
  function animateCursor() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Cursor hover effect on interactive elements
  const hoverEls = document.querySelectorAll('a, button, input, textarea, [data-tilt]');
  hoverEls.forEach((el) => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  /* ──────────────────────────────────────────────
     2. PARTICLE CANVAS
  ────────────────────────────────────────────── */
  const canvas = document.getElementById('particleCanvas');
  const ctx    = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); initParticles(); });

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x    = Math.random() * W;
      this.y    = Math.random() * H;
      this.r    = Math.random() * 1.5 + 0.3;
      this.vx   = (Math.random() - 0.5) * 0.3;
      this.vy   = (Math.random() - 0.5) * 0.3;
      this.life = Math.random() * 0.6 + 0.2;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(125, 211, 252, ${this.life})`;
      ctx.fill();
    }
  }

  function initParticles() {
    const count = Math.floor((W * H) / 10000);
    particles = Array.from({ length: count }, () => new Particle());
  }
  initParticles();

  // Draw connection lines between nearby particles
  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(125, 211, 252, ${0.08 * (1 - dist / 100)})`;
          ctx.lineWidth   = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach((p) => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  /* ──────────────────────────────────────────────
     3. TYPING EFFECT
  ────────────────────────────────────────────── */
  const phrases = [
    'Cybersecurity Enthusiast',
    'Deep Learning Developer',
    'Event Leader',
    'Problem Solver',
    'ISE Graduate',
  ];
  const typedEl = document.getElementById('typedText');
  let pIdx = 0, cIdx = 0, deleting = false;

  function type() {
    if (!typedEl) return;
    const phrase = phrases[pIdx];
    if (!deleting) {
      typedEl.textContent = phrase.substring(0, ++cIdx);
      if (cIdx === phrase.length) {
        deleting = true;
        setTimeout(type, 1800);
        return;
      }
    } else {
      typedEl.textContent = phrase.substring(0, --cIdx);
      if (cIdx === 0) {
        deleting = false;
        pIdx = (pIdx + 1) % phrases.length;
      }
    }
    setTimeout(type, deleting ? 50 : 90);
  }
  if (typedEl) {
    type();
  }

  /* ──────────────────────────────────────────────
     4. SCROLL REVEAL
  ────────────────────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => revealObs.observe(el));

  /* ──────────────────────────────────────────────
     5. ANIMATED SKILL BARS
  ────────────────────────────────────────────── */
  const skillFills = document.querySelectorAll('.skill-fill');
  const skillObs   = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const fill = entry.target;
          fill.style.width = fill.dataset.width + '%';
          skillObs.unobserve(fill);
        }
      });
    },
    { threshold: 0.5 }
  );
  skillFills.forEach((fill) => skillObs.observe(fill));

  /* ──────────────────────────────────────────────
     6. ANIMATED STAT COUNTERS
  ────────────────────────────────────────────── */
  const statVals = document.querySelectorAll('.stat-val');
  const counterObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.target, 10);
          let current = 0;
          const step = Math.ceil(target / 30);
          const tick = setInterval(() => {
            current = Math.min(current + step, target);
            el.textContent = current;
            if (current >= target) clearInterval(tick);
          }, 40);
          counterObs.unobserve(el);
        }
      });
    },
    { threshold: 0.7 }
  );
  statVals.forEach((el) => counterObs.observe(el));

  /* ──────────────────────────────────────────────
     7. 3D TILT EFFECT ON CARDS
  ────────────────────────────────────────────── */
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      const tiltX  = dy * -8;
      const tiltY  = dx *  8;
      card.style.transform = `perspective(700px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* ──────────────────────────────────────────────
     8. STICKY NAVBAR SCROLL SHADOW
  ────────────────────────────────────────────── */
  const topbar = document.getElementById('topbar');
  if (topbar) {
    window.addEventListener('scroll', () => {
      topbar.classList.toggle('scrolled', window.scrollY > 50);
      updateActiveNav();
      toggleBackToTop();
    });
  }

  /* ──────────────────────────────────────────────
     9. ACTIVE NAV LINK ON SCROLL
  ────────────────────────────────────────────── */
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');

  function updateActiveNav() {
    if (!sections.length) return;
    let current = '';
    sections.forEach((sec) => {
      if (window.scrollY >= sec.offsetTop - 140) current = sec.id;
    });
    if (!current) return;
    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href === '#' + current) {
        link.classList.add('active');
      } else if (href && href.startsWith('#')) {
        link.classList.remove('active');
      }
    });
  }
  updateActiveNav();

  /* ──────────────────────────────────────────────
     10. HAMBURGER / MOBILE NAV
  ────────────────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open');
  });

  document.querySelectorAll('.mobile-link').forEach((link) => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
    });
  });

  /* ──────────────────────────────────────────────
     11. BACK TO TOP
  ────────────────────────────────────────────── */
  const backToTop = document.getElementById('backToTop');
  function toggleBackToTop() {
    if (backToTop) backToTop.style.opacity = window.scrollY > 400 ? '1' : '0';
  }
  if (backToTop) {
    backToTop.style.opacity = '0';
    backToTop.style.transition = 'opacity 0.3s';
  }

  /* ──────────────────────────────────────────────
     12. CONTACT FORM (simple UX feedback)
  ────────────────────────────────────────────── */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      btn.textContent = '✅ Message sent!';
      btn.disabled = true;
      btn.style.background = 'linear-gradient(135deg, #34d399, #059669)';
      setTimeout(() => {
        btn.innerHTML = `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Send Message`;
        btn.disabled = false;
        btn.style.background = '';
        form.reset();
      }, 3000);
    });
  }

  /* ──────────────────────────────────────────────
     13. CURSOR TRAIL SPARKS
  ────────────────────────────────────────────── */
  let lastSpark = 0;
  document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastSpark < 60) return;
    lastSpark = now;

    const spark = document.createElement('span');
    spark.style.cssText = `
      position: fixed;
      left: ${e.clientX}px;
      top: ${e.clientY}px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: hsl(${Math.random() * 60 + 180}, 100%, 70%);
      pointer-events: none;
      z-index: 9997;
      transform: translate(-50%, -50%) scale(1);
      animation: spark-out 0.5s forwards ease-out;
    `;
    document.body.appendChild(spark);
    setTimeout(() => spark.remove(), 500);
  });

  // Inject spark animation
  const sparkStyle = document.createElement('style');
  sparkStyle.textContent = `
    @keyframes spark-out {
      0%   { transform: translate(-50%, -50%) scale(1); opacity: 1; }
      100% { transform: translate(
               calc(-50% + ${Math.random() > 0.5 ? '' : '-'}${Math.floor(Math.random()*30+10)}px),
               calc(-50% - ${Math.floor(Math.random()*30+10)}px)
             ) scale(0); opacity: 0; }
    }
  `;
  document.head.appendChild(sparkStyle);

  /* ──────────────────────────────────────────────
     14. SMOOTH PARALLAX ON HERO VISUAL
  ────────────────────────────────────────────── */
  const heroVisual = document.querySelector('.hero-visual');
  if (heroVisual) {
    document.addEventListener('mousemove', (e) => {
      const xMove = (e.clientX / window.innerWidth  - 0.5) * 18;
      const yMove = (e.clientY / window.innerHeight - 0.5) * 12;
      heroVisual.style.transform = `translate(${xMove}px, ${yMove}px)`;
    });
  }

})();
