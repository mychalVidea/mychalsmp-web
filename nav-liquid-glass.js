/* ==========================================================================
   MYCHAL SMP – Physical & Chemical Liquid Glass Navigation
   Přeneseno z https://github.com/mychalVidea/liquid-sim
   Model: Sellmeier/Cauchy disperze · Fresnel (s/p) · Beer-Lambert · TIR
   Config: Pill (SDF) · SF11 Olovnaté · ω₀=22.5 · ζ=0.78 · H=0.032 · Bevel=0.038 · Frost=0.16
   ========================================================================== */

(function () {
  'use strict';

  // Přesná konfigurace dle liquid-sim a zadaného presetu (SF11 Olovnaté, Pill)
  const LIQUID_NAV_CONFIG = {
    shape: 0, // Pill (sdRoundedBox s poloměrem půlvýšky)
    material: {
      name: 'SF11 Olovnaté',
      nd: 1.7847,
      cauchyB: 0.0165,
      absorption: [0.35, 0.25, 0.45]
    },
    omega: 22.5,      // Vlastní úhlová frekvence ω₀ (rad/s)
    zeta: 0.78,       // Poměr tlumení ζ
    thickness: 0.032, // Referenční tloušťka čočky H (poměrně k poloviční výšce pilulky 0.068)
    bevel: 0.038,     // Šířka zakřiveného menisku (poměrně k 0.068)
    frost: 0.16,      // Jemné mléko (Frost)
    refHalfHeight: 0.068
  };

  // Přesah WebGL plátna kolem .nav-links pro hladký stín, zvětšení a odlesky bez ořezu
  const BLEED_X = 40;
  const BLEED_Y = 20;

  const VERTEX_SHADER = `
    attribute vec2 aPosition;
    varying vec2 vUv;
    void main() {
      vUv = aPosition * 0.5 + 0.5;
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;

  const FRAGMENT_SHADER = `
    precision highp float;

    uniform sampler2D uImage;
    uniform vec2 uResolution;

    uniform vec2 uPos;       // Střed pilulky v prostoru [0..aspect, 0..1]
    uniform vec2 uHalfSize;  // Poloviční šířka a výška pilulky v Y-normalizovaných jednotkách
    uniform vec2 uStretch;   // Elastický objem-zachovávající stretch
    uniform float uScale;

    uniform float uNd;
    uniform float uCauchyB;
    uniform vec3 uAbsorption;
    uniform float uThickness;
    uniform float uBevel;
    uniform float uFrost;
    uniform float uSimScale;
    uniform vec3 uGlassTint;

    varying vec2 vUv;

    float sdRoundedBox(vec2 p, vec2 b, float r) {
      vec2 q = abs(p) - b + r;
      return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
    }

    float glassSDF(vec2 p) {
      vec2 d = p - uPos;
      float stMag = length(uStretch);
      if (stMag > 0.0005) {
        vec2 dir = uStretch / stMag;
        vec2 perp = vec2(-dir.y, dir.x);
        float s = 1.0 + stMag * 0.36;
        d = dir * (dot(d, dir) / s) + perp * (dot(d, perp) * s);
      }
      d /= uScale;
      vec2 boxB = vec2(max(uHalfSize.x, uHalfSize.y), uHalfSize.y);
      float radius = uHalfSize.y;
      return sdRoundedBox(d, boxB, radius) * uScale;
    }

    // Analytický profil 3D výšky z(sdf) s hladkým C¹ přechodem do plochého středu
    float surfaceHeight(float sdf) {
      float distIn = max(0.0, -sdf);
      float t = clamp(distIn / max(uBevel, 0.0001), 0.0, 1.0);
      return uThickness * sqrt(max(0.0, 1.0 - (1.0 - t) * (1.0 - t)));
    }

    // Přesný Fresnelův koeficient odrazu pro nepolarizované světlo: R = 0.5 * (Rs + Rp)
    float exactFresnel(float cosI, float n1, float n2) {
      float eta = n1 / n2;
      float sinT2 = eta * eta * (1.0 - cosI * cosI);
      if (sinT2 >= 1.0) return 1.0;
      float cosT = sqrt(1.0 - sinT2);
      float rs = (n1 * cosI - n2 * cosT) / (n1 * cosI + n2 * cosT);
      float rp = (n1 * cosT - n2 * cosI) / (n1 * cosT + n2 * cosI);
      return 0.5 * (rs * rs + rp * rp);
    }

    // Cauchyho disperzní rovnice: n(λ) = n_d + B * (1/λ² - 1/λ_d²)
    float dispersionIOR(float lambdaUm) {
      return uNd + uCauchyB * (1.0 / (lambdaUm * lambdaUm) - 2.89626);
    }

    vec3 sampleBg(vec2 uv, float blurAmount, float aspect) {
      if (blurAmount <= 0.0001) {
        return texture2D(uImage, clamp(uv, 0.002, 0.998)).rgb;
      }
      vec3 sum = texture2D(uImage, clamp(uv, 0.002, 0.998)).rgb * 0.20;
      for (int i = 0; i < 8; i++) {
        float a = float(i) * 0.78539816;
        vec2 off = vec2(cos(a) / aspect, sin(a)) * blurAmount;
        sum += texture2D(uImage, clamp(uv + off, 0.002, 0.998)).rgb * 0.10;
      }
      return sum;
    }

    // Dvoustupňové trasování paprsku pro danou vlnovou délku λ
    float traceWavelength(vec2 bgUv, vec3 V, vec3 N, float z, float lambdaUm, float aspect, float blur, float edgeFade, out float pathLen, int channel) {
      float n = mix(uNd, dispersionIOR(lambdaUm), edgeFade);
      vec3 T1 = refract(V, N, 1.0 / n);
      pathLen = z / max(abs(T1.z), 0.35);

      vec2 shift1 = T1.xy * pathLen;
      vec3 T2 = refract(T1, vec3(0.0, 0.0, 1.0), n);
      vec2 totalShift;
      if (length(T2) < 0.001) {
        totalShift = shift1 * 0.55;
      } else {
        totalShift = shift1 + T2.xy / max(abs(T2.z), 0.42) * (uThickness * 0.48);
      }
      totalShift = clamp(totalShift, vec2(-0.045 * uSimScale), vec2(0.045 * uSimScale));
      totalShift.x /= aspect;

      // Jemná refrakce meniskem bez vystřelování paprsků do vzdáleného textu
      vec3 col = sampleBg(bgUv + totalShift * 0.28, blur, aspect);
      return channel == 0 ? col.r : (channel == 1 ? col.g : col.b);
    }

    void main() {
      float aspect = uResolution.x / uResolution.y;
      vec2 p = vec2(vUv.x * aspect, vUv.y);

      float sdf = glassSDF(p);

      // Jemný fyzikální stín pod čočkou mimo tělo pilulky
      float shadowSdf = glassSDF(p - vec2(0.004, -0.010) * uSimScale);
      float shadow = smoothstep(0.036 * uSimScale, -0.006 * uSimScale, shadowSdf);
      float shadowAlpha = shadow * 0.34;

      float aa = max(0.0018 * uSimScale, 1.4 / uResolution.y);
      float mask = smoothstep(aa, -aa, sdf);
      if (mask <= 0.001) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, shadowAlpha);
        return;
      }

      // 1. Přesná 3D normála povrchu N = normalize(-∂z/∂x, -∂z/∂y, 1)
      float eps = 0.0016 * uSimScale;
      float zC = surfaceHeight(sdf);
      float zR = surfaceHeight(glassSDF(p + vec2(eps, 0.0)));
      float zL = surfaceHeight(glassSDF(p - vec2(eps, 0.0)));
      float zT = surfaceHeight(glassSDF(p + vec2(0.0, eps)));
      float zB = surfaceHeight(glassSDF(p - vec2(0.0, eps)));

      float dzdx = clamp((zR - zL) / (2.0 * eps), -2.4, 2.4);
      float dzdy = clamp((zT - zB) / (2.0 * eps), -2.4, 2.4);
      vec3 N = normalize(vec3(-dzdx, -dzdy, 1.0));

      vec3 V = normalize(vec3((p - uPos) * 0.08, -1.0));
      float cosI = clamp(dot(-V, N), 0.0, 1.0);

      // 2. Spektrální refrakce (630 nm R, 532 nm G, 465 nm B)
      // Plochý střed pilulky zůstává křišťálově ostrý, frost se soustředí do zakřiveného menisku
      float distIn = max(0.0, -sdf);
      float edgeFade = smoothstep(0.0, 0.005 * uSimScale, distIn);
      float meniscusMask = smoothstep(uBevel * 1.15, 0.0, distIn);
      float blur = uFrost * 0.0038 * uSimScale * meniscusMask;
      float pathR, pathG, pathB;
      float tR = traceWavelength(vUv, V, N, zC, 0.630, aspect, blur, edgeFade, pathR, 0);
      float tG = traceWavelength(vUv, V, N, zC, 0.532, aspect, blur, edgeFade, pathG, 1);
      float tB = traceWavelength(vUv, V, N, zC, 0.465, aspect, blur, edgeFade, pathB, 2);
      vec3 transmitted = vec3(tR, tG, tB);

      // 3. Chemická absorpce — Beer-Lambertův zákon (kalibrovaný pro tmavý Obsidian podklad)
      vec3 beerLambert = exp(-uAbsorption * vec3(pathR, pathG, pathB) * (0.95 / max(uSimScale, 0.5)));
      transmitted *= beerLambert;

      // 4. Fresnelův odraz zakotvený do čistého Apple Liquid Glass vzhledu na tmavém Obsidianu
      float F = exactFresnel(cosI, 1.0, uNd);
      vec3 Rdir = reflect(V, N);
      float sky = smoothstep(-0.15, 0.85, Rdir.y);
      float hasTint = step(0.01, length(uGlassTint));
      vec3 envBaseLow = mix(vec3(0.055, 0.058, 0.068), uGlassTint * 0.16, hasTint);
      vec3 envBaseHigh = mix(vec3(0.84, 0.88, 0.96), mix(vec3(0.88, 0.84, 0.96), uGlassTint, 0.55), hasTint);
      vec3 envReflect = mix(envBaseLow, envBaseHigh, sky);

      // Čisté neutrální kouřové sklo bez rušivého modrého zákalu
      vec3 minBody = mix(vec3(0.072, 0.074, 0.084), uGlassTint * 0.08 + vec3(0.062, 0.062, 0.068), hasTint);
      vec3 glassBody = max(transmitted, minBody);
      float fresnelEdgeWeight = mix(0.14, 0.82, smoothstep(0.0, uBevel * 0.95, abs(N.x) + abs(N.y)));
      vec3 glassColor = glassBody * (1.0 - F * 0.35) + envReflect * (F * fresnelEdgeWeight * 0.46);

      // 5. Apple diagonální odlesky na hraně (Specular Rim + ostrý meniskus)
      vec2 grad = normalize(vec2(-dzdx, -dzdy) + 1e-6);
      vec2 lightDir = normalize(vec2(-0.707, 0.707));
      float align = dot(grad, lightDir);
      float diag = pow(max(0.0, align), 3.2) + pow(max(0.0, -align), 4.2) * 0.65;

      float hairline = smoothstep(0.0030 * uSimScale, 0.0004 * uSimScale, distIn);
      float bevelSheen = smoothstep(uBevel * 0.58, 0.001 * uSimScale, distIn) * (1.0 - smoothstep(0.001 * uSimScale, 0.0, distIn));

      vec3 rimTint = mix(vec3(0.96, 0.98, 1.0), mix(vec3(1.0), uGlassTint + vec3(0.18), 0.38), hasTint);
      glassColor += rimTint * hairline * (0.14 + 0.62 * diag);
      glassColor += mix(vec3(0.90, 0.93, 0.98), transmitted + 0.18, 0.22) * bevelSheen * (0.04 + 0.18 * diag);

      // Přesné Porter-Duff složení: glass OVER shadow (přímá alfa pro canvas bez WebGL blendu)
      float outAlpha = mix(shadowAlpha, 1.0, mask);
      vec3 outRgb = (glassColor * mask) / max(outAlpha, 0.0001);
      gl_FragColor = vec4(outRgb, outAlpha);
    }
  `;

  function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn('[LiquidNav] Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  class NavLiquidGlassController {
    constructor() {
      this.container = document.querySelector('.nav-links');
      if (!this.container) return;

      this.canvas = null;
      this.gl = null;
      this.program = null;
      this.uniforms = {};
      this.texture = null;

      this.backdropCanvas = document.createElement('canvas');
      this.backdropCtx = this.backdropCanvas.getContext('2d');
      this.svgCache = new Map();
      this.textureDirty = true;

      this.activeBtn = this.container.querySelector('.nav-link.active') || this.container.querySelector('.nav-link');
      this.hoveredBtn = null;
      this.isPointerInside = false;
      this.pointerRelX = null;
      this.leaveTimer = null;
      this.navbar = this.container.closest('.navbar') || this.container;

      this.rafId = null;
      this.lastTime = 0;
      this.enabled = false;
      this.width = 0;
      this.height = 0;
      this.dpr = 1;
      this.lastScrolled = null;

      // Stav tlumeného harmonického oscilátoru (poloha v px od levého okraje canvasu, poloviční šířka v px)
      this.glass = {
        x: 0,
        vx: 0,
        y: 0,
        vy: 0,
        halfW: 36,
        vhw: 0,
        halfH: 17,
        scale: 1.0,
        scaleVel: 0,
        targetScale: 1.0,
        stretchX: 0,
        stretchY: 0,
        stretchVx: 0,
        stretchVy: 0
      };
      this.target = { x: 0, y: 0, halfW: 36, halfH: 17 };
      this.hasInitializedPos = false;

      this.init();
    }

    prefersReducedMotion() {
      return typeof window !== 'undefined'
        && window.matchMedia
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    init() {
      if (this.prefersReducedMotion()) return;

      const canvas = document.createElement('canvas');
      canvas.className = 'nav-liquid-canvas';
      canvas.setAttribute('aria-hidden', 'true');

      const gl = canvas.getContext('webgl', {
        alpha: true,
        antialias: true,
        premultipliedAlpha: false,
        powerPreference: 'high-performance'
      });

      if (!gl) return;

      const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
      const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
      if (!vs || !fs) return;

      const program = gl.createProgram();
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.warn('[LiquidNav] Link error:', gl.getProgramInfoLog(program));
        return;
      }

      gl.useProgram(program);

      const quad = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

      const aPos = gl.getAttribLocation(program, 'aPosition');
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      const uniformNames = [
        'uImage', 'uResolution', 'uPos', 'uHalfSize', 'uStretch', 'uScale',
        'uNd', 'uCauchyB', 'uAbsorption', 'uThickness', 'uBevel', 'uFrost', 'uSimScale', 'uGlassTint'
      ];
      for (const name of uniformNames) {
        this.uniforms[name] = gl.getUniformLocation(program, name);
      }

      this.canvas = canvas;
      this.gl = gl;
      this.program = program;
      this.texture = texture;
      this.enabled = true;

      this.container.classList.add('has-liquid-glass');
      this.container.appendChild(canvas);

      this.cacheSvgIcons();
      this.bindEvents();
      this.measureAndResize(true);

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          this.textureDirty = true;
          this.measureAndResize(false);
        });
      }
    }

    cacheSvgIcons() {
      const buttons = this.container.querySelectorAll('.nav-link');
      buttons.forEach((btn) => {
        const svg = btn.querySelector('svg');
        if (!svg) return;
        const rawXml = new XMLSerializer().serializeToString(svg);
        btn.dataset.liquidId = btn.id || btn.textContent.trim();
        if (btn.classList.contains('nav-link--smp')) {
          this.loadSvgVariant(btn.dataset.liquidId + ':default', rawXml, '#fbbf24');
          this.loadSvgVariant(btn.dataset.liquidId + ':active', rawXml, '#fbbf24');
          this.loadSvgVariant(btn.dataset.liquidId + ':hover', rawXml, '#fde68a');
        } else if (btn.classList.contains('nav-link--media')) {
          this.loadSvgVariant(btn.dataset.liquidId + ':default', rawXml, '#c084fc');
          this.loadSvgVariant(btn.dataset.liquidId + ':active', rawXml, '#d946ef');
          this.loadSvgVariant(btn.dataset.liquidId + ':hover', rawXml, '#e879f9');
        } else {
          this.loadSvgVariant(btn.dataset.liquidId + ':default', rawXml, '#94a3b8');
          this.loadSvgVariant(btn.dataset.liquidId + ':active', rawXml, '#2b7cf5');
          this.loadSvgVariant(btn.dataset.liquidId + ':hover', rawXml, '#ffffff');
        }
      });
    }

    loadSvgVariant(key, rawXml, color) {
      let xml = rawXml.replace(/currentColor/g, color);
      if (!/xmlns=/.test(xml)) {
        xml = xml.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
      }
      // Explicitní rozměry zajistí ostrou vektorovou rasterizaci napříč všemi prohlížeči
      xml = xml.replace(/<svg\b([^>]*)>/i, (_, attrs) => {
        const cleaned = attrs.replace(/\s+(?:width|height)\s*=\s*(?:"[^"]*"|'[^']*')/gi, '');
        return `<svg${cleaned} width="64" height="64">`;
      });
      const img = new Image();
      img.onload = () => {
        this.svgCache.set(key, img);
        this.textureDirty = true;
        this.wake();
      };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
    }

    clearLeaveTimer() {
      if (this.leaveTimer) {
        clearTimeout(this.leaveTimer);
        this.leaveTimer = null;
      }
    }

    scheduleReturnToActive(delayMs = 190) {
      this.clearLeaveTimer();
      this.leaveTimer = setTimeout(() => {
        this.leaveTimer = null;
        if (this.isPointerInside) return;
        this.hoveredBtn = null;
        this.pointerRelX = null;
        this.glass.targetScale = 1.0;
        this.textureDirty = true;
        if (this.activeBtn) {
          this.syncTargetToButton(this.activeBtn, false);
        }
      }, delayMs);
    }

    bindEvents() {
      const buttons = this.container.querySelectorAll('.nav-link');

      buttons.forEach((btn) => {
        btn.addEventListener('mouseenter', () => {
          this.clearLeaveTimer();
          this.hoveredBtn = btn;
          this.isPointerInside = true;
          this.textureDirty = true;
          this.syncTargetToButton(btn, false);
        });

        btn.addEventListener('mousedown', () => {
          this.clearLeaveTimer();
          this.glass.targetScale = 1.07;
          this.wake();
        });
      });

      const trackRoot = this.navbar || this.container;

      trackRoot.addEventListener('mousemove', (e) => {
        if (!this.enabled || this.width <= 0) return;
        const cRect = this.container.getBoundingClientRect();
        if (cRect.width === 0 || cRect.height === 0) return;

        // Velkorysá toleranční zóna kolem tlačítek (nav-links + okraje navbaru), aby sklo neuskakovalo při mírném sjetí myši
        const padX = 14;
        const padY = 16;
        const insideZone =
          e.clientX >= cRect.left - padX &&
          e.clientX <= cRect.right + padX &&
          e.clientY >= cRect.top - padY &&
          e.clientY <= cRect.bottom + padY;

        if (insideZone) {
          this.clearLeaveTimer();
          this.isPointerInside = true;
          this.pointerRelX = e.clientX - cRect.left;
          const btnUnder = e.target.closest('.nav-link');
          if (btnUnder && this.container.contains(btnUnder) && btnUnder !== this.hoveredBtn) {
            this.hoveredBtn = btnUnder;
            this.textureDirty = true;
          }
          const focusBtn = this.hoveredBtn || this.activeBtn;
          if (focusBtn) {
            this.syncTargetToButton(focusBtn, false);
          }
        } else if (this.isPointerInside) {
          this.isPointerInside = false;
          this.scheduleReturnToActive(190);
        }
      }, { passive: true });

      trackRoot.addEventListener('mouseleave', () => {
        this.isPointerInside = false;
        this.scheduleReturnToActive(190);
      });

      window.addEventListener('mouseup', () => {
        if (this.glass.targetScale !== 1.0) {
          this.glass.targetScale = 1.0;
          this.wake();
        }
      }, { passive: true });

      window.addEventListener('scroll', () => {
        const scrolled = Boolean(document.querySelector('.navbar')?.classList.contains('scrolled'));
        if (scrolled !== this.lastScrolled) {
          this.textureDirty = true;
          this.wake();
        }
      }, { passive: true });

      if (typeof ResizeObserver === 'function') {
        const ro = new ResizeObserver(() => this.measureAndResize(false));
        ro.observe(this.container);
      }
    }

    measureAndResize(snap) {
      if (!this.enabled) return;
      const cRect = this.container.getBoundingClientRect();
      if (cRect.width === 0 || cRect.height === 0) return;

      const cssW = Math.round(cRect.width + BLEED_X * 2);
      const cssH = Math.round(cRect.height + BLEED_Y * 2);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      if (cssW !== this.width || cssH !== this.height || dpr !== this.dpr) {
        this.width = cssW;
        this.height = cssH;
        this.dpr = dpr;

        this.canvas.style.width = `${cssW}px`;
        this.canvas.style.height = `${cssH}px`;
        this.canvas.width = Math.round(cssW * dpr);
        this.canvas.height = Math.round(cssH * dpr);

        this.backdropCanvas.width = this.canvas.width;
        this.backdropCanvas.height = this.canvas.height;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.textureDirty = true;
      }

      const targetBtn = this.hoveredBtn || this.activeBtn || this.container.querySelector('.nav-link.active');
      if (targetBtn) {
        this.syncTargetToButton(targetBtn, snap || !this.hasInitializedPos);
      }
    }

    setActiveButton(btn) {
      if (!this.enabled) return;
      if (btn) {
        this.activeBtn = btn;
      } else {
        this.activeBtn = this.container.querySelector('.nav-link.active');
      }
      if (!this.isPointerInside) {
        this.hoveredBtn = null;
      }
      this.textureDirty = true;
      const focusTarget = this.isPointerInside && this.hoveredBtn ? this.hoveredBtn : this.activeBtn;
      if (focusTarget) {
        this.syncTargetToButton(focusTarget, !this.hasInitializedPos);
      }
    }

    syncTargetToButton(btn, snap) {
      if (!btn || !this.enabled) return;
      const cRect = this.container.getBoundingClientRect();
      const bRect = btn.getBoundingClientRect();
      if (cRect.width === 0 || bRect.width === 0) return;

      let centerX = (bRect.left - cRect.left) + bRect.width * 0.5 + BLEED_X;
      const centerY = (bRect.top - cRect.top) + bRect.height * 0.5 + BLEED_Y;

      // Jemný magnetický tah za kurzorem uvnitř aktivního tlačítka
      if (this.isPointerInside && this.pointerRelX !== null && btn === this.hoveredBtn) {
        const btnRelCenter = (bRect.left - cRect.left) + bRect.width * 0.5;
        const delta = this.pointerRelX - btnRelCenter;
        centerX += Math.max(-3, Math.min(3, delta * 0.08));
      }

      this.target.x = centerX;
      this.target.y = centerY;
      this.target.halfW = bRect.width * 0.5 + 4;
      this.target.halfH = bRect.height * 0.5 + 5;

      if (snap || !this.hasInitializedPos) {
        this.glass.x = this.target.x;
        this.glass.y = this.target.y;
        this.glass.halfW = this.target.halfW;
        this.glass.halfH = this.target.halfH;
        this.glass.vx = 0;
        this.glass.vy = 0;
        this.glass.vhw = 0;
        this.glass.stretchX = 0;
        this.glass.stretchY = 0;
        this.glass.stretchVx = 0;
        this.glass.stretchVy = 0;
        this.hasInitializedPos = true;
      }

      this.wake();
    }

    renderBackdropTexture() {
      const ctx = this.backdropCtx;
      if (!ctx || this.width === 0 || this.height === 0) return;

      const cRect = this.container.getBoundingClientRect();
      if (cRect.width === 0 || cRect.height === 0) return;

      const dpr = this.dpr;
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, this.width, this.height);

      // Čistý neutrální Apple Obsidian podklad uvnitř skla bez rušivého vnitřního glow
      const scrolled = Boolean(document.querySelector('.navbar')?.classList.contains('scrolled'));
      this.lastScrolled = scrolled;
      const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
      if (scrolled) {
        bgGrad.addColorStop(0, '#141519');
        bgGrad.addColorStop(1, '#0c0d10');
      } else {
        bgGrad.addColorStop(0, '#16171c');
        bgGrad.addColorStop(1, '#0e0f13');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, this.width, this.height);

      // Pro Media a SMP+ jen velmi jemný barevný nádech (ostatní záložky čisté Apple sklo bez glow)
      const focusBtn = this.hoveredBtn || this.activeBtn;
      if (focusBtn && (focusBtn.classList.contains('nav-link--media') || focusBtn.classList.contains('nav-link--smp'))) {
        const bRect = focusBtn.getBoundingClientRect();
        const cx = (bRect.left - cRect.left) + bRect.width * 0.5 + BLEED_X;
        const cy = (bRect.top - cRect.top) + bRect.height * 0.5 + BLEED_Y;
        const isSmp = focusBtn.classList.contains('nav-link--smp');
        const glowGrad = ctx.createRadialGradient(cx, cy - 4, 2, cx, cy, Math.max(bRect.width * 0.75, 46));
        if (isSmp) {
          glowGrad.addColorStop(0, 'rgba(251, 191, 36, 0.13)');
          glowGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
        } else {
          glowGrad.addColorStop(0, 'rgba(217, 70, 239, 0.14)');
          glowGrad.addColorStop(1, 'rgba(192, 132, 252, 0)');
        }
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, this.width, this.height);
      }

      // Vykreslení všech tlačítek navigace přesně na jejich souřadnice
      const originX = cRect.left - BLEED_X;
      const originY = cRect.top - BLEED_Y;
      const buttons = this.container.querySelectorAll('.nav-link');

      buttons.forEach((btn) => {
        const span = btn.querySelector('span');
        const svg = btn.querySelector('svg');
        const isFocus = (btn === this.activeBtn || btn === this.hoveredBtn);
        const isActive = (btn === this.activeBtn);

        if (svg) {
          const sRect = svg.getBoundingClientRect();
          const id = btn.dataset.liquidId || btn.id || btn.textContent.trim();
          const variant = isActive ? ':active' : (btn === this.hoveredBtn ? ':hover' : ':default');
          const img = this.svgCache.get(id + variant) || this.svgCache.get(id + ':default');
          if (img && img.complete && sRect.width > 0) {
            ctx.drawImage(
              img,
              sRect.left - originX,
              sRect.top - originY,
              sRect.width,
              sRect.height
            );
          }
        }

        if (span) {
          const tRect = span.getBoundingClientRect();
          const cs = window.getComputedStyle(span);
          ctx.font = `${cs.fontStyle || 'normal'} ${cs.fontWeight || '600'} ${cs.fontSize || '14px'} ${cs.fontFamily || 'Outfit, sans-serif'}`;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = isFocus ? '#ffffff' : '#94a3b8';
          ctx.fillText(
            span.textContent.trim(),
            tRect.left - originX,
            (tRect.top - originY) + tRect.height * 0.52
          );
        }
      });

      ctx.restore();

      const gl = this.gl;
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.backdropCanvas);
      this.textureDirty = false;
    }

    stepPhysics(dt) {
      const w0 = LIQUID_NAV_CONFIG.omega;
      const z = LIQUID_NAV_CONFIG.zeta;
      const k = w0 * w0;
      const c = 2.0 * z * w0;
      const g = this.glass;
      const t = this.target;

      // 1) Pozice středu pilulky (harmonický oscilátor dle liquid-sim)
      const ax = k * (t.x - g.x) - c * g.vx;
      const ay = k * (t.y - g.y) - c * g.vy;
      g.vx += ax * dt;
      g.vy += ay * dt;
      g.x += g.vx * dt;
      g.y += g.vy * dt;

      // 2) Přizpůsobení šířky a výšky pilulky textu tlačítka stejným oscilátorem
      const ahw = k * (t.halfW - g.halfW) - c * g.vhw;
      g.vhw += ahw * dt;
      g.halfW += g.vhw * dt;
      g.halfH += (t.halfH - g.halfH) * Math.min(1, dt * 18);

      // 3) Měřítko při stisku / hoveru
      const wS = 18.0;
      const zS = 0.45;
      const aS = (wS * wS) * (g.targetScale - g.scale) - (2.0 * zS * wS) * g.scaleVel;
      g.scaleVel += aS * dt;
      g.scale += g.scaleVel * dt;

      // 4) Objem zachovávající elastické protažení (det(F) = 1)
      const normVx = g.vx / Math.max(this.height, 40);
      const normVy = -g.vy / Math.max(this.height, 40);
      const tSx = Math.max(-0.4, Math.min(0.4, normVx * 0.045));
      const tSy = Math.max(-0.4, Math.min(0.4, normVy * 0.045));
      const wSt = 16.0;
      const zSt = 0.5;
      g.stretchVx += ((wSt * wSt) * (tSx - g.stretchX) - (2.0 * zSt * wSt) * g.stretchVx) * dt;
      g.stretchVy += ((wSt * wSt) * (tSy - g.stretchY) - (2.0 * zSt * wSt) * g.stretchVy) * dt;
      g.stretchX += g.stretchVx * dt;
      g.stretchY += g.stretchVy * dt;
    }

    isSettled() {
      const g = this.glass;
      const t = this.target;
      const posErr = Math.abs(t.x - g.x) + Math.abs(t.y - g.y) + Math.abs(t.halfW - g.halfW);
      const velMag = Math.abs(g.vx) + Math.abs(g.vy) + Math.abs(g.vhw);
      const scaleErr = Math.abs(g.targetScale - g.scale) + Math.abs(g.scaleVel);
      const stretchErr = Math.abs(g.stretchX) + Math.abs(g.stretchY) + Math.abs(g.stretchVx) + Math.abs(g.stretchVy);
      return posErr < 0.05 && velMag < 0.1 && scaleErr < 0.0005 && stretchErr < 0.0005;
    }

    renderFrame() {
      if (!this.enabled || this.width === 0 || this.height === 0) return;
      if (this.textureDirty) {
        this.renderBackdropTexture();
      }

      const gl = this.gl;
      const u = this.uniforms;
      const g = this.glass;

      const W = this.canvas.width;
      const H = this.canvas.height;
      const aspect = this.width / this.height;

      // Převod pixelových souřadnic do WebGL prostoru [0..aspect, 0..1] (Y zdola nahoru)
      const posX = (g.x / this.width) * aspect;
      const posY = 1.0 - (g.y / this.height);
      const halfW = (g.halfW / this.height);
      const halfH = (g.halfH / this.height);
      const simScale = halfH / LIQUID_NAV_CONFIG.refHalfHeight;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.disable(gl.BLEND);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.uniform1i(u.uImage, 0);
      gl.uniform2f(u.uResolution, W, H);
      gl.uniform2f(u.uPos, posX, posY);
      gl.uniform2f(u.uHalfSize, halfW, halfH);
      gl.uniform2f(u.uStretch, g.stretchX, g.stretchY);
      gl.uniform1f(u.uScale, g.scale);

      gl.uniform1f(u.uNd, LIQUID_NAV_CONFIG.material.nd);
      gl.uniform1f(u.uCauchyB, LIQUID_NAV_CONFIG.material.cauchyB);
      gl.uniform3f(u.uAbsorption, ...LIQUID_NAV_CONFIG.material.absorption);
      gl.uniform1f(u.uThickness, LIQUID_NAV_CONFIG.thickness * simScale);
      gl.uniform1f(u.uBevel, LIQUID_NAV_CONFIG.bevel * simScale);
      gl.uniform1f(u.uFrost, LIQUID_NAV_CONFIG.frost);
      gl.uniform1f(u.uSimScale, simScale);

      const focusBtn = this.hoveredBtn || this.activeBtn;
      if (focusBtn && focusBtn.classList.contains('nav-link--media')) {
        gl.uniform3f(u.uGlassTint, 0.82, 0.34, 0.96);
      } else if (focusBtn && focusBtn.classList.contains('nav-link--smp')) {
        gl.uniform3f(u.uGlassTint, 0.98, 0.75, 0.14);
      } else {
        gl.uniform3f(u.uGlassTint, 0.0, 0.0, 0.0);
      }

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    wake() {
      if (!this.enabled || this.rafId !== null) return;
      this.lastTime = performance.now();
      const tick = (now) => {
        const dt = Math.min((now - this.lastTime) / 1000, 1 / 30);
        this.lastTime = now;

        const substeps = 2;
        const subDt = dt / substeps;
        for (let i = 0; i < substeps; i++) {
          this.stepPhysics(subDt);
        }

        this.renderFrame();

        if (!this.textureDirty && this.isSettled()) {
          this.rafId = null;
          return;
        }
        this.rafId = requestAnimationFrame(tick);
      };
      this.rafId = requestAnimationFrame(tick);
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    window.__navLiquidGlass = new NavLiquidGlassController();
  });
})();
