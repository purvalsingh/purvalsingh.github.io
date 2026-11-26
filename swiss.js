// Swiss portfolio: copy-to-clipboard, count-up numerals, active nav, grid overlay, game dialog.
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // toast
  const toast = $('#toast'); let tt;
  const say = msg => { toast.textContent = msg; toast.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('on'), 2200); };

  // copy email
  $$('.copy').forEach(b => b.addEventListener('click', async () => {
    const text = b.dataset.copy;
    try { await navigator.clipboard.writeText(text); say('Email copied: ' + text); }
    catch { location.href = 'mailto:' + text; }
  }));

  // count-up numerals (text is already final; this only replays it once on view)
  if (!reduce && 'IntersectionObserver' in window) {
    const fmt = (v, dec) => dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-US');
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target, end = +el.dataset.count, dec = +(el.dataset.dec || 0), t0 = performance.now(), dur = 1100;
      io.unobserve(el);
      const step = now => {
        const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(end * e, dec);
        if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(end, dec);
      };
      requestAnimationFrame(step);
    }), { threshold: .6 });
    $$('[data-count]').forEach(el => io.observe(el));
  }

  // active nav link
  const links = $$('.nav nav a');
  const secs = $$('main section[id]');
  let spyQueued = false;
  const spy = () => {
    spyQueued = false;
    let cur = '';
    secs.forEach(s => { if (s.getBoundingClientRect().top < innerHeight * .4) cur = s.id; });
    links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + cur));
  };
  addEventListener('scroll', () => { if (!spyQueued) { spyQueued = true; requestAnimationFrame(spy); } }, { passive: true });
  spy();

  // fallback progress bar where scroll timelines are unsupported
  if (!CSS.supports('animation-timeline: scroll()')) {
    const bar = $('.progress');
    const upd = () => { const h = document.documentElement.scrollHeight - innerHeight; bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`; };
    addEventListener('scroll', upd, { passive: true }); upd();
  }

  // G toggles the 12-column grid
  addEventListener('keydown', e => {
    if (e.key.toLowerCase() !== 'g' || e.metaKey || e.ctrlKey || e.altKey) return;
    if (/input|textarea|select/i.test(document.activeElement.tagName)) return;
    if ($('#gameDialog').open) return;
    document.body.classList.toggle('show-grid');
  });

  // game dialog
  const dlg = $('#gameDialog');
  $('#eggBtn').addEventListener('click', () => dlg.showModal());
  $('#gameClose').addEventListener('click', () => dlg.close());
})();
