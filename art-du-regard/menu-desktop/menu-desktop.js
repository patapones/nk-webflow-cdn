/*!
 * Méga menu desktop « L'Art du Regard » (v1.0.0 du 25/11/2026, validé par Kevin ; v1.1.0 du 27/11/2026 : flèche des soins qui glisse ;
 *   v1.2.0 du 27/11/2026 : liens de droite écrits lettre par lettre à leur apparition, survol lettre par lettre retiré ;
 *   v1.2.1 : vrai pas entre les rangées de soins, 0,12 s, 0,15 s à l'ouverture) · module NK Studio créa
 * Remplace les deux embeds (styles v15, script v9) du composant « Menu » de Webflow : Webflow reste propre.
 * Source lisible du CSS : menu-desktop.css (même dossier) ; détail du montage : ArtDuRegard/13-webflow/menu-montage.md.
 *
 * À METTRE DANS LE HEAD CODE DU SITE (script hébergé, ni async ni defer) : le CSS est posé tout de suite (pas de méga menu
 * visible au premier affichage) ; le reste démarre quand la page est lue. Sans [data-header] : rien ne se passe.
 */
/* Script du menu : Menu · méga menu Prestations (L'Art du Regard, v9 du 25/11/2026)
   - « Prestations » est un lien vers /prestations ; le méga menu s'ouvre au survol (souris : 0,15 s), se ferme 0,3 s après la sortie.
   - Le bouton chevron [data-megamenu-toggle] ouvre/ferme au clic (clavier, tactile) ; Échap et clic dehors ferment.
   - Changement de famille directionnel (data-dir sur .megamenu__panels) + triangle de sécurité (menu-aim).
   - Ouverture dans l'esprit du menu mobile (v9) : familles découpées en lettres, rangs de cascade (--mf, --mm-n), textes des soins
     enveloppés pour suivre leur ligne, classe is-opening sur .megamenu le temps de l'ouverture (délais plus longs, voir le CSS).
   - En-tête (et barre du bas mobile) masqués quand on descend, de retour quand on remonte. */
(function () {
  'use strict';
  if (window.__nkMega) return; window.__nkMega = true;   // jamais deux fois (script chargé en double)

  /* ---------- CSS : ce que le Designer ne sait pas faire (états posés par le script, délais de cascade, transitions, mouvement réduit) ---------- */
  var css = document.createElement('style');
  css.id = 'nk-mega-css';
  css.textContent = ".megamenu { clip-path: inset(0 0 100% 0); transition: clip-path 0.5s cubic-bezier(0.65, 0, 0.35, 1) 0.1s, visibility 0s linear 0.6s; }\n.header.is-open .megamenu { visibility: visible; pointer-events: auto; clip-path: inset(0 0 0 0); transition: clip-path 0.8s cubic-bezier(0.5, 0, 0, 1), visibility 0s; }\n.header__overlay { transition: opacity 0.8s cubic-bezier(0.45, 0, 0.55, 1), backdrop-filter 0.8s cubic-bezier(0.45, 0, 0.55, 1), -webkit-backdrop-filter 0.8s cubic-bezier(0.45, 0, 0.55, 1); }\n.header:not(.is-open) .header__overlay { backdrop-filter: blur(0px); -webkit-backdrop-filter: blur(0px); }\n.header.is-open .header__overlay { opacity: 1; }\n.header.is-open .nav__toggle, .header.is-open .nav__chevron { color: var(--color--title); }\n.nav__chevron[aria-expanded=\"true\"] .nav__icon { transform: rotate(180deg); }\n.nav__link.w--current { color: var(--color--title); }\n.nav__link.w--current .nav__dot, .nav__toggle.is-section .nav__dot, .header.is-open .nav__toggle .nav__dot { transform: none; }\n.megamenu__soin::before, .megamenu__all::before, .megamenu__consult-link::before { content: \"\"; position: absolute; left: 0; right: 0; bottom: -1px; height: 1px; background-color: currentColor; transform: scaleX(0); transform-origin: left center; transition: transform 0.4s cubic-bezier(0.65, 0, 0.35, 1); }\n:is(.megamenu__soin, .megamenu__all, .megamenu__consult-link):is(:hover, :focus-visible)::before { transform: scaleX(1); }\n:is(.megamenu__soin, .megamenu__all, .megamenu__consult-link):hover .link-arrow__icon { transform: translateX(0.25rem); }\n.megamenu__chars { display: inline-block; }\n.megamenu__wordchars { display: inline-block; white-space: nowrap; }\n.megamenu__char { display: inline-block; white-space: pre; opacity: 0; transform: translate3d(0, -0.35em, 0); transition: opacity 0.2s ease, transform 0.2s ease; }\n.header.is-open .megamenu__char { opacity: 1; transform: none; transition: opacity 0.45s ease, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1); transition-delay: calc(0.3s + var(--mf, 0) * 0.1s + var(--ci, 0) * 0.025s); }\n.megamenu { --mm-step: 0.04s; --mm-base: 0.12s; --mm-lag: 0.1s; --mm-photo: 0.05s; }\n.megamenu.is-opening { --mm-step: 0.06s; --mm-base: 0.6s; --mm-lag: 0.25s; --mm-photo: 0.85s; }\n.megamenu__panels { --mm-dir: 1; }\n.megamenu__panels[data-dir=\"up\"] { --mm-dir: -1; }\n.megamenu__panel :is(.megamenu__family-title, .megamenu__family-desc, .megamenu__consult), .megamenu__panel :is(.megamenu__soin, .megamenu__all) > * { opacity: 0; transform: translate3d(0, calc(var(--mm-dir) * 1.5rem), 0); transition: opacity 0.2s ease, transform 0.2s ease; }\n.megamenu__soin, .megamenu__all { border-bottom-color: transparent; background-image: linear-gradient(var(--color--border), var(--color--border)); background-repeat: no-repeat; background-origin: border-box; background-position: 100% 100%; background-size: 0% 1px; transition: background-size 0.3s ease; }\n.megamenu__panel .megamenu__photo-wrap { clip-path: inset(100% 0 0 0 round 0.375rem); transition: clip-path 0.3s ease; }\n.megamenu__panels[data-dir=\"up\"] .megamenu__panel .megamenu__photo-wrap { clip-path: inset(0 0 100% 0 round 0.375rem); }\n.megamenu__panel .megamenu__photo { transform: scale(1.12); transition: transform 0.3s ease; }\n.header.is-open .megamenu__panel.is-active :is(.megamenu__family-title, .megamenu__family-desc, .megamenu__consult), .header.is-open .megamenu__panel.is-active :is(.megamenu__soin, .megamenu__all) > * { opacity: 1; transform: none; transition: opacity 0.6s ease, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1); transition-delay: calc(var(--mm-base) + var(--mm-n, 0) * var(--mm-step)); }\n.header.is-open .megamenu__panel.is-active :is(.megamenu__soin, .megamenu__all) > * { transition-delay: calc(var(--mm-base) + var(--mm-n, 0) * var(--mm-step) + var(--mm-lag)); }\n.header.is-open .megamenu__panel.is-active :is(.megamenu__soin, .megamenu__all) { background-position: 0% 100%; background-size: 100% 1px; transition: background-size 0.7s cubic-bezier(0.65, 0, 0.35, 1); transition-delay: calc(var(--mm-base) + var(--mm-n, 0) * var(--mm-step)); }\n.header.is-open .megamenu__panels .megamenu__panel.is-active .megamenu__photo-wrap { clip-path: inset(0 0 0 0 round 0.375rem); transition: clip-path 0.6s cubic-bezier(0.22, 1, 0.36, 1) var(--mm-photo); }\n.header.is-open .megamenu__panel.is-active .megamenu__photo { transform: scale(1); transition: transform 0.9s cubic-bezier(0.22, 1, 0.36, 1) var(--mm-photo); }\n.megamenu__panel.is-leaving :is(.megamenu__family-title, .megamenu__family-desc, .megamenu__consult), .megamenu__panel.is-leaving :is(.megamenu__soin, .megamenu__all) > * { opacity: 0; transform: translate3d(0, calc(var(--mm-dir) * -1.5rem), 0); transition: opacity 0.3s cubic-bezier(0.4, 0, 1, 1), transform 0.35s cubic-bezier(0.4, 0, 1, 1); transition-delay: calc(var(--mm-n, 0) * 0.01s); }\n.megamenu__panel.is-snap, .megamenu__panel.is-snap * { transition: none !important; }\nhtml.is-scrolling-down .header:not(.is-open):not(:has(:focus-visible)) { transform: translateY(-100%); }\n@media (prefers-reduced-motion: reduce) {\n  .header, .header__overlay, .nav__dot, .nav__icon, .megamenu, .megamenu__char, .megamenu__panel, .megamenu__panel *, .megamenu__soin::before, .megamenu__all::before, .megamenu__consult-link::before { transition-duration: 0.01s !important; transition-delay: 0s !important; }\n  .megamenu { clip-path: none !important; }\n  .megamenu__panel *, .megamenu__char, .megamenu .link-arrow__icon { transform: none !important; clip-path: none !important; }\n}\n.mm-letters { display: inline; }\n.mm-letters__w { display: inline-block; white-space: nowrap; }\n.megamenu__panel:not(.is-leaving) :is(.megamenu__soin, .megamenu__all) > .mm-letters-host { opacity: 1; transform: none; transition: none; }\n.mm-letters__c { display: inline-block; white-space: pre; opacity: 0; transform: translate3d(0, -0.35em, 0); transition: opacity 0.2s ease, transform 0.2s ease; }\n.header.is-open .megamenu__panel.is-active .mm-letters__c { opacity: 1; transform: none; transition: opacity 0.45s ease, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1); transition-delay: calc(var(--mm-base) + var(--mm-n, 0) * var(--mm-step) + var(--mm-lag) + var(--ci, 0) * 0.015s); }\n.megamenu { --mm-row: 0.12s; }\n.megamenu.is-opening { --mm-row: 0.15s; }\n.header.is-open .megamenu__panel.is-active :is(.megamenu__soin, .megamenu__all) { transition-delay: calc(var(--mm-base) + (var(--mm-n, 0) - 1) * var(--mm-row)); }\n.header.is-open .megamenu__panel.is-active :is(.megamenu__soin, .megamenu__all) > * { transition-delay: calc(var(--mm-base) + (var(--mm-n, 0) - 1) * var(--mm-row) + var(--mm-lag)); }\n.header.is-open .megamenu__panel.is-active .mm-letters__c { transition-delay: calc(var(--mm-base) + (var(--mm-n, 0) - 1) * var(--mm-row) + var(--mm-lag) + var(--ci, 0) * 0.015s); }\n:is(.megamenu__soin, .megamenu__all) .link-arrow__icon svg { transition: transform 0.4s cubic-bezier(0.65, 0, 0.35, 1); }\n@media (hover: hover) and (pointer: fine) { :is(.megamenu__soin, .megamenu__all):is(:hover, :focus-visible) .link-arrow__icon svg { transform: translateX(0.25rem); } }\n@media (prefers-reduced-motion: reduce) { .mm-letters__c { opacity: 1 !important; transform: none !important; transition: none !important; } .megamenu .link-arrow__icon svg { transform: none !important; } }";
  (document.head || document.documentElement).appendChild(css);

  function start() {
  var header = document.querySelector('[data-header]');
  if (!header) return;
  document.documentElement.classList.add('js-menu');
  var trigger = header.querySelector('[data-megamenu-trigger]');
  var toggle = header.querySelector('[data-megamenu-toggle]');
  var mega = header.querySelector('[data-megamenu]');
  var link = trigger ? trigger.querySelector('a') : null;
  var families = Array.prototype.slice.call(header.querySelectorAll('[data-megamenu-family]'));
  var panelsBox = header.querySelector('.megamenu__panels');
  var order = families.map(function (f) { return f.getAttribute('data-megamenu-family'); });
  function panelOf(key) { return header.querySelector('[data-megamenu-panel="' + key + '"]'); }
  if (!toggle || !mega) return;

  /* Préparation de l'écriture (v9) */
  function chars(el, k) { // lettres groupées par mot ; le lecteur d'écran garde le libellé du lien (aria-label)
    var box = document.createElement('span');
    box.className = 'megamenu__chars'; box.setAttribute('aria-hidden', 'true');
    el.textContent.split(/(\s+)/).forEach(function (part) {
      if (!part) return;
      if (/^\s+$/.test(part)) { box.appendChild(document.createTextNode(' ')); return; }
      var w = document.createElement('span'); w.className = 'megamenu__wordchars';
      Array.prototype.forEach.call(part, function (c) {
        var ch = document.createElement('span');
        ch.className = 'megamenu__char'; ch.textContent = c; ch.style.setProperty('--ci', k++);
        w.appendChild(ch);
      });
      box.appendChild(w);
    });
    el.textContent = ''; el.appendChild(box);
    return k;
  }
  families.forEach(function (f, i) {
    f.style.setProperty('--mf', i);
    var num = f.querySelector('.megamenu__family-number'), name = f.querySelector('.megamenu__family-name');
    if (name) f.setAttribute('aria-label', name.textContent.trim());
    var k = num ? chars(num, 0) : 0;
    if (name) chars(name, k);
  });
  Array.prototype.forEach.call(header.querySelectorAll('[data-megamenu-panel]'), function (p) {
    Array.prototype.forEach.call(p.querySelectorAll('.megamenu__soin, .megamenu__all'), function (a) { // texte nu enveloppé : il suit sa ligne
      Array.prototype.slice.call(a.childNodes).forEach(function (n) {
        if (n.nodeType === 3 && n.textContent.trim()) { var s = document.createElement('span'); s.className = 'megamenu__label'; a.insertBefore(s, n); s.appendChild(n); }
      });
    });
    Array.prototype.forEach.call(p.querySelectorAll('.megamenu__family-title, .megamenu__family-desc, .megamenu__soin, .megamenu__all, .megamenu__consult'), function (el, n) {
      el.style.setProperty('--mm-n', n);
    });
  });

  /* v1.2.0 (27/11/2026) · apparition des liens de droite (soins, « Toutes les prestations et tarifs ») lettre par lettre, comme les
     noms de familles : à l'ouverture et au changement de famille, de haut en bas (rang --mm-n), la ligne se dessine puis le nom s'écrit
     (chaque lettre descend légèrement en apparaissant, --ci). Remplace le survol lettre par lettre de la v1.1.0 (retiré, demande de Kevin).
     Lecteur d'écran : aria-label sur le lien (libellé entier), lettres cachées. */
  Array.prototype.forEach.call(header.querySelectorAll('.megamenu__soin, .megamenu__all'), function (a) {
    var target = null;
    Array.prototype.some.call(a.children, function (c) { if (!c.classList.contains('link-arrow__icon') && c.textContent.trim()) { target = c; return true; } });
    if (!target || target.querySelector('.mm-letters')) return;
    var label = target.textContent.replace(/\s+/g, ' ').trim();
    a.setAttribute('aria-label', label);
    target.classList.add('mm-letters-host');
    var box = document.createElement('span'); box.className = 'mm-letters'; box.setAttribute('aria-hidden', 'true');
    var k = 0;
    label.split(/(\s+)/).forEach(function (part) {
      if (!part) return;
      if (/^\s+$/.test(part)) { box.appendChild(document.createTextNode(' ')); return; }
      var w = document.createElement('span'); w.className = 'mm-letters__w';
      Array.prototype.forEach.call(part, function (c) {
        var ch = document.createElement('span'); ch.className = 'mm-letters__c'; ch.textContent = c; ch.style.setProperty('--ci', k++);
        w.appendChild(ch);
      });
      box.appendChild(w);
    });
    target.textContent = ''; target.appendChild(box);
  });

  /* Familles : sortie de l'ancienne, entrée de la nouvelle, dans le sens du geste */
  var activeKey = null;
  var current = header.querySelector('[data-megamenu-family].is-active');
  if (current) activeKey = current.getAttribute('data-megamenu-family');
  var leaveTimers = {};
  function photoParts(p) { return [p.querySelector('.megamenu__photo-wrap'), p.querySelector('.megamenu__photo')]; }
  function freezePhoto(p) { /* la photo sortante reste exactement où elle en est, sans fondu, sous la nouvelle */
    var w = photoParts(p);
    if (w[0]) { w[0].style.clipPath = getComputedStyle(w[0]).clipPath; w[0].style.transition = 'none'; }
    if (w[1]) { w[1].style.transform = getComputedStyle(w[1]).transform; w[1].style.transition = 'none'; }
  }
  function unfreezePhoto(p) { photoParts(p).forEach(function (el) { if (el) { el.style.clipPath = ''; el.style.transform = ''; el.style.transition = ''; } }); }
  function snapHidden(p) { p.classList.add('is-snap'); p.classList.remove('is-active', 'is-leaving'); unfreezePhoto(p); void p.offsetWidth; p.classList.remove('is-snap'); }
  function enter(p) { p.classList.add('is-active'); }
  function showFamily(key, force) {
    if (key === activeKey && !force) return;
    if (!force) mega.classList.remove('is-opening'); // changement de famille : délais courts
    var oldKey = activeKey;
    var newP = panelOf(key), oldP = oldKey ? panelOf(oldKey) : null;
    if (!newP) return;
    var dir = (oldKey && order.indexOf(key) < order.indexOf(oldKey)) ? 'up' : 'down';
    if (panelsBox) panelsBox.setAttribute('data-dir', dir);
    clearTimeout(leaveTimers[key]);
    if (newP.classList.contains('is-leaving')) { newP.classList.remove('is-leaving'); unfreezePhoto(newP); } /* retour rapide : il repart de là où il en est */
    else snapHidden(newP);
    if (oldP && oldP !== newP) {
      freezePhoto(oldP);
      oldP.classList.remove('is-active');
      oldP.classList.add('is-leaving');
      clearTimeout(leaveTimers[oldKey]);
      leaveTimers[oldKey] = setTimeout(function () { snapHidden(oldP); }, 800); /* après la fin du dévoilement de la nouvelle photo */
    }
    activeKey = key;
    families.forEach(function (f) {
      var on = f.getAttribute('data-megamenu-family') === key;
      f.classList.toggle('is-active', on);
      f.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    enter(newP);
  }

  /* Ouverture / fermeture */
  var openedAt = 0, openT = null, closeT = null, openingT = null;
  function isOpen() { return header.classList.contains('is-open'); }
  function setOpen(open) {
    clearTimeout(openT); clearTimeout(closeT);
    if (open === isOpen()) return;
    header.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      openedAt = Date.now();
      mega.classList.add('is-opening');
      clearTimeout(openingT); openingT = setTimeout(function () { mega.classList.remove('is-opening'); }, 1600);
      if (activeKey) showFamily(activeKey, true);
    } else { /* fermeture juste après un changement de famille : l'ancien panneau (photo figée) disparaît tout de suite */
      Array.prototype.forEach.call(header.querySelectorAll('[data-megamenu-panel].is-leaving'), function (p) {
        clearTimeout(leaveTimers[p.getAttribute('data-megamenu-panel')]); snapHidden(p);
      });
    }
  }
  function isMouse(e) { return e.pointerType === 'mouse'; }
  function zoneEnter(e) {
    if (!isMouse(e)) return;
    clearTimeout(closeT);
    if (!isOpen()) { clearTimeout(openT); openT = setTimeout(function () { setOpen(true); }, 150); }
  }
  function zoneLeave(e) {
    if (!isMouse(e)) return;
    clearTimeout(openT);
    if (isOpen()) { clearTimeout(closeT); closeT = setTimeout(function () { setOpen(false); }, 300); }
  }
  if (trigger) { trigger.addEventListener('pointerenter', zoneEnter); trigger.addEventListener('pointerleave', zoneLeave); }
  mega.addEventListener('pointerenter', zoneEnter);
  mega.addEventListener('pointerleave', zoneLeave);
  toggle.addEventListener('click', function (e) {
    e.preventDefault();
    if (isOpen() && Date.now() - openedAt < 400) return; /* vient de s'ouvrir au survol : ne pas refermer */
    setOpen(!isOpen());
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen()) { setOpen(false); toggle.focus(); }
  });
  document.addEventListener('click', function (e) {
    if (isOpen() && !header.contains(e.target)) setOpen(false);
  });

  /* Triangle de sécurité : familles traversées en allant vers les soins ignorées ; arrêt 0,3 s = choix */
  var points = [], DELAY = 300, timer = null, hovered = null;
  document.addEventListener('mousemove', function (e) {
    points.push({ x: e.clientX, y: e.clientY });
    if (points.length > 3) points.shift();
  });
  function slope(a, b) { return (b.y - a.y) / (b.x - a.x || 0.0001); }
  function headingToPanel() {
    if (!panelsBox || points.length < 2) return false;
    var r = panelsBox.getBoundingClientRect();
    var prev = points[0], loc = points[points.length - 1];
    if (loc.x >= r.left) return false;
    var upper = { x: r.left, y: r.top - 80 }, lower = { x: r.left, y: r.bottom + 80 };
    return slope(loc, upper) < slope(prev, upper) && slope(loc, lower) > slope(prev, lower);
  }
  function attempt(key) {
    clearTimeout(timer); timer = null;
    if (!headingToPanel()) { showFamily(key); return; }
    var snap = points[points.length - 1];
    timer = setTimeout(function () {
      timer = null;
      if (hovered !== key) return;
      var last = points[points.length - 1];
      if (last.x === snap.x && last.y === snap.y) showFamily(key); else attempt(key);
    }, DELAY);
  }
  families.forEach(function (f) {
    var key = f.getAttribute('data-megamenu-family');
    f.addEventListener('pointerenter', function (e) { if (!isMouse(e)) return; hovered = key; attempt(key); });
    f.addEventListener('pointerleave', function () { if (hovered === key) hovered = null; clearTimeout(timer); timer = null; });
    f.addEventListener('focus', function () { clearTimeout(timer); timer = null; showFamily(key); });
    f.addEventListener('click', function (e) { e.preventDefault(); clearTimeout(timer); timer = null; showFamily(key); });
  });

  if (link && /^\/prestations(\/|$)/.test(window.location.pathname)) link.classList.add('is-section');

  /* Points sous les liens (v9) : 4 px, centrés sous des liens de largeur fractionnaire → recalés sur un pixel entier
     (propriété translate, distincte du transform de l'animation), sinon le cercle paraît déformé. Mesure relative à l'en-tête (fixe en haut). */
  var dots = Array.prototype.slice.call(header.querySelectorAll('.nav__dot'));
  function snapDots() {
    var h = header.getBoundingClientRect();
    dots.forEach(function (d) {
      d.style.translate = '';
      var p = d.parentElement.getBoundingClientRect();
      var x = p.left + (p.width - d.offsetWidth) / 2, y = p.bottom - h.top + 8 - d.offsetHeight;
      d.style.translate = (Math.round(x) - x).toFixed(3) + 'px ' + (Math.round(y) - y).toFixed(3) + 'px';
    });
  }
  var snapT = null;
  function snapLater() { clearTimeout(snapT); snapT = setTimeout(snapDots, 100); }
  snapDots();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(snapDots);
  window.addEventListener('load', snapDots);
  window.addEventListener('resize', snapLater);

  /* Masquage au défilement : <html class="is-scrolling-down"> quand on descend (seuil 8 px), retirée quand on remonte
     ou en haut de page. Sert à l'en-tête (ce composant) et à la barre du bas (composant Menu mobile). */
  var rootEl = document.documentElement, lastY = window.scrollY, ticking = false;
  function onScroll() {
    ticking = false;
    var y = Math.max(0, window.scrollY), dy = y - lastY;
    if (y <= header.offsetHeight) { rootEl.classList.remove('is-scrolling-down'); lastY = y; return; }
    if (Math.abs(dy) < 8) return;
    if (dy > 0 && !isOpen()) rootEl.classList.add('is-scrolling-down');
    else if (dy < 0) rootEl.classList.remove('is-scrolling-down');
    lastY = y;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
}

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
