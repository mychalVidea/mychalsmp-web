/* ==========================================================================
   MYCHAL SMP – Morphing Physical Liquid Glass Switchers
   Sdílený WebGL simulátor SF11 Olovnatého skla (navazující na nav-liquid-glass.js)
   Klidový stav: 100% nativní CSS indikátor (0 % GPU zátěže)
   Interakce (hover / press / drag / klávesnice): plynulý morfing do Liquid Glass
   čočky přizpůsobující se šířce textu a návrat zpět po uvolnění.
   ========================================================================== */

(function () {
  'use strict';

  const LIQUID_CONFIG = {
    nd: 1.7847,
    cauchyB: 0.0165,
    absorption: [0.35, 0.25, 0.45],
    absorptionVivid: [0.06, 0.04, 0.02],
    omega: 18.0,
    zeta: 0.86,
    thickness: 0.032,
    thicknessVivid: 0.036,
    bevel: 0.038,
    bevelVivid: 0.042,
    frost: 0.16,
    frostVivid: 0.14,
    refHalfHeight: 0.068
  };

  const BLEED_X = 40;
  const BLEED_Y = 24;

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
    uniform sampler2D uBgImage;
    uniform vec2 uResolution;

    uniform vec2 uPos;
    uniform vec2 uHalfSize;
    uniform vec2 uStretch;
    uniform float uScale;
    uniform float uMorph;
    uniform float uRestRadius;
    uniform float uRestBorderW;

    uniform vec3 uTrackColor;
    uniform vec4 uRestFill;
    uniform vec4 uRestBorder;

    uniform float uNd;
    uniform float uCauchyB;
    uniform vec3 uAbsorption;
    uniform float uThickness;
    uniform float uBevel;
    uniform float uFrost;
    uniform float uSimScale;
    uniform vec3 uGlassTint;
    uniform float uKeepGlow;

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
      vec2 boxB = vec2(max(uHalfSize.x, uHalfSize.y * 0.5), uHalfSize.y);
      float targetRadius = min(boxB.x, boxB.y);
      float radius = clamp(mix(uRestRadius, targetRadius, smoothstep(0.0, 1.0, uMorph)), 0.001, targetRadius);
      return sdRoundedBox(d, boxB, radius) * uScale;
    }

    float surfaceHeight(float sdf) {
      float distIn = max(0.0, -sdf);
      float t = clamp(distIn / max(uBevel, 0.0001), 0.0, 1.0);
      return uThickness * sqrt(max(0.0, 1.0 - (1.0 - t) * (1.0 - t)));
    }

    float exactFresnel(float cosI, float n1, float n2) {
      float eta = n1 / n2;
      float sinT2 = eta * eta * (1.0 - cosI * cosI);
      if (sinT2 >= 1.0) return 1.0;
      float cosT = sqrt(1.0 - sinT2);
      float rs = (n1 * cosI - n2 * cosT) / (n1 * cosI + n2 * cosT);
      float rp = (n1 * cosT - n2 * cosI) / (n1 * cosT + n2 * cosI);
      return 0.5 * (rs * rs + rp * rp);
    }

    float dispersionIOR(float lambdaUm) {
      return uNd + uCauchyB * (1.0 / (lambdaUm * lambdaUm) - 2.89626);
    }

    vec4 sampleTex(sampler2D tex, vec2 uv, float blurAmount, float aspect) {
      if (blurAmount <= 0.0001) {
        return texture2D(tex, clamp(uv, 0.002, 0.998));
      }
      vec4 sum = texture2D(tex, clamp(uv, 0.002, 0.998)) * 0.20;
      for (int i = 0; i < 8; i++) {
        float a = float(i) * 0.78539816;
        vec2 off = vec2(cos(a) / aspect, sin(a)) * blurAmount;
        sum += texture2D(tex, clamp(uv + off, 0.002, 0.998)) * 0.10;
      }
      return sum;
    }

    // Optické trasování jedné vlnové délky přes uImage (popředí) i uBgImage (reálný track & jeho rámeček)
    vec3 traceWavelength(vec2 bgUv, vec3 V, vec3 N, float z, float lambdaUm, float aspect, float blur, float edgeFade, float glassStr, out float pathLen, out float bgVal, int channel) {
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
      totalShift = clamp(totalShift, vec2(-0.055 * uSimScale), vec2(0.055 * uSimScale));
      totalShift.x /= aspect;

      vec4 fg = sampleTex(uImage, bgUv + totalShift * 0.24 * glassStr, blur * 0.55 * glassStr, aspect);
      vec4 bg = sampleTex(uBgImage, bgUv + totalShift * 0.72 * glassStr, blur * 0.85 * glassStr, aspect);
      float fgCh = channel == 0 ? fg.r : (channel == 1 ? fg.g : fg.b);
      bgVal = channel == 0 ? bg.r : (channel == 1 ? bg.g : bg.b);
      return vec3(fgCh, fg.a, bgVal);
    }

    void main() {
      float aspect = uResolution.x / uResolution.y;
      vec2 p = vec2(vUv.x * aspect, vUv.y);

      float sdf = glassSDF(p);
      float glassStr = uMorph * uMorph * (3.0 - 2.0 * uMorph);

      float shadowSdf = glassSDF(p - vec2(0.002, -0.007) * uSimScale);
      float shadow = smoothstep(0.026 * uSimScale, -0.005 * uSimScale, shadowSdf);
      float shadowAlpha = shadow * 0.30 * glassStr;

      float aa = max(0.0015 * uSimScale, 1.4 / uResolution.y);
      float mask = smoothstep(aa, -aa, sdf);
      if (mask <= 0.001) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, shadowAlpha);
        return;
      }

      float eps = 0.0016 * uSimScale;
      float zC = surfaceHeight(sdf);
      float zR = surfaceHeight(glassSDF(p + vec2(eps, 0.0)));
      float zL = surfaceHeight(glassSDF(p - vec2(eps, 0.0)));
      float zT = surfaceHeight(glassSDF(p + vec2(0.0, eps)));
      float zB = surfaceHeight(glassSDF(p - vec2(0.0, eps)));

      float dzdx = clamp((zR - zL) / (2.0 * eps), -2.5, 2.5) * glassStr;
      float dzdy = clamp((zT - zB) / (2.0 * eps), -2.5, 2.5) * glassStr;
      vec3 N = normalize(vec3(-dzdx, -dzdy, 1.0));

      vec3 V = normalize(vec3((p - uPos) * 0.08, -1.0));
      float cosI = clamp(dot(-V, N), 0.0, 1.0);

      float distIn = max(0.0, -sdf);
      float edgeFade = smoothstep(0.0, 0.005 * uSimScale, distIn);
      float meniscusMask = smoothstep(uBevel * 1.15, 0.0, distIn);
      float blur = uFrost * 0.0038 * uSimScale * meniscusMask;

      float pathR, pathG, pathB;
      float bgR, bgG, bgB;
      vec3 tR = traceWavelength(vUv, V, N, zC, 0.630, aspect, blur, edgeFade, glassStr, pathR, bgR, 0);
      vec3 tG = traceWavelength(vUv, V, N, zC, 0.532, aspect, blur, edgeFade, glassStr, pathG, bgG, 1);
      vec3 tB = traceWavelength(vUv, V, N, zC, 0.465, aspect, blur, edgeFade, glassStr, pathB, bgB, 2);

      vec3 refractedBg = vec3(tR.z, tG.z, tB.z);

      // Klidová pilulka (uMorph = 0) sedí přesně na CSS indikátoru nad trackem
      vec3 restBg = mix(refractedBg, uRestFill.rgb, uRestFill.a);
      float pxUnit = 1.0 / uResolution.y;
      if (uRestBorderW > 0.01 && uRestBorder.a > 0.005) {
        float borderBand = 1.0 - smoothstep(0.0, (uRestBorderW + 0.5) * pxUnit, distIn);
        restBg = mix(restBg, uRestBorder.rgb, borderBand * uRestBorder.a);
      }

      // Křišťálové Apple Liquid Glass tělo: mimo časový filtr (uKeepGlow=1) čistý obsidián jako v navigaci bez mléčné záře
      vec3 beerLambert = mix(
        vec3(1.0),
        exp(-uAbsorption * vec3(pathR, pathG, pathB) * (0.95 / max(uSimScale, 0.5))),
        glassStr
      );

      float hasTint = step(0.01, length(uGlassTint)) * uKeepGlow;
      vec3 navMinBody = vec3(0.062, 0.064, 0.072);
      vec3 navBody = max(refractedBg * beerLambert, navMinBody);
      vec3 vividLift = mix(vec3(0.036, 0.040, 0.048), uGlassTint * 0.11 + vec3(0.030, 0.033, 0.040), hasTint);
      vec3 vividBody = refractedBg * beerLambert + vividLift * (0.75 + 0.25 * meniscusMask);
      vec3 liquidBg = mix(navBody, vividBody, uKeepGlow);
      vec3 baseBg = mix(restBg, liquidBg, glassStr);

      // Refraktované popředí (ikony + text)
      vec3 fgAlpha = vec3(tR.y, tG.y, tB.y);
      vec3 fgRgb = vec3(tR.x, tG.x, tB.x);
      vec3 bodyWithFg = baseBg * (1.0 - fgAlpha) + fgRgb;

      // Fresnelův odraz zakřiveného menisku (v režimu navigace výrazně utlumený bez glow zákalu)
      float F = exactFresnel(cosI, 1.0, uNd) * glassStr;
      vec3 Rdir = reflect(V, N);
      float sky = smoothstep(-0.15, 0.85, Rdir.y);
      vec3 navEnvLow = vec3(0.052, 0.055, 0.064);
      vec3 navEnvHigh = vec3(0.76, 0.80, 0.88);
      vec3 vividEnvLow = mix(vec3(0.07, 0.075, 0.09), uGlassTint * 0.20, hasTint);
      vec3 vividEnvHigh = mix(vec3(0.90, 0.94, 1.0), mix(vec3(0.92, 0.94, 1.0), uGlassTint + vec3(0.22), 0.45), hasTint);
      vec3 envReflect = mix(mix(navEnvLow, vividEnvLow, uKeepGlow), mix(navEnvHigh, vividEnvHigh, uKeepGlow), sky);

      float fresnelEdgeWeight = mix(
        mix(0.06, 0.68, smoothstep(0.0, uBevel * 0.95, abs(N.x) + abs(N.y))),
        mix(0.12, 0.90, smoothstep(0.0, uBevel * 0.95, abs(N.x) + abs(N.y))),
        uKeepGlow
      );
      float fresnelGain = mix(0.32, 0.52, uKeepGlow);
      vec3 glassColor = bodyWithFg * (1.0 - F * 0.34) + envReflect * (F * fresnelEdgeWeight * fresnelGain);

      // Diagonální Apple Specular Rim (čistý tenký břit jako v navigaci, bez halo záře)
      vec2 grad = normalize(vec2(-dzdx, -dzdy) + 1e-6);
      vec2 lightDir = normalize(vec2(-0.707, 0.707));
      float align = dot(grad, lightDir);
      float diag = pow(max(0.0, align), 3.2) + pow(max(0.0, -align), 4.2) * 0.65;

      float hairline = smoothstep(0.0028 * uSimScale, 0.0004 * uSimScale, distIn);
      float bevelSheen = smoothstep(uBevel * 0.52, 0.001 * uSimScale, distIn) * (1.0 - smoothstep(0.001 * uSimScale, 0.0, distIn));

      vec3 vividRimTint = mix(vec3(0.96, 0.98, 1.0), mix(vec3(1.0), uGlassTint + vec3(0.28), 0.34), hasTint);
      vec3 rimTint = mix(vec3(0.92, 0.95, 1.0), vividRimTint, uKeepGlow);
      float hairlineAmt = mix(0.10 + 0.44 * diag, 0.16 + 0.68 * diag, uKeepGlow);
      float bevelAmt = mix(0.022 + 0.11 * diag, 0.05 + 0.22 * diag, uKeepGlow);

      glassColor += rimTint * hairline * hairlineAmt * glassStr;
      glassColor += mix(vec3(0.88, 0.92, 0.98), bodyWithFg + 0.16, 0.20) * bevelSheen * bevelAmt * glassStr;

      float outAlpha = mix(shadowAlpha, 1.0, mask);
      vec3 outRgb = (glassColor * mask) / max(outAlpha, 0.0001);
      gl_FragColor = vec4(outRgb, outAlpha);
    }
  `;

  function parseCssColor(str) {
    if (!str || str === 'transparent' || str === 'none') return [0, 0, 0, 0];
    const m = str.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i);
    if (m) {
      return [
        Math.min(255, Math.max(0, parseFloat(m[1]))) / 255,
        Math.min(255, Math.max(0, parseFloat(m[2]))) / 255,
        Math.min(255, Math.max(0, parseFloat(m[3]))) / 255,
        m[4] !== undefined ? Math.min(1, Math.max(0, parseFloat(m[4]))) : 1
      ];
    }
    const hex = str.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (hex) {
      let h = hex[1];
      if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      return [
        parseInt(h.slice(0, 2), 16) / 255,
        parseInt(h.slice(2, 4), 16) / 255,
        parseInt(h.slice(4, 6), 16) / 255,
        1
      ];
    }
    return [0, 0, 0, 0];
  }

  function toHexColor(str) {
    const rgba = parseCssColor(str);
    const to2 = (v) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0');
    return `#${to2(rgba[0])}${to2(rgba[1])}${to2(rgba[2])}`;
  }

  function mixRgbStrings(c1Str, c2Str, t) {
    const a = parseCssColor(c1Str);
    const b = parseCssColor(c2Str);
    const k = Math.max(0, Math.min(1, t));
    const r = Math.round((a[0] + (b[0] - a[0]) * k) * 255);
    const g = Math.round((a[1] + (b[1] - a[1]) * k) * 255);
    const bl = Math.round((a[2] + (b[2] - a[2]) * k) * 255);
    return `rgb(${r}, ${g}, ${bl})`;
  }

  function getEffectiveBgRgb(el) {
    const layers = [];
    let cur = el;
    while (cur && cur.nodeType === 1) {
      const bg = window.getComputedStyle(cur).backgroundColor;
      const rgba = parseCssColor(bg);
      if (rgba[3] > 0.005) {
        layers.push(rgba);
        if (rgba[3] >= 0.995) break;
      }
      cur = cur.parentElement;
    }
    // Výchozí Obsidian základ --bg: #0a0a0c
    let r = 10 / 255;
    let g = 10 / 255;
    let b = 12 / 255;
    for (let i = layers.length - 1; i >= 0; i--) {
      const [lr, lg, lb, la] = layers[i];
      r = r * (1 - la) + lr * la;
      g = g * (1 - la) + lg * la;
      b = b * (1 - la) + lb * la;
    }
    return [r, g, b];
  }

  function resolveCanvasFont(styleEl) {
    const cs = window.getComputedStyle(styleEl);
    let family = (cs.fontFamily || '').trim();
    // Přejdeme na Outfit místo případného systémového fallbacku Arial (který v Linux Canvasu padá na serif)
    if (!family || /^['"]?arial['"]?$/i.test(family)) {
      family = "'Outfit', sans-serif";
    } else if (!/outfit|mono|minecraft/i.test(family)) {
      family = `${family}, 'Outfit', sans-serif`;
    }
    const style = cs.fontStyle && cs.fontStyle !== 'normal' ? cs.fontStyle : 'normal';
    const weight = cs.fontWeight || '600';
    const size = cs.fontSize || '14px';
    return `${style} ${weight} ${size} ${family}`;
  }

  function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn('[SwitcherLiquidGlass] Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  // Jeden sdílený offscreen WebGL renderer pro všechny přepínače na stránce
  class SharedLiquidRenderer {
    constructor() {
      this.canvas = document.createElement('canvas');
      this.canvas.width = 512;
      this.canvas.height = 160;
      this.gl = this.canvas.getContext('webgl', {
        alpha: true,
        antialias: true,
        premultipliedAlpha: false,
        powerPreference: 'high-performance'
      });
      this.ok = false;
      this.program = null;
      this.uniforms = {};
      this.texture = null;
      this.bgTexture = null;

      if (this.gl) {
        this.initGL();
      }
    }

    initGL() {
      const gl = this.gl;
      const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
      const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
      if (!vs || !fs) return;

      const program = gl.createProgram();
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.warn('[SwitcherLiquidGlass] Link error:', gl.getProgramInfoLog(program));
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

      const createTex = () => {
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        return tex;
      };
      const texture = createTex();
      const bgTexture = createTex();

      const uniformNames = [
        'uImage', 'uBgImage', 'uResolution', 'uPos', 'uHalfSize', 'uStretch', 'uScale',
        'uMorph', 'uRestRadius', 'uRestBorderW', 'uTrackColor', 'uRestFill', 'uRestBorder',
        'uNd', 'uCauchyB', 'uAbsorption', 'uThickness', 'uBevel', 'uFrost', 'uSimScale', 'uGlassTint', 'uKeepGlow'
      ];
      for (const name of uniformNames) {
        this.uniforms[name] = gl.getUniformLocation(program, name);
      }

      this.program = program;
      this.texture = texture;
      this.bgTexture = bgTexture;
      this.ok = true;
    }

    ensureSize(W, H) {
      if (W > this.canvas.width || H > this.canvas.height) {
        this.canvas.width = Math.max(this.canvas.width, W);
        this.canvas.height = Math.max(this.canvas.height, H);
      }
    }

    renderTo(targetCanvas, targetCtx, state) {
      if (!this.ok) return;
      const W = targetCanvas.width;
      const H = targetCanvas.height;
      if (W <= 0 || H <= 0) return;

      this.ensureSize(W, H);
      const bufH = this.canvas.height;
      const gl = this.gl;
      const u = this.uniforms;

      gl.enable(gl.SCISSOR_TEST);
      gl.viewport(0, bufH - H, W, H);
      gl.scissor(0, bufH - H, W, H);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.disable(gl.BLEND);

      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, state.backdropCanvas);

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.bgTexture);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, state.bgCanvas);

      gl.uniform1i(u.uImage, 0);
      gl.uniform1i(u.uBgImage, 1);
      gl.uniform2f(u.uResolution, W, H);
      gl.uniform2f(u.uPos, state.posX, state.posY);
      gl.uniform2f(u.uHalfSize, state.halfW, state.halfH);
      gl.uniform2f(u.uStretch, state.stretchX, state.stretchY);
      gl.uniform1f(u.uScale, state.scale);
      gl.uniform1f(u.uMorph, state.morph);
      gl.uniform1f(u.uRestRadius, state.restRadius);
      gl.uniform1f(u.uRestBorderW, state.restBorderW);

      gl.uniform3f(u.uTrackColor, state.trackColor[0], state.trackColor[1], state.trackColor[2]);
      gl.uniform4f(u.uRestFill, state.restFill[0], state.restFill[1], state.restFill[2], state.restFill[3]);
      gl.uniform4f(u.uRestBorder, state.restBorder[0], state.restBorder[1], state.restBorder[2], state.restBorder[3]);

      const keepGlow = Boolean(state.keepGlow);
      gl.uniform1f(u.uNd, LIQUID_CONFIG.nd);
      gl.uniform1f(u.uCauchyB, LIQUID_CONFIG.cauchyB);
      gl.uniform3f(u.uAbsorption, ...(keepGlow ? LIQUID_CONFIG.absorptionVivid : LIQUID_CONFIG.absorption));
      gl.uniform1f(u.uThickness, (keepGlow ? LIQUID_CONFIG.thicknessVivid : LIQUID_CONFIG.thickness) * state.simScale);
      gl.uniform1f(u.uBevel, (keepGlow ? LIQUID_CONFIG.bevelVivid : LIQUID_CONFIG.bevel) * state.simScale);
      gl.uniform1f(u.uFrost, keepGlow ? LIQUID_CONFIG.frostVivid : LIQUID_CONFIG.frost);
      gl.uniform1f(u.uSimScale, state.simScale);
      gl.uniform3f(u.uGlassTint, state.glassTint[0], state.glassTint[1], state.glassTint[2]);
      gl.uniform1f(u.uKeepGlow, keepGlow ? 1.0 : 0.0);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      targetCtx.clearRect(0, 0, W, H);
      targetCtx.drawImage(this.canvas, 0, 0, W, H, 0, 0, W, H);
    }
  }

  function getTextNodeLines(node) {
    const val = node.nodeValue || '';
    const trimmed = val.trim();
    if (!trimmed) return [];

    const startIdx = val.indexOf(trimmed);
    const fullRange = document.createRange();
    fullRange.setStart(node, startIdx);
    fullRange.setEnd(node, startIdx + trimmed.length);
    const clientRects = fullRange.getClientRects();

    if (clientRects.length <= 1) {
      const r = fullRange.getBoundingClientRect();
      return r.width > 0 ? [{ text: trimmed, rect: r }] : [];
    }

    // Víceřádkový zalomený text (např. Obchodní / podmínky): rozdělíme po slovech na skutečné řádky
    const lines = [];
    const wordRe = /\S+/g;
    let m;
    while ((m = wordRe.exec(trimmed)) !== null) {
      const wr = document.createRange();
      wr.setStart(node, startIdx + m.index);
      wr.setEnd(node, startIdx + m.index + m[0].length);
      const rect = wr.getBoundingClientRect();
      if (rect.width <= 0) continue;

      const last = lines[lines.length - 1];
      if (last && Math.abs(rect.top - last.top) < Math.max(4, rect.height * 0.45)) {
        last.words.push(m[0]);
        last.left = Math.min(last.left, rect.left);
        last.right = Math.max(last.right, rect.right);
        last.top = Math.min(last.top, rect.top);
        last.bottom = Math.max(last.bottom, rect.bottom);
      } else {
        lines.push({
          words: [m[0]],
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom
        });
      }
    }

    return lines.map((ln) => ({
      text: ln.words.join(' '),
      rect: {
        left: ln.left,
        right: ln.right,
        top: ln.top,
        bottom: ln.bottom,
        width: ln.right - ln.left,
        height: ln.bottom - ln.top
      }
    }));
  }

  function getContentBounds(btn) {
    const bRect = btn.getBoundingClientRect();
    let minL = Infinity;
    let maxR = -Infinity;
    let minT = Infinity;
    let maxB = -Infinity;

    const svg = btn.querySelector('svg');
    if (svg) {
      const sRect = svg.getBoundingClientRect();
      if (sRect.width > 0) {
        minL = Math.min(minL, sRect.left);
        maxR = Math.max(maxR, sRect.right);
        minT = Math.min(minT, sRect.top);
        maxB = Math.max(maxB, sRect.bottom);
      }
    }

    const walker = document.createTreeWalker(btn, NodeFilter.SHOW_TEXT, null);
    let node;
    while ((node = walker.nextNode())) {
      const lines = getTextNodeLines(node);
      for (const ln of lines) {
        minL = Math.min(minL, ln.rect.left);
        maxR = Math.max(maxR, ln.rect.right);
        minT = Math.min(minT, ln.rect.top);
        maxB = Math.max(maxB, ln.rect.bottom);
      }
    }

    if (minL === Infinity || maxR <= minL) {
      return {
        centerX: bRect.left + bRect.width * 0.5,
        centerY: bRect.top + bRect.height * 0.5,
        contentW: bRect.width,
        contentH: bRect.height
      };
    }

    return {
      centerX: (minL + maxR) * 0.5,
      centerY: (minT + maxB) * 0.5,
      contentW: maxR - minL,
      contentH: maxB - minT
    };
  }

  class MorphingLiquidSwitcher {
    constructor(renderer, spec, container) {
      this.renderer = renderer;
      this.spec = spec;
      this.container = container;
      this.indicator = container.querySelector(spec.indicatorSelector);

      this.canvas = document.createElement('canvas');
      this.canvas.className = 'switcher-liquid-canvas';
      this.canvas.setAttribute('aria-hidden', 'true');
      this.canvas.style.display = 'none';
      this.ctx = this.canvas.getContext('2d');

      this.backdropCanvas = document.createElement('canvas');
      this.backdropCtx = this.backdropCanvas.getContext('2d');
      this.bgCanvas = document.createElement('canvas');
      this.bgCtx = this.bgCanvas.getContext('2d');

      this.svgRawMap = new WeakMap();
      this.svgCache = new Map();
      this.svgTintCanvas = document.createElement('canvas');
      this.svgTintCanvas.width = 64;
      this.svgTintCanvas.height = 64;
      this.svgTintCtx = this.svgTintCanvas.getContext('2d');

      this.activeBtn = this.getActiveButton();
      this.lastKnownActiveBtn = this.activeBtn;
      this.hoveredBtn = null;
      this.dragStartBtn = null;
      this.isPointerInside = false;
      this.isPointerDown = false;
      this.isKeyboardFocused = false;
      this.pointerRelX = null;
      this.pointerRelY = null;
      this.leaveTimer = null;
      this.interactHoldUntil = 0;
      this.boundWindowPointerMove = null;

      this.width = 0;
      this.height = 0;
      this.dpr = 1;
      this.rafId = null;
      this.lastTime = 0;
      this.hasInitializedPos = false;
      this.backdropDirty = true;
      this.bgDirty = true;
      this.lastMorphDrawn = -1;
      this.wasReturningTravel = false;
      this.returnAfterArrival = false;
      this.clickDissolvePending = false;
      this.activeSlideOmega = LIQUID_CONFIG.omega;

      this.suppressHover = false;
      this.suppressUntil = 0;
      this.suppressTimer = null;
      this.boundFarLeaveMove = null;
      this.preClickActiveBtn = null;
      this.prevActiveBtnBeforeExternal = null;

      this.glass = {
        x: 0, vx: 0,
        y: 0, vy: 0,
        halfW: 36, vhw: 0,
        halfH: 17, vhh: 0,
        scale: 1.0, scaleVel: 0, targetScale: 1.0,
        stretchX: 0, stretchY: 0, stretchVx: 0, stretchVy: 0,
        morph: 0, morphVel: 0, targetMorph: 0
      };
      this.target = { x: 0, y: 0, halfW: 36, halfH: 17 };
      this.currentTint = [0, 0, 0];
      this.targetTint = [0, 0, 0];

      this.restStyle = {
        trackColor: [0.094, 0.094, 0.11],
        restFill: [0.04, 0.40, 0.90, 1.0],
        restBorder: [1, 1, 1, 0],
        restBorderW: 0,
        restRadiusPx: 8,
        restActiveTextColor: '#ffffff',
        glassTint: [0, 0, 0]
      };

      this.init();
    }

    prefersReducedMotion() {
      return typeof window !== 'undefined'
        && window.matchMedia
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    getButtons() {
      return Array.from(this.container.querySelectorAll(this.spec.buttonSelector));
    }

    getActiveButton() {
      return this.container.querySelector(this.spec.buttonSelector + '.active')
        || this.getButtons()[0]
        || null;
    }

    init() {
      if (this.prefersReducedMotion()) return;

      this.container.classList.add('has-liquid-switcher');
      this.container.appendChild(this.canvas);
      this.cacheSvgSources();
      this.bindEvents();
    }

    cacheSvgSources() {
      this.getButtons().forEach((btn, idx) => {
        const svg = btn.querySelector('svg');
        if (!svg) return;
        const xml = new XMLSerializer().serializeToString(svg);
        btn.dataset.liquidBtnIdx = String(idx);
        this.svgRawMap.set(btn, xml);
        // Přednačteme základní varianty předem, aby se ikona během morfu nikdy neztratila
        this.preloadSvgImage(btn, '#ffffff');
        if (xml.includes('currentColor')) {
          this.preloadSvgImage(btn, '#94a3b8');
        }
      });
    }

    preloadSvgImage(btn, colorHex) {
      const rawXml = this.svgRawMap.get(btn);
      if (!rawXml) return null;
      const idx = btn.dataset.liquidBtnIdx || '0';
      const usesCurrent = rawXml.includes('currentColor');
      const key = usesCurrent ? `${idx}:${colorHex}` : `${idx}:static`;
      const existing = this.svgCache.get(key);
      if (existing) return existing;

      let xml = usesCurrent ? rawXml.replace(/currentColor/g, colorHex) : rawXml;
      if (!/xmlns=/.test(xml)) {
        xml = xml.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
      }
      xml = xml.replace(/<svg\b([^>]*)>/i, (_, attrs) => {
        const cleaned = attrs.replace(/\s+(?:width|height)\s*=\s*(?:"[^"]*"|'[^']*')/gi, '');
        return `<svg${cleaned} width="64" height="64">`;
      });

      const img = new Image();
      img.onload = () => {
        this.backdropDirty = true;
        if (this.glass.morph > 0.001 || this.glass.targetMorph > 0.001) {
          this.wake();
        }
      };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
      this.svgCache.set(key, img);
      return img;
    }

    drawSvgForButton(ctx, btn, color, x, y, w, h) {
      const rawXml = this.svgRawMap.get(btn);
      if (!rawXml) return;
      const idx = btn.dataset.liquidBtnIdx || '0';
      const usesCurrent = rawXml.includes('currentColor');
      if (!usesCurrent) {
        const staticImg = this.preloadSvgImage(btn, '#ffffff');
        if (staticImg && staticImg.complete && staticImg.naturalWidth > 0) {
          ctx.drawImage(staticImg, x, y, w, h);
        }
        return;
      }

      const hex = toHexColor(color);
      const exactImg = this.svgCache.get(`${idx}:${hex}`);
      if (exactImg && exactImg.complete && exactImg.naturalWidth > 0) {
        ctx.drawImage(exactImg, x, y, w, h);
        return;
      }

      // Synchronní přebarvení přes přednačtenou bílou masku bez čekání na asynchronní Image.onload
      const baseImg = this.preloadSvgImage(btn, '#ffffff');
      if (baseImg && baseImg.complete && baseImg.naturalWidth > 0 && this.svgTintCtx) {
        const tCtx = this.svgTintCtx;
        tCtx.clearRect(0, 0, 64, 64);
        tCtx.globalCompositeOperation = 'source-over';
        tCtx.drawImage(baseImg, 0, 0, 64, 64);
        tCtx.globalCompositeOperation = 'source-in';
        tCtx.fillStyle = color;
        tCtx.fillRect(0, 0, 64, 64);
        tCtx.globalCompositeOperation = 'source-over';
        ctx.drawImage(this.svgTintCanvas, x, y, w, h);
        return;
      }

      // Krajní záloha na jinou již načtenou variantu
      const fallback = this.svgCache.get(`${idx}:#94a3b8`);
      if (fallback && fallback.complete && fallback.naturalWidth > 0) {
        ctx.drawImage(fallback, x, y, w, h);
      }
    }

    clearLeaveTimer() {
      if (this.leaveTimer) {
        clearTimeout(this.leaveTimer);
        this.leaveTimer = null;
      }
    }

    hitTestButton(clientX, clientY, allowOutsideGap = false) {
      const buttons = this.getButtons();
      let best = null;
      let bestDist = Infinity;
      for (const btn of buttons) {
        const r = btn.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (clientX >= r.left - 3 && clientX <= r.right + 3 && clientY >= r.top - 6 && clientY <= r.bottom + 6) {
          return btn;
        }
        const cx = Math.max(r.left, Math.min(clientX, r.right));
        const cy = Math.max(r.top, Math.min(clientY, r.bottom));
        const dx = clientX - cx;
        const dy = clientY - cy;
        const d2 = dx * dx + dy * dy;
        if (d2 < bestDist) {
          bestDist = d2;
          best = btn;
        }
      }
      const limit = allowOutsideGap ? 18 * 18 : 10 * 10;
      return bestDist <= limit ? best : null;
    }

    isHoverSuppressed() {
      if (!this.suppressHover) return false;
      if (performance.now() >= this.suppressUntil) {
        this.clearHoverSuppression();
        return false;
      }
      return true;
    }

    clearHoverSuppression() {
      this.suppressHover = false;
      this.suppressUntil = 0;
      if (this.suppressTimer) {
        clearTimeout(this.suppressTimer);
        this.suppressTimer = null;
      }
      this.detachFarLeaveWatcher();
    }

    activateHoverSuppression(durationMs = 3000) {
      this.clearHoverSuppression();
      this.suppressHover = true;
      this.suppressUntil = performance.now() + durationMs;
      this.suppressTimer = setTimeout(() => {
        this.clearHoverSuppression();
      }, durationMs);
      this.attachFarLeaveWatcher();
    }

    attachFarLeaveWatcher() {
      if (this.boundFarLeaveMove) return;
      this.boundFarLeaveMove = (e) => {
        if (!this.suppressHover) {
          this.detachFarLeaveWatcher();
          return;
        }
        if (e.pointerType === 'touch') return;
        const cRect = this.container.getBoundingClientRect();
        if (cRect.width === 0 || cRect.height === 0) {
          this.clearHoverSuppression();
          return;
        }
        // Resetuje cooldown až po výrazném odjetí myši od přepínače (> 56 px)
        const farPad = 56;
        const insideHalo =
          e.clientX >= cRect.left - 14 &&
          e.clientX <= cRect.right + 14 &&
          e.clientY >= cRect.top - 16 &&
          e.clientY <= cRect.bottom + 16;
        if (!insideHalo && !this.isPointerDown) {
          this.isPointerInside = false;
          this.hoveredBtn = null;
          this.pointerRelX = null;
          this.pointerRelY = null;
        }
        const isFar =
          e.clientX < cRect.left - farPad ||
          e.clientX > cRect.right + farPad ||
          e.clientY < cRect.top - farPad ||
          e.clientY > cRect.bottom + farPad;
        if (isFar) {
          this.isPointerInside = false;
          this.hoveredBtn = null;
          this.pointerRelX = null;
          this.pointerRelY = null;
          this.detachWindowTracker();
          this.clearHoverSuppression();
          this.clickDissolvePending = false;
          this.wake();
        }
      };
      window.addEventListener('pointermove', this.boundFarLeaveMove, { passive: true });
    }

    detachFarLeaveWatcher() {
      if (!this.boundFarLeaveMove) return;
      window.removeEventListener('pointermove', this.boundFarLeaveMove);
      this.boundFarLeaveMove = null;
    }

    attachWindowTracker() {
      if (this.boundWindowPointerMove) return;
      this.boundWindowPointerMove = (e) => {
        if (!this.isPointerInside && !this.isPointerDown) {
          this.detachWindowTracker();
          return;
        }
        if (e.pointerType === 'touch' && !this.isPointerDown) return;

        const cRect = this.container.getBoundingClientRect();
        if (cRect.width === 0 || cRect.height === 0) {
          this.isPointerInside = false;
          this.detachWindowTracker();
          return;
        }

        // Stejná velkorysá toleranční zóna jako v navigaci (padX=14, padY=16), aby sklo neuskakovalo na hraně
        const padX = this.isPointerDown ? 28 : 14;
        const padY = this.isPointerDown ? 28 : 16;
        const inside =
          e.clientX >= cRect.left - padX &&
          e.clientX <= cRect.right + padX &&
          e.clientY >= cRect.top - padY &&
          e.clientY <= cRect.bottom + padY;

        if (inside) {
          this.clearLeaveTimer();
          this.isPointerInside = true;
          this.pointerRelX = e.clientX - (cRect.left + (this.container.clientLeft || 0));
          this.pointerRelY = e.clientY - (cRect.top + (this.container.clientTop || 0));

          if (this.clickDissolvePending || this.isHoverSuppressed()) return;

          const directBtn = e.target && e.target.closest ? e.target.closest(this.spec.buttonSelector) : null;
          let nextBtn = (directBtn && this.container.contains(directBtn)) ? directBtn : null;
          if (!nextBtn && this.isPointerDown) {
            nextBtn = this.hitTestButton(e.clientX, e.clientY, true);
          }

          if (nextBtn && nextBtn !== this.hoveredBtn) {
            this.hoveredBtn = nextBtn;
            this.backdropDirty = true;
          }
          const focusBtn = this.hoveredBtn || this.activeBtn;
          if (focusBtn) {
            this.activateInteraction(focusBtn, 0);
          }
        } else if (this.isPointerInside && !this.isPointerDown) {
          this.isPointerInside = false;
          this.hoveredBtn = null;
          this.pointerRelX = null;
          this.pointerRelY = null;
          this.detachWindowTracker();
          if (!this.clickDissolvePending && !this.isHoverSuppressed() && !this.returnAfterArrival) {
            this.scheduleReturnOrRelease(190);
          } else {
            this.wake();
          }
        }
      };
      window.addEventListener('pointermove', this.boundWindowPointerMove, { passive: true });
    }

    detachWindowTracker() {
      if (!this.boundWindowPointerMove) return;
      window.removeEventListener('pointermove', this.boundWindowPointerMove);
      this.boundWindowPointerMove = null;
    }

    activateInteraction(btn, holdMs = 0) {
      if (this.prefersReducedMotion()) return;
      const cRect = this.container.getBoundingClientRect();
      if (cRect.width === 0 || cRect.height === 0) return;

      const currentActive = this.getActiveButton();
      const wasIdle = !this.container.classList.contains('is-liquid-active');
      this.clickDissolvePending = false;

      if (wasIdle) {
        this.refreshRestingVisuals();
        this.measureAndResize();
        // Začneme přesně na předchozí klidové pozici bez probliknutí a plynule vyklouzneme k cíli
        const startBtn = this.lastKnownActiveBtn || currentActive || btn;
        if (startBtn) {
          this.syncTargetToButton(startBtn, true, 0);
        }
        this.glass.morph = 0;
        this.glass.morphVel = 0;
        this.glass.scale = 1.0;
        this.glass.scaleVel = 0;
        this.wasReturningTravel = false;
        this.returnAfterArrival = false;
        this.backdropDirty = true;
        this.bgDirty = true;
        this.canvas.style.display = 'block';
        this.container.classList.add('is-liquid-active');
      }

      this.activeBtn = currentActive;
      this.lastKnownActiveBtn = currentActive;

      if (holdMs > 0) {
        this.interactHoldUntil = Math.max(this.interactHoldUntil, performance.now() + holdMs);
      }

      this.wasReturningTravel = false;
      this.returnAfterArrival = false;
      this.glass.targetMorph = 1.0;
      const targetBtn = btn || this.hoveredBtn || this.activeBtn;
      if (targetBtn) {
        this.syncTargetToButton(targetBtn, false, 1.0);
      }
      if (wasIdle) {
        this.renderFrame();
      }
      this.wake();
    }

    startClickTransfer(fromBtn, toBtn, wasIdle) {
      if (this.prefersReducedMotion()) return;
      const cRect = this.container.getBoundingClientRect();
      if (cRect.width === 0 || cRect.height === 0) return;

      this.refreshRestingVisuals();
      this.measureAndResize();
      this.hoveredBtn = null;

      if (wasIdle) {
        this.syncTargetToButton(fromBtn, true, 0);
        this.glass.morph = 0;
        this.glass.morphVel = 0;
        this.glass.scale = 1.0;
        this.glass.scaleVel = 0;
        this.canvas.style.display = 'block';
        this.container.classList.add('is-liquid-active');
      }

      this.activeBtn = toBtn;
      this.wasReturningTravel = false;
      this.returnAfterArrival = true;
      this.clickDissolvePending = true;
      this.glass.targetMorph = 1.0;
      this.interactHoldUntil = performance.now() + 90;
      this.backdropDirty = true;
      this.bgDirty = true;
      this.syncTargetToButton(toBtn, false, 1.0);
      if (wasIdle) {
        this.renderFrame();
      }
      this.wake();
    }

    scheduleReturnOrRelease(delayMs = 170) {
      this.clearLeaveTimer();
      this.leaveTimer = setTimeout(() => {
        this.leaveTimer = null;
        if (this.isPointerInside || this.isPointerDown) return;
        this.hoveredBtn = null;
        this.pointerRelX = null;
        this.pointerRelY = null;
        this.glass.targetScale = 1.0;
        this.backdropDirty = true;
        this.activeBtn = this.getActiveButton();
        if (this.activeBtn) {
          const prevX = this.target.x;
          this.syncTargetToButton(this.activeBtn, false, 1.0);
          if (Math.abs(this.target.x - prevX) > 10 || Math.abs(this.target.x - this.glass.x) > 10) {
            this.wasReturningTravel = true;
          }
        }
        this.wake();
      }, delayMs);
    }

    bindEvents() {
      const container = this.container;

      container.addEventListener('pointerenter', (e) => {
        if (e.pointerType === 'touch') return;
        this.clearLeaveTimer();
        this.isPointerInside = true;
        const cRect = container.getBoundingClientRect();
        this.pointerRelX = e.clientX - (cRect.left + (container.clientLeft || 0));
        this.pointerRelY = e.clientY - (cRect.top + (container.clientTop || 0));
        const directBtn = e.target && e.target.closest ? e.target.closest(this.spec.buttonSelector) : null;
        const btn = (directBtn && container.contains(directBtn))
          ? directBtn
          : (this.hitTestButton(e.clientX, e.clientY, true) || this.getActiveButton());
        if (btn !== this.hoveredBtn) {
          this.hoveredBtn = btn;
          this.backdropDirty = true;
        }
        if (this.clickDissolvePending || this.isHoverSuppressed()) return;
        this.attachWindowTracker();
        this.activateInteraction(btn, 0);
      }, { passive: true });

      // Znovu probudí hover uvnitř kontejneru hned jakmile vyprší 3s cooldown bez nutnosti opuštění containeru
      container.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'touch' || this.isPointerDown) return;
        if (this.clickDissolvePending || this.isHoverSuppressed()) return;
        this.isPointerInside = true;
        const cRect = container.getBoundingClientRect();
        this.pointerRelX = e.clientX - (cRect.left + (container.clientLeft || 0));
        this.pointerRelY = e.clientY - (cRect.top + (container.clientTop || 0));
        const directBtn = e.target && e.target.closest ? e.target.closest(this.spec.buttonSelector) : null;
        const btn = (directBtn && container.contains(directBtn)) ? directBtn : null;
        if (btn && btn !== this.hoveredBtn) {
          this.hoveredBtn = btn;
          this.backdropDirty = true;
        }
        this.attachWindowTracker();
        const focusBtn = this.hoveredBtn || this.activeBtn;
        if (focusBtn && (!this.container.classList.contains('is-liquid-active') || this.returnAfterArrival)) {
          this.activateInteraction(focusBtn, 0);
        }
      }, { passive: true });

      container.addEventListener('pointerdown', (e) => {
        this.preClickActiveBtn = this.getActiveButton();
        if (e.button && e.button !== 0) return;
        this.clearLeaveTimer();
        this.isPointerDown = true;
        const cRect = container.getBoundingClientRect();
        this.pointerRelX = e.clientX - (cRect.left + (container.clientLeft || 0));
        this.pointerRelY = e.clientY - (cRect.top + (container.clientTop || 0));
        const directBtn = e.target && e.target.closest ? e.target.closest(this.spec.buttonSelector) : null;
        const btn = (directBtn && container.contains(directBtn))
          ? directBtn
          : (this.hitTestButton(e.clientX, e.clientY, true) || this.getActiveButton());
        this.dragStartBtn = btn;

        // Při aktivním cooldownu po kliku nespouštíme hover předčasně (přesun případně vyvolá až klik na sousední položku)
        if ((this.clickDissolvePending || this.isHoverSuppressed()) && e.pointerType !== 'touch') {
          return;
        }

        this.hoveredBtn = btn;
        this.glass.targetScale = 1.045;
        this.backdropDirty = true;

        // Pro touch zařízení držíme pointer capture při tahu přes přepínač
        if (e.pointerType === 'touch' && typeof container.setPointerCapture === 'function') {
          try {
            container.setPointerCapture(e.pointerId);
          } catch (_) {
            // Ignorováno
          }
        }
        if (e.pointerType !== 'touch') {
          this.attachWindowTracker();
        } else {
          container.addEventListener('pointermove', this.boundTouchMove || (this.boundTouchMove = (te) => {
            if (!this.isPointerDown) return;
            const cr = container.getBoundingClientRect();
            this.pointerRelX = te.clientX - cr.left;
            this.pointerRelY = te.clientY - cr.top;
            const b = this.hitTestButton(te.clientX, te.clientY, true);
            if (b && b !== this.hoveredBtn) {
              this.hoveredBtn = b;
              this.backdropDirty = true;
            }
            const focus = this.hoveredBtn || this.activeBtn;
            if (focus) this.activateInteraction(focus, 0);
          }), { passive: true });
        }
        this.activateInteraction(btn, 240);
      });

      const handlePointerUp = (e) => {
        if (!this.isPointerDown) return;
        const startBtn = this.dragStartBtn;
        this.isPointerDown = false;
        this.dragStartBtn = null;
        this.glass.targetScale = 1.0;

        const cRect = container.getBoundingClientRect();
        const pad = 28;
        const inRange =
          e.clientX >= cRect.left - pad &&
          e.clientX <= cRect.right + pad &&
          e.clientY >= cRect.top - pad &&
          e.clientY <= cRect.bottom + pad;

        const releaseBtn = inRange ? this.hitTestButton(e.clientX, e.clientY, true) : null;
        const insideNormal =
          e.clientX >= cRect.left - 14 &&
          e.clientX <= cRect.right + 14 &&
          e.clientY >= cRect.top - 16 &&
          e.clientY <= cRect.bottom + 16;

        if (e.pointerType === 'touch' || !insideNormal) {
          this.isPointerInside = false;
          this.hoveredBtn = null;
          this.pointerRelX = null;
          this.pointerRelY = null;
          this.detachWindowTracker();
        }

        // Pokud uživatel táhl přes tlačítka a pustil na jiném tlačítku, přepneme možnost jako nativní iOS přepínač
        if (releaseBtn && startBtn && releaseBtn !== startBtn && !releaseBtn.classList.contains('active')) {
          releaseBtn.click();
        } else if (this.container.classList.contains('is-liquid-active')) {
          this.activeBtn = this.getActiveButton();
          if (e.pointerType !== 'touch' && !insideNormal) {
            if (this.activeBtn && !this.clickDissolvePending && !this.isHoverSuppressed()) {
              const prevX = this.target.x;
              this.syncTargetToButton(this.activeBtn, false, 1.0);
              if (Math.abs(this.target.x - prevX) > 10 || Math.abs(this.target.x - this.glass.x) > 10) {
                this.wasReturningTravel = true;
              }
            }
          } else if (!this.clickDissolvePending && !this.isHoverSuppressed() && !this.returnAfterArrival) {
            this.interactHoldUntil = Math.max(this.interactHoldUntil, performance.now() + 180);
          }
          if (e.pointerType === 'touch' && this.activeBtn) {
            this.syncTargetToButton(this.activeBtn, false, 1.0);
          }
          this.backdropDirty = true;
          this.wake();
        }
      };

      container.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointerup', handlePointerUp, { passive: true });
      window.addEventListener('pointercancel', () => {
        if (!this.isPointerDown) return;
        this.isPointerDown = false;
        this.dragStartBtn = null;
        this.isPointerInside = false;
        this.hoveredBtn = null;
        this.glass.targetScale = 1.0;
        this.detachWindowTracker();
        this.backdropDirty = true;
        this.wake();
      }, { passive: true });

      container.addEventListener('pointerleave', (e) => {
        if (this.isPointerDown || e.pointerType === 'touch') return;
        const cRect = container.getBoundingClientRect();
        const padX = 14;
        const padY = 16;
        const stillNear =
          !this.clickDissolvePending &&
          !this.isHoverSuppressed() &&
          e.clientX >= cRect.left - padX &&
          e.clientX <= cRect.right + padX &&
          e.clientY >= cRect.top - padY &&
          e.clientY <= cRect.bottom + padY;
        if (stillNear) {
          this.attachWindowTracker();
          return;
        }
        this.isPointerInside = false;
        this.hoveredBtn = null;
        this.pointerRelX = null;
        this.pointerRelY = null;
        this.detachWindowTracker();
        if (!this.clickDissolvePending && !this.isHoverSuppressed() && !this.returnAfterArrival) {
          this.scheduleReturnOrRelease(170);
        } else {
          this.wake();
        }
      });

      const releaseOutOfViewport = () => {
        if (!this.isPointerInside && !this.isPointerDown && !this.isKeyboardFocused) return;
        this.isPointerInside = false;
        this.isPointerDown = false;
        this.isKeyboardFocused = false;
        this.dragStartBtn = null;
        this.hoveredBtn = null;
        this.pointerRelX = null;
        this.pointerRelY = null;
        this.glass.targetScale = 1.0;
        this.detachWindowTracker();
        if (this.container.classList.contains('is-liquid-active')) {
          this.activeBtn = this.getActiveButton();
          if (this.activeBtn && !this.clickDissolvePending && !this.returnAfterArrival) {
            this.syncTargetToButton(this.activeBtn, false, this.glass.targetMorph);
          }
          this.backdropDirty = true;
          this.wake();
        }
      };
      document.addEventListener('mouseleave', releaseOutOfViewport, { passive: true });
      window.addEventListener('blur', releaseOutOfViewport, { passive: true });

      container.addEventListener('click', (e) => {
        const btn = e.target.closest(this.spec.buttonSelector);
        if (!btn || !container.contains(btn)) return;

        const prevActive = this.preClickActiveBtn || this.prevActiveBtnBeforeExternal || this.lastKnownActiveBtn || btn;
        this.preClickActiveBtn = null;
        this.prevActiveBtnBeforeExternal = null;

        const wasIdle = !this.container.classList.contains('is-liquid-active');
        const isNeighborSwitch = Boolean(prevActive && prevActive !== btn);

        let distToClicked = 0;
        if (!wasIdle) {
          const cRect = container.getBoundingClientRect();
          const bRect = btn.getBoundingClientRect();
          if (cRect.width > 0 && bRect.width > 0) {
            const { sx } = this.getScaleFactors(cRect);
            const cl = container.clientLeft || 0;
            const btnCenterX = (bRect.left - cRect.left) / sx - cl + (bRect.width / sx) * 0.5 + BLEED_X;
            distToClicked = Math.abs(btnCenterX - this.glass.x);
          }
        }

        this.activeBtn = btn;
        this.lastKnownActiveBtn = btn;
        this.glass.targetScale = 1.0;

        // Po kliknutí potlačíme hover na 3s nebo do odjetí myši daleko od přepínače
        if (e.detail > 0) {
          const cr = container.getBoundingClientRect();
          if (
            e.clientX < cr.left - 14 ||
            e.clientX > cr.right + 14 ||
            e.clientY < cr.top - 16 ||
            e.clientY > cr.bottom + 16
          ) {
            this.isPointerInside = false;
          }
        }
        this.activateHoverSuppression(3000);
        if (this.isPointerInside) {
          this.attachWindowTracker();
        } else {
          this.detachWindowTracker();
        }

        if (isNeighborSwitch && (wasIdle || distToClicked >= 12)) {
          // Kliknutí na sousední tlačítko: vždy spustí Liquid Glass morph a přesun blobu, poté se rozplyne do klidu
          this.startClickTransfer(prevActive, btn, wasIdle);
          return;
        }

        // Kliknutí na tlačítko pod najetým kurzorem nebo na aktuální položku: plynule morphne zpět do klidu
        this.hoveredBtn = null;
        this.refreshRestingVisuals();
        this.backdropDirty = true;
        if (!wasIdle) {
          this.clickDissolvePending = true;
          this.returnAfterArrival = false;
          this.wasReturningTravel = false;
          this.interactHoldUntil = 0;
          this.glass.targetMorph = 0;
          this.syncTargetToButton(btn, false, 0);
          this.wake();
        }
      });

      container.addEventListener('focusin', (e) => {
        const btn = e.target.closest(this.spec.buttonSelector);
        if (!btn || !container.contains(btn)) return;
        try {
          if (btn.matches(':focus-visible')) {
            this.isKeyboardFocused = true;
            this.hoveredBtn = btn;
            this.activateInteraction(btn, 0);
          }
        } catch (_) {
          // Fallback bez :focus-visible
        }
      });

      container.addEventListener('focusout', (e) => {
        if (!container.contains(e.relatedTarget)) {
          this.isKeyboardFocused = false;
          if (!this.isPointerInside) {
            this.hoveredBtn = null;
            this.activeBtn = this.getActiveButton();
            if (this.activeBtn && this.container.classList.contains('is-liquid-active')) {
              this.syncTargetToButton(this.activeBtn, false, this.glass.targetMorph);
              this.wake();
            }
          }
        }
      });

      if (typeof ResizeObserver === 'function') {
        const ro = new ResizeObserver(() => {
          const cRect = container.getBoundingClientRect();
          if (cRect.width === 0 || cRect.height === 0) {
            this.forceIdle();
            return;
          }
          if (this.container.classList.contains('is-liquid-active')) {
            this.measureAndResize();
            const focus = this.hoveredBtn || this.getActiveButton();
            if (focus) this.syncTargetToButton(focus, false, this.glass.targetMorph);
            this.renderFrame();
            this.wake();
          }
        });
        ro.observe(container);
      }
    }

    forceIdle() {
      this.clearLeaveTimer();
      this.detachWindowTracker();
      this.clearHoverSuppression();
      this.isPointerInside = false;
      this.isPointerDown = false;
      this.isKeyboardFocused = false;
      this.wasReturningTravel = false;
      this.returnAfterArrival = false;
      this.clickDissolvePending = false;
      this.preClickActiveBtn = null;
      this.prevActiveBtnBeforeExternal = null;
      this.hoveredBtn = null;
      this.pointerRelX = null;
      this.pointerRelY = null;
      this.interactHoldUntil = 0;
      this.glass.morph = 0;
      this.glass.morphVel = 0;
      this.glass.targetMorph = 0;
      this.glass.scale = 1.0;
      this.glass.scaleVel = 0;
      this.glass.targetScale = 1.0;
      this.hasInitializedPos = false;
      if (this.rafId !== null) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
      this.canvas.style.display = 'none';
      this.container.classList.remove('is-liquid-active', 'is-liquid-away');
    }

    refreshRestingVisuals() {
      const wasActive = this.container.classList.contains('is-liquid-active');
      const wasAway = this.container.classList.contains('is-liquid-away');
      if (wasActive || wasAway) this.container.classList.remove('is-liquid-active', 'is-liquid-away');

      const trackColor = getEffectiveBgRgb(this.container);
      let restFill = [0.094, 0.094, 0.11, 1.0];
      let restBorder = [1, 1, 1, 0];
      let restBorderW = 0;
      let rawRadius = 999;

      if (this.indicator) {
        const prevIndTrans = this.indicator.style.transition;
        this.indicator.style.transition = 'none';
        const pCs = window.getComputedStyle(this.indicator);
        restFill = parseCssColor(pCs.backgroundColor);
        restBorderW = parseFloat(pCs.borderTopWidth) || 0;
        restBorder = restBorderW > 0 ? parseCssColor(pCs.borderTopColor) : [1, 1, 1, 0];
        rawRadius = parseFloat(pCs.borderTopLeftRadius) || 999;
        this.indicator.style.transition = prevIndTrans;
      }

      const activeBtn = this.getActiveButton();
      const activeH = activeBtn ? activeBtn.getBoundingClientRect().height : 34;
      const restRadiusPx = Math.min(rawRadius, (activeH || 34) * 0.5);
      let restActiveTextColor = '#ffffff';
      if (activeBtn) {
        const prevBtnTrans = activeBtn.style.transition;
        activeBtn.style.transition = 'none';
        restActiveTextColor = window.getComputedStyle(activeBtn).color || '#ffffff';
        activeBtn.style.transition = prevBtnTrans;
      }

      if (wasActive) this.container.classList.add('is-liquid-active');
      if (wasAway) this.container.classList.add('is-liquid-away');

      const focusBtn = this.hoveredBtn || activeBtn;
      const glassTint = this.spec.getTint
        ? this.spec.getTint(this.container, focusBtn, activeBtn)
        : [0, 0, 0];

      this.restStyle = {
        trackColor,
        restFill,
        restBorder,
        restBorderW,
        restRadiusPx,
        restActiveTextColor,
        glassTint
      };
    }

    getScaleFactors(cRect) {
      const sx = this.container.offsetWidth > 0 ? (cRect.width / this.container.offsetWidth) : 1;
      const sy = this.container.offsetHeight > 0 ? (cRect.height / this.container.offsetHeight) : 1;
      return { sx: sx || 1, sy: sy || 1 };
    }

    measureAndResize() {
      const cRect = this.container.getBoundingClientRect();
      if (cRect.width === 0 || cRect.height === 0) return;

      const layoutW = this.container.offsetWidth || cRect.width;
      const layoutH = this.container.offsetHeight || cRect.height;
      const cssW = Math.round(layoutW + BLEED_X * 2);
      const cssH = Math.round(layoutH + BLEED_Y * 2);
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
        this.bgCanvas.width = this.canvas.width;
        this.bgCanvas.height = this.canvas.height;
        this.backdropDirty = true;
        this.bgDirty = true;
      }
    }

    syncTargetToButton(btn, snap, morphFactor) {
      if (!btn) return;
      const cRect = this.container.getBoundingClientRect();
      const bRect = btn.getBoundingClientRect();
      if (cRect.width === 0 || bRect.width === 0) return;

      const { sx, sy } = this.getScaleFactors(cRect);
      const cl = this.container.clientLeft || 0;
      const ct = this.container.clientTop || 0;
      const bWidth = bRect.width / sx;
      const bHeight = bRect.height / sy;
      const bLeftLocal = (bRect.left - cRect.left) / sx - cl;
      const bTopLocal = (bRect.top - cRect.top) / sy - ct;

      const m = morphFactor !== undefined ? morphFactor : this.glass.targetMorph;
      const restHalfW = bWidth * 0.5;
      const restHalfH = bHeight * 0.5;

      // Apple Liquid Glass efekt: při interakci se čočka lehce rozkvete nad okraj tlačítka i tracku (+4px W / +4.5px H)
      const morphedHalfW = restHalfW + 4.0;
      const morphedHalfH = restHalfH + 4.5;

      let centerX = bLeftLocal + bWidth * 0.5 + BLEED_X;
      const centerY = bTopLocal + bHeight * 0.5 + BLEED_Y;

      // Jemné ukotvené následování kurzoru uvnitř aktivního tlačítka
      if ((this.isPointerInside || this.isPointerDown) && this.pointerRelX !== null && btn === this.hoveredBtn) {
        const btnRelCenter = bLeftLocal + bWidth * 0.5;
        const deltaX = (this.pointerRelX / sx) - btnRelCenter;
        const maxPull = Math.min(1.5, bWidth * 0.02);
        centerX += Math.max(-maxPull, Math.min(maxPull, deltaX * 0.035));
      }

      if (!snap && Math.abs(centerX - this.target.x) > 6) {
        const travel = Math.abs(centerX - this.glass.x);
        this.activeSlideOmega = Math.max(12.2, Math.min(18.0, 18.0 - Math.max(0, travel - 80) * 0.0095));
      } else if (snap) {
        this.activeSlideOmega = LIQUID_CONFIG.omega;
      }

      this.target.x = centerX;
      this.target.y = centerY;
      this.target.halfW = restHalfW + (morphedHalfW - restHalfW) * m;
      this.target.halfH = restHalfH + (morphedHalfH - restHalfH) * m;

      // Aktualizuj cílové zabarvení skla (plynule se prolnou v stepPhysics)
      this.activeBtn = this.getActiveButton();
      if (this.spec.getTint) {
        this.targetTint = this.spec.getTint(this.container, btn, this.activeBtn);
        this.restStyle.glassTint = this.targetTint;
      }

      if (snap || !this.hasInitializedPos) {
        this.glass.x = this.target.x;
        this.glass.y = this.target.y;
        this.glass.halfW = this.target.halfW;
        this.glass.halfH = this.target.halfH;
        this.glass.vx = 0;
        this.glass.vy = 0;
        this.glass.vhw = 0;
        this.glass.vhh = 0;
        this.glass.stretchX = 0;
        this.glass.stretchY = 0;
        this.glass.stretchVx = 0;
        this.glass.stretchVy = 0;
        this.currentTint = [...this.targetTint];
        this.hasInitializedPos = true;
      }
    }

    onExternalStateChange() {
      const newActive = this.getActiveButton();
      if (this.activeBtn && newActive && this.activeBtn !== newActive) {
        this.prevActiveBtnBeforeExternal = this.activeBtn;
      }
      this.activeBtn = newActive;
      this.refreshRestingVisuals();
      this.backdropDirty = true;
      this.bgDirty = true;
      if (this.container.classList.contains('is-liquid-active')) {
        const targetBtn = (!this.clickDissolvePending && !this.isHoverSuppressed() && this.isPointerInside && this.hoveredBtn)
          ? this.hoveredBtn
          : ((this.returnAfterArrival && this.hoveredBtn) ? this.hoveredBtn : this.activeBtn);
        if (targetBtn) {
          this.syncTargetToButton(targetBtn, false, this.glass.targetMorph);
        }
        this.wake();
      }
      Promise.resolve().then(() => {
        if (!this.isPointerDown) {
          this.lastKnownActiveBtn = this.getActiveButton();
        }
      });
    }

    renderTrackBgTexture() {
      const ctx = this.bgCtx;
      if (!ctx || this.width === 0 || this.height === 0) return;
      const cRect = this.container.getBoundingClientRect();
      if (cRect.width === 0 || cRect.height === 0) return;

      const dpr = this.dpr;
      const parentEl = this.container.parentElement || document.body;
      const parentRgb = getEffectiveBgRgb(parentEl);
      const trackRgb = getEffectiveBgRgb(this.container);
      const cs = window.getComputedStyle(this.container);
      const bw = parseFloat(cs.borderTopWidth) || 0;
      const rawRad = parseFloat(cs.borderTopLeftRadius) || 0;
      const cl = this.container.clientLeft || 0;
      const ct = this.container.clientTop || 0;

      const toRgbStr = (arr) => `rgb(${Math.round(arr[0] * 255)}, ${Math.round(arr[1] * 255)}, ${Math.round(arr[2] * 255)})`;

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = toRgbStr(parentRgb);
      ctx.fillRect(0, 0, this.width, this.height);

      const tx = BLEED_X - cl;
      const ty = BLEED_Y - ct;
      const tw = this.container.offsetWidth || cRect.width;
      const th = this.container.offsetHeight || cRect.height;
      const tr = Math.min(rawRad, Math.min(tw, th) * 0.5);
      const inset = bw * 0.5;
      const innerR = Math.max(0, tr - inset);

      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(tx + inset, ty + inset, tw - bw, th - bw, innerR);
      } else {
        ctx.rect(tx + inset, ty + inset, tw - bw, th - bw);
      }
      ctx.fillStyle = toRgbStr(trackRgb);
      ctx.fill();

      if (bw > 0) {
        ctx.strokeStyle = cs.borderTopColor || 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = bw;
        ctx.stroke();
      }
      ctx.restore();
      this.bgDirty = false;
    }

    renderBackdropTexture() {
      const ctx = this.backdropCtx;
      if (!ctx || this.width === 0 || this.height === 0) return;

      const cRect = this.container.getBoundingClientRect();
      if (cRect.width === 0 || cRect.height === 0) return;

      const { sx, sy } = this.getScaleFactors(cRect);
      const dpr = this.dpr;
      const morph = this.glass.morph;
      const cl = this.container.clientLeft || 0;
      const ct = this.container.clientTop || 0;

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, this.width, this.height);

      const buttons = this.getButtons();
      const activeBtn = this.getActiveButton();
      const hoveredBtn = this.hoveredBtn;

      buttons.forEach((btn) => {
        const bRect = btn.getBoundingClientRect();
        if (bRect.width === 0 || bRect.height === 0) return;

        const isActive = btn === activeBtn;
        const isHovered = btn === hoveredBtn;
        const isFocus = isActive || isHovered;

        // Výpočet barvy ikony a textu uvnitř čočky (plynulý přechod z klidové barvy do krystalické bílé)
        let fgColor;
        if (this.spec.getButtonTextColor) {
          fgColor = this.spec.getButtonTextColor(btn, isActive, isHovered, morph, this.restStyle.restActiveTextColor);
        } else if (isFocus) {
          fgColor = mixRgbStrings(this.restStyle.restActiveTextColor, '#ffffff', isHovered ? 1.0 : morph);
        } else {
          fgColor = window.getComputedStyle(btn).color || '#94a3b8';
        }

        const svg = btn.querySelector('svg');
        if (svg) {
          const sRect = svg.getBoundingClientRect();
          if (sRect.width > 0) {
            this.drawSvgForButton(
              ctx,
              btn,
              fgColor,
              (sRect.left - cRect.left) / sx - cl + BLEED_X,
              (sRect.top - cRect.top) / sy - ct + BLEED_Y,
              sRect.width / sx,
              sRect.height / sy
            );
          }
        }

        // Vykreslení všech textových uzlů po skutečných řádcích (včetně zalomeného textu)
        const walker = document.createTreeWalker(btn, NodeFilter.SHOW_TEXT, null);
        let node;
        while ((node = walker.nextNode())) {
          const lines = getTextNodeLines(node);
          if (!lines.length) continue;

          const styleEl = node.parentElement || btn;
          ctx.font = resolveCanvasFont(styleEl);
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = fgColor;
          for (const ln of lines) {
            ctx.fillText(
              ln.text,
              (ln.rect.left - cRect.left) / sx - cl + BLEED_X,
              ((ln.rect.top - cRect.top) / sy - ct + BLEED_Y) + (ln.rect.height / sy) * 0.52
            );
          }
        }
      });

      ctx.restore();
      this.backdropDirty = false;
      this.lastMorphDrawn = morph;
    }

    stepPhysics(dt) {
      const now = performance.now();
      const g = this.glass;
      const t = this.target;

      // Aktivní stav držení skla: hover a stisk (jen pokud neprobíhá poklikové rozplynutí nebo cooldown)
      const hoverEngaged =
        (this.isPointerInside && !this.isHoverSuppressed() && !this.clickDissolvePending) ||
        (this.isPointerDown && !this.isHoverSuppressed() && !this.clickDissolvePending) ||
        this.isKeyboardFocused;

      // Při návratu nebo dokončení přesunu po kliknutí necháme čočku měkce dosednout (65ms pauza) a pak se rozplyne do klidu
      const posDist = Math.abs(t.x - g.x) + Math.abs(t.y - g.y);
      const posArrived = posDist < 1.0 && Math.abs(g.vx) < 24 && Math.abs(g.vy) < 16;

      if ((this.wasReturningTravel || this.returnAfterArrival) && posArrived && !hoverEngaged) {
        this.wasReturningTravel = false;
        this.returnAfterArrival = false;
        this.interactHoldUntil = Math.max(this.interactHoldUntil, now + 65);
      }

      const shouldBeLiquid =
        hoverEngaged ||
        now < this.interactHoldUntil ||
        (this.clickDissolvePending ? this.returnAfterArrival : !posArrived);

      g.targetMorph = shouldBeLiquid ? 1.0 : 0.0;

      // Ukotvíme cílový rozměr podle ustáleného targetMorph (bez zpětné vazby rozměru z oscilujícího g.morph)
      const focusBtn = this.hoveredBtn || this.activeBtn;
      if (focusBtn) {
        this.syncTargetToButton(focusBtn, false, g.targetMorph);
      }

      // 1) Poloha čočky s plynulou vzdálenostní pružinou (krátký skok svižný, dlouhý přejezd ladný bez snapu)
      const w0 = this.activeSlideOmega || LIQUID_CONFIG.omega;
      const z = LIQUID_CONFIG.zeta;
      const k = w0 * w0;
      const c = 2.0 * z * w0;

      const ax = k * (t.x - g.x) - c * g.vx;
      const ay = k * (t.y - g.y) - c * g.vy;
      g.vx += ax * dt;
      g.vy += ay * dt;
      g.x += g.vx * dt;
      g.y += g.vy * dt;

      // 2) Plynulý rozměr čočky (rozkvět i rozplynutí do klidu)
      const wD = g.targetMorph >= 0.5 ? 17.0 : 17.5;
      const zD = 0.88;
      const kD = wD * wD;
      const cD = 2.0 * zD * wD;
      const ahw = kD * (t.halfW - g.halfW) - cD * g.vhw;
      const ahh = kD * (t.halfH - g.halfH) - cD * g.vhh;
      g.vhw += ahw * dt;
      g.vhh += ahh * dt;
      g.halfW += g.vhw * dt;
      g.halfH += g.vhh * dt;

      // 3) Morfovací pružina: sametový nástup i návrat bez levného snapnutí a bez zbytečného ocasu
      const wM = g.targetMorph > g.morph ? 17.5 : 16.5;
      const zM = 0.88;
      const aM = (wM * wM) * (g.targetMorph - g.morph) - (2.0 * zM * wM) * g.morphVel;
      g.morphVel += aM * dt;
      g.morph = Math.max(0, Math.min(1.0, g.morph + g.morphVel * dt));

      // 4) Tactile scale při stisku
      const wS = 18.0;
      const zS = 0.80;
      const aS = (wS * wS) * (g.targetScale - g.scale) - (2.0 * zS * wS) * g.scaleVel;
      g.scaleVel += aS * dt;
      g.scale += g.scaleVel * dt;

      // 5) Plynulé prolínání barvy skla při přejezdu přes různobarevné položky
      const tintLerp = 1.0 - Math.exp(-dt * 12.0);
      for (let i = 0; i < 3; i++) {
        this.currentTint[i] += (this.targetTint[i] - this.currentTint[i]) * tintLerp;
      }

      // 6) Objem zachovávající elastické protažení při pohybu (tekutý tah kapky)
      const normVx = (g.vx / Math.max(this.height, 40)) * g.morph;
      const normVy = (-g.vy / Math.max(this.height, 40)) * g.morph;
      const tSx = Math.max(-0.34, Math.min(0.34, normVx * 0.044));
      const tSy = Math.max(-0.34, Math.min(0.34, normVy * 0.044));
      const wSt = 14.0;
      const zSt = 0.68;
      g.stretchVx += ((wSt * wSt) * (tSx - g.stretchX) - (2.0 * zSt * wSt) * g.stretchVx) * dt;
      g.stretchVy += ((wSt * wSt) * (tSy - g.stretchY) - (2.0 * zSt * wSt) * g.stretchVy) * dt;
      g.stretchX += g.stretchVx * dt;
      g.stretchY += g.stretchVy * dt;
    }

    isSettledToIdle() {
      const g = this.glass;
      const t = this.target;
      if (g.targetMorph > 0.001) return false;
      const slideErr = Math.abs(t.x - g.x) + Math.abs(t.y - g.y);
      const dimErr = Math.abs(t.halfW - g.halfW) + Math.abs(t.halfH - g.halfH);
      return g.morph <= 0.012 && Math.abs(g.morphVel) < 0.05 && slideErr < 0.8 && dimErr < 0.8 && Math.abs(g.vx) < 4.0;
    }

    isRestingLiquid() {
      const g = this.glass;
      const t = this.target;
      if (g.targetMorph < 0.999) return false;
      const posErr = Math.abs(t.x - g.x) + Math.abs(t.y - g.y) + Math.abs(t.halfW - g.halfW) + Math.abs(t.halfH - g.halfH);
      const velMag = Math.abs(g.vx) + Math.abs(g.vy) + Math.abs(g.vhw) + Math.abs(g.vhh) + Math.abs(g.morphVel);
      const scaleErr = Math.abs(g.targetScale - g.scale) + Math.abs(g.scaleVel);
      const stretchErr = Math.abs(g.stretchX) + Math.abs(g.stretchY) + Math.abs(g.stretchVx) + Math.abs(g.stretchVy);
      const tintErr = Math.abs(this.targetTint[0] - this.currentTint[0]) + Math.abs(this.targetTint[1] - this.currentTint[1]) + Math.abs(this.targetTint[2] - this.currentTint[2]);
      return Math.abs(1.0 - g.morph) < 0.002 && posErr < 0.06 && velMag < 0.15 && scaleErr < 0.0008 && stretchErr < 0.0008 && tintErr < 0.004;
    }

    syncAwayState() {
      const active = this.activeBtn || this.getActiveButton();
      if (!active || !this.container.classList.contains('is-liquid-active')) {
        this.container.classList.remove('is-liquid-away');
        return;
      }
      const cRect = this.container.getBoundingClientRect();
      const aRect = active.getBoundingClientRect();
      if (cRect.width === 0 || aRect.width === 0) {
        this.container.classList.remove('is-liquid-away');
        return;
      }
      const { sx } = this.getScaleFactors(cRect);
      const cl = this.container.clientLeft || 0;
      const activeCx = (aRect.left - cRect.left) / sx - cl + (aRect.width / sx) * 0.5 + BLEED_X;
      const isAway = Math.abs(this.glass.x - activeCx) > 8 || Boolean(this.hoveredBtn && this.hoveredBtn !== active);
      this.container.classList.toggle('is-liquid-away', isAway);
    }

    renderFrame() {
      if (this.width === 0 || this.height === 0) return;
      this.syncAwayState();
      if (this.bgDirty) {
        this.renderTrackBgTexture();
      }
      if (this.backdropDirty || Math.abs(this.glass.morph - this.lastMorphDrawn) > 0.02) {
        this.renderBackdropTexture();
      }

      const g = this.glass;
      const aspect = this.width / this.height;
      const posX = (g.x / this.width) * aspect;
      const posY = 1.0 - (g.y / this.height);
      const halfW = g.halfW / this.height;
      const halfH = g.halfH / this.height;
      const simScale = halfH / LIQUID_CONFIG.refHalfHeight;
      const restRadius = this.restStyle.restRadiusPx / this.height;

      this.renderer.renderTo(this.canvas, this.ctx, {
        backdropCanvas: this.backdropCanvas,
        bgCanvas: this.bgCanvas,
        posX,
        posY,
        halfW,
        halfH,
        stretchX: g.stretchX,
        stretchY: g.stretchY,
        scale: g.scale,
        morph: Math.max(0, Math.min(1, g.morph)),
        restRadius,
        restBorderW: this.restStyle.restBorderW * this.dpr,
        trackColor: this.restStyle.trackColor,
        restFill: this.restStyle.restFill,
        restBorder: this.restStyle.restBorder,
        glassTint: this.currentTint,
        keepGlow: Boolean(this.spec.keepGlow),
        simScale
      });
    }

    wake() {
      if (this.prefersReducedMotion() || this.rafId !== null) return;
      this.lastTime = performance.now();
      const tick = (now) => {
        const dt = Math.min((now - this.lastTime) / 1000, 1 / 30);
        this.lastTime = now;

        const substeps = 2;
        const subDt = dt / substeps;
        for (let i = 0; i < substeps; i++) {
          this.stepPhysics(subDt);
        }

        if (this.isSettledToIdle()) {
          this.rafId = null;
          this.clickDissolvePending = false;
          this.wasReturningTravel = false;
          this.returnAfterArrival = false;
          this.glass.morph = 0;
          this.glass.morphVel = 0;
          this.canvas.style.display = 'none';
          this.container.classList.remove('is-liquid-active', 'is-liquid-away');
          return;
        }

        this.renderFrame();

        // Pokud ukazatel stále stojí na tlačítku a čočka už dosedla na 100 %,
        // pozastavíme RAF smyčku dokud uživatel nepohne myší nebo neodejde.
        if (!this.backdropDirty && this.isRestingLiquid() && now >= this.interactHoldUntil) {
          this.rafId = null;
          return;
        }

        this.rafId = requestAnimationFrame(tick);
      };
      this.rafId = requestAnimationFrame(tick);
    }
  }

  // Konfigurace všech 8 přepínačů napříč webem
  const SWITCHER_SPECS = [
    {
      // 1. SMPClient OS přepínač (Windows / Linux)
      containerSelector: '.os-selector-nav',
      indicatorSelector: '#os-nav-pill',
      buttonSelector: '.os-nav-tab',
      hugTextOnMorph: false,
      hasChipChrome: false,
      keepGlow: false,
      getTint: () => [0, 0, 0]
    },
    {
      // 2. SMP+ živý náhled (Chat / Tablist / Nad hlavou)
      containerSelector: '.smp-preview-modes',
      indicatorSelector: '#smp-mode-pill',
      buttonSelector: '.smp-mode-btn',
      hugTextOnMorph: false,
      hasChipChrome: false,
      keepGlow: false,
      getTint: () => [0, 0, 0]
    },
    {
      // 3. Media rank náhled (Media / Media+)
      containerSelector: '.media-preview-toggle-wrap',
      indicatorSelector: '#media-toggle-pill',
      buttonSelector: '.media-preview-toggle-btn',
      hugTextOnMorph: false,
      hasChipChrome: false,
      keepGlow: false,
      getTint: () => [0, 0, 0],
      getButtonTextColor: (_btn, isActive, isHovered) => {
        if (isActive || isHovered) return '#ffffff';
        return 'rgba(255, 255, 255, 0.72)';
      }
    },
    {
      // 4. Statistiky – Časové období (1H / 1D / 1W / 1M) – jediný přepínač se zachovaným barevným glowem
      containerSelector: '#stats-timeframe-selector',
      indicatorSelector: '#timeframe-pill',
      buttonSelector: '.timeframe-btn',
      hugTextOnMorph: false,
      hasChipChrome: false,
      keepGlow: true,
      getTint: (container) => {
        const pill = container.querySelector('#timeframe-pill');
        if (pill && pill.style.backgroundColor) {
          const rgba = parseCssColor(pill.style.backgroundColor);
          return [rgba[0], rgba[1], rgba[2]];
        }
        return [0.04, 0.40, 0.90];
      },
      getButtonTextColor: (btn, isActive, isHovered, morph) => {
        if (isActive) return mixRgbStrings('#0a0a0c', '#ffffff', morph);
        if (isHovered) return '#ffffff';
        return '#94a3b8';
      }
    },
    {
      // 5. Právní navigace (Ochrana údajů / Obchodní podmínky) – na obou legal tabech
      containerSelector: '.legal-nav-switch',
      indicatorSelector: '.legal-nav-indicator',
      buttonSelector: '.legal-nav-btn',
      hugTextOnMorph: false,
      hasChipChrome: false,
      keepGlow: false,
      getTint: () => [0, 0, 0]
    },
    {
      // 6. Pravidla – Kategorie & Zabanovaní hráči
      containerSelector: '.rules-filter-bar',
      indicatorSelector: '#rules-filter-pill',
      buttonSelector: '.rules-filter-btn',
      hugTextOnMorph: false,
      hasChipChrome: false,
      keepGlow: false,
      getTint: () => [0, 0, 0],
      getButtonTextColor: (btn, isActive, isHovered, morph) => {
        if (isActive || isHovered) return '#ffffff';
        if (btn.classList.contains('rules-filter-btn--banned')) return '#f87171';
        return '#94a3b8';
      }
    },
    {
      // 7. Bug & Unban report – Kategorie čipy
      containerSelector: '.bug-category-chips',
      indicatorSelector: '#bug-cat-pill',
      buttonSelector: '.bug-cat-chip',
      hugTextOnMorph: false,
      hasChipChrome: false,
      keepGlow: false,
      getTint: () => [0, 0, 0],
      getButtonTextColor: (_btn, isActive, isHovered) => {
        if (isActive || isHovered) return '#ffffff';
        return '#94a3b8';
      }
    },
    {
      // 8. Statistiky – Výběr metriky (Hráči / Playtime / Peníze / Návštěvníci / Úmrtí)
      containerSelector: '.stats-metric-selector',
      indicatorSelector: '#stats-metric-pill',
      buttonSelector: '.stats-metric-btn',
      hugTextOnMorph: false,
      hasChipChrome: false,
      keepGlow: false,
      getTint: () => [0, 0, 0],
      getButtonTextColor: (btn, isActive, isHovered, morph) => {
        const id = btn.id;
        if (isActive) {
          if (id === 'metric-btn-playtime' || id === 'metric-btn-money') {
            return mixRgbStrings('#0a0a0c', '#ffffff', morph);
          }
          return '#ffffff';
        }
        if (isHovered) return '#ffffff';
        return '#94a3b8';
      }
    }
  ];

  class SwitcherLiquidGlassManager {
    constructor() {
      this.renderer = new SharedLiquidRenderer();
      this.controllers = new Map();
      if (!this.renderer.ok) return;

      for (const spec of SWITCHER_SPECS) {
        const nodes = document.querySelectorAll(spec.containerSelector);
        nodes.forEach((container) => {
          if (!this.controllers.has(container)) {
            this.controllers.set(container, new MorphingLiquidSwitcher(this.renderer, spec, container));
          }
        });
      }

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          this.controllers.forEach((ctrl) => {
            ctrl.backdropDirty = true;
            if (ctrl.container.classList.contains('is-liquid-active')) {
              ctrl.measureAndResize();
              ctrl.wake();
            }
          });
        });
      }
    }

    syncContainer(container) {
      const ctrl = this.controllers.get(container);
      if (ctrl) ctrl.onExternalStateChange();
    }

    resetAllHidden() {
      this.controllers.forEach((ctrl) => {
        const r = ctrl.container.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) {
          ctrl.forceIdle();
        }
      });
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    window.__switcherLiquidGlass = new SwitcherLiquidGlassManager();
  });
})();
