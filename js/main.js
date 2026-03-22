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

  // --- SPA Router ---
  // Intercepts internal navigation between index.html and article pages.
  // Each page is a standalone .html file (for SEO), but navigation between
  // them swaps <main> content with a crossfade instead of a full reload.
  // Uses History API for real URLs — Daria's SEO requirement preserved.

  var mainEl = document.querySelector('main#app');
  var isTransitioning = false;
  var articleCSSLink = document.querySelector('link[href*="article.css"]');

  // Cache for prefetched pages
  var pageCache = {};

  // Determine if a URL is an internal SPA-routable link
  function isRoutable(url) {
    try {
      var a = new URL(url, window.location.origin);
      // Same origin only
      if (a.origin !== window.location.origin) return false;
      // Must be an article page or index
      var path = a.pathname;
      if (path.includes('/articles/') && path.endsWith('.html')) return true;
      if (path.endsWith('/index.html') || path.endsWith('/')) return true;
      // Also match relative paths by checking href attribute
      return false;
    } catch(e) { return false; }
  }

  // Resolve a relative href to an absolute URL
  function resolveHref(href) {
    var a = document.createElement('a');
    a.href = href;
    return a.href;
  }

  // Fetch a page and extract <main id="app"> content, <title>, and meta
  function fetchPage(url) {
    if (pageCache[url]) return Promise.resolve(pageCache[url]);
    return fetch(url).then(function(res) {
      if (!res.ok) throw new Error('Fetch failed: ' + res.status);
      return res.text();
    }).then(function(html) {
      var parser = new DOMParser();
      var doc = parser.parseFromString(html, 'text/html');
      var newMain = doc.querySelector('main#app');
      var newTitle = doc.querySelector('title');
      var newDesc = doc.querySelector('meta[name="description"]');
      var hasArticleCSS = !!doc.querySelector('link[href*="article.css"]');
      var result = {
        mainHTML: newMain ? newMain.innerHTML : null,
        title: newTitle ? newTitle.textContent : document.title,
        description: newDesc ? newDesc.getAttribute('content') : '',
        needsArticleCSS: hasArticleCSS
      };
      pageCache[url] = result;
      return result;
    });
  }

  // Ensure article.css is loaded or unloaded
  // Always use path relative to index.html since the browser URL
  // may not match the fetched page's directory depth during SPA nav
  function manageArticleCSS(needed) {
    var existing = document.querySelector('link[data-spa-article-css]');
    if (needed && !existing) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      // Use absolute-ish path from site root to avoid relative path confusion
      // Determine base from the initial page's stylesheet link
      var baseCSS = document.querySelector('link[href*="styles.css"]');
      var basePath = baseCSS ? baseCSS.href.replace(/styles\.css$/, 'article.css') : 'css/article.css';
      link.href = basePath;
      link.setAttribute('data-spa-article-css', 'true');
      document.head.appendChild(link);
    } else if (!needed && existing) {
      existing.remove();
    }
  }

  // Re-observe scroll-reveal elements in new content
  function reobserveAnimations() {
    if (!('IntersectionObserver' in window)) return;
    var targets = mainEl.querySelectorAll('.animate-in, .fly-in-header, .fade-in');
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });
    targets.forEach(function(el) { observer.observe(el); });
  }

  // Re-bind FAQ accordion in new content
  function rebindFAQ() {
    mainEl.querySelectorAll('.faq-question').forEach(function(q) {
      q.addEventListener('click', function() {
        var item = q.parentElement;
        var sec = item.closest('.section');
        var wasOpen = item.classList.contains('open');
        sec.querySelectorAll('.faq-accordion-item.open').forEach(function(i) { i.classList.remove('open'); });
        if (!wasOpen) item.classList.add('open');
      });
    });
  }

  // Re-run blog card generation script if we navigated back to index
  function rebindBlogCards() {
    var grid = mainEl.querySelector('#blogGrid');
    if (!grid || grid.children.length > 0) return;
    // The blog card data is in a <script> tag inside main — it will auto-execute
    // after innerHTML swap. But since innerHTML scripts don't execute, we need
    // to find and run them manually.
    var scripts = mainEl.querySelectorAll('script');
    scripts.forEach(function(oldScript) {
      var newScript = document.createElement('script');
      if (oldScript.src) {
        newScript.src = oldScript.src;
      } else {
        newScript.textContent = oldScript.textContent;
      }
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  }

  // The actual navigation transition
  function navigateSPA(href, scrollToId, pushState) {
    if (isTransitioning || !mainEl) return;
    isTransitioning = true;

    var targetURL = resolveHref(href);

    fetchPage(targetURL).then(function(page) {
      if (!page.mainHTML) {
        // Fallback: full page load
        window.location.href = targetURL;
        return;
      }

      // Phase 1: fade out current content
      mainEl.classList.add('spa-fade-out');

      setTimeout(function() {
        // Phase 2: swap content
        mainEl.innerHTML = page.mainHTML;
        document.title = page.title;

        // Update meta description
        var metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && page.description) {
          metaDesc.setAttribute('content', page.description);
        }

        // Manage article.css
        manageArticleCSS(page.needsArticleCSS);

        // Push history state
        if (pushState !== false) {
          history.pushState({ spaURL: targetURL }, page.title, targetURL);
        }

        // Scroll: either to a specific section or to top
        document.documentElement.style.scrollBehavior = 'auto';
        if (scrollToId) {
          var target = document.getElementById(scrollToId);
          if (target) {
            var navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 80;
            var pos = target.getBoundingClientRect().top + window.scrollY - navH;
            window.scrollTo(0, pos);
          }
        } else {
          window.scrollTo(0, 0);
        }
        document.documentElement.style.scrollBehavior = '';

        // Phase 3: re-bind interactive elements
        rebindBlogCards();
        rebindFAQ();
        reobserveAnimations();
        updateActiveNav();
        bindSPALinks();

        // Phase 4: fade in new content
        mainEl.classList.remove('spa-fade-out');
        mainEl.classList.add('spa-fade-in');

        setTimeout(function() {
          mainEl.classList.remove('spa-fade-in');
          isTransitioning = false;
        }, 300);

      }, 200); // matches fade-out duration

    }).catch(function(err) {
      console.error('SPA navigation failed, falling back:', err);
      isTransitioning = false;
      window.location.href = targetURL;
    });
  }

  // Bind click handlers on all routable links inside <main>
  function bindSPALinks() {
    if (!mainEl) return;

    // Blog link cards → article pages
    mainEl.querySelectorAll('a.blog-link-card').forEach(function(card) {
      // Remove old listeners by cloning
      var newCard = card.cloneNode(true);
      card.parentNode.replaceChild(newCard, card);
      newCard.addEventListener('click', function(e) {
        e.preventDefault();
        navigateSPA(this.getAttribute('href'), null, true);
      });
    });

    // Article breadcrumb back links → index#blog
    // Use a smooth fade-out then full page load (not SPA swap) because
    // the homepage has canvas/parallax/fireflies that need fresh init.
    mainEl.querySelectorAll('.article-breadcrumb a').forEach(function(link) {
      var newLink = link.cloneNode(true);
      link.parentNode.replaceChild(newLink, link);
      newLink.addEventListener('click', function(e) {
        e.preventDefault();
        var href = this.getAttribute('href');
        // Fade out, then navigate with scrollto param for instant jump
        mainEl.classList.add('spa-fade-out');
        setTimeout(function() {
          var base = href.split('#')[0];
          var hash = href.split('#')[1] || '';
          window.location.href = base + (hash ? '?scrollto=' + hash : '');
        }, 200);
      });
    });
  }

  // Prefetch: on hover over blog cards, start fetching the target page
  document.addEventListener('mouseover', function(e) {
    var card = e.target.closest('a.blog-link-card');
    if (!card) return;
    var url = resolveHref(card.getAttribute('href'));
    if (!pageCache[url]) {
      fetchPage(url).catch(function() {}); // silent prefetch
    }
  });

  // Handle browser back/forward
  window.addEventListener('popstate', function(e) {
    if (e.state && e.state.spaURL) {
      var url = e.state.spaURL;
      var hash = new URL(url).hash.replace('#', '');
      navigateSPA(url, hash || null, false);
    } else {
      // Fallback: reload
      window.location.reload();
    }
  });

  // On page load: if ?scrollto= param exists, jump to that section instantly
  // (used when navigating back from article pages)
  var params = new URLSearchParams(window.location.search);
  var scrollTarget = params.get('scrollto');
  if (scrollTarget) {
    var scrollEl = document.getElementById(scrollTarget);
    if (scrollEl) {
      document.documentElement.style.scrollBehavior = 'auto';
      var navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 80;
      var pos = scrollEl.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo(0, pos);
      setTimeout(function() {
        history.replaceState(null, '', window.location.pathname + '#' + scrollTarget);
        document.documentElement.style.scrollBehavior = '';
      }, 50);
    }
  }

  // Set initial history state
  history.replaceState({ spaURL: window.location.href }, document.title, window.location.href);

  // Initial binding
  bindSPALinks();

  // Mark article.css as SPA-managed if it exists on this page
  if (articleCSSLink) {
    articleCSSLink.setAttribute('data-spa-article-css', 'true');
  }

})(); // end IIFE
