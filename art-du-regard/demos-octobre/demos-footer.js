/* Démos d'octobre (/demo-a, /demo-b) : code autrefois dans le Footer du site, déplacé le 24/11/2026. Nécessite curtains.js (chargé à part). */

/* Module de démo branché sur stack-base.js (test du 27/10) */
window.NKPages = window.NKPages || {};
(function () {
  function log(msg, ok) {
    ok = ok !== false;
    console.log('[DEMO]', ok ? 'OK' : 'ECHEC', msg);
    var box = document.querySelector('[data-demo="log"]');
    if (!box) return;
    var line = document.createElement('div');
    line.textContent = (ok ? '✓ ' : '✗ ') + msg;
    if (!ok) line.style.color = '#ff8a8a';
    box.prepend(line);
    while (box.children.length > 10) box.lastChild.remove();
  }
  window.demoLog = log;

  document.addEventListener('click', function (e) {
    var menu = document.querySelector('[data-demo="menu"]');
    if (e.target.closest('[data-demo="menu-open"]')) { menu.setAttribute('data-open', 'true'); NK.stopScroll(); log('Menu ouvert (NK.stopScroll)'); }
    if (e.target.closest('[data-demo="menu-close"]')) { menu.setAttribute('data-open', 'false'); NK.startScroll(); log('Menu fermé (NK.startScroll)'); }
  });

  window.NKPages['*'] = function (container, cond) {
    var reduce = cond.reduce;
    container.querySelectorAll('[data-split="lines"]').forEach(function (el) {
      var inHero = !!el.closest('[data-demo="hero"]');
      SplitText.create(el, {
        type: 'lines', mask: 'lines', autoSplit: true,
        onSplit: function (self) {
          gsap.set(el, { visibility: 'visible' }); // caché par le CSS jusqu'ici (anti-flash)
          if (reduce) return gsap.from(self.lines, { autoAlpha: 0, duration: 0.3 });
          return gsap.from(self.lines, { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.08,
            scrollTrigger: inHero ? null : { trigger: el, start: 'top 85%' } });
        }
      });
    });
    ScrollTrigger.batch(container.querySelectorAll('[data-anim="reveal"]'), {
      start: 'top 85%', once: true,
      onEnter: function (batch) {
        gsap.fromTo(batch, { autoAlpha: 0, yPercent: reduce ? 0 : 20 },
          { autoAlpha: 1, yPercent: 0, duration: reduce ? 0.2 : 0.8, ease: 'power3.out', stagger: 0.08, overwrite: true });
      }
    });
    var pin = container.querySelector('[data-demo="pin"]');
    if (pin) {
      gsap.fromTo(pin.querySelector('[data-demo="bar"]'), { scaleX: 0 }, { scaleX: 1, ease: 'none',
        scrollTrigger: { trigger: pin, start: 'top top', end: '+=150%', pin: true, scrub: reduce ? true : 1 } });
    }
    var k = container.querySelector('[data-demo="kicker"]');
    var t = setTimeout(function () { log('Surtitre IX3 animé : ' + !!(k && k.getAttribute('style')), !!(k && k.getAttribute('style'))); }, 1500);
    log('stack-base : page « ' + container.getAttribute('data-barba-namespace') + ' », ' + ScrollTrigger.getAll().length + ' ScrollTrigger');
    return function () { clearTimeout(t); };
  };
})();


/* Distorsion WebGL : défilement + survol eau / peau (prototype 28/10) : copie de code/distorsion.js */
(function () {
  'use strict';

  var HEAD = [
    'precision mediump float;',
    'attribute vec3 aVertexPosition;',
    'attribute vec2 aTextureCoord;',
    'uniform mat4 uMVMatrix;',
    'uniform mat4 uPMatrix;',
    'uniform mat4 planeTextureMatrix;',
    'uniform float uDeform;',
    'uniform vec2 uMouse;',
    'uniform float uPress;',
    'uniform float uTime;',
    'uniform float uAspect;',
    'varying vec2 vTextureCoord;',
    'varying float vShade;',
    'void main() {',
    '  vec3 p = aVertexPosition;',
    '  vShade = 0.0;'
  ].join('\n');

  // courbure au défilement : nulle sur les bords gauche et droit, maximale au centre
  var ARC = '  p.y += sin(((p.x + 1.0) / 2.0) * 3.141592) * sin(uDeform / 240.0);';

  var HOVER = {
    // Ondes concentriques (type eau), d'après le shader du site de référence
    eau: [
      '  vec2 dv = p.xy - uMouse; dv.x *= uAspect;',
      '  float d = length(dv);',
      '  float wave = cos(5.0 * (d - uTime / 75.0));',
      '  float e = (0.4 / (d + 0.4)) * wave * uPress;',
      '  p.z += e * 0.06;',
      '  p.xy += e * 0.035 * (uMouse - p.xy);',
      '  vShade = e * 0.6;'
    ].join('\n'),
    // Peau : creux doux sous la souris (gaussienne), la matière se tend vers le point, pas d'ondes
    peau: [
      '  vec2 dv = p.xy - uMouse; dv.x *= uAspect;',
      '  float d2 = dot(dv, dv);',
      '  float f = exp(-d2 / 0.16) * uPress;',
      '  p.z -= f * 0.07;',
      '  p.xy -= (p.xy - uMouse) * f * 0.05;',
      '  vShade = f;'
    ].join('\n')
  };

  var TAIL = [
    '  gl_Position = uPMatrix * uMVMatrix * vec4(p, 1.0);',
    '  vTextureCoord = (planeTextureMatrix * vec4(aTextureCoord, 0.0, 1.0)).xy;',
    '}'
  ].join('\n');

  var FRAG = {
    base: 'c.rgb += 0.0 * vShade;',
    eau: 'c.rgb += clamp(vShade, -1.0, 1.0) * 0.12;',
    // peau comprimée : très légèrement plus claire et plus chaude au centre
    peau: 'c.rgb += vShade * vec3(0.045, 0.03, 0.02);'
  };

  function fragment(mode) {
    return [
      'precision mediump float;',
      'varying vec2 vTextureCoord;',
      'varying float vShade;',
      'uniform sampler2D planeTexture;',
      'uniform float uOpacity;',
      'void main() {',
      '  vec4 c = texture2D(planeTexture, vTextureCoord);',
      '  ' + (FRAG[mode] || FRAG.base),
      '  c.a *= uOpacity;',
      '  gl_FragColor = c;',
      '}'
    ].join('\n');
  }

  function vertex(mode) { return [HEAD, ARC, HOVER[mode] || '', TAIL].join('\n'); }

  var MAX = 20;          // vitesse de défilement retenue au maximum (px par image) : effet doux
  var RETURN = 0.075;    // retour au repos après le défilement (plus petit = plus lent)
  var FOLLOW = { eau: 0.25, peau: 0.08 };   // vitesse à laquelle le point suit la souris (peau : inertie)
  var PRESS = { eau: 0.12, peau: 0.05 };    // vitesse d'apparition / de relâchement de l'effet

  var curtains = null, failed = false, planes = [], deform = 0, lastY = null, time = 0;

  function lerp(a, b, t) { return a + (b - a) * t; }
  function scrollY() { return (window.NK && NK.lenis) ? NK.lenis.scroll : window.pageYOffset; }

  function onScroll() {
    var y = scrollY();
    if (lastY === null) { lastY = y; return; }
    var d = Math.max(-MAX, Math.min(MAX, -(y - lastY)));
    lastY = y;
    if (Math.abs(d) > Math.abs(deform)) deform = lerp(deform, d, 0.5);
  }

  function tick() {
    if (!curtains || !curtains.gl) return;
    onScroll();
    curtains.updateScrollValues(0, scrollY());
    deform = lerp(deform, 0, RETURN);
    time += 1;
    for (var i = 0; i < planes.length; i++) {
      var p = planes[i], u = p.uniforms, h = p.__hover;
      p.updatePosition();
      u.deform.value = deform * p.__scroll;
      u.time.value = time;
      if (h) {
        // eau : l'onde naît du mouvement et s'éteint quand la souris s'arrête ; peau : pression tant qu'on survole
        if (h === 'eau') p.__target *= 0.96;
        u.press.value = lerp(u.press.value, p.__target * p.__touch, PRESS[h]);
        u.mouse.value.x = lerp(u.mouse.value.x, p.__mx, FOLLOW[h]);
        u.mouse.value.y = lerp(u.mouse.value.y, p.__my, FOLLOW[h]);
        var r = p.getBoundingRect(); if (r.height) u.aspect.value = r.width / r.height;
      }
    }
    curtains.render();
  }

  function ensure() {
    if (curtains || failed) return curtains;
    if (!window.Curtains) { failed = true; console.warn('[distorsion] curtains.js absent'); return null; }
    var box = document.querySelector('[data-distort-canvas]');
    if (!box) { box = document.createElement('div'); box.setAttribute('data-distort-canvas', ''); box.setAttribute('aria-hidden', 'true'); document.body.appendChild(box); }
    try {
      curtains = new Curtains({ container: box, pixelRatio: Math.min(1.5, window.devicePixelRatio || 1), watchScroll: false, autoRender: false, depth: false });
    } catch (e) { failed = true; return null; }
    curtains.onError(function () { failed = true; document.documentElement.classList.add('no-distort'); })
            .onContextLost(function () { curtains.restoreContext(); });
    gsap.ticker.add(tick); // une seule boucle : celle de GSAP (comme Lenis)
    return curtains;
  }

  window.NKDistort = {
    init: function (container, cond) {
      cond = cond || {};
      if (!cond.desktop || cond.reduce) return function () {};
      var els = (container || document).querySelectorAll('[data-distort]');
      if (!els.length || !ensure()) return function () {};
      var mine = [];
      els.forEach(function (el) {
        var img = el.querySelector('img');
        if (!img) return;
        var hover = el.getAttribute('data-distort-hover');
        if (hover !== 'eau' && hover !== 'peau') hover = null;
        img.setAttribute('data-sampler', 'planeTexture');
        img.setAttribute('crossorigin', 'anonymous');
        var seg = hover ? 40 : 10; // une déformation locale demande une grille plus fine
        // la version CDN (UMD) de curtains.js expose window.Curtains, window.Plane et window.Vec2
        var plane = new window.Plane(curtains, el, {
          vertexShader: vertex(hover),
          fragmentShader: fragment(hover),
          widthSegments: seg,
          heightSegments: seg,
          fov: 45,
          drawCheckMargins: { top: 100, right: 0, bottom: 100, left: 0 },
          uniforms: {
            deform: { name: 'uDeform', type: '1f', value: 0 },
            opacity: { name: 'uOpacity', type: '1f', value: 0 },
            mouse: { name: 'uMouse', type: '2f', value: new window.Vec2(0, 0) },
            press: { name: 'uPress', type: '1f', value: 0 },
            time: { name: 'uTime', type: '1f', value: 0 },
            aspect: { name: 'uAspect', type: '1f', value: 1 }
          }
        });
        var s = el.getAttribute('data-distort');
        plane.__scroll = (s === null || s === '') ? 1 : (isNaN(parseFloat(s)) ? 1 : parseFloat(s));
        plane.__touch = parseFloat(el.getAttribute('data-distort-touch')) || 1;
        plane.__hover = hover; plane.__target = 0; plane.__mx = 0; plane.__my = 0;

        var listeners = [];
        if (hover) {
          var v = new window.Vec2();
          var move = function (e) {
            var c = plane.mouseToPlaneCoords(v.set(e.clientX, e.clientY));
            plane.__mx = c.x; plane.__my = c.y;
            plane.__target = hover === 'eau' ? Math.min(1, plane.__target + 0.12) : 1;
          };
          var enter = function (e) {
            // la peau se touche là où l'on entre : pas de glissement depuis le centre
            var c = plane.mouseToPlaneCoords(v.set(e.clientX, e.clientY));
            plane.__mx = c.x; plane.__my = c.y;
            plane.uniforms.mouse.value.set(c.x, c.y);
            if (hover === 'peau') plane.__target = 1;
          };
          var leave = function () { plane.__target = 0; };
          el.addEventListener('mousemove', move);
          el.addEventListener('mouseenter', enter);
          el.addEventListener('mouseleave', leave);
          listeners = [['mousemove', move], ['mouseenter', enter], ['mouseleave', leave]];
        }

        plane.onReady(function () {
          // la surface apparaît, PUIS la vraie image se cache (jamais de trou)
          gsap.to(plane.uniforms.opacity, { value: 1, duration: 0.3, onComplete: function () { el.setAttribute('data-distort-ready', 'true'); } });
        });
        planes.push(plane); mine.push({ plane: plane, el: el, listeners: listeners });
      });
      return function () {
        mine.forEach(function (m) {
          m.listeners.forEach(function (l) { m.el.removeEventListener(l[0], l[1]); });
          m.el.removeAttribute('data-distort-ready');
          var i = planes.indexOf(m.plane); if (i > -1) planes.splice(i, 1);
          try { m.plane.remove(); } catch (e) {}
        });
      };
    }
  };
})();
(function () {
  var base = window.NKPages['*'];
  window.NKPages['*'] = function (container, cond, lenis) {
    var a = base ? base(container, cond, lenis) : null;
    var b = NKDistort.init(container, cond);
    if (window.demoLog) demoLog('Distorsion : ' + container.querySelectorAll('[data-distort]').length + ' image(s), ' + (cond.desktop && !cond.reduce ? 'active' : 'désactivée (écran < 992 px ou mouvement réduit)'));
    return function () { if (a) a(); b(); };
  };
})();


/* Texte qui fait la mise au point au défilement (prototype 28/10) : copie de code/texte-flou.js */
(function () {
  'use strict';
  window.NKFocusText = {
    init: function (container, cond) {
      cond = cond || {};
      var splits = [];
      (container || document).querySelectorAll('[data-focus-text]').forEach(function (el) {
        var words = el.getAttribute('data-focus-text') === 'words';
        var blur = parseFloat(el.getAttribute('data-focus-blur')) || 10;
        var stagger = parseFloat(el.getAttribute('data-focus-stagger')) || (words ? 0.12 : 0.05);
        splits.push(SplitText.create(el, {
          type: words ? 'words' : 'words,chars', // les mots restent entiers en fin de ligne
          autoSplit: true, // redécoupe au redimensionnement (et refait l'animation)
          onSplit: function (self) {
            gsap.set(el, { visibility: 'visible' }); // caché par le CSS jusqu'ici (anti-flash)
            var t = words ? self.words : self.chars;
            if (cond.reduce) {
              return gsap.from(el, { autoAlpha: 0, duration: 0.5, scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
            }
            return gsap.fromTo(t,
              { autoAlpha: 0, filter: 'blur(' + blur + 'px)', yPercent: 14 },
              {
                autoAlpha: 1, filter: 'blur(0px)', yPercent: 0,
                ease: 'sine.out', stagger: stagger, // chaque lettre se pose en douceur, en vague continue
                scrollTrigger: { trigger: el, start: 'top 88%', end: 'bottom 45%', scrub: 1.2 } // scrub lissé : légère inertie
              });
          }
        }));
      });
      return function () { splits.forEach(function (s) { s.revert(); }); };
    }
  };
})();
(function () { // démo sur /demo-b : trois réglages à comparer au scroll
  var base = window.NKPages['*'];
  window.NKPages['*'] = function (container, cond, lenis) {
    if (container.getAttribute('data-barba-namespace') === 'demo-b' && !container.querySelector('[data-demo="focus"]')) {
      var s = document.createElement('section'); s.setAttribute('data-demo', 'focus');
      s.style.cssText = 'background:#0a0807;color:#f2ece5;padding:35vh 7vw 45vh;display:flex;flex-direction:column;gap:55vh;font-family:Georgia,serif';
      var lab = 'style="font:600 .75rem/1 sans-serif;letter-spacing:.12em;text-transform:uppercase;opacity:.45;margin:0 0 1.5rem"';
      s.innerHTML =
        '<div><p ' + lab + '>1 · Lettre par lettre · flou 12 px</p><h2 data-focus-text="chars" data-focus-blur="12" style="visibility:hidden;font-size:clamp(2.6rem,6.5vw,6.5rem);line-height:1.05;font-weight:400;margin:0;max-width:14ch">L’art de révéler votre beauté naturelle.</h2></div>' +
        '<div><p ' + lab + '>2 · Mot par mot · flou 8 px (paragraphe)</p><p data-focus-text="words" data-focus-blur="8" style="visibility:hidden;font-size:clamp(1.3rem,2.3vw,2.1rem);line-height:1.45;margin:0;max-width:38ch">À Biscarrosse, L’Art du Regard cultive l’art du détail. Microblading, eyeliner, lèvres poudrées, taches de rousseur et manucure : des prestations sur mesure, où précision et savoir-faire révèlent votre singularité.</p></div>' +
        '<div><p ' + lab + '>3 · Lettre par lettre · flou fort 24 px, plus lent</p><h2 data-focus-text="chars" data-focus-blur="24" data-focus-stagger="0.09" style="visibility:hidden;font-size:clamp(2.6rem,6.5vw,6.5rem);line-height:1.05;font-weight:400;margin:0;max-width:16ch">Une passion, un regard pour chaque visage.</h2></div>';
      var first = container.firstElementChild;
      container.insertBefore(s, first ? first.nextSibling : null);
    }
    var a = base ? base(container, cond, lenis) : null;
    var b = window.NKFocusText ? NKFocusText.init(container, cond) : function () {};
    return function () { if (a) a(); b(); };
  };
})();
