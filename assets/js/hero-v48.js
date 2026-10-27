(() => {
  'use strict';
  const host = document.querySelector('[data-cinema]');
  if (!host) return;
  const config = window.FRAME_HERO_V48 || {};
  const clips = (config.clips || []).filter(c => c && typeof c.src === 'string' && c.src.trim());
  const videos = [...host.querySelectorAll('.cinema-clip')];
  const button = host.querySelector('.cinema-toggle');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let active = 0, index = 0, visible = true, paused = false, stopped = false;
  let busy = false, generation = 0;
  const allowed = () => !paused && !stopped && visible && !document.hidden && !reduced.matches && !navigator.connection?.saveData;
  function fallback(reason) {
    host.dataset.cinemaState = reason?.name || 'fallback';
    generation++;
    stopped = true;
    busy = false;
    videos.forEach(v => { v.pause(); v.classList.remove('is-active'); v.removeAttribute('src'); v.load(); });
    button.hidden = true;
  }
  function load(slot, n) {
    const v = videos[slot];
    v.pause();
    v.muted = true;
    v.loop = false; // The playlist, rather than each individual clip, loops.
    v.autoplay = false; // Explicit play below obeys visibility and user preferences.
    v.src = clips[n].src;
    v.preload = 'auto';
    v.load();
  }
  function sync() {
    videos.forEach((v, i) => {
      if (i === active && allowed() && v.hasAttribute('src')) v.play().catch(error => {
        if (error.name !== 'AbortError') fallback(error);
      });
      else v.pause();
    });
  }
  async function advance() {
    if (busy || !allowed()) return;
    const next = index + 1 < clips.length ? index + 1 : (config.loop !== false ? 0 : -1);
    if (next < 0) { paused = true; sync(); button.textContent = 'Reiniciar vídeo'; return; }
    busy = true;
    const token = generation;
    const slot = 1 - active;
    const v = videos[slot];
    let timeout;
    try {
      await new Promise((resolve, reject) => {
        const clean = () => { clearTimeout(timeout); v.removeEventListener('canplay', ready); v.removeEventListener('error', fail); };
        const ready = () => { clean(); resolve(); };
        const fail = () => { clean(); reject(new Error('clip unavailable')); };
        timeout = setTimeout(fail, 12000);
        v.addEventListener('canplay', ready, {once:true});
        v.addEventListener('error', fail, {once:true});
        load(slot, next);
      });
      if (token !== generation || !allowed()) { busy = false; return; }
      await v.play();
      if (token !== generation || !allowed()) { v.pause(); busy = false; return; }
      const old = videos[active];
      active = slot;
      index = next;
      v.classList.add('is-active');
      old.classList.remove('is-active');
      setTimeout(() => { old.pause(); busy = false; }, Math.max(0, Number(config.transitionMs) || 450));
    } catch (_) { fallback(); }
  }
  videos.forEach((v, slot) => {
    v.addEventListener('error', fallback);
    v.addEventListener('stalled', () => { /* Keep last decoded frame while buffering. */ });
    v.addEventListener('playing', () => {
      if (slot === active && allowed()) { v.classList.add('is-active'); button.hidden = false; }
      else if (!allowed()) v.pause();
    });
    v.addEventListener('timeupdate', () => {
      const end = Math.min(Number(clips[index]?.duration) || 8, v.duration || Infinity);
      if (slot === active && v.currentTime >= end) advance();
    });
    v.addEventListener('ended', () => { if (slot === active) advance(); });
  });
  button.addEventListener('click', () => {
    paused = !paused;
    if (!paused && videos[active].ended) videos[active].currentTime = 0;
    button.setAttribute('aria-pressed', String(paused));
    button.textContent = paused ? 'Reproduzir vídeo' : 'Pausar vídeo';
    sync();
  });
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', () => { if (reduced.matches) fallback(); });
  navigator.connection?.addEventListener('change', () => { if (navigator.connection.saveData) fallback(); });
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    sync();
  }, {threshold:0.05}).observe(host);
  if (!clips.length || reduced.matches || navigator.connection?.saveData) return;
  host.style.setProperty('--cinema-fade', `${Number(config.transitionMs) || 450}ms`);
  load(0, 0);
  sync();
})();
