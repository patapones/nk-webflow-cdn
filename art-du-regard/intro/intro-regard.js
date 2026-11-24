/*!
 * Intro « L'Art du Regard » (v19, validée par Kevin le 04/11/2026) · module NK Studio créa, ciblage data-intro-*
 * Fiche : 13-webflow/demo-intro/FICHE-WEBFLOW-INTRO.md · démo : https://claude.ai/artifact/GvzfLWu4kRTfLBkZyZQYUK
 *
 * Déroulé : fond encre → logo qui naît du centre, lettre à lettre → le logo s'écarte et un masque « écran de cinéma »
 * s'ouvre entre « du » et « Regard » → diaporama de regards (un toutes les 0,44 s, ouverture 1,35 s, dézoom 150 → 100 %)
 * jusqu'au regard du hero → le logo se dissout des lettres extérieures vers le cadre → le masque s'agrandit jusqu'au hero
 * → le menu et les textes du hero apparaissent (opacité, 8 px, flou 6 px).
 *
 * À METTRE DANS LE HEAD CODE DU SITE (script normal, ni async ni defer) : la classe html.nk-intro et le CSS qui cache
 * la page doivent exister avant le premier affichage. Remplace code/intro.js (même principe : accueil seulement,
 * une fois par visite). Branché sur stack-base.js par window.NKIntro (appelé seulement sur un site AVEC Barba).
 * Version Webflow ADR (24/11/2026) : démarre seule si le site n'a pas Barba (pas de stack-base.js) ; [data-intro-under]
 * passe l'en-tête et la barre mobile sous le fond encre pendant l'intro.
 * Dépendance : GSAP (Designer > Settings > GSAP). SplitText facultatif (paragraphe ligne par ligne). Pas de CustomEase :
 * les courbes sur mesure sont calculées ici.
 */
(function () {
  'use strict';

  /* ---------- réglages du site ---------- */
  var ONLY_PATHS = ['/'];          // pages d'arrivée qui jouent l'intro ; null = toutes
  var ONCE_PER_SESSION = true;     // une fois vue, plus jamais de la visite (même accueil rechargé)
  var SAFETY = 15000;              // filet de sécurité (ms) : la page se découvre quoi qu'il arrive

  var html = document.documentElement;

  /* CSS posé tout de suite (Head) : pendant l'intro, la page est cachée sous le fond encre ; sans intro, rien ne change */
  var css = document.createElement('style');
  css.id = 'nk-intro-css';
  css.textContent = [
    '[data-intro],[data-intro-logo],[data-intro-slides]{display:none}',
    'html.nk-intro{overflow:hidden}',
    'html.nk-intro [data-intro]{display:block;position:fixed;inset:0;z-index:50;pointer-events:none}',
    'html.nk-intro [data-intro-logo]{display:block;position:fixed;z-index:53;left:0;top:0;pointer-events:none;transform-origin:0 0;visibility:hidden}',
    'html.nk-intro [data-intro-reveal]{opacity:0}',
    'html.nk-intro [data-intro-under]{z-index:40!important}',
    '[data-intro-logo] [data-intro-word]{position:absolute;inset:0}',
    '[data-intro-logo] svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}',
    '.nk-show{position:fixed;z-index:52;overflow:hidden;pointer-events:none}',
    '.nk-show i{position:absolute;inset:0;background-repeat:no-repeat}'
  ].join('\n');
  (document.head || html).appendChild(css);

  var path = location.pathname.replace(/\/+$/, '') || '/';
  if (ONLY_PATHS && ONLY_PATHS.indexOf(path) === -1) return;
  var seen = false;
  try { seen = ONCE_PER_SESSION && sessionStorage.getItem('nk-intro') === '1'; } catch (e) {}
  if (seen) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return; // mouvement réduit : pas d'intro

  html.classList.add('nk-intro');
  setTimeout(function () { if (!window.__introDone) { html.classList.remove('nk-intro'); window.__introDone = true; } }, SAFETY);
  // stack-base.js n'appelle NKIntro que sur un site avec Barba : sans appel peu après le chargement, on découvre la page
  // sans Barba (pas de stack-base.js) : l'intro démarre seule quand Webflow est prêt
  window.Webflow = window.Webflow || [];
  window.Webflow.push(function () {
    setTimeout(function () {
      if (!window.__introCalled && !window.__introDone && !window.barba && typeof window.NKIntro === 'function') window.NKIntro(document.body, function () {});
    }, 0);
  });
  window.addEventListener('load', function () {
    setTimeout(function () { if (!window.__introCalled && !window.__introDone) { html.classList.remove('nk-intro'); window.__introDone = true; } }, 1500);
  });

  /* courbe de Bézier (équivalent CustomEase) */
  function bez(x1, y1, x2, y2) {
    function a(p, q) { return 1 - 3 * q + 3 * p; } function b(p, q) { return 3 * q - 6 * p; } function c(p) { return 3 * p; }
    function f(t, p, q) { return ((a(p, q) * t + b(p, q)) * t + c(p)) * t; }
    function d(t, p, q) { return 3 * a(p, q) * t * t + 2 * b(p, q) * t + c(p); }
    return function (x) {
      if (x <= 0) return 0; if (x >= 1) return 1;
      var t = x;
      for (var i = 0; i < 8; i++) { var s = d(t, x1, x2); if (Math.abs(s) < 1e-6) break; t -= (f(t, x1, x2) - x) / s; }
      t = Math.min(1, Math.max(0, t));
      return f(t, y1, y2);
    };
  }
  var QUART = bez(.77, 0, .18, 1);   // écartement du logo, ouverture du masque
  var DOUX = bez(.4, 0, .1, 1);      // ouverture du hero : départ en douceur, arrivée très lente

  function num(el, name, d) { var v = el && parseFloat(el.getAttribute(name)); return isNaN(v) ? d : v; }
  function pair(el, name, d) {
    var v = el && el.getAttribute(name); if (!v) return d;
    var p = v.trim().split(/[\s,]+/).map(parseFloat); return p.length === 2 && !isNaN(p[0]) && !isNaN(p[1]) ? p : d;
  }
  // longueur CSS (ex. 26.25rem, 70vw) lue sur une variable ; repli en px à 1440
  function cssLen(el, varName, fallbackPx) {
    var v = getComputedStyle(el).getPropertyValue(varName).trim(); if (!v) return fallbackPx;
    var p = document.createElement('div'); p.style.cssText = 'position:absolute;visibility:hidden;width:' + v;
    document.body.appendChild(p); var w = p.getBoundingClientRect().width; p.remove(); return w || fallbackPx;
  }

  window.NKIntro = function (container, start) {
    window.__introCalled = true;
    var overlay = document.querySelector('[data-intro]'), big = document.querySelector('[data-intro-logo]');
    var hero = document.querySelector('[data-intro-hero]'), himg = hero && hero.querySelector('[data-intro-hero-img]');
    var started = false, finished = false;
    function go() { if (!started) { started = true; start(); } }
    function done() {
      if (finished) return;
      finished = true; window.__introDone = true;
      html.classList.remove('nk-intro');
      if (show) show.remove();
      if (hero) { hero.style.clipPath = ''; hero.style.visibility = ''; hero.style.zIndex = ''; if (heroPos) hero.style.position = ''; }
      gsap.set([overlay, big].concat(reveals, splitLines, letters, words).filter(Boolean), { clearProps: 'all' });
      if (himg) gsap.set(himg, { clearProps: 'transform,transformOrigin' });
      if (split) split.revert();
      if (window.NK) NK.startScroll();
      try { if (ONCE_PER_SESSION) sessionStorage.setItem('nk-intro', '1'); } catch (e) {}
      go();
    }
    var show = null, heroPos = false, reveals = [], splitLines = [], letters = [], words = [], split = null;
    if (!overlay || !big || !hero || !himg || !window.gsap) { html.classList.remove('nk-intro'); window.__introDone = true; return go(); }
    if (window.NK) NK.stopScroll();

    var run = function () {
      /* ---------- repères ---------- */
      var W = innerWidth, H = innerHeight, u = Math.min(W, 1920) / 1440;
      if (getComputedStyle(hero).position === 'static') { hero.style.position = 'relative'; heroPos = true; }
      hero.style.zIndex = 51;                                  // pendant l'intro, le hero passe au-dessus du fond encre
      var hr = hero.getBoundingClientRect();
      var cx = W / 2 - hr.left, cy = H / 2 - hr.top;           // centre de l'écran, dans le repère du hero
      var fw = cssLen(hero, '--intro-frame-w', 420 * u), fh = cssLen(hero, '--intro-frame-h', 210 * u), R = 3 * u;
      var Z = num(himg, 'data-intro-zoom', 1.7);

      /* ---------- masque « écran de cinéma » piloté par ses 4 côtés (jamais par une animation CSS de clip-path) ---------- */
      var M = { w: 0, k: 0 };
      show = document.createElement('div'); show.className = 'nk-show'; show.setAttribute('aria-hidden', 'true');
      document.body.appendChild(show);
      gsap.set(show, { left: W / 2 - fw / 2, top: H / 2 - fh / 2, width: fw, height: fh, borderRadius: R });
      function clip() {
        var t = cy - fh / 2, r = hr.width - cx - M.w / 2, b = hr.height - cy - fh / 2, l = cx - M.w / 2, q = 1 - M.k;
        hero.style.clipPath = 'inset(' + t * q + 'px ' + r * q + 'px ' + b * q + 'px ' + l * q + 'px round ' + (R + R * M.k) + 'px)';
        var sh = (fw - M.w) / 2; show.style.clipPath = 'inset(0px ' + sh + 'px 0px ' + sh + 'px)';
        var shut = M.w < .5 && !M.k;                           // fermé : rien à l'écran (sinon une ligne d'1 px entre « du » et « Regard »)
        hero.style.visibility = shut ? 'hidden' : ''; show.style.visibility = shut ? 'hidden' : '';
      }

      /* ---------- hero : rapproché sur le regard, centré dans le masque ---------- */
      var eyes = pair(himg, 'data-intro-eyes', [.5918, .4601]); // point des yeux, en fractions de l'image affichée
      var ir = himg.getBoundingClientRect();
      var ox = eyes[0] * ir.width, oy = eyes[1] * ir.height;   // dans le repère de l'image
      var ex = ir.left - hr.left + ox, ey = ir.top - hr.top + oy; // dans le repère du hero
      gsap.set(himg, { transformOrigin: ox + 'px ' + oy + 'px', scale: Z, x: cx - ex, y: cy - ey });
      clip();

      /* ---------- diaporama : regards lus dans [data-intro-slides], puis le regard du hero (relais au pixel) ---------- */
      var src = [].slice.call(document.querySelectorAll('[data-intro-slides] img'));
      var slides = src.map(function (img) {
        var i = document.createElement('i'), url = img.getAttribute('src');
        var e = pair(img, 'data-intro-eyes', [.5, .5]), z = num(img, 'data-intro-zoom', 1.06), w = num(img, 'data-intro-warm', 0);
        i.style.backgroundImage = 'url("' + url + '")';
        if (w) i.style.filter = 'sepia(' + w + ') saturate(' + (1 - w / 3) + ')'; // réchauffe vers les teintes du hero
        i._o = { src: url, ex: e[0], ey: e[1], z: z };
        show.appendChild(i); return i;
      });
      var P = [];
      function paint(i) {
        var el = slides[i]; if (!el || !P[i]) return; var q = (1 - P[i].o) * 50, b = el._b;
        el.style.clipPath = 'inset(' + q + '% ' + q + '% ' + q + '% ' + q + '%)';
        if (!b) return; var s = P[i].s;                         // dézoom autour du centre du masque
        el.style.backgroundSize = b.w * s + 'px ' + b.h * s + 'px';
        el.style.backgroundPosition = (fw / 2 - (fw / 2 - b.x) * s) + 'px ' + (fh / 2 - (fh / 2 - b.y) * s) + 'px';
      }
      slides.forEach(function (i, k) {
        var o = i._o, im = new Image();
        var fit = function () {                                 // cadrage sur les yeux, jamais de bord vide
          var kk = Math.max(fw / im.naturalWidth, fh / im.naturalHeight) * o.z, w = im.naturalWidth * kk, h = im.naturalHeight * kk;
          var px = Math.min(0, Math.max(fw - w, fw / 2 - o.ex * w)), py = Math.min(0, Math.max(fh - h, fh / 2 - o.ey * h));
          i._b = { w: w, h: h, x: px, y: py }; paint(k);
        };
        im.onload = fit; im.src = o.src; if (im.complete && im.naturalWidth) fit();
      });
      // dernier regard = la photo du hero telle que le masque la montre (object-fit: cover pris en compte)
      var last = document.createElement('i'), rr = himg.getBoundingClientRect();
      var nw = himg.naturalWidth || rr.width, nh = himg.naturalHeight || rr.height, fit = getComputedStyle(himg).objectFit;
      var bw = rr.width, bh = rr.height, bx = rr.left, by = rr.top;
      if (fit === 'cover' && nw && nh) {
        var kc = Math.max(rr.width / nw, rr.height / nh), op = getComputedStyle(himg).objectPosition.split(' ').map(parseFloat);
        bw = nw * kc; bh = nh * kc; bx = rr.left + (rr.width - bw) * (isNaN(op[0]) ? .5 : op[0] / 100); by = rr.top + (rr.height - bh) * (isNaN(op[1]) ? .5 : op[1] / 100);
      }
      last.style.backgroundImage = 'url("' + (himg.currentSrc || himg.src) + '")';
      last._b = { w: bw, h: bh, x: bx - (W / 2 - fw / 2), y: by - (H / 2 - fh / 2) };
      show.appendChild(last); slides.push(last);
      P = slides.map(function () { return { o: 0, s: 1.5 }; });
      slides.forEach(function (el, i) { P[i].o = i ? 0 : 1; paint(i); });

      /* ---------- logo : l'espace entre « du » et « Regard » tombe au centre de l'écran ---------- */
      gsap.set(big, { autoAlpha: 1, x: 0, y: 0, scale: 1 });
      var lw = big.offsetWidth, lh = big.offsetHeight;
      var GC = num(big, 'data-intro-gap-center', .452), GW = num(big, 'data-intro-gap-width', .0305), GY = num(big, 'data-intro-gap-y', .38);
      gsap.set(big, { left: W / 2 - GC * lw, top: H / 2 - GY * lh });
      words = [].slice.call(big.querySelectorAll('[data-intro-word]'));
      var wa = big.querySelector('[data-intro-word="a"]'), wb = big.querySelector('[data-intro-word="b"]');
      var half = (fw - GW * lw) / 2 + 16 * u;                  // chaque mot s'écarte de la place exacte du masque (+ marge)
      letters = [].slice.call(big.querySelectorAll('[data-intro-letter]'));
      var mid = W / 2;
      letters.forEach(function (el) {
        var shape = el.querySelector('svg') || el, r = shape.getBoundingClientRect();
        el._d = (r.left + r.width / 2) - mid; gsap.set(el, { opacity: 0, x: el._d * .07, filter: 'blur(8px)' });
      });
      var far = Math.max.apply(null, letters.map(function (el) { return Math.abs(el._d); })) || 1;

      /* ---------- apparitions du menu et du hero : [data-intro-reveal] + data-intro-at (s après l'ouverture) ---------- */
      reveals = [].slice.call(document.querySelectorAll('[data-intro-reveal]'));
      var settle = { opacity: 0, y: 8, filter: 'blur(6px)' };
      reveals.forEach(function (el) {
        var kind = el.getAttribute('data-intro-reveal');
        if (kind === 'line') gsap.set(el, { opacity: 1, scaleX: 0, transformOrigin: 'left center' });
        else if (kind === 'badge') gsap.set(el, { opacity: 0, rotate: -50, filter: 'blur(6px)' });
        else if (kind === 'lines' && window.SplitText) {
          split = SplitText.create(el, { type: 'lines' }); splitLines = split.lines;
          gsap.set(el, { opacity: 1 }); gsap.set(splitLines, settle);
        } else gsap.set(el, settle);
      });

      /* ---------- la timeline (valeurs de la v19) ---------- */
      var tl = gsap.timeline({ onComplete: done });
      // 1. le logo naît du centre : les lettres sortent du flou de l'intérieur vers l'extérieur
      letters.forEach(function (el) {
        tl.to(el, { opacity: 1, x: 0, filter: 'blur(0px)', duration: 1.5, ease: 'power2.out' }, .3 + Math.abs(el._d) / far * .75);
      });
      // 2. le logo s'écarte ; le masque s'ouvre depuis le centre, sur le regard
      tl.addLabel('part', 2.15);
      if (wa) tl.to(wa, { x: -half, duration: 1.6, ease: QUART }, 'part');
      if (wb) tl.to(wb, { x: half, duration: 1.6, ease: QUART }, 'part');
      tl.to(M, { w: fw, duration: 1.6, ease: QUART, onUpdate: clip }, 'part');
      // 3. diaporama (cadence realevate) : un regard toutes les GAP s, chacun s'ouvre en REV s (power4.out) en dézoomant
      var N = slides.length - 1, START = .95, GAP = .44, REV = 1.35, SWAP = 1.08, lastAt = START + GAP * (N - 1);
      tl.to(P[0], { s: 1, duration: 1.6, ease: QUART, onUpdate: function () { paint(0); } }, 'part');
      slides.forEach(function (el, i) {
        if (!i) return;
        tl.to(P[i], { o: 1, s: 1, duration: REV, ease: 'power4.out', onUpdate: function () { paint(i); } }, 'part+=' + (START + GAP * (i - 1)));
      });
      tl.add(function () { show.style.display = 'none'; }, 'part+=' + (lastAt + SWAP)); // le hero prend le relais, identique au pixel
      // 4. sur le regard du hero, le logo se dissout des lettres extérieures vers celles qui touchent le cadre
      var GO = lastAt + SWAP - .5 - .6 * .55, WAVE = .5, FADE = .6;
      letters.forEach(function (el) {
        tl.to(el, { opacity: 0, x: el._d * .07, filter: 'blur(8px)', duration: FADE, ease: 'power2.in' }, 'part+=' + (GO + (1 - Math.abs(el._d) / far) * WAVE));
      });
      // 5. le masque s'agrandit jusqu'au hero ; la page démarre à ce moment (ses modules posent leur état sous l'intro)
      tl.addLabel('open', 'part+=' + (GO + WAVE + FADE * .55))
        .add(go, 'open')
        .to(M, { k: 1, duration: 1.8, ease: DOUX, onUpdate: clip }, 'open')
        .to(himg, { scale: 1, x: 0, y: 0, duration: 1.95, ease: DOUX }, 'open')
        .to(overlay, { autoAlpha: 0, duration: 1.2, ease: 'sine.inOut' }, 'open+=.4')
        .add(function () { gsap.set(big, { autoAlpha: 0 }); hero.style.clipPath = ''; hero.style.visibility = ''; hero.style.zIndex = ''; html.classList.remove('nk-intro'); if (window.NK) NK.startScroll(); }, 'open+=2');
      // 6. menu et textes du hero : chaque élément à son heure (data-intro-at), groupes décalés (data-intro-stagger)
      var groups = {};
      reveals.forEach(function (el) { var at = num(el, 'data-intro-at', 1.5); (groups[at] = groups[at] || []).push(el); });
      Object.keys(groups).forEach(function (at) {
        var g = groups[at], st = num(g[0], 'data-intro-stagger', .08), pos = 'open+=' + at;
        var kind = g[0].getAttribute('data-intro-reveal');
        if (kind === 'line') tl.to(g, { scaleX: 1, duration: .7, ease: 'power2.inOut', stagger: st }, pos);
        else if (kind === 'badge') tl.to(g, { opacity: 1, rotate: 0, filter: 'blur(0px)', duration: 1.3, ease: 'power3.out', stagger: st }, pos);
        else if (kind === 'lines' && splitLines.length) tl.to(splitLines, { opacity: 1, y: 0, filter: 'blur(0px)', duration: .8, ease: 'power1.out', stagger: st }, pos);
        else tl.to(g, { opacity: 1, y: 0, filter: 'blur(0px)', duration: num(g[0], 'data-intro-duration', .8), ease: 'power1.out', stagger: st }, pos);
      });
      return tl;
    };

    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () {
      try { run(); } catch (e) { console.error('[intro]', e); done(); }
    });
  };
})();
