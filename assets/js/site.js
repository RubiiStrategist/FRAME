(() => {
  const body = document.body;
  const menuToggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.menu-overlay');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  requestAnimationFrame(() => body.classList.add('motion-ready'));

  /* -------------------------------------------------------------
     HEADER
     ------------------------------------------------------------- */
  const header = document.querySelector('.site-header');
  const syncHeader = () => header?.classList.toggle('scrolled', scrollY > 24);
  syncHeader();
  addEventListener('scroll', syncHeader, {passive:true});

  /* -------------------------------------------------------------
     MENU
     ------------------------------------------------------------- */
  let menuCloseTimer = 0;
  let menuLastFocus = null;
  const menuVideo = menu?.querySelector('.menu-media-video');
  const menuLabel = menuToggle?.querySelector('span:first-child');

  const markCurrentMenuItem = () => {
    if (!menu) return;
    const file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    menu.querySelectorAll('.menu-primary a[data-page]').forEach(a => {
      const target = (a.dataset.page || '').toLowerCase();
      a.classList.toggle('is-current', target !== 'about' && target === file);
    });
  };
  markCurrentMenuItem();

  const toggleMenu = open => {
    if (!menu || !menuToggle) return;
    clearTimeout(menuCloseTimer);
    if (open) {
      // Mount first, paint the CLOSED state, then trigger the OPEN state.
      // This extra paint is important on Chrome/Windows; without it, the
      // browser can skip straight to the final menu frame and the motion
      // looks like a hard cut.
      menuLastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : menuToggle;
      body.classList.add('menu-open');
      menu.removeAttribute('inert');
      menu.setAttribute('aria-hidden','false');
      menu.classList.remove('closing','open');
      menu.classList.add('mounted');
      menu.getBoundingClientRect(); // force the mounted/closed frame to exist
      requestAnimationFrame(() => {
        requestAnimationFrame(() => menu.classList.add('open'));
      });
      menuToggle.setAttribute('aria-expanded','true');
      menuToggle.setAttribute('aria-label','Fechar menu');
      if (menuLabel) menuLabel.textContent = 'Menu';
      menuVideo?.play().catch(() => {});
      setTimeout(() => {
        const first = menu.querySelector('.menu-primary a.is-current, .menu-primary a, .menu-secondary a');
        first?.focus({preventScroll:true});
      }, reduced ? 0 : 520);
    } else {
      menu.classList.add('closing');
      menu.classList.remove('open');
      menuToggle.setAttribute('aria-expanded','false');
      menuToggle.setAttribute('aria-label','Abrir menu');
      if (menuLabel) menuLabel.textContent = 'Menu';
      menuCloseTimer = setTimeout(() => {
        menu.classList.remove('mounted','closing');
        body.classList.remove('menu-open');
        menu.setAttribute('aria-hidden','true');
        menu.setAttribute('inert','');
        menuVideo?.pause();
        if (menuLastFocus?.focus) menuLastFocus.focus({preventScroll:true});
      }, 1080);
    }
  };
  menuToggle?.addEventListener('click', () => toggleMenu(!menu?.classList.contains('open')));
  menu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));
  addEventListener('keydown', e => {
    if (!menu?.classList.contains('open')) return;
    if (e.key === 'Escape') { e.preventDefault(); toggleMenu(false); return; }
    if (e.key !== 'Tab') return;
    const focusable = [...menu.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(el => !el.hasAttribute('inert'));
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* -------------------------------------------------------------
     SCROLL REVEALS — progressive instead of binary
     Elements below the hero gradually resolve as the viewport reaches them.
     ------------------------------------------------------------- */
  const revealEls = [...document.querySelectorAll('.reveal')];
  const scrubRevealEls = revealEls.filter(el => !el.closest('.hero'));

  // Fallback for browsers where the scrub loop is paused / reduced motion.
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('in');
  }), {threshold:.04, rootMargin:'0px 0px 6%'});
  revealEls.forEach(el => io.observe(el));

  let revealRAF = 0;
  const clamp01 = n => Math.max(0, Math.min(1, n));
  const easeOutQuart = t => 1 - Math.pow(1 - t, 4);
  const paintReveals = () => {
    revealRAF = 0;
    if (reduced) return;
    const vh = innerHeight || 1;
    const start = vh * .96;
    const finish = vh * .57;
    scrubRevealEls.forEach((el, index) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -120) {
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.style.filter = 'none';
        el.style.clipPath = 'inset(0 0 0 0)';
        return;
      }
      if (r.top > vh + 160) return;
      const groupDelay = el.matches('.case-duo,.capability-card-v22') ? (index % 2) * .055 : 0;
      const raw = clamp01((start - r.top) / Math.max(1, start - finish) - groupDelay);
      const p = easeOutQuart(raw);
      const y = (1 - p) * 54;
      const scale = .986 + p * .014;
      const blur = (1 - p) * 9;
      el.style.opacity = String(.035 + p * .965);
      el.style.transform = `translate3d(0,${y}px,0) scale(${scale})`;
      el.style.filter = `blur(${blur}px)`;
      el.style.clipPath = `inset(${(1-p)*5.5}% 0 0 0)`;
      if (raw >= .995) {
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.style.filter = 'none';
        el.style.clipPath = 'inset(0 0 0 0)';
      }
    });
  };
  const queueRevealPaint = () => { if (!revealRAF) revealRAF = requestAnimationFrame(paintReveals); };
  addEventListener('scroll', queueRevealPaint, {passive:true});
  addEventListener('resize', queueRevealPaint, {passive:true});
  requestAnimationFrame(paintReveals);

  /* -------------------------------------------------------------
     CUSTOM CURSOR
     ------------------------------------------------------------- */
  const cursor = document.querySelector('.frame-cursor');
  if (cursor && !reduced && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    addEventListener('mousemove', e => { cursor.style.left = `${e.clientX}px`; cursor.style.top = `${e.clientY}px`; }, {passive:true});
    document.querySelectorAll('[data-cursor]').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('show'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('show'));
    });
  }

  /* -------------------------------------------------------------
     V30 — RELIABLE NATIVE SCROLL + CINEMATIC VISUAL MOTION
     -------------------------------------------------------------
     Important: do not intercept the desktop mouse wheel. Chrome/Windows
     wheel behavior can vary a lot and a preventDefault-based loop can trap
     the page. Native scrolling now owns the actual page position on every
     device. The cinematic feeling stays in the progressive reveals, hero
     depth and parallax, so motion remains smooth without risking a freeze.
     ------------------------------------------------------------- */
  document.documentElement.classList.remove('frame-inertia-active');

  const maxY = () => Math.max(0, document.documentElement.scrollHeight - innerHeight);
  const clampY = y => Math.min(maxY(), Math.max(0, y));
  const smoothTo = y => {
    window.scrollTo({
      left: 0,
      top: clampY(y),
      behavior: reduced ? 'auto' : 'smooth'
    });
  };

  document.querySelectorAll('a[href^="#"]:not([data-contact])').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      const y = el.getBoundingClientRect().top + scrollY;
      smoothTo(y);
      history.replaceState(null, '', id);
    });
  });

  /* -------------------------------------------------------------
     CONTACT / FRAME BRIEFING
     ------------------------------------------------------------- */
  const dialog = document.getElementById('contactDialog');
  const form = document.getElementById('contactForm');
  const steps = [...(form?.querySelectorAll('.briefing-step') || [])];
  const progressSteps = [...(form?.querySelectorAll('.briefing-progress span') || [])];
  const progressLines = [...(form?.querySelectorAll('.briefing-progress i') || [])];
  const count = form?.querySelector('.briefing-step-count');
  const nextBtn = form?.querySelector('.briefing-next');
  const backBtn = form?.querySelector('.briefing-back');
  const submitBtn = form?.querySelector('.briefing-submit');
  let briefingStep = 0;
  let contactLastFocus = null;

  const setBriefingStep = index => {
    briefingStep = Math.max(0, Math.min(steps.length - 1, index));
    steps.forEach((step, i) => {
      step.classList.toggle('is-active', i === briefingStep);
      step.classList.toggle('is-before', i < briefingStep);
    });
    progressSteps.forEach((el, i) => el.classList.toggle('is-active', i <= briefingStep));
    progressLines.forEach((el, i) => el.classList.toggle('is-active', i < briefingStep));
    if (count) count.textContent = `${String(briefingStep + 1).padStart(2,'0')} / ${String(steps.length).padStart(2,'0')}`;
    if (backBtn) backBtn.hidden = briefingStep === 0;
    if (nextBtn) nextBtn.hidden = briefingStep === steps.length - 1;
    if (submitBtn) submitBtn.hidden = briefingStep !== steps.length - 1;
  };

  const validateBriefingStep = () => {
    const active = steps[briefingStep];
    if (!active) return true;
    const required = [...active.querySelectorAll('[required]')];
    for (const field of required) {
      if (field.type === 'radio') {
        const group = active.querySelectorAll(`input[type="radio"][name="${field.name}"]`);
        if (![...group].some(r => r.checked)) {
          field.setCustomValidity('Escolha uma opção para continuar.');
          field.reportValidity();
          field.setCustomValidity('');
          return false;
        }
      } else if (!field.checkValidity()) {
        field.reportValidity();
        return false;
      }
    }
    return true;
  };

  const openContact = () => {
    if (!dialog) return;
    contactLastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setBriefingStep(0);
    dialog.showModal ? dialog.showModal() : dialog.setAttribute('open','');
    requestAnimationFrame(() => dialog.querySelector('input,button,textarea,[tabindex]')?.focus({preventScroll:true}));
  };
  const closeContact = () => {
    if (!dialog?.open) return;
    dialog.close();
  };
  document.querySelectorAll('[data-contact]').forEach(el => el.addEventListener('click', e => { e.preventDefault(); openContact(); }));
  dialog?.querySelector('.contact-close')?.addEventListener('click', closeContact);
  dialog?.addEventListener('click', e => { if(e.target === dialog) closeContact(); });
  dialog?.addEventListener('close', () => { if (contactLastFocus?.focus) contactLastFocus.focus({preventScroll:true}); });
  nextBtn?.addEventListener('click', () => { if (validateBriefingStep()) setBriefingStep(briefingStep + 1); });
  backBtn?.addEventListener('click', () => setBriefingStep(briefingStep - 1));

  form?.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateBriefingStep() || !form.reportValidity()) return;
    const fd = new FormData(form);
    const txt = `Olá! Quero iniciar um projeto com a FRAME.\n\nNome: ${fd.get('name')||''}\nEmpresa: ${fd.get('company')||''}\nInteresse: ${fd.get('service')||''}\n\nDetalhes do projeto:\n${fd.get('message')||''}`;
    window.open(`https://api.whatsapp.com/send?phone=5519974123215&text=${encodeURIComponent(txt)}`,'_blank','noopener');
  });

  setBriefingStep(0);

  /* -------------------------------------------------------------
     HERO DEPTH
     ------------------------------------------------------------- */
  const heroVideo = document.querySelector('.hero video');
  const heroMidline = document.querySelector('.hero-midline');
  if(heroVideo && !reduced){
    let heroRAF = 0;
    const paintHero = () => {
      heroRAF = 0;
      const p = Math.min(1, Math.max(0, scrollY / Math.max(1, innerHeight * .82)));
      heroVideo.style.transform = `scale(${1.015 + p*.035}) translate3d(0,${p*14}px,0)`;
      if (heroMidline) {
        heroMidline.style.opacity = String(1 - p*.82);
        heroMidline.style.transform = `translate3d(0,${p*-18}px,0) scale(${1-p*.018})`;
      }
    };
    const qHero = () => { if(!heroRAF) heroRAF=requestAnimationFrame(paintHero); };
    addEventListener('scroll', qHero, {passive:true});
    addEventListener('resize', qHero, {passive:true});
    paintHero();
  }


  /* -------------------------------------------------------------
     V25 MOTION DESIGN — stagger, parallax, magnetic details
     ------------------------------------------------------------- */
  if (!reduced) {
    // Stagger children inside key editorial groups.
    const staggerGroups = document.querySelectorAll('.cases-duo-grid, .capability-cards-v22, .trust-grid, .about-clean-grid, .about-personal-top, .about-story-columns');
    staggerGroups.forEach(group => {
      [...group.children].forEach((child, i) => {
        child.style.transitionDelay = `${Math.min(i * 70, 280)}ms`;
      });
    });

    // Soft viewport parallax on the most cinematic media only.
    const parallaxMedia = [...document.querySelectorAll('.about-clean-media img, .about-personal-media img, .cta-clean-card > img, .capability-media-v22 > img')];
    let motionRAF = 0;
    const paintAnimação = () => {
      const vh = innerHeight || 1;
      parallaxMedia.forEach(img => {
        const host = img.parentElement;
        if (!host) return;
        const r = host.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        const center = r.top + r.height / 2;
        const progress = (center - vh / 2) / vh;
        const drift = Math.max(-16, Math.min(16, progress * -18));
        img.style.setProperty('--frame-drift', `${drift}px`);
        if (!host.matches(':hover')) img.style.transform = `translate3d(0,${drift}px,0) scale(1.035)`;
      });
      motionRAF = 0;
    };
    addEventListener('scroll', () => { if (!motionRAF) motionRAF = requestAnimationFrame(paintAnimação); }, {passive:true});
    addEventListener('resize', () => { if (!motionRAF) motionRAF = requestAnimationFrame(paintAnimação); }, {passive:true});
    paintAnimação();

    // Magnetic movement for circular arrows / CTA controls on fine pointers.
    if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
      document.querySelectorAll('.capability-arrow-v22, .cta-clean-button, .clean-link').forEach(el => {
        el.addEventListener('mousemove', e => {
          const r = el.getBoundingClientRect();
          const x = (e.clientX - (r.left + r.width/2)) * .12;
          const y = (e.clientY - (r.top + r.height/2)) * .12;
          el.style.transform = `translate3d(${x}px,${y}px,0)`;
        });
        el.addEventListener('mouseleave', () => { el.style.transform = ''; });
      });
    }
  }

  /* -------------------------------------------------------------
     V39 — PORTFOLIO PREVIEWS: STATIC UNTIL HOVER
     ------------------------------------------------------------- */
  const hoverPreviewCards = document.querySelectorAll('.case-duo');
  hoverPreviewCards.forEach(card => {
    const video = card.querySelector('video[data-hover-video]');
    if (!video) return;
    video.muted = true;
    video.pause();
    const playPreview = () => {
      if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
      const p = video.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    };
    const stopPreview = () => {
      video.pause();
      try { video.currentTime = 0; } catch(_) {}
    };
    card.addEventListener('mouseenter', playPreview);
    card.addEventListener('mouseleave', stopPreview);
    card.addEventListener('focusin', playPreview);
    card.addEventListener('focusout', stopPreview);
    document.addEventListener('visibilitychange', () => { if (document.hidden) stopPreview(); });
  });


  /* -------------------------------------------------------------
     V44 — CLIENT LOGO CROSSFADE
     Rest state uses a real, detail-preserving muted asset instead of a
     CSS white silhouette. Hover/focus fades the original color back in.
     ------------------------------------------------------------- */
  document.querySelectorAll('.case-duo-logo, .trust-logo-card-v40 img').forEach(img => {
    const src = img.getAttribute('src') || '';
    if (!src.includes('assets/clients/') || img.closest('.client-logo-crossfade')) return;

    const stack = document.createElement('span');
    stack.className = 'client-logo-crossfade';

    const muted = img.cloneNode(true);
    muted.src = src.replace('assets/clients/', 'assets/clients-muted/');
    muted.alt = '';
    muted.setAttribute('aria-hidden', 'true');
    muted.classList.add('client-logo-muted');

    img.classList.add('client-logo-color');
    img.parentNode.insertBefore(stack, img);
    stack.appendChild(muted);
    stack.appendChild(img);
  });

  /* -------------------------------------------------------------
     V44 — SLOW PREMIUM DESKTOP SCROLL
     Wheel intensity is normalized and the scroll target is kept close to
     the current frame. The page therefore glides at a calm, predictable
     pace instead of mirroring how aggressively the wheel is spun.
     ------------------------------------------------------------- */
  const premiumScrollMQ = matchMedia('(min-width: 900px) and (hover:hover) and (pointer:fine)');
  if (premiumScrollMQ.matches && !reduced) {
    const root = document.documentElement;
    root.classList.add('frame-premium-scroll');

    let currentY = window.scrollY || 0;
    let targetY = currentY;
    let scrollRAF = 0;
    let lastFrame = performance.now();

    const premiumMaxY = () => Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const premiumClamp = y => Math.min(premiumMaxY(), Math.max(0, y));

    const renderPremiumScroll = now => {
      const dt = Math.min(34, Math.max(8, now - lastFrame));
      lastFrame = now;
      const diff = targetY - currentY;
      // Longer time constant = the quiet, floating movement the site needs.
      const follow = 1 - Math.exp(-dt / 380);
      currentY += diff * follow;

      if (Math.abs(diff) < .22) {
        currentY = targetY;
        window.scrollTo(0, currentY);
        scrollRAF = 0;
        return;
      }

      window.scrollTo(0, currentY);
      scrollRAF = requestAnimationFrame(renderPremiumScroll);
    };

    const queuePremiumScroll = () => {
      if (scrollRAF) return;
      lastFrame = performance.now();
      scrollRAF = requestAnimationFrame(renderPremiumScroll);
    };

    window.addEventListener('wheel', e => {
      if (e.ctrlKey || e.metaKey) return;
      if (document.documentElement.classList.contains('frame-transition-lock')) return;
      if (document.body.classList.contains('menu-open')) return;
      if (document.querySelector('dialog[open]')) return;

      const modeScale = e.deltaMode === 1 ? 16 : (e.deltaMode === 2 ? innerHeight : 1);
      const raw = e.deltaY * modeScale;
      if (Math.abs(raw) < .01) return;

      e.preventDefault();

      if (!scrollRAF) {
        currentY = window.scrollY || 0;
        targetY = currentY;
      }

      const magnitude = Math.abs(raw);
      // Fine trackpad input remains proportional; a mouse-wheel notch gets a
      // consistent step so the page never accelerates wildly.
      const impulse = magnitude < 28
        ? raw * .68
        : Math.sign(raw) * 72;

      const maxLead = Math.min(470, innerHeight * .52);
      targetY = premiumClamp(targetY + impulse);
      targetY = Math.max(currentY - maxLead, Math.min(currentY + maxLead, targetY));
      queuePremiumScroll();
    }, { passive:false });

    window.addEventListener('scroll', () => {
      if (scrollRAF) return;
      currentY = targetY = window.scrollY || 0;
    }, { passive:true });

    window.addEventListener('resize', () => {
      targetY = premiumClamp(targetY);
      currentY = premiumClamp(window.scrollY || currentY);
    }, { passive:true });
  }

  /* -------------------------------------------------------------
     V44 — FLUID CLIENT RAIL
     Drag follows through a soft spring, dots travel continuously with the
     rail, and settling uses a long sine ease instead of a snap/cut.
     ------------------------------------------------------------- */
  const trustCarousel = document.querySelector('.trust-carousel-v40');
  if (trustCarousel) {
    const viewport = trustCarousel.querySelector('.trust-carousel-viewport-v40');
    const track = trustCarousel.querySelector('.trust-carousel-track-v40');
    const pages = [...trustCarousel.querySelectorAll('.trust-carousel-page-v40')];
    const dotsWrap = trustCarousel.querySelector('.trust-carousel-dots-v40');
    const dots = [...trustCarousel.querySelectorAll('.trust-carousel-dot-v40')];

    let active = 0;
    let currentX = 0;
    let desiredX = 0;
    let dragging = false;
    let pointerId = null;
    let startX = 0;
    let startY = 0;
    let startTranslate = 0;
    let lastX = 0;
    let lastTime = 0;
    let velocityX = 0;
    let moved = false;
    let horizontalIntent = false;
    let motionRAF = 0;
    let settleToken = 0;

    const pageWidth = () => Math.max(1, pages[0]?.getBoundingClientRect().width || viewport?.clientWidth || 1);
    const clampPage = n => Math.max(0, Math.min(pages.length - 1, n));
    const targetFor = index => -clampPage(index) * pageWidth();
    const clampX = x => Math.max(targetFor(pages.length - 1), Math.min(0, x));
    const easeInOutSine = t => -(Math.cos(Math.PI * t) - 1) / 2;

    const paintRail = x => {
      currentX = x;
      if (track) track.style.transform = `translate3d(${x}px,0,0)`;
      const w = pageWidth();
      const progress = Math.max(0, Math.min(pages.length - 1, Math.abs(x) / w));
      dotsWrap?.style.setProperty('--trust-progress', progress.toFixed(4));
      pages.forEach((page, i) => {
        const away = Math.min(1, Math.abs(progress - i));
        page.style.opacity = String(1 - away * .13);
        page.style.filter = `blur(${(away * .55).toFixed(2)}px)`;
      });
    };

    const stopMotion = () => {
      settleToken++;
      if (motionRAF) cancelAnimationFrame(motionRAF);
      motionRAF = 0;
      trustCarousel.classList.remove('is-settling');
    };

    const updateUI = index => {
      active = clampPage(index);
      dots.forEach((dot, i) => {
        const on = i === active;
        dot.classList.toggle('is-active', on);
        dot.setAttribute('aria-current', on ? 'true' : 'false');
      });
      pages.forEach((page, i) => {
        const on = i === active;
        page.classList.toggle('is-active', on);
        page.setAttribute('aria-hidden', on ? 'false' : 'true');
        page.toggleAttribute('inert', !on);
      });
    };

    const animateTo = (index, opts={}) => {
      index = clampPage(index);
      stopMotion();
      const token = ++settleToken;
      const from = currentX;
      const to = targetFor(index);
      desiredX = to;
      updateUI(index);

      if (reduced || opts.instant || Math.abs(to - from) < .25) {
        paintRail(to);
        return;
      }

      const distance = Math.abs(to - from);
      const duration = Math.max(1380, Math.min(2050, 1460 + distance * .19));
      const start = performance.now();
      trustCarousel.classList.add('is-settling');

      const tick = now => {
        if (token !== settleToken) return;
        const t = Math.min(1, (now - start) / duration);
        const e = easeInOutSine(t);
        paintRail(from + (to - from) * e);
        if (t < 1) {
          motionRAF = requestAnimationFrame(tick);
        } else {
          motionRAF = 0;
          paintRail(to);
          trustCarousel.classList.remove('is-settling');
        }
      };
      motionRAF = requestAnimationFrame(tick);
    };

    const runDragSpring = () => {
      if (!dragging) { motionRAF = 0; return; }
      const diff = desiredX - currentX;
      currentX += diff * .31;
      paintRail(currentX);
      motionRAF = requestAnimationFrame(runDragSpring);
    };

    viewport?.querySelectorAll('img,a').forEach(el => {
      el.setAttribute('draggable','false');
      el.addEventListener('dragstart', e => e.preventDefault());
    });

    dots.forEach((dot, index) => dot.addEventListener('click', () => animateTo(index)));

    viewport?.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); animateTo(active + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); animateTo(active - 1); }
    });

    viewport?.addEventListener('pointerdown', e => {
      if (e.button !== undefined && e.button !== 0) return;
      stopMotion();
      dragging = true;
      pointerId = e.pointerId;
      startX = lastX = e.clientX;
      startY = e.clientY;
      startTranslate = currentX;
      desiredX = currentX;
      lastTime = performance.now();
      velocityX = 0;
      moved = false;
      horizontalIntent = false;
      viewport.classList.add('is-dragging');
      try { viewport.setPointerCapture?.(pointerId); } catch (_) {}
      motionRAF = requestAnimationFrame(runDragSpring);
    });

    viewport?.addEventListener('pointermove', e => {
      if (!dragging || (pointerId !== null && e.pointerId !== pointerId)) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (!horizontalIntent && Math.hypot(dx,dy) > 4) {
        horizontalIntent = Math.abs(dx) > Math.abs(dy) * .9;
      }
      if (!horizontalIntent) return;
      e.preventDefault();

      const now = performance.now();
      const dt = Math.max(8, now - lastTime);
      const inst = (e.clientX - lastX) / dt;
      velocityX = velocityX * .82 + inst * .18;
      lastX = e.clientX;
      lastTime = now;
      moved = moved || Math.abs(dx) > 6;

      let next = startTranslate + dx * .9;
      const min = targetFor(pages.length - 1);
      if (next > 0) next *= .12;
      if (next < min) next = min + (next - min) * .12;
      desiredX = next;
    }, { passive:false });

    const finishDrag = () => {
      if (!dragging) return;
      dragging = false;
      viewport?.classList.remove('is-dragging');
      try { if (pointerId !== null) viewport?.releasePointerCapture?.(pointerId); } catch (_) {}
      if (motionRAF) { cancelAnimationFrame(motionRAF); motionRAF = 0; }
      // Paint once toward the pointer target before the long settle so release
      // never feels like a cut from a lagging frame.
      paintRail(currentX + (desiredX - currentX) * .55);

      const width = pageWidth();
      const projected = clampX(desiredX + velocityX * 190);
      let next = Math.round(Math.abs(projected) / width);
      if (!horizontalIntent || !moved) next = active;
      animateTo(next);

      pointerId = null;
      setTimeout(() => { moved = false; }, 320);
    };

    viewport?.addEventListener('pointerup', finishDrag);
    viewport?.addEventListener('pointercancel', finishDrag);
    viewport?.addEventListener('lostpointercapture', () => { if (dragging) finishDrag(); });

    viewport?.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', e => {
        if (!moved) return;
        e.preventDefault();
        e.stopPropagation();
      }, true);
    });

    let resizeTimer = 0;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        stopMotion();
        desiredX = targetFor(active);
        paintRail(desiredX);
      }, 140);
    });

    updateUI(0);
    desiredX = 0;
    paintRail(0);
  }

})();
