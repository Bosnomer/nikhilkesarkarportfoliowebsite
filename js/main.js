/* ============================================================
   Nikhil Kesarkar — Portfolio interactions
   ============================================================ */
(function () {
  'use strict';

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme toggle (persisted) ---------- */
  const themeToggle = document.getElementById('themeToggle');
  const saved = localStorage.getItem('nk-theme');
  if (saved) {
    root.setAttribute('data-theme', saved);
  } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    root.setAttribute('data-theme', 'light');
  }
  themeToggle.addEventListener('click', function () {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('nk-theme', next);
  });

  /* ---------- Year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- Mobile nav ---------- */
  const burger = document.getElementById('navBurger');
  const navLinks = document.getElementById('navLinks');
  function closeMenu() { burger.classList.remove('is-open'); navLinks.classList.remove('is-open'); }
  burger.addEventListener('click', function () {
    burger.classList.toggle('is-open');
    navLinks.classList.toggle('is-open');
  });
  navLinks.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });

  /* ---------- Scroll: nav state + progress bar ---------- */
  const nav = document.getElementById('nav');
  const progress = document.getElementById('scrollProgress');
  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 30);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Active section highlight ---------- */
  const sections = document.querySelectorAll('main section[id]');
  const linkMap = {};
  document.querySelectorAll('.nav__link').forEach(function (l) {
    linkMap[l.getAttribute('href').slice(1)] = l;
  });
  const spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        Object.values(linkMap).forEach(function (l) { l.classList.remove('is-active'); });
        const link = linkMap[e.target.id];
        if (link) link.classList.add('is-active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(function (s) { spy.observe(s); });

  /* ---------- Reveal on scroll ---------- */
  const revealer = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); revealer.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function (el) { revealer.observe(el); });

  /* ---------- Animated counters ---------- */
  function formatVal(val, format, suffix) {
    let out;
    if (format === 'k' && val >= 1000) {
      out = (val / 1000).toFixed(val % 1000 === 0 ? 0 : 1) + 'k';
    } else {
      out = Math.round(val).toString();
    }
    return out + (suffix || '');
  }
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const format = el.dataset.format;
    if (reduceMotion) { el.textContent = formatVal(target, format, suffix); return; }
    const dur = 1500;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatVal(target * eased, format, suffix);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = formatVal(target, format, suffix);
    }
    requestAnimationFrame(tick);
  }
  const countObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { animateCount(e.target); countObs.unobserve(e.target); }
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('.stat__num').forEach(function (el) { countObs.observe(el); });

  /* ---------- Typing effect ---------- */
  const typedEl = document.getElementById('typed');
  const phrases = [
    ' Lakehouse platforms',
    ' Azure data pipelines',
    ' Databricks & Spark jobs',
    ' Microsoft Fabric solutions',
    ' that scale to 20,000 users'
  ];
  if (reduceMotion) {
    typedEl.textContent = phrases[0];
  } else {
    let pi = 0, ci = 0, deleting = false;
    function type() {
      const cur = phrases[pi];
      typedEl.textContent = cur.slice(0, ci);
      if (!deleting && ci < cur.length) { ci++; setTimeout(type, 55); }
      else if (!deleting && ci === cur.length) { deleting = true; setTimeout(type, 1600); }
      else if (deleting && ci > 0) { ci--; setTimeout(type, 28); }
      else { deleting = false; pi = (pi + 1) % phrases.length; setTimeout(type, 280); }
    }
    type();
  }

  /* ---------- Particle / node background ---------- */
  const canvas = document.getElementById('bgCanvas');
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    let w, h, dpr, particles = [];
    const mouse = { x: -9999, y: -9999 };

    function accent() {
      // pull current accent for theme-aware dots
      return getComputedStyle(root).getPropertyValue('--accent').trim() || '#22d3ee';
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width = window.innerWidth * dpr;
      h = canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      const count = Math.min(70, Math.floor(window.innerWidth / 22));
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.25 * dpr,
          vy: (Math.random() - 0.5) * 0.25 * dpr,
          r: (Math.random() * 1.6 + 0.6) * dpr
        });
      }
    }

    function hexToRgb(hex) {
      const m = hex.replace('#', '');
      const n = m.length === 3 ? m.split('').map(c => c + c).join('') : m;
      const int = parseInt(n, 16);
      return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      const [r, g, b] = hexToRgb(accent());
      const linkDist = 130 * dpr;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // mouse repel
        const mdx = p.x - mouse.x, mdy = p.y - mouse.y;
        const md = Math.hypot(mdx, mdy);
        if (md < 110 * dpr && md > 0) {
          p.x += (mdx / md) * 0.7;
          p.y += (mdy / md) * 0.7;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',0.6)';
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const dist = Math.hypot(dx, dy);
          if (dist < linkDist) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + (0.16 * (1 - dist / linkDist)) + ')';
            ctx.lineWidth = dpr;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('mousemove', function (e) { mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr; }, { passive: true });
    window.addEventListener('mouseout', function () { mouse.x = -9999; mouse.y = -9999; });
    resize();
    draw();
  }
})();
