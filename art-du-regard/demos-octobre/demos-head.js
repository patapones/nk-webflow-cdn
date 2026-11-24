/* Démos d'octobre (/demo-a, /demo-b) : code autrefois dans le Head du site, déplacé le 24/11/2026 pour ne pas gêner l'intro v19 de l'accueil. */
(function(){var s=document.createElement('style');s.textContent="\n[data-intro]{display:none;position:fixed;inset:0;z-index:90;background:#0a0807;align-items:center;justify-content:center}\nhtml[data-fond=\"aiguille\"] [data-intro]{background:#f4efe9}\nhtml.nk-intro [data-intro]{display:flex}\n[data-intro-text]{display:none}\n[data-intro-logo]{width:min(56vw,56rem);visibility:hidden}\n[data-intro-logo] svg{display:block;width:100%;height:auto;overflow:visible}\n@media (max-width:767px){[data-intro-logo]{width:82vw}}\nhtml.demo-js [data-split]{visibility:hidden}\n[data-demo=\"focus\"] [data-focus-text]{text-transform:none;letter-spacing:normal}\n[data-demo=\"photos\"]{padding:4rem 2rem}\n[data-demo=\"photo-grid\"]{display:grid;grid-template-columns:1fr 1fr;gap:5rem 2rem;margin-top:2rem}\n[data-distort]{aspect-ratio:4/5;position:relative}\n[data-distort] img{width:100%;height:100%;object-fit:cover;display:block}\n[data-distort-canvas]{position:fixed;inset:0;width:100%;height:100vh;pointer-events:none;z-index:5}\n[data-distort-ready=\"true\"] img{opacity:0}\n[data-distort-hover]::after{content:'Survol : ' attr(data-distort-hover);position:absolute;left:0;top:calc(100% + .75rem);font:600 .85rem/1 sans-serif;letter-spacing:.08em;text-transform:uppercase}\n";(document.head||document.documentElement).appendChild(s);})();

/* DEMO intro (28/10) : copie de code/intro-logo.js ; par défaut « mise au point », ?intro=encre ou ?intro=aiguille */
(function () {
  'use strict';
  var ONLY_PATHS = ['/demo-a']; // démo : /demo-a joue l'accueil
  var ONCE_PER_SESSION = true;
  var html = document.documentElement;

  var forced = (location.search.match(/[?&]intro=(aiguille|encre|point)/) || [])[1] || null;
  var path = location.pathname.replace(/\/+$/, '') || '/';
  if (!forced) {
    if (ONLY_PATHS && ONLY_PATHS.indexOf(path) === -1) return;
    try { if (ONCE_PER_SESSION && sessionStorage.getItem('nk-intro') === '1') return; } catch (e) {}
  }
  html.classList.add('nk-intro');
  setTimeout(function () { if (!window.__introDone) html.classList.remove('nk-intro'); }, 12000); // filet de sécurité

  function letters(svg) {
    return Array.prototype.slice.call(svg.querySelectorAll('path'))
      .map(function (p) { return { el: p, box: p.getBBox() }; })
      .sort(function (a, b) { return a.box.x - b.box.x; });
  }
  function ns(tag) { return document.createElementNS('http://www.w3.org/2000/svg', tag); }

  var A = {
    DRAW: 3.4,      // durée cumulée du tracé des contours, répartie selon la longueur de chaque lettre
    OVERLAP: 0.45,  // la lettre suivante commence quand la précédente est tracée à 55 % : l'écriture coule
    FILL: 1.3,      // étalement du pigment dans une lettre
    STROKE: 0.22,   // épaisseur du contour (unités du logo)
    STROKE_OP: 0.5, // contour plus clair que la lettre finale : un premier passage léger
    JITTER: 0.08    // vibration de la pointe, à peine perceptible
  };
  function aiguille(svg, color) {
    var list = letters(svg);
    var tl = gsap.timeline();

    var needle = ns('g'), glow = ns('circle'), tip = ns('circle');
    glow.setAttribute('r', '1.1'); glow.style.fill = color; glow.style.opacity = '0.08';
    tip.setAttribute('r', '0.28'); tip.style.fill = color; tip.style.opacity = '0.85';
    needle.appendChild(glow); needle.appendChild(tip); needle.style.opacity = 0;
    svg.appendChild(needle);
    var pos = { x: 0, y: 0 }, cur = { x: 0, y: 0 }, first = true;
    var follow = function () { // la pointe glisse vers sa cible (pas de saut d'une lettre à l'autre)
      if (first) { cur.x = pos.x; cur.y = pos.y; first = false; }
      cur.x += (pos.x - cur.x) * 0.35; cur.y += (pos.y - cur.y) * 0.35;
      needle.setAttribute('transform', 'translate(' + (cur.x + (Math.random() - 0.5) * A.JITTER) + ',' + (cur.y + (Math.random() - 0.5) * A.JITTER) + ')');
    };
    gsap.ticker.add(follow);

    var defs = ns('defs'), filter = ns('filter'), turb = ns('feTurbulence'), disp = ns('feDisplacementMap'), blur = ns('feGaussianBlur');
    filter.setAttribute('id', 'nk-pigment'); filter.setAttribute('x', '-30%'); filter.setAttribute('y', '-30%');
    filter.setAttribute('width', '160%'); filter.setAttribute('height', '160%');
    turb.setAttribute('type', 'fractalNoise'); turb.setAttribute('baseFrequency', '0.45'); turb.setAttribute('numOctaves', '3'); turb.setAttribute('seed', '7');
    disp.setAttribute('in', 'SourceGraphic'); disp.setAttribute('scale', '2.4');
    disp.setAttribute('xChannelSelector', 'R'); disp.setAttribute('yChannelSelector', 'G'); disp.setAttribute('result', 'd');
    blur.setAttribute('in', 'd'); blur.setAttribute('stdDeviation', '0.45');
    filter.appendChild(turb); filter.appendChild(disp); filter.appendChild(blur);
    defs.appendChild(filter); svg.insertBefore(defs, svg.firstChild);

    var total = list.reduce(function (s, l) { return s + l.el.getTotalLength(); }, 0);
    var strokes = [], at = 0, end = 0;

    list.forEach(function (l, i) {
      var p = l.el, len = p.getTotalLength(), b = l.box;
      p.style.opacity = 0; // la lettre nette n'apparaît qu'à la fin, en fondu

      var stroke = p.cloneNode();
      stroke.removeAttribute('class');
      stroke.style.fill = 'none'; stroke.style.stroke = color; stroke.style.opacity = A.STROKE_OP;
      stroke.style.strokeWidth = A.STROKE; stroke.style.strokeLinejoin = 'round'; stroke.style.strokeLinecap = 'round';
      stroke.style.strokeDasharray = len; stroke.style.strokeDashoffset = len;

      var clip = ns('clipPath'); clip.setAttribute('id', 'nk-l' + i);
      var cp = ns('path'); cp.setAttribute('d', p.getAttribute('d')); clip.appendChild(cp); defs.appendChild(clip);
      var g = ns('g'); g.setAttribute('clip-path', 'url(#nk-l' + i + ')'); g.setAttribute('data-nk-pigment', '');
      var blob = ns('circle'); blob.style.fill = color; blob.style.opacity = 0.55; blob.setAttribute('filter', 'url(#nk-pigment)');
      var isDot = b.width < 5 && i === list.length - 1;
      var o = isDot ? { x: b.x + b.width / 2, y: b.y + b.height / 2 } : p.getPointAtLength(0);
      blob.setAttribute('cx', o.x); blob.setAttribute('cy', o.y); blob.setAttribute('r', 0);
      g.appendChild(blob);
      p.parentNode.insertBefore(g, p.nextSibling);
      if (!isDot) { p.parentNode.insertBefore(stroke, g.nextSibling); strokes.push(stroke); }
      var R = Math.sqrt(b.width * b.width + b.height * b.height) * 1.2;

      if (isDot) { // le point final : la pointe s'y pose, le pigment éclot
        var t0 = at + 0.25;
        tl.call(function () { pos.x = o.x; pos.y = o.y; }, null, t0)
          .to(blob, { attr: { r: R }, duration: 0.9, ease: 'sine.out' }, t0 + 0.2)
          .to(blob, { opacity: 1, duration: 0.9, ease: 'sine.out' }, t0 + 0.2);
        end = Math.max(end, t0 + 1.1);
        return;
      }
      var d = Math.max(0.25, A.DRAW * len / total);
      var proxy = { t: 0 };
      tl.call(function () { pos.x = o.x; pos.y = o.y; }, null, at)
        .to(proxy, {
          t: 1, duration: d, ease: 'sine.inOut',
          onUpdate: function () {
            stroke.style.strokeDashoffset = len * (1 - proxy.t);
            var pt = p.getPointAtLength(len * proxy.t); pos.x = pt.x; pos.y = pt.y;
          }
        }, at)
        .to(blob, { attr: { r: R }, duration: A.FILL, ease: 'sine.inOut' }, at + d * 0.9)
        .to(blob, { opacity: 1, duration: A.FILL, ease: 'sine.inOut' }, at + d * 0.9);
      end = Math.max(end, at + d * 0.9 + A.FILL);
      at += d * (1 - A.OVERLAP);
    });

    tl.to(needle, { opacity: 1, duration: 0.4, ease: 'sine.out' }, 0)
      .to(needle, { opacity: 0, duration: 0.5, ease: 'sine.inOut' }, end - 0.6)
      .to(strokes, { opacity: 0, duration: 0.6, ease: 'sine.inOut' }, end - 0.3)
      .to(list.map(function (l) { return l.el; }), { opacity: 1, duration: 0.5, ease: 'sine.inOut' }, end - 0.2)
      .call(function () {
        gsap.ticker.remove(follow); needle.remove();
        svg.querySelectorAll('[data-nk-pigment]').forEach(function (n) { n.remove(); });
        strokes.forEach(function (n) { n.remove(); });
        defs.remove();
      }, null, end + 0.4);
    return tl;
  }


  function hex(c) { var n = parseInt(c.replace('#', ''), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; }

  function loadPhoto(url) {
    return new Promise(function (resolve) {
      if (!url) return resolve(null);
      var img = new Image(), t = setTimeout(function () { resolve(null); }, 4000);
      img.crossOrigin = 'anonymous'; // la photo devient une texture WebGL : CORS obligatoire (OK sur le CDN Webflow)
      img.onload = function () { clearTimeout(t); resolve(img); };
      img.onerror = function () { clearTimeout(t); resolve(null); };
      img.src = url;
    });
  }

  function pct(v, d) { return (v || d).split(' ').map(function (x) { return parseFloat(x) / 100; }); }

  function cover(img, W, H, pos) {
    var p = (pos || '50% 35%').split(' ').map(function (v) { return parseFloat(v) / 100; });
    var A = W / H, B = img.naturalWidth / img.naturalHeight, kx = 1, ky = 1;
    if (A > B) ky = B / A; else kx = A / B;
    return [kx, ky, (1 - kx) * p[0] + kx / 2, 1 - ((1 - ky) * p[1] + ky / 2)];
  }

  var F = {
    DUR: 5.4,          // durée de l'étalement (secondes)
    BG: '#0a0807',     // fond de départ (noir chaud)
    R1: 0.13,          // la tache s'ouvre d'abord sur le regard (rayon, en hauteur d'écran)…
    TAU: 0.9,          // …en ralentissant doucement (constante de temps, s), sans jamais s'arrêter…
    GROW: [0.6, 5.1],  // …pendant que la croissance vers tout l'écran a déjà commencé (vitesse jamais nulle : vérifié)
    STRETCH: 2.0,      // étirée en largeur sur la ligne des yeux au début
    ZOOM: 2.2, ZOOM_OUT: [0.3, 4.9], // la photo commence rapprochée sur le regard et recule jusqu'au plan entier
    WOB: 0.16,         // grands lobes du bord
    FRINGE: 0.035,     // digitations (relatif au rayon)
    SOFT: 0.06,        // douceur du bord (relatif au rayon, bornée)
    HALO: 0.16, HALO_OP: 0.5, // frange fibreuse au-delà du bord (relatif au rayon)
    RES: 1.25          // définition de rendu max (× pixels CSS) : bord doux, inutile d'aller au-delà
  };
  var FS = ['precision highp float;varying vec2 vUv;',
    'uniform sampler2D uPhoto;uniform vec4 uCov;uniform vec2 uFocus,uAnchor,uRes;uniform vec3 uBg;',
    'uniform float uZoom,uR,uT,uStretch,uWob,uFringe,uSoft,uHalo,uHaloOp;',
    'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
    'float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}',
    'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}',
    'void main(){float asp=uRes.x/uRes.y;vec2 q=vec2(vUv.x*asp,vUv.y);vec2 c=vec2(uAnchor.x*asp,uAnchor.y);',
    ' vec3 ph=texture2D(uPhoto,uFocus+(vUv-uAnchor)*uCov.xy/uZoom).rgb;',
    ' if(uR<=0.){gl_FragColor=vec4(uBg,1.);return;}',
    ' vec2 v=q-c;v.x/=uStretch;float L=length(v);vec2 dir=v/(L+1e-5);',
    ' float n=L/uR;',
    ' float lob=fbm(dir*1.5+3.3+uT*.05)-.5;',             // grands lobes, qui évoluent très lentement
    ' float fin=fbm(dir*6.+7.1)-.5;',                       // digitations, fixes sur la tache
    ' float e=1.+lob*uWob*2.+fin*uFringe*2.;',
    ' float d=e-n;',                                         // > 0 dans la tache
    ' float s=clamp(uSoft,.004/uR,.25);',
    ' float core=smoothstep(-s,s*.6,d);',
    ' float a=core;',
    ' if(d>-uHalo-.02&&d<.02){',                             // la frange n'est calculée qu'au bord
    '  float fib=smoothstep(.42,.72,fbm(dir*38.+vec2(n*3.,0.)))*.75+fbm(dir*12.+vec2(n*1.5,2.))*.45;',
    '  float hw=uHalo*(.55+.9*fbm(dir*4.+1.));',
    '  a=max(core,smoothstep(-hw,0.,d)*fib*uHaloOp);}',
    ' gl_FragColor=vec4(mix(uBg,ph,a),1.);}'].join('\n');

  function smoother(x) { x = Math.min(1, Math.max(0, x)); return x * x * x * (x * (x * 6 - 15) + 10); } // continue jusqu'à l'accélération

  function encre(el, photo, o) {
    var dpr = Math.min(F.RES, window.devicePixelRatio || 1);
    var cv = document.createElement('canvas');
    cv.width = Math.round(window.innerWidth * dpr); cv.height = Math.round(window.innerHeight * dpr);
    cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:2';
    var gl = cv.getContext('webgl', { alpha: false, antialias: false, preserveDrawingBuffer: !!o.keep });
    if (!gl) return null;
    function sh(t, s) { var x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x);
      if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) { console.warn('[intro encre]', gl.getShaderInfoLog(x)); return null; } return x; }
    var vs = sh(gl.VERTEX_SHADER, 'attribute vec2 aPos;varying vec2 vUv;void main(){vUv=aPos*.5+.5;gl_Position=vec4(aPos,0.,1.);}');
    var fs = sh(gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) return null;
    var pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return null;
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pr, 'aPos'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, photo);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    var U = function (n) { return gl.getUniformLocation(pr, n); };
    var cov = cover(photo, cv.width, cv.height, o.photoPos);
    var f = pct(o.focus, '50% 30%'), fu = f[0], fv = 1 - f[1];
    var ex = (fu - cov[2]) / cov[0] + 0.5, ey = (fv - cov[3]) / cov[1] + 0.5; // le regard à l'écran
    gl.uniform4fv(U('uCov'), cov); gl.uniform2f(U('uFocus'), fu, fv); gl.uniform2f(U('uAnchor'), ex, ey);
    gl.uniform2f(U('uRes'), cv.width, cv.height); gl.uniform3fv(U('uBg'), hex(o.bg || F.BG));
    gl.uniform1f(U('uWob'), F.WOB); gl.uniform1f(U('uFringe'), F.FRINGE); gl.uniform1f(U('uSoft'), F.SOFT);
    gl.uniform1f(U('uHalo'), F.HALO); gl.uniform1f(U('uHaloOp'), F.HALO_OP);
    gl.viewport(0, 0, cv.width, cv.height);
    var uR = U('uR'), uT = U('uT'), uZ = U('uZoom'), uS = U('uStretch');
    var asp = cv.width / cv.height, fx = Math.max(ex, 1 - ex) * asp, fy = Math.max(ey, 1 - ey);
    var Rmax = Math.sqrt(fx * fx + fy * fy) * 1.3; // juste assez : la révélation dure jusqu'au fondu
    function R(t) { // une seule courbe : ouverture sur le regard qui ralentit, puis croissance douce jusqu'à tout l'écran
      return F.R1 * (1 - Math.exp(-t / F.TAU)) + (Rmax - F.R1) * smoother((t - F.GROW[0]) / (F.GROW[1] - F.GROW[0]));
    }
    function draw(t) {
      var r = t > 0 ? R(t) : 0, e = smoother((t - F.ZOOM_OUT[0]) / (F.ZOOM_OUT[1] - F.ZOOM_OUT[0]));
      gl.uniform1f(uR, r); gl.uniform1f(uT, t); gl.uniform1f(uZ, 1 + (F.ZOOM - 1) * (1 - e));
      gl.uniform1f(uS, 1 + (F.STRETCH - 1) * (1 - smoother(r / 0.6)));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    var st = { t: 0 };
    draw(0);
    el.appendChild(cv); // première image : le fond seul, identique à l'écran d'intro
    var tl = gsap.timeline();
    tl.to(st, { t: F.DUR, duration: F.DUR, ease: 'none', onUpdate: function () { draw(st.t); } });
    tl.__canvas = cv; tl.__dur = F.DUR;
    tl.__dispose = function () { var l = gl.getExtension('WEBGL_lose_context'); if (l) l.loseContext(); cv.remove(); };
    return tl;
  }

  var P = {
    DUR: 5.2,            // durée totale (s)
    BLUR: 30,            // flou de départ (px CSS)
    R1: 0.12, TAU: 0.8,  // zone nette : s'ouvre d'abord sur le regard (rayon, en hauteur d'écran)…
    GROW: [0.7, 4.5],    // …puis gagne tout l'écran, sans pause (vitesse jamais nulle)
    SOFT: 0.2,           // dégradé de netteté (profondeur de champ), en hauteur d'écran
    STRETCH: 2.3,        // zone nette étirée sur la ligne des yeux au début
    EXPO: [0, 2.2],      // la lumière monte depuis le noir
    VEIL: 0.4,           // hors de la zone nette, l'image reste plus sombre au début (le regard s'éclaire en premier)
    ZOOM: 1.45, ZOOM_OUT: [0, 4.9], // léger recul jusqu'au cadrage du hero
    RES: 1.25
  };
  var PS = ['precision highp float;varying vec2 vUv;',
    'uniform sampler2D uPhoto;uniform vec4 uCov;uniform vec2 uFocus,uAnchor,uRes;uniform vec3 uBg;',
    'uniform float uZoom,uRf,uSoft,uStretch,uBlur,uExpo,uVeil;',
    'vec2 uvOf(vec2 s){return uFocus+(s-uAnchor)*uCov.xy/uZoom;}',
    'void main(){float asp=uRes.x/uRes.y;',
    ' vec2 v=vUv-uAnchor;v.x*=asp/uStretch;float L=length(v);',
    ' float k=smoothstep(uRf,uRf+uSoft,L);',                   // 0 = net (près du regard), 1 = flou
    ' float b=uBlur*k;',                                        // rayon de flou en pixels de la toile
    ' vec2 uv=uvOf(vUv);vec3 c=vec3(0.);',
    ' float lod=log2(1.+b/3.);vec2 sc=uCov.xy/uZoom/uRes*b;',
    ' for(int i=0;i<24;i++){float fi=float(i);float r=sqrt((fi+.5)/24.);float a=fi*2.39996;',  // spirale de Vogel
    '  c+=texture2D(uPhoto,uv+vec2(cos(a),sin(a))*r*sc,lod).rgb;}',
    ' c/=24.;',
    ' float kv=smoothstep(uRf,uRf+uSoft*3.,L);',             // voile très progressif : pas d'ovale « projecteur »
    ' float e=uExpo*(1.-kv*uVeil);',
    ' gl_FragColor=vec4(mix(uBg,c,e),1.);}'].join('\n');

  function point(el, photo, o) {
    var dpr = Math.min(P.RES, window.devicePixelRatio || 1);
    var cv = document.createElement('canvas');
    cv.width = Math.round(window.innerWidth * dpr); cv.height = Math.round(window.innerHeight * dpr);
    cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:2';
    var gl = cv.getContext('webgl', { alpha: false, antialias: false, preserveDrawingBuffer: !!o.keep });
    if (!gl) return null;
    function sh(t, s) { var x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x);
      if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) { console.warn('[intro point]', gl.getShaderInfoLog(x)); return null; } return x; }
    var vs = sh(gl.VERTEX_SHADER, 'attribute vec2 aPos;varying vec2 vUv;void main(){vUv=aPos*.5+.5;gl_Position=vec4(aPos,0.,1.);}');
    var fs = sh(gl.FRAGMENT_SHADER, PS);
    if (!vs || !fs) return null;
    var pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return null;
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pr, 'aPos'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var max = gl.getParameter(gl.MAX_TEXTURE_SIZE), tw = Math.min(4096, max), th = tw / 2;
    var tc = document.createElement('canvas'); tc.width = tw; tc.height = th;
    tc.getContext('2d').drawImage(photo, 0, 0, tw, th);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tc);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    var U = function (n) { return gl.getUniformLocation(pr, n); };
    var cov = cover(photo, cv.width, cv.height, o.photoPos); // cadrage d'après les proportions réelles de la photo
    var f = pct(o.focus, '50% 30%'), fu = f[0], fv = 1 - f[1];
    var ex = (fu - cov[2]) / cov[0] + 0.5, ey = (fv - cov[3]) / cov[1] + 0.5; // le regard à l'écran
    gl.uniform4fv(U('uCov'), cov); gl.uniform2f(U('uFocus'), fu, fv); gl.uniform2f(U('uAnchor'), ex, ey);
    gl.uniform2f(U('uRes'), cv.width, cv.height); gl.uniform3fv(U('uBg'), hex(o.bg || F.BG));
    gl.uniform1f(U('uSoft'), P.SOFT);
    gl.viewport(0, 0, cv.width, cv.height);
    var uRf = U('uRf'), uS = U('uStretch'), uB = U('uBlur'), uE = U('uExpo'), uV = U('uVeil'), uZ = U('uZoom');
    var asp = cv.width / cv.height, fx = Math.max(ex, 1 - ex) * asp, fy = Math.max(ey, 1 - ey);
    var Rmax = Math.sqrt(fx * fx + fy * fy); // zone nette qui couvre tout l'écran depuis le regard
    function Rf(t) { // part de -SOFT (tout flou, même les yeux), une seule courbe continue
      return -P.SOFT + (P.R1 + P.SOFT) * (1 - Math.exp(-t / P.TAU)) + (Rmax - P.R1) * smoother((t - P.GROW[0]) / (P.GROW[1] - P.GROW[0]));
    }
    function draw(t) {
      var r = Rf(t), g = smoother(t / P.DUR);
      gl.uniform1f(uRf, r);
      gl.uniform1f(uS, 1 + (P.STRETCH - 1) * (1 - smoother(Math.max(0, r) / 0.7)));
      gl.uniform1f(uB, P.BLUR * dpr * (1 - g));            // le flou lointain se dissipe aussi, jusqu'à zéro
      gl.uniform1f(uE, smoother((t - P.EXPO[0]) / (P.EXPO[1] - P.EXPO[0])));
      gl.uniform1f(uV, P.VEIL * (1 - smoother(t / 3.6)));
      gl.uniform1f(uZ, 1 + (P.ZOOM - 1) * (1 - smoother((t - P.ZOOM_OUT[0]) / (P.ZOOM_OUT[1] - P.ZOOM_OUT[0]))));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    var st = { t: 0 };
    draw(0);
    el.appendChild(cv); // première image : noir, identique à l'écran d'intro
    var tl = gsap.timeline();
    tl.to(st, { t: P.DUR, duration: P.DUR, ease: 'none', onUpdate: function () { draw(st.t); } });
    tl.__canvas = cv; tl.__dur = P.DUR;
    tl.__dispose = function () { var l = gl.getExtension('WEBGL_lose_context'); if (l) l.loseContext(); cv.remove(); };
    return tl;
  }

  window.NKIntro = function (container, start) {
    var el = document.querySelector('[data-intro]');
    var logo = el && el.querySelector('[data-intro-logo]');
    var svg = logo && logo.querySelector('svg');
    var variant = el && (forced || el.getAttribute('data-intro-variant') || 'aiguille');
    if (!el || !window.gsap || (!svg && variant !== 'encre' && variant !== 'point')) { html.classList.remove('nk-intro'); return start(); }
    var color = el.getAttribute('data-intro-color') || '#090203';
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (window.NK) NK.stopScroll();

    function done() {
      window.__introDone = true;
      html.classList.remove('nk-intro');
      gsap.set(el, { clearProps: 'all' });
      if (window.NK) NK.startScroll();
      try { if (ONCE_PER_SESSION && !forced) sessionStorage.setItem('nk-intro', '1'); } catch (e) {}
    }
    function outro(tl) { // volet (aiguille)
      tl.add(start, '+=0.6') // la page se prépare, encore cachée
        .to(el, { scaleX: 0, transformOrigin: '0% 50%', duration: 1.1, ease: 'expo.inOut', onComplete: done });
    }
    function fade(tl) { // repli : simple fondu de l'écran d'intro
      tl.add(start, '+=0.2').to(el, { autoAlpha: 0, duration: 0.8, ease: 'sine.inOut', onComplete: done });
    }

    if (variant === 'encre' || variant === 'point') { // écran noir, puis l'encre ou la mise au point sur le regard
      if (logo) gsap.set(logo, { visibility: 'hidden' });
      var bg = el.getAttribute('data-intro-bg') || F.BG;
      gsap.set(el, { backgroundColor: bg });
      if (reduce) return fade(gsap.timeline());
      loadPhoto(el.getAttribute('data-intro-photo')).then(function (photo) {
        var tl = photo && (variant === 'point' ? point : encre)(el, photo, { bg: bg, photoPos: el.getAttribute('data-intro-photo-pos'), focus: el.getAttribute('data-intro-focus') });
        if (!tl) return fade(gsap.timeline()); // pas de photo ou pas de WebGL
        gsap.set(el, { backgroundColor: 'transparent' }); // la toile, opaque, couvre tout
        tl.add(start, tl.__dur - 1.1)
          .to(tl.__canvas, { opacity: 0, duration: 1, ease: 'sine.inOut' }, tl.__dur - 0.7)
          .call(function () { tl.__dispose(); done(); });
      });
      return;
    }

    if (reduce) { // mouvement réduit : logo affiché, simple fondu
      gsap.set(logo, { visibility: 'visible' });
      var r = gsap.timeline(); r.from(logo, { autoAlpha: 0, duration: 0.4 }); outro(r); return;
    }
    var tl = aiguille(svg, color);
    gsap.set(logo, { visibility: 'visible' });
    outro(tl);
  };
})();
(function () { // démo : logo de Nadia (aiguille), photo du hero provisoire (encre, point)
  if (!window.NKIntro) return;
  var aig = /[?&]intro=aiguille/.test(location.search);
  document.documentElement.setAttribute('data-fond', aig ? 'aiguille' : 'noir');
  var svgReady = fetch('https://cdn.prod.website-files.com/6adf3b7acbf156898f50a232/6ae1ae06a7b5b1d293475376_logo-adr-intro.svg').then(function (r) { return r.text(); });
  var orig = window.NKIntro;
  window.NKIntro = function (c, s) {
    var el = document.querySelector('[data-intro]');
    if (el) {
      el.setAttribute('data-intro-variant', 'point');
      el.setAttribute('data-intro-photo', 'https://cdn.prod.website-files.com/6adf3b7acbf156898f50a232/6ae1b7fd88d29a2dd6c21b55_intro-photo-hero-paysage.jpg');
      el.setAttribute('data-intro-photo-pos', '50% 35%');
      el.setAttribute('data-intro-focus', '50% 30%');
    }
    svgReady.then(function (txt) {
      if (el && !el.querySelector('[data-intro-logo]')) { var d = document.createElement('div'); d.setAttribute('data-intro-logo', ''); d.innerHTML = txt; el.appendChild(d); }
      orig(c, s);
    }, function () { orig(c, s); });
  };
})();
