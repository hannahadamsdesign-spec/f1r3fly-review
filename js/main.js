/* ============================================
   F1R3FLY.IO — Main JavaScript
   Uses Intersection Observer (not scroll events)
   for scroll-reveal animations
   ============================================ */

(function () {
  'use strict';

  // --- Mobile Menu ---
  const hamburger = document.querySelector('.hamburger');
  const overlay = document.getElementById('mobileMenuOverlay');

  function toggleMobileMenu() {
    const isOpen = overlay.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  function closeMobileMenu() {
    overlay.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger?.addEventListener('click', toggleMobileMenu);
  overlay?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // --- Anchor Link Click Handler ---
  // Manually calculate scroll position for all anchor clicks.
  // Reasons: scrollIntoView() doesn't reliably respect scroll-margin-top,
  // and the mobile menu's body overflow reset causes reflow issues.
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const targetId = link.getAttribute('href');
    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();

    const isMenuOpen = overlay?.classList.contains('active');
    if (isMenuOpen) {
      closeMobileMenu();
    }

    // Use rAF to let any layout changes (menu close) settle first
    requestAnimationFrame(() => {
      const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'));
      const targetPos = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top: targetPos, behavior: 'smooth' });
    });
  });

  // --- Active Nav State ---
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  function updateActiveNav() {
    const scrollPos = window.scrollY + 150;
    if (scrollPos < 600) {
      navLinks.forEach(l => l.classList.remove('active'));
      return;
    }
    let current = null;
    sections.forEach(sec => {
      if (scrollPos >= sec.offsetTop && scrollPos < sec.offsetTop + sec.offsetHeight) {
        current = sec.getAttribute('id');
      }
    });
    navLinks.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === '#' + current);
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  // --- FAQ Accordion ---
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      const section = item.closest('.section');
      const wasOpen = item.classList.contains('open');
      // Close siblings in same section
      section.querySelectorAll('.faq-accordion-item.open').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  // --- Scroll Reveal (Intersection Observer) ---
  const revealTargets = document.querySelectorAll(
    '.animate-in, .fly-in-header, .fade-in'
  );

  if (revealTargets.length && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target); // animate once
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
    );
    revealTargets.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback: show everything
    revealTargets.forEach(el => el.classList.add('visible'));
  }

  // --- Hero Parallax ---
  const heroBg = document.getElementById('heroBg');
  const heroPines = document.getElementById('heroPines');
  const heroBranches = document.getElementById('heroBranches');
  const heroSection = document.querySelector('.hero');
  const fireflyCanvas = document.getElementById('fireflyCanvas');

  if (heroSection && heroBg) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.pageYOffset;
          const heroH = heroSection.offsetHeight;
          if (scrollY < heroH) {
            heroBg.style.transform = `translateY(${scrollY * 0.2}px)`;
            heroPines.style.transform = `translateY(${scrollY * 0.4}px)`;
            heroBranches.style.transform = `translateY(${scrollY * 0.6}px)`;
            if (fireflyCanvas) fireflyCanvas.style.transform = `translateY(${scrollY * 0.5}px)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // --- Fireflies Canvas ---
  if (fireflyCanvas && heroSection) {
    const ctx = fireflyCanvas.getContext('2d');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function setupCanvas() {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = heroSection.offsetHeight;
      fireflyCanvas.width = w * dpr;
      fireflyCanvas.height = h * dpr;
      ctx.scale(dpr, dpr);
      fireflyCanvas.style.width = w + 'px';
      fireflyCanvas.style.height = h + 'px';
    }
    setupCanvas();
    window.addEventListener('resize', setupCanvas);

    class Firefly {
      constructor(initial) { this.reset(initial); }

      reset(initial) {
        const w = window.innerWidth;
        const h = heroSection.offsetHeight;
        if (initial) {
          this.x = Math.random() * w;
          this.y = Math.random() * h;
          this.speedX = (Math.random() > 0.5 ? 1 : -1) * (0.3 + Math.random() * 0.4);
        } else {
          const left = Math.random() > 0.5;
          this.x = left ? -20 : w + 20;
          this.y = Math.random() * h;
          this.speedX = left ? (0.3 + Math.random() * 0.4) : -(0.3 + Math.random() * 0.4);
        }
        this.speedY = (Math.random() - 0.5) * 0.2;
        this.size = 1.2 + Math.random() * 2.8;
        this.baseAlpha = 0.4 + Math.random() * 0.6;
        this.alpha = 0;
        this.pulseSpeed = 0.008 + Math.random() * 0.015;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.wobbleX = Math.random() * Math.PI * 2;
        this.wobbleY = Math.random() * Math.PI * 2;
        this.wobbleSpeedX = 0.015 + Math.random() * 0.02;
        this.wobbleSpeedY = 0.01 + Math.random() * 0.015;
        this.wobbleAmp = 0.8 + Math.random() * 1.2;
        const roll = Math.random();
        if (roll < 0.25) {
          // warm yellow
          this.hue = 45 + Math.random() * 15;
          this.sat = 90 + Math.random() * 10;
          this.lit = 60 + Math.random() * 15;
        } else if (roll < 0.4) {
          // amber-red
          this.hue = 15 + Math.random() * 20;
          this.sat = 85 + Math.random() * 15;
          this.lit = 50 + Math.random() * 15;
        } else if (roll < 0.55) {
          // soft white
          this.hue = 60;
          this.sat = 10;
          this.lit = 90;
        } else {
          // classic gold
          this.hue = 40 + Math.random() * 20;
          this.sat = 80 + Math.random() * 20;
          this.lit = 55 + Math.random() * 20;
        }
      }

      update() {
        const w = window.innerWidth;
        const h = heroSection.offsetHeight;
        const cx = w / 2, cy = h / 2;
        this.wobbleX += this.wobbleSpeedX;
        this.wobbleY += this.wobbleSpeedY;
        this.x += this.speedX + Math.sin(this.wobbleX) * this.wobbleAmp;
        this.y += this.speedY + Math.sin(this.wobbleY) * (this.wobbleAmp * 0.7);

        // Fade near center (where text is)
        const dx = Math.abs(this.x - cx), dy = Math.abs(this.y - cy);
        let fade = 1;
        if (dx < 150 && dy < 120) fade = 0;
        else if (dx < 280 && dy < 220) {
          fade = Math.max(0, Math.min((dx - 150) / 130, (dy - 120) / 100));
        }

        this.pulsePhase += this.pulseSpeed;
        this.alpha = this.baseAlpha * (0.6 + 0.4 * Math.sin(this.pulsePhase)) * fade;
        if (this.x < -50 || this.x > w + 50 || this.y < -50 || this.y > h + 50) this.reset();
      }

      draw() {
        if (this.alpha <= 0.05) return;
        // Glow
        const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 6);
        g.addColorStop(0, `hsla(${this.hue},${this.sat}%,${this.lit}%,${this.alpha * 0.4})`);
        g.addColorStop(0.3, `hsla(${this.hue},${this.sat}%,${this.lit}%,${this.alpha * 0.15})`);
        g.addColorStop(1, `hsla(${this.hue},${this.sat}%,${this.lit}%,0)`);
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size * 6, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
        // Core
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue},50%,85%,${this.alpha})`; ctx.fill();
        // Center
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(60,20%,98%,${this.alpha})`; ctx.fill();
      }
    }

    if (!prefersReducedMotion) {
      const flies = Array.from({ length: 20 }, () => new Firefly(true));
      (function loop() {
        const w = window.innerWidth, h = heroSection.offsetHeight;
        ctx.clearRect(0, 0, w, h);
        flies.forEach(f => { f.update(); f.draw(); });
        requestAnimationFrame(loop);
      })();
    }
  }

})(); // end IIFE
