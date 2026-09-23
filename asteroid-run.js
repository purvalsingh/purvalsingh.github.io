// Asteroid Run — tiny canvas mini game embedded on the portfolio.
(() => {
  const cv = document.getElementById('game');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  const overlay = document.getElementById('gameOverlay');
  const startBtn = document.getElementById('gameStart');
  const scoreEl = document.getElementById('grScore'), bestEl = document.getElementById('grBest');
  const store = {
    get: () => { try { return +localStorage.getItem('ar-best') || 0; } catch { return 0; } },
    set: v => { try { localStorage.setItem('ar-best', v); } catch {} }
  };
  let best = store.get();
  bestEl.textContent = best;

  let ship, rocks, gems, shots, parts, bg, score, lives, t, running = false, visible = true, last = 0, keys = {}, fireCd = 0, inv = 0, shake = 0;

  bg = Array.from({ length: 90 }, () => ({ x: Math.random() * W, y: Math.random() * H, s: Math.random() * 1.6 + .2 }));

  function reset() {
    ship = { x: W / 2, y: H - 60, tx: W / 2, ty: H - 60 };
    rocks = []; gems = []; shots = []; parts = [];
    score = 0; lives = 3; t = 0; inv = 60;
    scoreEl.textContent = 0;
  }

  function rock() {
    const r = 12 + Math.random() * 26, n = 9, pts = [];
    for (let i = 0; i < n; i++) pts.push(r * (.7 + Math.random() * .35));
    return { x: Math.random() * (W - 40) + 20, y: -r, r, pts, a: 0, va: (Math.random() - .5) * .05,
      vy: 1.4 + Math.random() * 1.6 + t / 1800, vx: (Math.random() - .5) * 1.2, hp: r > 26 ? 2 : 1 };
  }

  function boom(x, y, c, n = 14) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.283, s = Math.random() * 3.5 + .5;
      parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, l: 1, c });
    }
  }

  function fire() {
    if (fireCd > 0 || !running) return;
    shots.push({ x: ship.x - 9, y: ship.y - 10 }, { x: ship.x + 9, y: ship.y - 10 });
    fireCd = 9;
  }

  function update() {
    t++;
    // input
    if (keys.ArrowLeft || keys.a) ship.tx -= 7;
    if (keys.ArrowRight || keys.d) ship.tx += 7;
    if (keys.ArrowUp || keys.w) ship.ty -= 6;
    if (keys.ArrowDown || keys.s) ship.ty += 6;
    if (keys[' ']) fire();
    ship.tx = Math.max(20, Math.min(W - 20, ship.tx));
    ship.ty = Math.max(H * .45, Math.min(H - 24, ship.ty));
    ship.x += (ship.tx - ship.x) * .22; ship.y += (ship.ty - ship.y) * .22;
    if (fireCd > 0) fireCd--;
    if (inv > 0) inv--;

    // spawns ramp with time
    if (Math.random() < .022 + t / 60000) rocks.push(rock());
    if (Math.random() < .006) gems.push({ x: Math.random() * (W - 40) + 20, y: -10, a: 0 });

    shots.forEach(s => (s.y -= 11));
    shots = shots.filter(s => s.y > -10);

    for (const r of rocks) {
      r.y += r.vy; r.x += r.vx; r.a += r.va;
      for (const s of shots) {
        if (!s.dead && Math.hypot(s.x - r.x, s.y - r.y) < r.r) {
          s.dead = true; r.hp--;
          boom(s.x, s.y, '#9b7bff', 4);
          if (r.hp <= 0) { r.dead = true; score += Math.round(40 - r.r); boom(r.x, r.y, '#b9c3ff', 18); }
        }
      }
      if (!r.dead && inv === 0 && Math.hypot(ship.x - r.x, ship.y - r.y) < r.r + 10) {
        r.dead = true; lives--; inv = 90; shake = 14;
        boom(ship.x, ship.y, '#ffb86b', 30);
        if (lives <= 0) return over();
      }
    }
    shots = shots.filter(s => !s.dead);
    rocks = rocks.filter(r => !r.dead && r.y < H + 50);

    for (const g of gems) {
      g.y += 2.2; g.a += .08;
      if (Math.hypot(ship.x - g.x, ship.y - g.y) < 22) { g.dead = true; score += 100; boom(g.x, g.y, '#ffb86b', 12); }
    }
    gems = gems.filter(g => !g.dead && g.y < H + 20);

    parts.forEach(p => { p.x += p.vx; p.y += p.vy; p.l -= .025; });
    parts = parts.filter(p => p.l > 0);

    if (t % 6 === 0) score++;
    scoreEl.textContent = score;
  }

  function draw() {
    ctx.save();
    if (shake > 0) { ctx.translate((Math.random() - .5) * shake, (Math.random() - .5) * shake); shake *= .85; if (shake < .5) shake = 0; }
    ctx.fillStyle = '#02030a'; ctx.fillRect(-20, -20, W + 40, H + 40);
    for (const s of bg) {
      s.y += s.s * (running ? 1.2 : .3);
      if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
      ctx.fillStyle = `rgba(220,230,255,${s.s / 2})`;
      ctx.fillRect(s.x, s.y, s.s, s.s * (running ? 3 : 1));
    }

    // gems
    for (const g of gems) {
      ctx.save(); ctx.translate(g.x, g.y); ctx.rotate(g.a);
      ctx.fillStyle = '#ffb86b'; ctx.shadowColor = '#ffb86b'; ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(7, 0); ctx.lineTo(0, 9); ctx.lineTo(-7, 0); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    // rocks
    for (const r of rocks) {
      ctx.save(); ctx.translate(r.x, r.y); ctx.rotate(r.a);
      ctx.strokeStyle = r.hp > 1 ? '#9b7bff' : '#b9c3ff'; ctx.lineWidth = 2; ctx.fillStyle = 'rgba(20,24,52,.9)';
      ctx.beginPath();
      r.pts.forEach((d, i) => { const a = i / r.pts.length * 6.283; i ? ctx.lineTo(Math.cos(a) * d, Math.sin(a) * d) : ctx.moveTo(Math.cos(a) * d, Math.sin(a) * d); });
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();
    }
    // shots
    ctx.fillStyle = '#5ef2ff'; ctx.shadowColor = '#5ef2ff'; ctx.shadowBlur = 10;
    for (const s of shots) ctx.fillRect(s.x - 1.5, s.y - 8, 3, 12);
    ctx.shadowBlur = 0;
    // particles
    for (const p of parts) { ctx.globalAlpha = p.l; ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, 2.5, 2.5); }
    ctx.globalAlpha = 1;
    // ship
    if (running && !(inv > 0 && Math.floor(inv / 5) % 2)) {
      ctx.save(); ctx.translate(ship.x, ship.y);
      const fl = 8 + Math.random() * 8;
      ctx.fillStyle = '#ffb86b'; ctx.beginPath(); ctx.moveTo(-5, 12); ctx.lineTo(0, 12 + fl); ctx.lineTo(5, 12); ctx.fill();
      ctx.fillStyle = '#e8ecff'; ctx.strokeStyle = '#5ef2ff'; ctx.lineWidth = 2; ctx.shadowColor = '#5ef2ff'; ctx.shadowBlur = 16;
      ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(14, 12); ctx.lineTo(0, 6); ctx.lineTo(-14, 12); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();
    }
    // lives
    ctx.fillStyle = '#5ef2ff'; ctx.font = '14px JetBrains Mono, monospace';
    if (running) ctx.fillText('♥'.repeat(lives), 14, 24);
    ctx.restore();
  }

  function loop(now) {
    if (visible) {
      // fixed ~60fps step so speed is the same on 120Hz screens
      if (now - last > 14) { if (running) update(); draw(); last = now; }
    }
    requestAnimationFrame(loop);
  }

  function over() {
    running = false;
    if (score > best) { best = score; store.set(best); bestEl.textContent = best; }
    overlay.querySelector('h3').textContent = `Hull breached — ${score}`;
    overlay.querySelector('p').innerHTML = score >= best && score > 0 ? 'New best on this device ✦' : `Best: ${best}. One more run?`;
    startBtn.textContent = 'Relaunch ▸';
    overlay.classList.remove('off');
  }

  function start() { reset(); running = true; overlay.classList.add('off'); cv.focus({ preventScroll: true }); }
  startBtn.addEventListener('click', start);

  // pointer: ship follows, press fires
  const toGame = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; };
  let holding = false;
  cv.addEventListener('pointermove', e => { if (!running) return; const p = toGame(e); ship.tx = p.x; ship.ty = p.y; });
  cv.addEventListener('pointerdown', e => { if (!running) return; const p = toGame(e); ship.tx = p.x; ship.ty = p.y; holding = true; fire(); });
  addEventListener('pointerup', () => (holding = false));
  setInterval(() => holding && fire(), 60);

  cv.tabIndex = 0;
  addEventListener('keydown', e => {
    if (!running || !visible) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'a', 'd', 'w', 's'].includes(k)) { keys[k] = true; e.preventDefault(); }
  });
  addEventListener('keyup', e => { keys[e.key.length === 1 ? e.key.toLowerCase() : e.key] = false; });

  // pause the run while scrolled away
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(cv);

  reset();
  requestAnimationFrame(loop);
})();
