/* ULLAN GPS · simulador del vallado virtual (arrastra la vaca y los vértices) */
(() => {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const clampInt = (v, min, max, fb) => { const n = parseInt(v, 10); return Number.isNaN(n) ? fb : Math.min(max, Math.max(min, n)); };
  /* ---------- Demo del vallado virtual ---------- */
  const visor = $('.visor');
  const stage = $('#visor-stage');
  if (visor && stage) {
    const W = 1000;
    const H = 680;
    const BAND = 36; // metros de zona de aviso (1 unidad = 1 m en la simulación)
    const START_ZONE = [[262, 168], [540, 112], [764, 194], [802, 410], [622, 548], [330, 532], [206, 352]];
    const START_COW = [560, 300];
    const START_IDLE = [[420, 300], [470, 438], [646, 410]];

    let pts = START_ZONE.map((p) => p.slice());
    let cow = START_COW.slice();
    const idle = START_IDLE.map((p) => p.slice());

    const shapes = ['#zone-fill', '#zone-band', '#zone-halo', '#zone-line', '#zone-clip-shape'].map((s) => $(s));
    const cowEl = $('#cow-active');
    const idleEls = $$('.cow--idle', stage);
    const hint = $('#visor-hint');
    const stArea = $('#st-area');
    const stPos = $('#st-pos');
    const stSignal = $('#st-signal');
    const rowSignal = $('[data-status="signal"]', visor);
    const rowPos = $('[data-status="pos"]', visor);
    const bandToggle = $('#toggle-band');
    const btnWalk = $('#sim-walk');
    const btnReset = $('#sim-reset');
    const vertexLayer = $('#vertex-layer');

    const setPos = (el, x, y) => {
      el.style.setProperty('--x', (x / W * 100).toFixed(3));
      el.style.setProperty('--y', (y / H * 100).toFixed(3));
    };

    /* Geometría */
    const inside = (x, y) => {
      let c = false;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const [xi, yi] = pts[i];
        const [xj, yj] = pts[j];
        if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
      }
      return c;
    };
    const nearestEdge = (x, y) => {
      let best = { d: Infinity, x: 0, y: 0 };
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const [ax, ay] = pts[j];
        const [bx, by] = pts[i];
        const dx = bx - ax;
        const dy = by - ay;
        const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1)));
        const cx = ax + t * dx;
        const cy = ay + t * dy;
        const d = Math.hypot(x - cx, y - cy);
        if (d < best.d) best = { d, x: cx, y: cy };
      }
      return best;
    };
    const area = () => {
      let a = 0;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) a += (pts[j][0] + pts[i][0]) * (pts[j][1] - pts[i][1]);
      return Math.abs(a / 2);
    };
    const centroid = () => {
      const n = pts.length;
      return [pts.reduce((s, p) => s + p[0], 0) / n, pts.reduce((s, p) => s + p[1], 0) / n];
    };

    /* Límites visibles del mapa (en móvil el mapa se recorta en cuadrado) */
    const visibleBounds = () => {
      const s = stage.getBoundingClientRect();
      const m = stage.parentElement.getBoundingClientRect();
      const m2 = 16;
      return {
        x0: Math.max(0, ((m.left - s.left) / s.width) * W) + m2,
        x1: Math.min(W, ((m.right - s.left) / s.width) * W) - m2,
        y0: Math.max(0, ((m.top - s.top) / s.height) * H) + m2,
        y1: Math.min(H, ((m.bottom - s.top) / s.height) * H) - m2,
      };
    };
    let bounds = visibleBounds();
    const clampPoint = ([x, y]) => [Math.min(bounds.x1, Math.max(bounds.x0, x)), Math.min(bounds.y1, Math.max(bounds.y0, y))];

    /* Vértices arrastrables */
    const vertexEls = pts.map((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'vertex';
      b.setAttribute('aria-label', `Vértice ${i + 1} de la zona. Muévelo arrastrando o con las flechas del teclado.`);
      vertexLayer.append(b);
      return b;
    });

    let lastState = '';
    const evaluate = () => {
      const edge = nearestEdge(cow[0], cow[1]);
      const isIn = inside(cow[0], cow[1]);
      /* in: dentro · warn: zona de aviso · stim: acaba de cruzar (hasta 30 m) · out: más lejos */
      const state = isIn ? (edge.d > BAND ? 'in' : 'warn') : (edge.d <= 30 ? 'stim' : 'out');
      const meters = Math.max(1, Math.round(edge.d));
      visor.dataset.state = state;
      rowSignal.dataset.state = state === 'warn' || state === 'stim' ? state : 'none';
      rowPos.dataset.state = state === 'in' ? 'none' : state === 'out' ? 'stim' : state;
      stPos.textContent = {
        in: 'Dentro de la zona',
        warn: `Cerca del límite, a ${meters} m`,
        stim: `Ha cruzado el límite, a ${meters} m`,
        out: 'Fuera de la zona',
      }[state];
      if (state !== lastState) {
        stSignal.textContent = {
          in: 'Ninguna',
          warn: 'Aviso sonoro',
          stim: 'Estímulo eléctrico ajustable',
          out: 'Según el fabricante',
        }[state];
        lastState = state;
      }
    };

    const renderZone = () => {
      const s = pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
      shapes.forEach((el) => el && el.setAttribute('points', s));
      pts.forEach((p, i) => setPos(vertexEls[i], p[0], p[1]));
      const ha = area() / 10000;
      stArea.textContent = `${ha.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ha aprox.`;
    };
    const renderCow = () => { setPos(cowEl, cow[0], cow[1]); evaluate(); };

    let frame = 0;
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => { frame = 0; renderZone(); renderCow(); });
    };

    let interacted = false;
    const markInteracted = () => {
      if (interacted) return;
      interacted = true;
      hint.classList.add('is-hidden');
    };

    const toMap = (e) => {
      const r = stage.getBoundingClientRect();
      return [((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H];
    };

    const draggable = (el, get, set, onEnd) => {
      let active = null;
      let offset = [0, 0];
      el.addEventListener('pointerdown', (e) => {
        if (active !== null) return;
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        stopWalk();
        markInteracted();
        bounds = visibleBounds();
        active = e.pointerId;
        const p = toMap(e);
        const cur = get();
        offset = [cur[0] - p[0], cur[1] - p[1]];
        el.setPointerCapture(e.pointerId);
        el.classList.add('is-dragging');
        e.preventDefault();
      });
      el.addEventListener('pointermove', (e) => {
        if (e.pointerId !== active) return;
        const p = toMap(e);
        set(clampPoint([p[0] + offset[0], p[1] + offset[1]]));
        schedule();
      });
      const end = (e) => {
        if (e.pointerId !== active) return;
        active = null;
        el.classList.remove('is-dragging');
        if (onEnd) onEnd();
      };
      el.addEventListener('pointerup', end);
      el.addEventListener('pointercancel', end);
      el.addEventListener('lostpointercapture', end);
      el.addEventListener('keydown', (e) => {
        const step = e.shiftKey ? 40 : 10;
        const move = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
        if (!move) return;
        e.preventDefault();
        stopWalk();
        markInteracted();
        bounds = visibleBounds();
        const cur = get();
        set(clampPoint([cur[0] + move[0], cur[1] + move[1]]));
        schedule();
        if (onEnd) onEnd();
      });
    };

    draggable(cowEl, () => cow, (p) => { cow = p; });
    vertexEls.forEach((el, i) => draggable(el, () => pts[i], (p) => { pts[i] = p; }, () => keepIdleInside()));

    /* Vacas en reposo: nuevas posiciones GPS cada poco tiempo */
    const keepIdleInside = () => {
      const c = centroid();
      idle.forEach((p, i) => {
        let tries = 0;
        while ((!inside(p[0], p[1]) || nearestEdge(p[0], p[1]).d < BAND + 8) && tries < 30) {
          p[0] += (c[0] - p[0]) * 0.18;
          p[1] += (c[1] - p[1]) * 0.18;
          tries += 1;
        }
        setPos(idleEls[i], p[0], p[1]);
      });
    };
    const wander = () => {
      idle.forEach((p, i) => {
        for (let k = 0; k < 10; k += 1) {
          const a = Math.random() * Math.PI * 2;
          const r = 14 + Math.random() * 26;
          const nx = p[0] + Math.cos(a) * r;
          const ny = p[1] + Math.sin(a) * r;
          if (inside(nx, ny) && nearestEdge(nx, ny).d > BAND + 10) {
            p[0] = nx;
            p[1] = ny;
            break;
          }
        }
        setPos(idleEls[i], p[0], p[1]);
      });
    };
    let wanderTimer = 0;
    let visorVisible = false;
    const runWander = () => {
      window.clearTimeout(wanderTimer);
      if (!visorVisible || reduceMotion.matches || document.hidden) return;
      wanderTimer = window.setTimeout(() => { wander(); runWander(); }, 1600 + Math.random() * 900);
    };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => { visorVisible = entry.isIntersecting; runWander(); }, { threshold: 0.25 }).observe(visor);
    }
    document.addEventListener('visibilitychange', runWander);
    reduceMotion.addEventListener('change', runWander);

    /* Simular un paseo hacia el límite y de vuelta */
    let walkFrame = 0;
    let walkTimers = [];
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    function stopWalk() {
      if (walkFrame) cancelAnimationFrame(walkFrame);
      walkFrame = 0;
      walkTimers.forEach((t) => window.clearTimeout(t));
      walkTimers = [];
    }
    const tween = (from, to, duration, done) => {
      const t0 = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - t0) / duration);
        const k = ease(t);
        cow = [from[0] + (to[0] - from[0]) * k, from[1] + (to[1] - from[1]) * k];
        renderCow();
        if (t < 1) walkFrame = requestAnimationFrame(step);
        else { walkFrame = 0; if (done) done(); }
      };
      walkFrame = requestAnimationFrame(step);
    };
    const walk = () => {
      stopWalk();
      markInteracted();
      let start = cow.slice();
      if (!inside(start[0], start[1]) || nearestEdge(start[0], start[1]).d < BAND + 20) start = centroid();
      const edge = nearestEdge(start[0], start[1]);
      const dx = edge.x - start[0];
      const dy = edge.y - start[1];
      const len = Math.hypot(dx, dy) || 1;
      bounds = visibleBounds();
      const warnPoint = clampPoint([edge.x - (dx / len) * (BAND * 0.45), edge.y - (dy / len) * (BAND * 0.45)]);
      const target = clampPoint([edge.x + (dx / len) * 14, edge.y + (dy / len) * 14]);
      if (reduceMotion.matches) {
        cow = warnPoint; renderCow();
        walkTimers.push(window.setTimeout(() => { cow = target; renderCow(); }, 1600));
        walkTimers.push(window.setTimeout(() => { cow = start; renderCow(); }, 3200));
        return;
      }
      cow = start;
      renderCow();
      tween(start, warnPoint, 1500, () => {
        walkTimers.push(window.setTimeout(() => tween(warnPoint, target, 900, () => {
          walkTimers.push(window.setTimeout(() => tween(target, start, 1600), 1100));
        }), 1000));
      });
    };

    btnWalk.addEventListener('click', walk);
    btnReset.addEventListener('click', () => {
      stopWalk();
      pts = START_ZONE.map((p) => p.slice());
      cow = START_COW.slice();
      START_IDLE.forEach((p, i) => { idle[i][0] = p[0]; idle[i][1] = p[1]; setPos(idleEls[i], p[0], p[1]); });
      bandToggle.checked = true;
      visor.dataset.band = 'on';
      renderZone();
      renderCow();
    });
    bandToggle.addEventListener('change', () => { visor.dataset.band = bandToggle.checked ? 'on' : 'off'; });

    window.addEventListener('resize', () => { bounds = visibleBounds(); }, { passive: true });

    visor.dataset.band = 'on';
    idle.forEach((p, i) => setPos(idleEls[i], p[0], p[1]));
    renderZone();
    renderCow();
  }

})();
