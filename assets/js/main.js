/* ==========================================================================
   Nodo Colibrí — interacciones
   ========================================================================== */
(() => {
  'use strict';

  /* ------------------------------------------------------------------------
     WhatsApp: número único para todo el sitio.
     Formato internacional sin "+" ni espacios (504 = Honduras).
     ------------------------------------------------------------------------ */
  const WHATSAPP_NUMBER = '50487797996';
  const DEFAULT_MESSAGE = 'Hola Nodo Colibrí, me gustaría cotizar un sitio web.';

  const waLink = (message = DEFAULT_MESSAGE) =>
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  /* Enlaces de WhatsApp ---------------------------------------------------- */
  $$('[data-wa]').forEach((link) => {
    link.href = waLink(link.dataset.wa || DEFAULT_MESSAGE);
    link.target = '_blank';
    link.rel = 'noopener';
  });

  /* Año del footer --------------------------------------------------------- */
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* Navbar: estado al hacer scroll + FAB ----------------------------------- */
  const header = $('[data-header]');
  const fab = $('[data-fab]');
  let lastScrollState = null;

  const onScrollState = () => {
    const y = window.scrollY;
    const scrolled = y > 24;
    if (scrolled !== lastScrollState) {
      header.classList.toggle('is-scrolled', scrolled);
      lastScrollState = scrolled;
    }
    if (fab) fab.classList.toggle('is-visible', y > window.innerHeight * 0.65);
  };

  /* Menú móvil ------------------------------------------------------------- */
  const toggle = $('[data-menu-toggle]');
  const menu = $('[data-menu]');

  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    menu.classList.toggle('is-open', open);
  };

  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      setMenu(false);
      toggle.focus();
    }
  });
  document.addEventListener('click', (e) => {
    if (menu.classList.contains('is-open') && !header.contains(e.target)) setMenu(false);
  });
  window.matchMedia('(min-width: 961px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  /* Indicador de cristal en los enlaces + sección activa ------------------- */
  const navList = $('[data-nav-links]');
  const indicator = $('.nav__indicator', navList);
  const navLinks = $$('a', navList);
  let activeLink = null;

  const moveIndicator = (link) => {
    if (!link || !navList.offsetParent) {
      indicator.style.opacity = '0';
      return;
    }
    indicator.style.width = `${link.offsetWidth}px`;
    indicator.style.transform = `translateX(${link.offsetLeft}px)`;
    indicator.style.opacity = '1';
  };

  navLinks.forEach((link) => {
    link.addEventListener('pointerenter', () => moveIndicator(link));
    link.addEventListener('focus', () => moveIndicator(link));
  });
  navList.addEventListener('pointerleave', () => moveIndicator(activeLink));

  const sections = navLinks
    .map((link) => document.getElementById(link.hash.slice(1)))
    .filter(Boolean);

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const link = navLinks.find((a) => a.hash === `#${entry.target.id}`);
      navLinks.forEach((a) => a.classList.toggle('is-active', a === link));
      if (link) link.setAttribute('aria-current', 'true');
      navLinks.filter((a) => a !== link).forEach((a) => a.removeAttribute('aria-current'));
      activeLink = link || null;
      if (!navList.matches(':hover')) moveIndicator(activeLink);
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  sections.forEach((s) => sectionObserver.observe(s));

  const hero = $('#inicio');
  if (hero) {
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
        navLinks.forEach((a) => { a.classList.remove('is-active'); a.removeAttribute('aria-current'); });
        activeLink = null;
        if (!navList.matches(':hover')) moveIndicator(null);
      }
    }, { threshold: [0.5] }).observe(hero);
  }

  /* Aparición progresiva --------------------------------------------------- */
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* Iluminación que sigue al cursor en superficies de cristal -------------- */
  if (finePointer.matches) {
    $$('.is-interactive').forEach((el) => {
      let frame = 0;
      el.addEventListener('pointermove', (e) => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
          const r = el.getBoundingClientRect();
          el.style.setProperty('--mx', `${e.clientX - r.left}px`);
          el.style.setProperty('--my', `${e.clientY - r.top}px`);
          frame = 0;
        });
      });
    });
  }

  /* Parallax sutil --------------------------------------------------------- */
  const stage = $('[data-stage]');
  const depthLayers = stage ? $$('[data-depth]', stage) : [];
  const parallaxEls = $$('[data-parallax]');

  let pointerX = 0;
  let pointerY = 0;
  let curX = 0;
  let curY = 0;
  let ticking = false;
  let heroVisible = true;

  const render = () => {
    ticking = false;
    const vh = window.innerHeight;

    // Hero: cursor + scroll
    if (heroVisible && depthLayers.length) {
      curX += (pointerX - curX) * 0.08;
      curY += (pointerY - curY) * 0.08;
      const scroll = Math.min(window.scrollY, vh);
      depthLayers.forEach((layer) => {
        const d = parseFloat(layer.dataset.depth) || 0;
        const x = -curX * d * 26;
        const y = -curY * d * 20 - scroll * d * 0.09;
        layer.style.translate = `${x.toFixed(2)}px ${y.toFixed(2)}px`;
      });
      // Sigue animando mientras el suavizado no haya convergido
      if (Math.abs(pointerX - curX) > 0.001 || Math.abs(pointerY - curY) > 0.001) requestTick();
    }

    // Decoraciones de sección
    parallaxEls.forEach((el) => {
      const parent = el.parentElement.getBoundingClientRect();
      if (parent.bottom < -200 || parent.top > vh + 200) return;
      const speed = parseFloat(el.dataset.parallax) || 0;
      const offset = (parent.top + parent.height / 2 - vh / 2) * speed;
      el.style.translate = `0 ${offset.toFixed(1)}px`;
    });
  };

  const requestTick = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(render);
    }
  };

  const enableParallax = () => !reducedMotion.matches;

  if (enableParallax()) {
    if (stage) {
      new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; }).observe(stage);
    }
    if (finePointer.matches && stage) {
      window.addEventListener('pointermove', (e) => {
        if (!heroVisible) return;
        pointerX = e.clientX / window.innerWidth - 0.5;
        pointerY = e.clientY / window.innerHeight - 0.5;
        requestTick();
      }, { passive: true });
    }
    requestTick();
  }

  window.addEventListener('scroll', () => {
    onScrollState();
    if (enableParallax()) requestTick();
  }, { passive: true });

  window.addEventListener('resize', () => {
    moveIndicator(activeLink);
    if (enableParallax()) requestTick();
  });

  onScrollState();

  /* Preguntas frecuentes --------------------------------------------------- */
  $$('[data-accordion] .acc__q').forEach((btn) => {
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      btn.closest('.acc__item').classList.toggle('is-open', open);
    });
  });

  /* Formulario → WhatsApp -------------------------------------------------- */
  const form = $('[data-wa-form]');
  if (form) {
    const nameInput = form.elements.nombre;
    const errorEl = $('[data-form-error]', form);

    nameInput.addEventListener('input', () => {
      nameInput.removeAttribute('aria-invalid');
      errorEl.textContent = '';
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = String(data.get('nombre') || '').trim();

      if (!name) {
        nameInput.setAttribute('aria-invalid', 'true');
        errorEl.textContent = 'Escribe tu nombre para poder saludarte.';
        nameInput.focus();
        return;
      }

      const tipo = String(data.get('tipo') || '').trim();
      const plan = String(data.get('plan') || '').trim();
      const mensaje = String(data.get('mensaje') || '').trim();

      const lines = [
        `Hola Nodo Colibrí, soy ${name}.`,
        tipo ? `Necesito: ${tipo.charAt(0).toLowerCase()}${tipo.slice(1)}.` : '',
        plan ? `Plan de interés: ${plan}.` : '',
        mensaje ? `\n${mensaje}` : '',
      ].filter(Boolean);

      window.open(waLink(lines.join('\n')), '_blank', 'noopener');
    });
  }
})();
