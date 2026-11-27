/*!
 * Menu mobile et tablette « L'Art du Regard » (v1.0.2 du 25/11/2026 : point de 6 px gardé au centre de la croix, à l'essai ; v1.1.0 du 27/11/2026 : barre du bas visible pendant le défilement, cachée à l'arrêt) · module NK Studio créa
 * Remplace les deux embeds (styles v12, script v6) du composant « Menu mobile » de Webflow : Webflow reste propre.
 * Source lisible du CSS : menu-mobile.css (même dossier) ; détail du montage : ArtDuRegard/13-webflow/menu-montage.md.
 *
 * À METTRE DANS LE HEAD CODE DU SITE (script hébergé, ni async ni defer) : le CSS est posé tout de suite (pas de saut
 * de mise en page au premier affichage) ; le reste démarre quand la page est lue. Sans [data-mnav-root] : rien ne se passe
 * (seule la feuille de style est posée, ses règles ne touchent que les éléments du menu).
 */
(function () {
  'use strict';
  if (window.__nkMnav) return; window.__nkMnav = true;   // jamais deux fois (script chargé en double)

  /* ---------- CSS : ce que le Designer ne sait pas faire (états posés par le script, html, paysage, @keyframes, mouvement réduit) ---------- */
  var css = document.createElement('style');
  css.id = 'nk-mnav-css';
  css.textContent = ".burger[aria-expanded=\"true\"] .burger__dot { transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1); }\n.burger[aria-expanded=\"true\"] .burger__dot--1 { transform: translate(8px, 8px) scale(0.75); }\n.burger[aria-expanded=\"true\"] .burger__dot--2 { transform: translate(-8px, 8px) scale(0.75); }\n.burger[aria-expanded=\"true\"] .burger__dot--3 { transform: translate(8px, -8px) scale(0.75); }\n.burger[aria-expanded=\"true\"] .burger__dot--4 { transform: translate(-8px, -8px) scale(0.75); }\n.burger[aria-expanded=\"true\"] .burger__line { transform: none; transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.4s; }\n[data-mi=\"item\"], [data-mi=\"line\"] > *, .mnav__cta, .mnav__quick > * { opacity: 0; transform: translate3d(0, 0.75rem, 0); transition: opacity 0.2s ease, transform 0.2s ease; }\n.mnav.is-open .mnav__screen.is-active [data-mi=\"item\"], .mnav.is-open .mnav__screen.is-active [data-mi=\"line\"] > * { opacity: 1; transform: none; transition: opacity 0.6s ease, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1); transition-delay: calc(var(--mi-base, 0.4s) + var(--mi, 0s) + 0.25s); }\n[data-mi=\"line\"]::after { transform: scaleX(0); transform-origin: 100% 50%; transition: transform 0.3s ease; }\n.mnav.is-open .mnav__screen.is-active [data-mi=\"line\"]::after { transform: none; transform-origin: 0% 50%; transition: transform 0.7s cubic-bezier(0.65, 0, 0.35, 1); transition-delay: calc(var(--mi-base, 0.4s) + var(--mi, 0s)); }\n[data-mi=\"photo\"] { clip-path: inset(0% 0% 0% 100%); transition: clip-path 0.45s cubic-bezier(0.45, 0, 0.55, 1); }\n[data-mi=\"photo\"] img { transform: translate3d(8%, 0, 0) scale(1.12); transition: transform 0.45s cubic-bezier(0.45, 0, 0.55, 1); }\n.mnav.is-open .mnav__screen.is-active [data-mi=\"photo\"] { clip-path: inset(0% 0% 0% 0%); transition: clip-path 0.8s cubic-bezier(0.5, 0, 0, 1); transition-delay: calc(var(--mi-base, 0.4s) + var(--mi, 0s)); }\n.mnav.is-open .mnav__screen.is-active [data-mi=\"photo\"] img { transform: none; transition: transform 1.1s cubic-bezier(0.22, 1, 0.36, 1); transition-delay: calc(var(--mi-base, 0.4s) + var(--mi, 0s)); }\n.mnav__chars { display: inline-block; overflow: hidden; vertical-align: top; }\n.mnav__char { display: inline-block; white-space: pre; transform: translate3d(0, -110%, 0); transition: transform 0.25s ease; transition-delay: calc(var(--ci, 0) * 0.015s); }\n.mnav.is-open .mnav__screen.is-active .mnav__char { transform: none; transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1); transition-delay: calc(var(--mi-base, 0.4s) + var(--mi, 0s) + var(--ci, 0) * 0.025s); }\n.mnav__wordchars { display: inline-block; white-space: nowrap; }\n[data-mi=\"line\"] > [data-split-host] { opacity: 1; transform: none; }\n.mnav__chars--link { overflow: visible; }\n.mnav__chars--link .mnav__char { opacity: 0; transform: translate3d(0, -0.35em, 0); transition: opacity 0.2s ease, transform 0.2s ease; transition-delay: calc(var(--ci, 0) * 0.01s); }\n.mnav.is-open .mnav__screen.is-active .mnav__chars--link .mnav__char { opacity: 1; transform: none; transition: opacity 0.45s ease, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1); transition-delay: calc(var(--mi-base, 0.4s) + var(--mi, 0s) + 0.25s + var(--ci, 0) * 0.025s); }\n.mnav.is-open .mnav__cta, .mnav.is-open .mnav__quick > * { opacity: 1; transform: none; transition: opacity 0.6s ease, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1); }\n.mnav.is-open .mnav__cta { transition-delay: calc(var(--mi-end, 0.72s) + 0.65s); }\n.mnav.is-open .mnav__quick > :nth-child(1) { transition-delay: calc(var(--mi-end, 0.72s) + 0.71s); }\n.mnav.is-open .mnav__quick > :nth-child(2) { transition-delay: calc(var(--mi-end, 0.72s) + 0.77s); }\n@media (max-width: 991px) { body:has([data-mnav-root]) { padding-bottom: calc(4rem + env(safe-area-inset-bottom)); } }\nhtml.is-bar-idle:not(.mnav-open) .mbar:not(:has(:focus-visible)) { transform: translateY(100%); }\n.mnav.is-instant .mnav__screen { transition: none !important; }\nhtml.mnav-open, html.mnav-open body { overflow: hidden; }\nhtml.mnav-open .header { transform: none !important; }\n.msheet.is-open .msheet__veil { opacity: 1; }\n.msheet.is-open .msheet__panel { transform: none; }\n@media (orientation: landscape) and (max-height: 500px) and (pointer: coarse) {\n.orient { display: flex; }\nhtml, body { overflow: hidden; }\n}\n.orient__icon svg { display: block; width: 100%; height: 100%; }\n.orient .rotate-phone__phone { animation: orient-phone 3.2s infinite; }\n.orient .rotate-phone__arrow-line { stroke-dasharray: 1; animation: orient-arrow-line 3.2s infinite; }\n.orient .rotate-phone__arrow-head { animation: orient-arrow-head 3.2s infinite; }\n.orient .rotate-phone__ghost { animation: orient-ghost 3.2s infinite; }\n@keyframes orient-phone {\n0% { transform: translate(26px, 44px) rotate(-90deg); opacity: 0; animation-timing-function: ease-out; }\n6.25% { opacity: 1; }\n18.75% { transform: translate(26px, 44px) rotate(-90deg); animation-timing-function: cubic-bezier(0.65, 0, 0.35, 1); }\n56.25% { transform: translate(100px, 40px) rotate(0deg); }\n87.5% { transform: translate(100px, 40px) rotate(0deg); opacity: 1; animation-timing-function: ease-in; }\n100% { transform: translate(100px, 40px) rotate(0deg); opacity: 0; }\n}\n@keyframes orient-arrow-line {\n0%, 6.25% { stroke-dashoffset: 1; opacity: 1; animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1); }\n18.75% { stroke-dashoffset: 0; }\n87.5% { stroke-dashoffset: 0; opacity: 1; animation-timing-function: ease-in; }\n100% { stroke-dashoffset: 0; opacity: 0; }\n}\n@keyframes orient-arrow-head {\n0%, 16% { opacity: 0; }\n20% { opacity: 1; }\n87.5% { opacity: 1; animation-timing-function: ease-in; }\n100% { opacity: 0; }\n}\n@keyframes orient-ghost {\n0%, 6.25% { opacity: 0; }\n18.75% { opacity: 0.4; }\n87.5% { opacity: 0.4; animation-timing-function: ease-in; }\n100% { opacity: 0; }\n}\n@media (prefers-reduced-motion: reduce) { .mbar, .burger, .burger__dot, .burger__line, [data-mi=\"item\"], [data-mi=\"line\"] > *, [data-mi=\"line\"]::after, [data-mi=\"photo\"], [data-mi=\"photo\"] img, .mnav__char, .mnav__cta, .mnav__quick > *, .mnav, .mnav__screen, .msheet, .msheet__veil, .msheet__panel { transition-duration: 0.01s !important; transition-delay: 0s !important; } [data-mi=\"item\"], [data-mi=\"line\"] > *, [data-mi=\"line\"]::after, [data-mi=\"photo\"] img, .mnav__char, .mnav__cta, .mnav__quick > * { transform: none !important; } [data-mi=\"photo\"] { clip-path: none !important; } .orient .rotate-phone__phone, .orient .rotate-phone__arrow-line, .orient .rotate-phone__arrow-head, .orient .rotate-phone__ghost { animation: none; } }";
  (document.head || document.documentElement).appendChild(css);

  function start() {
    var root = document.querySelector('[data-mnav-root]');
    if (!root) return;
    var mnav = root.querySelector('[data-mnav]');
    var sheet = root.querySelector('[data-msheet]');
    if (!mnav) return;
    document.documentElement.classList.add('js-mnav');
    var screens = Array.prototype.slice.call(mnav.querySelectorAll('[data-mnav-screen]'));
    var toggles = Array.prototype.slice.call(document.querySelectorAll('[data-mnav-toggle]'));
    /* Cascade (v2, v5) : chaque élément d'un écran reçoit son moment (--mi : 0,06 s après le précédent, 0,12 s après un lien découpé en
       lettres, pour que les liens arrivent l'un après l'autre) et son type (data-mi : « line » = ligne qui se dessine puis texte, « item » = bloc
       qui apparaît) ; le CSS du menu mobile en tire les délais. --mi-end (fin de la cascade de l'écran Menu) cale le bouton Planity et les raccourcis. Calculé une fois. */
    var STEP = 0.06, LINK_STEP = 0.12;
    var CASCADE = '.mnav__back, .mnav__photo-wrap, .mnav__head > *, .mnav__link, .mnav__soin, .mnav__info, .mnav__text-link';
    screens.forEach(function (s) {
      var t = 0;
      Array.prototype.slice.call(s.querySelectorAll(CASCADE)).forEach(function (el) {
        var type = el.matches('.mnav__link, .mnav__soin') ? 'line' : el.matches('.mnav__back') ? 'letters'
          : el.matches('.mnav__photo-wrap') ? 'photo' : 'item';
        el.setAttribute('data-mi', type);
        el.style.setProperty('--mi', t.toFixed(2) + 's');
        if (type === 'letters') splitLetters(el);
        t += (el.matches('.mnav__link') && splitLink(el)) ? LINK_STEP : STEP;
      });
      if (s.getAttribute('data-mnav-screen') === 'menu') mnav.style.setProperty('--mi-end', t.toFixed(2) + 's');
    });
    /* Lettre par lettre : boutons retour (v3) et liens vers les pages ou l'écran suivant (v4). Les lettres sont groupées par mot
       (pas de coupure au milieu d'un mot) ; le lecteur d'écran garde le libellé entier (aria-label), les lettres lui sont cachées. */
    function chars(el, cls, k) {
      var box = document.createElement('span');
      box.className = cls; box.setAttribute('aria-hidden', 'true');
      el.textContent.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { box.appendChild(document.createTextNode(' ')); return; }
        var w = document.createElement('span'); w.className = 'mnav__wordchars';
        Array.prototype.forEach.call(part, function (c) {
          var ch = document.createElement('span');
          ch.className = 'mnav__char'; ch.textContent = c; ch.style.setProperty('--ci', k++);
          w.appendChild(ch);
        });
        box.appendChild(w);
      });
      el.textContent = ''; el.appendChild(box);
      return k;
    }
    function splitLetters(btn) {
      var label = btn.querySelector('.eyebrow') || btn;
      btn.setAttribute('aria-label', 'Retour : ' + label.textContent.replace(/^\s*‹\s*/, '').trim());
      chars(label, 'mnav__chars', 0);
    }
    function splitLink(link) {
      var title = link.querySelector('.nav-link--title');
      if (!title) return false;
      link.setAttribute('aria-label', title.textContent.trim());
      var k = 0, num = link.querySelector('.mnav__number .label');
      if (num) { k = chars(num, 'mnav__chars mnav__chars--link', k); markHost(num, link); }
      chars(title, 'mnav__chars mnav__chars--link', k); markHost(title, link);
      return true;
    }
    function markHost(el, link) { // bloc direct du lien qui porte les lettres : il ne s'efface plus en entier
      var host = el;
      while (host.parentElement && host.parentElement !== link) host = host.parentElement;
      host.setAttribute('data-split-host', '');
    }
    var depth = { menu: 0, prestations: 1 };
    function depthOf(key) { return depth[key] != null ? depth[key] : 2; }

    var opened = false, sheetOpen = false, lastToggle = null;
    function show(key) {
      mnav.style.setProperty('--mi-base', '0.4s'); // après le volet ou après la sortie de l'écran précédent (0,45 s pour la photo)
      var d = depthOf(key);
      screens.forEach(function (s) {
        var k = s.getAttribute('data-mnav-screen');
        if (k === key) { s.classList.add('is-active'); s.removeAttribute('data-pos'); s.scrollTop = 0; }
        else { s.classList.remove('is-active'); s.setAttribute('data-pos', depthOf(k) < d ? 'prev' : 'next'); }
      });
    }
    function focusScreen() {
      var s = mnav.querySelector('[data-mnav-screen].is-active');
      var f = s && s.querySelector('button, a[href]');
      if (f) f.focus({ preventScroll: true });
    }
    function setExpanded(v) {
      toggles.forEach(function (t) {
        t.setAttribute('aria-expanded', v ? 'true' : 'false');
        t.setAttribute('aria-label', v ? 'Fermer le menu' : 'Ouvrir le menu');
      });
    }
    function open(from) {
      lastToggle = from || null;
      // photos des familles : chargées dès l'ouverture du volet, pour être prêtes quand leur volet s'ouvre
      Array.prototype.forEach.call(mnav.querySelectorAll('img[loading="lazy"]'), function (img) { img.loading = 'eager'; });
      mnav.classList.add('is-instant'); show('menu'); void mnav.offsetWidth; mnav.classList.remove('is-instant');
      mnav.classList.add('is-open');
      document.documentElement.classList.add('mnav-open');
      opened = true;
      requestAnimationFrame(function () { requestAnimationFrame(function () { setExpanded(true); }); });
      setTimeout(focusScreen, 50);
    }
    function close() {
      if (!opened) return;
      closeSheet(true);
      mnav.classList.remove('is-open');
      document.documentElement.classList.remove('mnav-open');
      setExpanded(false);
      opened = false;
      var back = (lastToggle && !mnav.contains(lastToggle) && lastToggle.offsetParent) ? lastToggle
        : toggles.filter(function (t) { return !mnav.contains(t) && t.offsetParent; })[0];
      if (back) back.focus({ preventScroll: true });
    }
    toggles.forEach(function (t) {
      t.addEventListener('click', function (e) { e.preventDefault(); if (opened) close(); else open(t); });
    });
    mnav.addEventListener('click', function (e) {
      var go = e.target.closest('[data-mnav-go]');
      if (!go) return;
      e.preventDefault();
      show(go.getAttribute('data-mnav-go'));
      setTimeout(focusScreen, 50);
    });

    /* Volet Itinéraire */
    var sheetOpener = null;
    function openSheet(from) {
      if (!sheet) return;
      sheetOpener = from || null;
      sheet.classList.add('is-open'); sheetOpen = true;
      var f = sheet.querySelector('a[href], button'); if (f) setTimeout(function () { f.focus({ preventScroll: true }); }, 50);
    }
    function closeSheet(silent) {
      if (!sheet || !sheetOpen) return;
      sheet.classList.remove('is-open'); sheetOpen = false;
      if (!silent && sheetOpener) sheetOpener.focus({ preventScroll: true });
    }
    root.querySelectorAll('[data-msheet-open]').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); openSheet(b); }); });
    root.querySelectorAll('[data-msheet-close]').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); closeSheet(); }); });

    /* Clavier : Échap, Tab qui reste dans le volet ouvert */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { if (sheetOpen) closeSheet(); else if (opened) close(); return; }
      if (e.key !== 'Tab' || !opened) return;
      var box = sheetOpen ? sheet : mnav;
      var items = Array.prototype.slice.call(box.querySelectorAll('a[href], button')).filter(function (el) {
        return el.offsetParent && getComputedStyle(el).visibility === 'visible';
      });
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (!box.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    });

    /* Barre du bas (v1.1.0, décision de Kevin du 27/11/2026) : visible pendant le défilement, cachée IDLE ms après l'arrêt
       (<html class="is-bar-idle">). Toujours visible en haut de page, menu ouvert (règle CSS) ou clavier dans la barre (:focus-visible).
       Un toucher sur l'écran la fait revenir. L'en-tête garde son comportement (caché quand on descend, script du Menu). */
    var rootEl = document.documentElement, IDLE = 1200, idleT = 0;
    function hideBar() { if (opened || window.scrollY <= 8) { rootEl.classList.remove('is-bar-idle'); return; } rootEl.classList.add('is-bar-idle'); }
    function wakeBar() { rootEl.classList.remove('is-bar-idle'); clearTimeout(idleT); idleT = setTimeout(hideBar, IDLE); }
    window.addEventListener('scroll', wakeBar, { passive: true });
    window.addEventListener('touchstart', wakeBar, { passive: true });
    idleT = setTimeout(hideBar, IDLE);

    /* Passage en desktop : le volet se ferme */
    var desktop = window.matchMedia('(min-width: 992px)');
    function onBp() { if (desktop.matches && opened) close(); }
    if (desktop.addEventListener) desktop.addEventListener('change', onBp); else desktop.addListener(onBp);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
