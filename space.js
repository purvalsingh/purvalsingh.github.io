(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  window.__errs = [];
  addEventListener('error', e => window.__errs.push(e.message));

  /* ---------- starfield: 3D stars, speed follows scroll velocity ---------- */
  const sc = $('#stars'), sx = sc.getContext('2d');
  let W, H, DPR, stars = [], shooters = [];
  let speed = 0.4, boost = 0, mx = 0, my = 0, pmx = 0, pmy = 0;
  const N = innerWidth < 600 ? 260 : 620;
  function sizeStars() {
    DPR = Math.min(devicePixelRatio || 1, 2);
    W = sc.width = innerWidth * DPR; H = sc.height = innerHeight * DPR;
  }
  const star = () => ({ x: (Math.random() - .5) * 2, y: (Math.random() - .5) * 2, z: Math.random() * .9 + .1, h: Math.random() < .12 ? 190 + Math.random() * 90 : 0 });
  sizeStars();
  for (let i = 0; i < N; i++) stars.push(star());
  addEventListener('resize', sizeStars);

  function drawStars() {
    // trail: faster = longer streaks
    sx.fillStyle = `rgba(4,5,13,${boost > 2 ? .35 : 1})`;
    sx.fillRect(0, 0, W, H);
    pmx += (mx - pmx) * .05; pmy += (my - pmy) * .05;
    const v = (speed + boost) * .0025, f = Math.min(W, H) * .6;
    for (const s of stars) {
      s.z -= v;
      if (s.z <= .02) { Object.assign(s, star(), { z: 1 }); }
      const k = f / s.z;
      const x = W / 2 + (s.x - pmx * .15 * (1 - s.z)) * k * .5;
      const y = H / 2 + (s.y - pmy * .15 * (1 - s.z)) * k * .5;
      if (x < 0 || x > W || y < 0 || y > H) { if (s.z < .9) Object.assign(s, star(), { z: 1 }); continue; }
      const r = Math.max(.3, (1 - s.z) * 1.9) * DPR;
      const a = Math.min(1, (1 - s.z) * 1.4);
      sx.fillStyle = s.h ? `hsla(${s.h},90%,75%,${a})` : `rgba(230,236,255,${a})`;
      sx.beginPath(); sx.arc(x, y, r, 0, 6.283); sx.fill();
    }
    // shooting stars
    if (Math.random() < .004 && shooters.length < 2) shooters.push({ x: Math.random() * W, y: Math.random() * H * .5, vx: (4 + Math.random() * 4) * DPR, vy: (1.5 + Math.random() * 2) * DPR, life: 1 });
    shooters = shooters.filter(s => s.life > 0);
    for (const s of shooters) {
      const g = sx.createLinearGradient(s.x, s.y, s.x - s.vx * 14, s.y - s.vy * 14);
      g.addColorStop(0, `rgba(255,255,255,${s.life})`); g.addColorStop(1, 'rgba(94,242,255,0)');
      sx.strokeStyle = g; sx.lineWidth = 1.5 * DPR;
      sx.beginPath(); sx.moveTo(s.x, s.y); sx.lineTo(s.x - s.vx * 14, s.y - s.vy * 14); sx.stroke();
      s.x += s.vx; s.y += s.vy; s.life -= .012;
    }
    boost *= .94;
    if (!reduce) requestAnimationFrame(drawStars);
  }
  drawStars();
  addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; });

  /* ---------- loader countdown then ignite ---------- */
  document.body.classList.add('loading');
  const cnt = $('#count');
  let n = 10;
  const tick = setInterval(() => {
    n--; cnt.textContent = n;
    if (n <= 0) { clearInterval(tick); launch(); }
  }, reduce ? 20 : 120);
  function launch() {
    $('#loader').classList.add('done');
    document.body.classList.remove('loading');
    document.body.classList.add('ready');
    boost = 18;
    setTimeout(() => $$('.hero .reveal').forEach((el, i) => setTimeout(() => el.classList.add('in'), i * 120)), 250);
  }

  /* ---------- split headings into words ---------- */
  $$('.split').forEach(h => {
    const parts = h.innerHTML.split(/(<br>|\s+)/);
    h.innerHTML = parts.map(p => (p === '<br>' ? p : /^\s+$/.test(p) || !p ? p : `<span class="w"><span>${p}</span></span>`)).join('');
    $$('.w > span', h).forEach((s, i) => (s.style.transitionDelay = i * 70 + 'ms'));
  });

  /* ---------- reveal on view ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .15 });
  $$('.reveal:not(.hero .reveal), .split').forEach(el => io.observe(el));
  // stagger mission cards
  $$('.mission').forEach((m, i) => { m.classList.add('reveal'); m.style.transitionDelay = (i % 3) * 90 + 'ms'; io.observe(m); });

  /* ---------- brief: word-by-word light-up on scroll ---------- */
  const brief = $('#briefText');
  brief.innerHTML = brief.textContent.split(' ').map(w => `<span class="bw">${w}</span>`).join(' ');
  const bws = $$('.bw', brief);

  /* ---------- scroll-driven: nav, progress, hud, timeline, marquee ---------- */
  const nav = $('#nav'), prog = $('.progress'), alt = $('#alt'), tl = $('#timeline'), mq = $('#marquee');
  let lastY = scrollY, mqX = 0, vel = 0;
  function onScroll() {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    const dy = y - lastY;
    vel = dy;
    nav.classList.toggle('scrolled', y > 40);
    nav.classList.toggle('hidden', dy > 4 && y > 300 && !$('#navLinks').classList.contains('open'));
    if (dy < -4) nav.classList.remove('hidden');
    prog.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    alt.textContent = String(Math.round(y * 1.7)).padStart(3, '0');
    boost = Math.min(boost + Math.abs(dy) * .04, 14);

    const br = brief.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * .85 - br.top) / (br.height + innerHeight * .35)));
    const lit = Math.floor(p * bws.length);
    bws.forEach((w, i) => w.classList.toggle('lit', i < lit));

    const tr = tl.getBoundingClientRect();
    tl.style.setProperty('--tl', Math.min(1, Math.max(0, (innerHeight * .7 - tr.top) / tr.height)).toFixed(3));
    lastY = y;
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  (function marquee() {
    mqX -= 0.6 + Math.min(Math.abs(vel), 40) * .25;
    vel *= .9;
    const half = mq.scrollWidth / 2;
    if (-mqX >= half) mqX += half;
    mq.style.transform = `translateX(${mqX}px)`;
    if (!reduce) requestAnimationFrame(marquee);
  })();
  mq.innerHTML += mq.innerHTML; // seamless loop

  /* ---------- clock ---------- */
  const clock = $('#clock');
  const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const setClock = () => (clock.textContent = fmt.format(new Date()));
  setClock(); setInterval(setClock, 1000);
  $('#year').textContent = new Date().getFullYear();

  /* ---------- typed roles ---------- */
  const roles = ['Web Developer', 'App Builder', 'Trader', 'Backtesting nerd', 'Vibe Coder', 'CS Student @ RAIT', 'Space Invaders champion (self-declared)'];
  const roleEl = $('#role');
  let ri = 0, ci = roles[0].length, del = false;
  (function type() {
    const r = roles[ri];
    if (!del && ci >= r.length) { del = true; return setTimeout(type, 2600); }
    if (del && ci <= 0) { del = false; ri = (ri + 1) % roles.length; }
    ci += del ? -1 : 1;
    roleEl.textContent = roles[ri].slice(0, ci);
    setTimeout(type, del ? 35 : 75);
  })();

  /* ---------- nav tag cycles through hats ---------- */
  const tag = $('#brandTag'), hats = ['builder', 'web dev', 'app dev', 'trader', 'backtester', 'vibe coder'];
  let hi = 0;
  if (!reduce) setInterval(() => {
    tag.style.opacity = 0;
    setTimeout(() => { hi = (hi + 1) % hats.length; tag.textContent = hats[hi]; tag.style.opacity = 1; }, 250);
  }, 2400);

  /* ---------- contact heading swaps what you might bring ---------- */
  const swap = $('#swap');
  const asks = ['a site in mind', 'an app idea', 'work to automate', 'a strategy to test', 'a wild idea'];
  let ai = 0;
  if (!reduce) setInterval(() => {
    swap.classList.add('out');
    setTimeout(() => {
      ai = (ai + 1) % asks.length; swap.textContent = asks[ai];
      swap.classList.replace('out', 'pre');
      requestAnimationFrame(() => requestAnimationFrame(() => swap.classList.remove('pre')));
    }, 350);
  }, 2600);

  /* ---------- burger menu ---------- */
  const burger = $('#burger'), links = $('#navLinks');
  burger.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  $$('a', links).forEach(a => a.addEventListener('click', () => {
    links.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = '';
  }));

  /* ---------- warp jump ---------- */
  $$('[data-warp]').forEach(a => a.addEventListener('click', () => {
    boost = 40; document.body.classList.add('warp');
    setTimeout(() => document.body.classList.remove('warp'), 900);
  }));

  /* ---------- filters ---------- */
  $$('.filters button').forEach(b => b.addEventListener('click', () => {
    $$('.filters button').forEach(x => x.classList.toggle('on', x === b));
    const f = b.dataset.f;
    $$('.mission').forEach(m => m.classList.toggle('out', f !== 'all' && m.dataset.k !== f));
  }));

  /* ---------- GitHub repo count (live, public API) ---------- */
  fetch('https://api.github.com/users/purvalsingh')
    .then(r => (r.ok ? r.json() : null))
    .then(d => { if (d && typeof d.public_repos === 'number') $('#repoCount').textContent = d.public_repos; })
    .catch(() => {});

  /* ---------- constellation ---------- */
  const cons = $('#constellation'), cc = $('#constCanvas'), cx = cc.getContext('2d');
  const items = $$('#skillList li');
  let pts = [], hot = null;
  function layout() {
    if (innerWidth <= 560) return;
    const r = cons.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
    cc.width = r.width * d; cc.height = r.height * d; cx.setTransform(d, 0, 0, d, 0, 0);
    const groups = {};
    items.forEach(li => (groups[li.dataset.g] ||= []).push(li));
    const keys = Object.keys(groups), centers = {
      web: [.3, .38], lang: [.72, .25], tool: [.78, .7], sec: [.22, .78], cs: [.52, .78]
    };
    pts = [];
    keys.forEach(k => {
      const [gx, gy] = centers[k], list = groups[k];
      list.forEach((li, i) => {
        const a = (i / list.length) * 6.283 + k.length, rad = list.length > 3 ? .16 : .1;
        const x = (gx + Math.cos(a) * rad * (r.height / r.width) * 1.5) * r.width;
        const y = (gy + Math.sin(a) * rad * 1.1) * r.height;
        li.style.left = x + 'px'; li.style.top = y + 'px';
        pts.push({ li, x, y, g: k });
      });
    });
    drawCons();
  }
  function drawCons() {
    const r = cons.getBoundingClientRect();
    cx.clearRect(0, 0, r.width, r.height);
    const groups = {};
    pts.forEach(p => (groups[p.g] ||= []).push(p));
    Object.values(groups).forEach(list => {
      const on = hot && hot.g === list[0].g;
      cx.strokeStyle = on ? 'rgba(94,242,255,.7)' : 'rgba(160,180,255,.18)';
      cx.lineWidth = on ? 1.4 : 1;
      cx.beginPath();
      list.forEach((p, i) => (i ? cx.lineTo(p.x, p.y) : cx.moveTo(p.x, p.y)));
      cx.closePath(); cx.stroke();
    });
    if (hot) {
      cx.strokeStyle = 'rgba(155,123,255,.12)';
      pts.forEach(p => { if (p !== hot && p.g !== hot.g) { cx.beginPath(); cx.moveTo(hot.x, hot.y); cx.lineTo(p.x, p.y); cx.stroke(); } });
    }
  }
  const setHot = li => {
    hot = li ? pts.find(p => p.li === li) || { g: li.dataset.g } : null;
    items.forEach(x => {
      x.classList.toggle('hot', !!li && x.dataset.g === li.dataset.g);
      x.classList.toggle('dimmed', !!li && x.dataset.g !== li.dataset.g);
    });
    if (innerWidth > 560) drawCons();
  };
  items.forEach(li => {
    li.addEventListener('pointerenter', () => setHot(li));
    li.addEventListener('pointerleave', () => setHot(null));
    li.addEventListener('click', () => setHot(hot && hot.li === li ? null : li));
  });
  layout();
  addEventListener('resize', layout);

  /* ---------- pointer toys (desktop only) ---------- */
  if (fine && !reduce) {
    const cur = $('.cursor'), lab = $('span', cur);
    let cxp = innerWidth / 2, cyp = innerHeight / 2, tx = cxp, ty = cyp;
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; });
    (function follow() {
      cxp += (tx - cxp) * .25; cyp += (ty - cyp) * .25;
      cur.style.transform = `translate(${cxp}px,${cyp}px)`;
      requestAnimationFrame(follow);
    })();
    const label = el => el.closest('#game') ? '' : el.closest('.invaders-card, [data-warp]') ? 'PLAY' : el.closest('.m-links a, .contact-mail') ? 'OPEN' : el.closest('a, button') ? 'GO' : null;
    document.addEventListener('pointerover', e => {
      const l = label(e.target);
      cur.classList.toggle('hover', !!l);
      cur.classList.toggle('hide', !!e.target.closest('#game'));
      lab.textContent = l || '';
    });

    $$('.magnetic').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .3}px,${(e.clientY - r.top - r.height / 2) * .4}px)`;
      });
      b.addEventListener('pointerleave', () => (b.style.transform = ''));
    });

    $$('.tilt').forEach(c => {
      c.addEventListener('pointermove', e => {
        const r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        c.style.transform = `perspective(900px) rotateX(${(.5 - py) * 7}deg) rotateY(${(px - .5) * 9}deg) translateY(-4px)`;
        c.style.setProperty('--mx', px * 100 + '%'); c.style.setProperty('--my', py * 100 + '%');
      });
      c.addEventListener('pointerleave', () => (c.style.transform = ''));
    });

    const orbit = $('#orbit');
    addEventListener('pointermove', e => {
      if (scrollY > innerHeight) return;
      orbit.style.transform = `translate(${mx * -24}px,${my * -24}px) rotateX(${my * 10}deg) rotateY(${mx * -10}deg)`;
    });
  }
})();
