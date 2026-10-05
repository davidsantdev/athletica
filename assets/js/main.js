/* ==========================================================================
   Atlética Academia NR — interações do site (JavaScript puro, sem bibliotecas)
   1. Topo (sombra ao rolar + menu mobile)   2. Link ativo no menu
   3. Animação de entrada                    4. Contadores
   5. Carrossel de serviços                  6. Acordeão
   7. "Aberto agora"                         8. Ano no rodapé
   ========================================================================== */
(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Só marca a página como "com JS" quando este arquivo realmente roda: o CSS esconde os blocos de
  // animação de entrada e fecha o acordeão apenas nesse caso. Se o JS falhar, tudo continua visível.
  document.documentElement.classList.add('js');

  /* ---------- 1. Topo ---------- */
  const header = $('.site-header');
  const toggle = $('.nav__toggle');
  const menu = $('#menu-mobile');

  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    toggle.querySelector('use').setAttribute('href', open ? '#i-close' : '#i-menu');
    menu.classList.toggle('is-open', open);
    menu.inert = !open; // fechado: fora da navegação por teclado e dos leitores de tela
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  document.addEventListener('click', (e) => { if (!e.target.closest('.site-header')) setMenu(false); });
  matchMedia('(min-width: 901px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  /* ---------- 2. Link ativo no menu ---------- */
  const navLinks = $$('.nav__links a');
  const sections = navLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const link = navLinks.find((a) => a.getAttribute('href') === '#' + entry.target.id);
        if (!link) return;
        if (entry.isIntersecting) navLinks.forEach((a) => a.classList.toggle('is-active', a === link));
        else link.classList.remove('is-active'); // saiu da faixa central da tela (ex.: voltou ao topo)
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- 3. Animação de entrada ---------- */
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- 4. Contadores ---------- */
  const counters = $$('[data-count]');
  const runCounter = (el) => {
    const end = Number(el.dataset.count);
    const t0 = performance.now();
    const dur = 1500;
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    el.textContent = '0';
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window && !reduceMotion) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { runCounter(entry.target); co.unobserve(entry.target); }
      });
    }, { threshold: 0.8 });
    counters.forEach((el) => co.observe(el));
  }

  /* ---------- 5. Carrossel de serviços ---------- */
  const track = $('[data-carousel-track]');
  const prev = $('[data-carousel-prev]');
  const next = $('[data-carousel-next]');

  if (track && prev && next) {
    const stepSize = () => {
      const card = track.firstElementChild;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return card ? card.getBoundingClientRect().width + gap : track.clientWidth * 0.8;
    };
    const updateArrows = () => {
      const max = track.scrollWidth - track.clientWidth - 4;
      prev.disabled = track.scrollLeft <= 4;
      next.disabled = track.scrollLeft >= max;
    };
    prev.addEventListener('click', () => track.scrollBy({ left: -stepSize(), behavior: 'smooth' }));
    next.addEventListener('click', () => track.scrollBy({ left: stepSize(), behavior: 'smooth' }));
    let ticking = false;
    track.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { updateArrows(); ticking = false; });
    }, { passive: true });
    window.addEventListener('resize', updateArrows);
    updateArrows();

    // arrastar com o mouse (no toque, o scroll nativo já funciona)
    let down = false, startX = 0, startLeft = 0, moved = false;
    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
    });
    window.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 5) { moved = true; track.classList.add('is-dragging'); }
      if (moved) track.scrollLeft = startLeft - dx;
    });
    const endDrag = () => {
      if (!down) return;
      down = false;
      if (moved) {
        track.classList.remove('is-dragging');
        // reencaixa no cartão mais próximo
        const s = stepSize();
        track.scrollTo({ left: Math.round(track.scrollLeft / s) * s, behavior: 'smooth' });
      }
    };
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);

    // teclado: setas esquerda/direita quando o carrossel está focado
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); next.click(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev.click(); }
    });
  }

  /* ---------- 6. Acordeão ---------- */
  const items = $$('[data-accordion] .acc-item');
  const setItem = (item, open) => {
    item.classList.toggle('is-open', open);
    $('button', item).setAttribute('aria-expanded', String(open));
  };
  items.forEach((item) => {
    $('button', item).addEventListener('click', () => {
      const willOpen = !item.classList.contains('is-open');
      items.forEach((other) => { if (other !== item) setItem(other, false); });
      setItem(item, willOpen);
    });
  });

  /* ---------- 7. "Aberto agora" ----------
     Horários em minutos desde 00:00, por dia da semana (0 = domingo).
     EDITAR aqui se o horário de funcionamento mudar (e também o texto no HTML). */
  const SCHEDULE = {
    0: [],
    1: [[300, 1290]], 2: [[300, 1290]], 3: [[300, 1290]], 4: [[300, 1290]], 5: [[300, 1290]], // seg–sex: 5h às 21h30
    6: [[420, 660], [900, 1140]],                                                              // sáb: 7h–11h e 15h–19h
  };
  const DAY_NAMES = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  const WEEKDAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  const fmt = (min) => {
    const h = Math.floor(min / 60), m = min % 60;
    return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
  };

  // hora de Novo Repartimento (fuso de Belém), independente do fuso de quem acessa
  const nowInPara = () => {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Belem', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23',
    }).formatToParts(new Date());
    const get = (type) => parts.find((p) => p.type === type).value;
    return { day: WEEKDAY_INDEX[get('weekday')], minutes: Number(get('hour')) * 60 + Number(get('minute')) };
  };

  const statusNow = () => {
    const { day, minutes } = nowInPara();
    const current = SCHEDULE[day].find(([open, close]) => minutes >= open && minutes < close);
    if (current) return { open: true, title: 'Aberto agora', detail: `Hoje até às ${fmt(current[1])}`, day };

    for (let i = 0; i < 7; i++) {
      const d = (day + i) % 7;
      const slot = SCHEDULE[d].find(([open]) => i > 0 || open > minutes);
      if (slot) {
        const when = i === 0 ? 'hoje' : i === 1 ? 'amanhã' : DAY_NAMES[d];
        return { open: false, title: 'Fechado agora', detail: `Abre ${when} às ${fmt(slot[0])}`, day };
      }
    }
    return null;
  };

  const card = $('[data-open-status]');
  const hoursRows = $$('[data-hours] [data-days]');
  const refreshStatus = () => {
    let s;
    try { s = statusNow(); } catch (_) { s = null; } // navegador sem suporte a Intl/fuso: mantém o texto padrão
    if (!s) return;
    if (card) {
      card.dataset.state = s.open ? 'open' : 'closed';
      const setText = (el, text) => { if (el.textContent !== text) el.textContent = text; };
      setText($('[data-status-title]', card), s.title);
      setText($('[data-status-detail]', card), s.detail);
    }
    hoursRows.forEach((row) => row.classList.toggle('is-today', row.dataset.days.split(',').map(Number).includes(s.day)));
  };
  refreshStatus();
  setInterval(refreshStatus, 60 * 1000);

  /* ---------- 8. Ano no rodapé ---------- */
  const year = $('#ano');
  if (year) year.textContent = new Date().getFullYear();
})();
