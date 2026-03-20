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
          this.speedX = (Math.random() > 0.5 ? 1 : -1) * (0.15 + Math.random() * 0.2);
        } else {
          const left = Math.random() > 0.5;
          this.x = left ? -20 : w + 20;
          this.y = Math.random() * h;
          this.speedX = left ? (0.15 + Math.random() * 0.2) : -(0.15 + Math.random() * 0.2);
        }
        this.speedY = (Math.random() - 0.5) * 0.1;
        this.coreRadius = 1.5 + Math.random() * 2;
        this.baseAlpha = 0.4 + Math.random() * 0.6;
        this.alpha = 0;
        this.pulseSpeed = 0.009 + Math.random() * 0.0125;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.brightness = 0.7 + Math.random() * 0.3;
        this.wobbleX = Math.random() * Math.PI * 2;
        this.wobbleY = Math.random() * Math.PI * 2;
        this.wobbleSpeedX = 0.0075 + Math.random() * 0.01;
        this.wobbleSpeedY = 0.005 + Math.random() * 0.0075;
        this.wobbleAmp = 0.4 + Math.random() * 0.6;

        // Vibrant orange-red palette (RGB)
        const pick = Math.random();
        if (pick < 0.25) {
          this.r = 255; this.g = 165 + Math.random() * 25; this.b = 20 + Math.random() * 15;
        } else if (pick < 0.6) {
          this.r = 255; this.g = 110 + Math.random() * 30; this.b = 5 + Math.random() * 12;
        } else {
          this.r = 255; this.g = 60 + Math.random() * 40; this.b = 0 + Math.random() * 8;
        }

        // Spark filaments
        this.numSpikes = 6 + Math.floor(Math.random() * 8);
        this.spikes = [];
        for (let i = 0; i < this.numSpikes; i++) {
          this.spikes.push({
            angle: (i / this.numSpikes) * Math.PI * 2 + (Math.random() - 0.5) * 0.6,
            baseLength: 8 + Math.random() * 20,
            wobblePhase: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.02 + Math.random() * 0.025,
            flickerPhase: Math.random() * Math.PI * 2,
            flickerSpeed: 0.04 + Math.random() * 0.06,
            thickness: 0.5 + Math.random() * 1,
            curvature: (Math.random() - 0.5) * 0.3,
          });
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
        const pulse = 0.4 + 0.6 * Math.sin(this.pulsePhase);
        this.alpha = this.brightness * pulse * fade;

        // Update spike animations
        for (const s of this.spikes) {
          s.wobblePhase += s.wobbleSpeed;
          s.flickerPhase += s.flickerSpeed;
        }

        if (this.x < -50 || this.x > w + 50 || this.y < -50 || this.y > h + 50) this.reset();
      }

      draw() {
        const a = this.alpha;
        if (a < 0.01) return;
        const { r, g, b } = this;
        const cr = this.coreRadius;
        const pulse = 0.4 + 0.6 * Math.sin(this.pulsePhase);

        // 1. Warm glow haze
        const glowR = cr * 10;
        const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowR);
        glow.addColorStop(0, `rgba(${r},${g},${b},${a * 0.3})`);
        glow.addColorStop(0.2, `rgba(${r},${g},${b},${a * 0.12})`);
        glow.addColorStop(0.5, `rgba(${r},${Math.max(g-30,0)},${b},${a * 0.04})`);
        glow.addColorStop(1, `rgba(${r},${Math.max(g-50,0)},0,0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(this.x, this.y, glowR, 0, Math.PI * 2);
        ctx.fill();

        // 2. Spark filaments
        for (const s of this.spikes) {
          const wobble = Math.sin(s.wobblePhase) * 0.3;
          const flicker = Math.max(0, Math.sin(s.flickerPhase));
          const lenMult = 0.3 + 0.7 * flicker;
          const spikeLen = s.baseLength * pulse * lenMult;
          if (spikeLen < 2) continue;

          const angle = s.angle + wobble;
          const midFrac = 0.5;
          const curveOff = Math.sin(s.wobblePhase * 1.3) * s.curvature * spikeLen;
          const mx = this.x + Math.cos(angle) * spikeLen * midFrac + Math.cos(angle + Math.PI/2) * curveOff;
          const my = this.y + Math.sin(angle) * spikeLen * midFrac + Math.sin(angle + Math.PI/2) * curveOff;
          const ex = this.x + Math.cos(angle) * spikeLen;
          const ey = this.y + Math.sin(angle) * spikeLen;

          const grad = ctx.createLinearGradient(this.x, this.y, ex, ey);
          grad.addColorStop(0, `rgba(255,${Math.min(g+50,255)},${Math.min(b+60,200)},${a * 0.85 * flicker})`);
          grad.addColorStop(0.4, `rgba(${r},${g},${b},${a * 0.5 * flicker})`);
          grad.addColorStop(1, `rgba(${r},${Math.max(g-40,0)},0,0)`);

          ctx.strokeStyle = grad;
          ctx.lineWidth = s.thickness * (0.6 + 0.4 * pulse);
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(this.x, this.y);
          ctx.quadraticCurveTo(mx, my, ex, ey);
          ctx.stroke();
        }

        // 3. Bright core
        const coreGrad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, cr * 3);
        coreGrad.addColorStop(0, `rgba(255,255,235,${a * 0.95})`);
        coreGrad.addColorStop(0.25, `rgba(255,${Math.min(g+40,255)},${Math.min(b+50,200)},${a * 0.75})`);
        coreGrad.addColorStop(0.6, `rgba(${r},${g},${b},${a * 0.3})`);
        coreGrad.addColorStop(1, `rgba(${r},${Math.max(g-30,0)},0,0)`);
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, cr * 3, 0, Math.PI * 2);
        ctx.fill();

        // 4. White-hot pinpoint
        ctx.fillStyle = `rgba(255,255,240,${a * 0.9})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, cr * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (!prefersReducedMotion) {
      const flies = Array.from({ length: 30 }, () => new Firefly(true));
      (function loop() {
        const w = window.innerWidth, h = heroSection.offsetHeight;
        ctx.clearRect(0, 0, w, h);
        flies.forEach(f => { f.update(); f.draw(); });
        requestAnimationFrame(loop);
      })();
    }
  }

  // --- Page Transitions (blog cards → articles, articles → blog) ---
  var transEl = document.createElement('div');
  transEl.className = 'page-transition';
  document.body.appendChild(transEl);

  function navigateWithTransition(href, direction) {
    transEl.className = 'page-transition ' + direction;
    setTimeout(function() { window.location.href = href; }, 180);
  }

  // Blog link cards: slide right (going deeper into an article)
  document.querySelectorAll('a.blog-link-card').forEach(function(card) {
    card.addEventListener('click', function(e) {
      e.preventDefault();
      navigateWithTransition(this.href, 'slide-right');
    });
  });

  // Article breadcrumb back link: slide left (going back to blog)
  document.querySelectorAll('.article-breadcrumb a').forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      // Navigate without hash — use ?scrollto=blog so we can jump instantly
      var base = this.href.split('#')[0];
      navigateWithTransition(base + '?scrollto=blog', 'slide-left');
    });
  });

  // On page load: if ?scrollto= param exists, jump to that section instantly
  // (no smooth scroll animation — we already have the slide transition)
  var params = new URLSearchParams(window.location.search);
  var scrollTarget = params.get('scrollto');
  if (scrollTarget) {
    var target = document.getElementById(scrollTarget);
    if (target) {
      // Force instant jump — override CSS smooth scroll
      document.documentElement.style.scrollBehavior = 'auto';
      target.scrollIntoView();
      // Clean up the URL and restore smooth scroll
      setTimeout(function() {
        history.replaceState(null, '', window.location.pathname + '#' + scrollTarget);
        document.documentElement.style.scrollBehavior = '';
      }, 50);
    }
  }

})(); // end IIFE
