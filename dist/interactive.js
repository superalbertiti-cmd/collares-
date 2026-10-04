/* ULLAN GPS · capa de interacción: collar con puntos, scroll, imán, cifras */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const raf = (fn) => { let q = 0; return (...a) => { if (!q) q = requestAnimationFrame(() => { q = 0; fn(...a); }); }; };

  /* Barra de lectura + cabecera */
  const bar = document.createElement('div');
  bar.className = 'read-progress'; bar.setAttribute('aria-hidden', 'true');
  document.body.prepend(bar);
  const header = $('.site-header');
  const onScroll = raf(() => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.setProperty('--p', max > 0 ? Math.min(1, scrollY / max).toFixed(4) : '0');
    if (header) header.classList.toggle('is-scrolled', scrollY > 24);
  });
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* Enlace activo del menú */
  const links = $$('#site-nav a[href^="#"]');
  const map = new Map(links.map((a) => [a.getAttribute('href'), a]));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((a) => a.removeAttribute('aria-current'));
      const a = map.get('#' + en.target.id); if (a) a.setAttribute('aria-current', 'true');
    }), { rootMargin: '-40% 0px -55% 0px' });
    [...map.keys()].map((h) => $(h)).filter(Boolean).forEach((s) => io.observe(s));
  }

  /* Portada: puntos clicables sobre el collar */
  const product = $('.hero-product');
  const collar = $('#hero-collar');
  const tag = $('.solar-tag');
  if (product && collar && tag) {
    const DATA = {
      gps: { n: '01', t: 'GPS y BeiDou', s: 'Precisión indicada de 10 m' },
      solar: { n: '02', t: 'Paneles solares', s: 'Energía de la luz del día' },
      strap: { n: '03', t: 'Sujeción reforzada', s: 'Cadena de acero y goma reforzada' }
    };
    const layer = document.createElement('div');
    layer.className = 'hs-layer';
    layer.innerHTML = [['gps', 49, 29, 'GPS y BeiDou'], ['solar', 33.4, 51.5, 'Paneles solares'], ['strap', 81.8, 33.6, 'Sujeción reforzada']]
      .map(([k, x, y, l]) => `<button class="hs" type="button" data-hs="${k}" style="--x:${x};--y:${y}" aria-pressed="${k === 'solar'}" aria-label="${l}"></button>`).join('');
    collar.after(layer);
    const hint = document.createElement('span');
    hint.className = 'hero-hint'; hint.textContent = 'Toca los puntos del collar';
    product.append(hint);
    const num = $('span', tag); const box = $('div', tag);
    const title = box.firstChild; const small = $('small', box);
    let timer = 0; let stopped = false;
    const show = (k, user) => {
      if (user) { stopped = true; hint.classList.add('is-hidden'); }
      const d = DATA[k];
      $$('.hs', layer).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.hs === k)));
      const apply = () => { num.textContent = d.n; title.textContent = d.t; small.textContent = d.s; tag.classList.remove('is-swap'); };
      if (calm.matches) return apply();
      tag.classList.add('is-swap'); clearTimeout(timer); timer = setTimeout(apply, 170);
    };
    $$('.hs', layer).forEach((b) => b.addEventListener('click', () => show(b.dataset.hs, true)));
    /* Recorrido automático hasta que la persona interactúe */
    const order = ['gps', 'solar', 'strap']; let i = 1;
    if (!calm.matches) {
      const tick = () => { if (stopped || document.hidden) return; i = (i + 1) % 3; show(order[i], false); };
      setInterval(tick, 3600);
    }
    /* Copia las variables de scroll del collar a la capa de puntos */
    const sync = raf(() => ['--hero-y', '--hero-angle', '--hero-scale'].forEach((p) => { const v = collar.style.getPropertyValue(p); if (v) layer.style.setProperty(p, v); }));
    addEventListener('scroll', sync, { passive: true }); addEventListener('resize', sync); sync();
    /* Perspectiva con el puntero */
    if (fine.matches && !calm.matches) {
      const hero = $('.hero');
      const move = raf((e) => {
        const r = hero.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
        const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
        [collar, layer].forEach((el) => { el.style.setProperty('--px', x.toFixed(3)); el.style.setProperty('--py', y.toFixed(3)); });
      });
      hero.addEventListener('pointermove', move);
      hero.addEventListener('pointerleave', () => [collar, layer].forEach((el) => { el.style.setProperty('--px', '0'); el.style.setProperty('--py', '0'); }));
    }
  }

  /* Botones con efecto imán */
  if (fine.matches && !calm.matches) {
    $$('.button, .nav-cta').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width, dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        el.style.translate = `${(dx * 8).toFixed(1)}px ${(dy * 6).toFixed(1)}px`;
      });
      el.addEventListener('pointerleave', () => { el.style.translate = ''; });
    });
    /* Foco de luz en tarjetas de modelo */
    $$('.model-card').forEach((el) => el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--sx', (e.clientX - r.left) + 'px'); el.style.setProperty('--sy', (e.clientY - r.top) + 'px');
    }));
  }

  /* Revelado escalonado al hacer scroll (solo lo que está bajo el pliegue) */
  if ('IntersectionObserver' in window && !calm.matches) {
    const sel = '.section-heading, .spec-heading, .model-card, .spec-numbers > div, .setup-steps > article, .faq details, .clarity-grid > *, .anatomy-grid > *, .vzw, .cows-heading, .purchase-copy, .history-copy, .calc';
    const els = $$(sel).filter((el) => el.getBoundingClientRect().top > innerHeight * 0.92 && !el.closest('.product-story'));
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach((el, n) => { el.classList.add('rv'); el.style.setProperty('--rd', String(n % 4)); io.observe(el); });
    setTimeout(() => $$('.rv').forEach((el) => el.classList.add('in')), 7000);
  }

  /* Cifras que cuentan al aparecer */
  const nums = $$('.spec-numbers strong');
  if (nums.length && 'IntersectionObserver' in window && !calm.matches) {
    const ease = (t) => 1 - Math.pow(1 - t, 4);
    const io = new IntersectionObserver((es) => es.forEach((en) => {
      if (!en.isIntersecting) return; io.unobserve(en.target);
      const node = [...en.target.childNodes].find((n) => n.nodeType === 3 && /^\d/.test(n.textContent));
      if (!node) return;
      const m = node.textContent.match(/^(\d+)(?:,(\d+))?/); if (!m) return;
      const dec = m[2] ? m[2].length : 0; const end = parseFloat(m[1] + (m[2] ? '.' + m[2] : ''));
      const tail = node.textContent.slice(m[0].length); const t0 = performance.now();
      const step = (t) => {
        const k = Math.min(1, (t - t0) / 1100); const v = end * ease(k);
        node.textContent = v.toFixed(dec).replace('.', ',') + tail;
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }), { threshold: 0.6 });
    nums.forEach((n) => io.observe(n));
  }

  /* Total estimado: pequeño relevo al cambiar */
  const total = $('#estimated-total');
  if (total && !calm.matches) {
    let last = total.textContent;
    new MutationObserver(() => {
      if (total.textContent === last) return; last = total.textContent;
      total.classList.remove('is-tick'); void total.offsetWidth; total.classList.add('is-tick');
    }).observe(total, { childList: true, characterData: true, subtree: true });
  }
  /* Calculadora de estimación (misma lógica de precios que la consulta) */
  const anchor = $('.antenna-accessory');
  if (anchor) {
    const PRICE = { mobile: 100, antenna: 110, unit: 800 };
    const money = (v) => Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '\u00a0€';
    const calc = document.createElement('div');
    calc.className = 'calc'; calc.id = 'calculadora';
    calc.innerHTML = `
      <div class="calc-head"><h3>Calcula tu estimación.</h3><p>Mueve el control y mira al momento el importe orientativo de los equipos.</p></div>
      <div class="calc-body">
        <div class="calc-seg" role="group" aria-label="Modelo de collar">
          <button type="button" data-m="mobile" aria-pressed="true">5G · 100 €</button>
          <button type="button" data-m="antenna" aria-pressed="false">Antena · 110 €</button>
        </div>
        <div class="calc-row"><label for="calc-range">Collares, uno por vaca <output id="calc-out" aria-live="polite">20</output></label>
          <input id="calc-range" type="range" min="1" max="200" value="20" aria-label="Número de collares"></div>
        <div class="calc-row"><label for="calc-num">¿Más de 200 o una cifra exacta?</label><input class="calc-num" id="calc-num" type="number" inputmode="numeric" min="1" max="9999" value="20"></div>
        <div class="calc-row calc-ant" hidden><label for="calc-ant">Antenas (unos 800 € cada una)</label><input class="calc-num" id="calc-ant" type="number" inputmode="numeric" min="0" max="999" value="1"></div>
        <div class="calc-total"><span>Estimación de equipos</span><strong id="calc-total" aria-live="polite">2.000 € aprox.</strong><small id="calc-detail"></small></div>
        <a class="button light" id="calc-wa" href="https://wa.me/34603682555" target="_blank" rel="noopener noreferrer">Consultar por WhatsApp <span aria-hidden="true">＋</span></a>
        <p class="calc-fine">Solo equipos. IVA, envío, instalación, SIM y cuotas de servicio aparte. Te confirmamos el importe final antes de contratar.</p>
      </div>`;
    anchor.before(calc);
    const range = $('#calc-range', calc), num = $('#calc-num', calc), ant = $('#calc-ant', calc), out = $('#calc-out', calc);
    const totalEl = $('#calc-total', calc), detail = $('#calc-detail', calc), wa = $('#calc-wa', calc), antRow = $('.calc-ant', calc);
    let model = 'mobile', shown = 2000, tween = 0;
    const clamp = (v, a, b, d) => { const n = parseInt(v, 10); return Number.isNaN(n) ? d : Math.min(b, Math.max(a, n)); };
    const animateTo = (to) => {
      cancelAnimationFrame(tween);
      if (calm.matches) { shown = to; totalEl.textContent = money(to) + ' aprox.'; return; }
      const from = shown, t0 = performance.now();
      const step = (t) => { const k = Math.min(1, (t - t0) / 380); shown = from + (to - from) * (1 - Math.pow(1 - k, 3)); totalEl.textContent = money(Math.round(shown)) + ' aprox.'; if (k < 1) tween = requestAnimationFrame(step); };
      tween = requestAnimationFrame(step);
    };
    const update = (from) => {
      const n = clamp(from === 'num' ? num.value : range.value, 1, 9999, 1);
      const a = model === 'antenna' ? clamp(ant.value, 0, 999, 0) : 0;
      if (from !== 'num') num.value = String(n); else range.value = String(Math.min(n, 200));
      out.textContent = String(n);
      range.style.setProperty('--fill', (Math.min(n, 200) - 1) / 199 * 100 + '%');
      const unit = PRICE[model]; const total = n * unit + a * PRICE.unit;
      detail.textContent = `${n} ${n === 1 ? 'collar' : 'collares'} × ${money(unit)}` + (a ? ` + ${a} ${a === 1 ? 'antena' : 'antenas'} × ${money(PRICE.unit)}` : '');
      animateTo(total);
      const msg = `Hola, me interesan ${n} ${n === 1 ? 'collar' : 'collares'} ULLAN GPS ${model === 'antenna' ? 'con antena' : '5G'} para vacas${a ? ' y ' + a + ' ' + (a === 1 ? 'antena' : 'antenas') : ''}. Estimación orientativa de equipos: ${money(total)}. ¿Podéis ayudarme?`;
      wa.href = 'https://wa.me/34603682555?text=' + encodeURIComponent(msg);
    };
    $$('.calc-seg button', calc).forEach((b) => b.addEventListener('click', () => {
      model = b.dataset.m; $$('.calc-seg button', calc).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      antRow.hidden = model !== 'antenna'; update();
    }));
    range.addEventListener('input', () => update('range'));
    num.addEventListener('input', () => update('num'));
    ant.addEventListener('input', () => update());
    update();
  }
})();
