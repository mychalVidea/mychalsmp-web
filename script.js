/* =============================================
   MYCHAL SMP – script.js
   ============================================= */

// ---- CONSOLE ANTI-SCAM WARNING ----
console.log('%cSTOP!', 'color: #f51515; font-size: 40px; font-weight: bold;');
console.log('%cPokud ti někdo řekl, abys sem vložil nějaký kód, snaží se ti ukrást účet!', 'color: #fff; font-size: 14px;');

// ---- SECURE & RESILIENT API FETCH WRAPPER ----
const API_BASE_URL = 'https://api.6767111.xyz';

/**
 * Bezpečné volání API s nastavitelným timeoutem, ochranou proti pádu skriptu
 * a detekcí chyb spojení či SSL certifikátu.
 */
async function apiFetch(urlOrPath, options = {}, timeoutMs = 8000) {
  const url = (typeof urlOrPath === 'string' && (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')))
    ? urlOrPath
    : `${API_BASE_URL}${urlOrPath.startsWith('/') ? '' : '/'}${urlOrPath}`;

  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const fetchOptions = {
      credentials: 'include',
      ...options,
      signal: controller.signal
    };
    return await fetch(url, fetchOptions);
  } catch (err) {
    if (err && err.name === 'AbortError') {
      console.warn(`[API FETCH TIMEOUT] Požadavek na ${url} vypršel po ${timeoutMs}ms.`);
    } else {
      console.warn(`[API FETCH ERROR] Chyba komunikace s ${url}:`, (err && err.message) || err);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// ---- TAB SWITCHING & ROUTING ----
function showTab(name) {
  executeTabSwitch(name, true);
}

function handleUrlRouting() {
  const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
  const hash = window.location.hash.toLowerCase().replace(/^#/, '');
  const route = hash || path.split('/').pop();
  const urlParams = new URLSearchParams(window.location.search);
  const tierParam = (urlParams.get('tier') || '').toLowerCase();

  if (route === 'smp_ppp' || route === 'smpppp' || route === 'smp+++' || tierParam === 'smp_ppp' || tierParam === 'smpppp' || tierParam === 'smp+++') {
    selectSmpTier('smp_ppp');
    executeTabSwitch('smp-plus', false);
  } else if (route === 'smp_pp' || route === 'smppp' || route === 'smp++' || tierParam === 'smp_pp' || tierParam === 'smppp' || tierParam === 'smp++') {
    selectSmpTier('smp_pp');
    executeTabSwitch('smp-plus', false);
  } else if (route === 'smp_plus' || route === 'smpplus' || route === 'smp-plus' || route === 'vip' || route === 'smp+' || tierParam === 'smp_plus' || tierParam === 'smp+') {
    if (route === 'smp_plus' || route === 'smp+' || tierParam === 'smp_plus' || tierParam === 'smp+') {
      selectSmpTier('smp_plus');
    }
    executeTabSwitch('smp-plus', false);
  } else if (route === 'stats' || route === 'statistiky' || route === 'stat') {
    executeTabSwitch('stats', false);
  } else if (route === 'bug' || route === 'bugs' || route === 'report') {
    executeTabSwitch('bugs', false);
  } else if (route === 'media' || route === 'creator' || route === 'yt') {
    executeTabSwitch('media', false);
  } else if (route === 'howto' || route === 'jakhrat' || route === 'join' || route === 'help') {
    executeTabSwitch('join', false);
  } else if (route === 'rules' || route === 'pravidla') {
    executeTabSwitch('rules', false);
  } else if (route === 'banned' || route === 'bany' || route === 'zabanovani') {
    executeTabSwitch('rules', false);
    setTimeout(() => {
      const btn = document.getElementById('btn-toggle-banned-board');
      if (btn) filterRules('banned', btn);
    }, 120);
  } else if (route === 'modtest' || route === 'moderator' || route === 'mod' || route === 'zkouska') {
    executeTabSwitch('modtest', false);
  } else if (route === 'napady' || route === 'napad' || route === 'ideas') {
    executeTabSwitch('napady', false);
  } else if (route === 'launcher' || route === 'download' || route === 'klient' || route === 'client' || route === 'smpclient') {
    executeTabSwitch('launcher', false);
  } else if (route === 'privacy' || route === 'gdpr' || route === 'soukromi' || route === 'data') {
    executeTabSwitch('privacy', false);
  } else if (route === 'terms' || route === 'tos' || route === 'podminky') {
    executeTabSwitch('terms', false);
  } else if (route === 'home' || route === '' || route === 'index.html') {
    executeTabSwitch('home', false);
  }
}

// ---- INLINE SVG ICON LIBRARY (Rule 53: Zero System Emojis, stroke-width 1.75) ----
const UI_ICONS = {
  info: '<svg class="ui-icon-svg ui-icon-svg--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  check: '<svg class="ui-icon-svg ui-icon-svg--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>',
  x: '<svg class="ui-icon-svg ui-icon-svg--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  alert: '<svg class="ui-icon-svg ui-icon-svg--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  clock: '<svg class="ui-icon-svg ui-icon-svg--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  refresh: '<svg class="ui-icon-svg ui-icon-svg--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
  video: '<svg class="ui-icon-svg ui-icon-svg--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>',
  crown: '<svg class="ui-icon-svg ui-icon-svg--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>',
  lock: '<svg class="ui-icon-svg ui-icon-svg--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  star: '<svg class="ui-icon-svg ui-icon-svg--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  send: '<svg class="ui-icon-svg ui-icon-svg--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
  lightbulb: '<svg class="ui-icon-svg ui-icon-svg--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/></svg>',
  user: '<svg class="ui-icon-svg ui-icon-svg--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  users: '<svg class="ui-icon-svg ui-icon-svg--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  sparkles: '<svg class="ui-icon-svg ui-icon-svg--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>',
  pin: '<svg class="ui-icon-svg ui-icon-svg--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/></svg>',
  thumbsUp: '<svg class="ui-icon-svg ui-icon-svg--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>',
  thumbsDown: '<svg class="ui-icon-svg ui-icon-svg--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 14V2"/><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"/></svg>',
  calendar: '<svg class="ui-icon-svg ui-icon-svg--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  bolt: '<svg class="ui-icon-svg ui-icon-svg--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  moon: '<svg class="ui-icon-svg ui-icon-svg--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
  copy: '<svg class="ui-icon-svg ui-icon-svg--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  gem: '<svg class="ui-icon-svg ui-icon-svg--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></svg>',
  candle: '<svg class="ui-icon-svg ui-icon-svg--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2c1.5 2 3 3.8 3 6a3 3 0 1 1-6 0c0-2.2 1.5-4 3-6Z"/><rect x="9" y="12" width="6" height="10" rx="1"/></svg>',
  question: '<svg class="ui-icon-svg ui-icon-svg--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
};

const APPLE_SPRING_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Smooth state visibility transition (Rule 35, 116: Zero Hard-Cut display: none -> block).
 * Animates opacity + micro translateY on GPU without jarring layout snaps.
 */
function transitionPanelVisibility(el, show, displayType = 'block') {
  if (!el) return;
  if (el._visTimer) {
    clearTimeout(el._visTimer);
    el._visTimer = null;
  }

  if (prefersReducedMotion()) {
    el.style.display = show ? displayType : 'none';
    el.style.opacity = show ? '1' : '0';
    el.style.transform = 'none';
    el.classList.toggle('is-panel-visible', show);
    return;
  }

  if (show) {
    const alreadyVisible = el.style.display === displayType && el.style.opacity === '1';
    el.style.display = displayType;
    el.classList.add('is-panel-visible');
    if (alreadyVisible) return;
    el.style.opacity = '0';
    el.style.transform = 'translate3d(0, 6px, 0)';
    el.style.transition = `opacity 220ms ${APPLE_SPRING_EASE}, transform 220ms ${APPLE_SPRING_EASE}`;
    void el.offsetWidth;
    el.style.opacity = '1';
    el.style.transform = 'translate3d(0, 0, 0)';
  } else {
    if (el.style.display === 'none') return;
    el.classList.remove('is-panel-visible');
    el.style.transition = `opacity 150ms ${APPLE_SPRING_EASE}, transform 150ms ${APPLE_SPRING_EASE}`;
    el.style.opacity = '0';
    el.style.transform = 'translate3d(0, 4px, 0)';
    el._visTimer = setTimeout(() => {
      el.style.display = 'none';
      el._visTimer = null;
    }, 155);
  }
}

/**
 * Local inline feedback right beside the triggering form/control (Rules 24, 25).
 */
function showInlineFeedback(anchorEl, message, type = 'error', autoHideMs = 4500) {
  if (!anchorEl) return;
  const host = anchorEl.closest('form') || anchorEl.parentElement || anchorEl;
  if (!host) return;

  let slot = host.querySelector(':scope > .inline-feedback-msg');
  if (!slot) {
    slot = document.createElement('div');
    slot.className = 'inline-feedback-msg';
    slot.setAttribute('role', 'status');
    slot.setAttribute('aria-live', 'polite');
    host.appendChild(slot);
  }

  const iconMap = {
    error: UI_ICONS.x,
    warning: UI_ICONS.alert,
    success: UI_ICONS.check,
    info: UI_ICONS.info
  };

  slot.className = `inline-feedback-msg is-${type} is-visible`;
  slot.innerHTML = `<span class="inline-feedback-icon">${iconMap[type] || UI_ICONS.info}</span><span>${escapeHtml(message)}</span>`;

  if (slot._hideTimer) clearTimeout(slot._hideTimer);
  if (autoHideMs > 0) {
    slot._hideTimer = setTimeout(() => {
      slot.classList.remove('is-visible');
      slot._hideTimer = null;
    }, autoHideMs);
  }
}

function positionSegmentedPill(container, pill, btn, opts = {}) {
  if (!container || !pill || !btn) return false;
  const cRect = container.getBoundingClientRect();
  const bRect = btn.getBoundingClientRect();
  if (cRect.width === 0 || bRect.width === 0) return false;

  // Zrušíme případné dočasné měřítko rodičovské animace (tabPanelReveal scale), aby pilulka vždy přesně seděla
  const scaleX = container.offsetWidth > 0 ? (cRect.width / container.offsetWidth) : 1;
  const scaleY = container.offsetHeight > 0 ? (cRect.height / container.offsetHeight) : 1;
  const left = (bRect.left - cRect.left) / scaleX - (container.clientLeft || 0);
  const top = (bRect.top - cRect.top) / scaleY - (container.clientTop || 0);
  const width = bRect.width / scaleX;
  const height = bRect.height / scaleY;

  const firstPlace = !pill.dataset.pillPlaced;
  if (firstPlace) {
    pill.style.transition = 'none';
  }
  if (opts.matchRadius) {
    pill.style.borderRadius = window.getComputedStyle(btn).borderTopLeftRadius;
  }
  pill.style.width = `${width}px`;
  if (opts.vertical) {
    pill.style.height = `${height}px`;
    pill.style.transform = `translate3d(${left}px, ${top}px, 0)`;
  } else {
    pill.style.transform = `translate3d(${left}px, 0, 0)`;
  }
  if (firstPlace) {
    pill.dataset.pillPlaced = '1';
    pill.offsetHeight;
    pill.style.transition = '';
  }
  return true;
}

function updateMainNavPill(targetBtn) {
  const container = document.querySelector('.nav-links');
  const pill = document.getElementById('nav-links-pill') || document.getElementById('nav-active-pill');
  const btn = targetBtn || container?.querySelector('.nav-link.active');
  if (window.__navLiquidGlass && window.__navLiquidGlass.enabled) {
    window.__navLiquidGlass.setActiveButton(btn);
  }
  if (!container || !pill) return;
  if (!btn) {
    pill.style.opacity = '0';
    return;
  }
  const cRect = container.getBoundingClientRect();
  const bRect = btn.getBoundingClientRect();
  if (bRect.width === 0) {
    pill.style.opacity = '0';
    return;
  }
  container.classList.add('has-indicator');
  const left = bRect.left - cRect.left;
  pill.style.opacity = '1';
  pill.style.width = `${bRect.width}px`;
  pill.style.transform = `translate3d(${left}px, 0, 0)`;
}

let currentActiveTab = 'home';

function executeTabSwitch(name, updateUrl = true) {
  currentActiveTab = name;
  document.body.style.overflow = ''; // Unlock vertical page scroll
  // Deactivate current active tab immediately with animation reset
  const activeSections = document.querySelectorAll('.tab-section.active');
  activeSections.forEach(s => {
    s.classList.remove('animate-in');
    s.classList.remove('active');
  });

  // Remove active state from all nav links (both desktop and mobile bottom)
  document.querySelectorAll('.nav-link, .bottom-nav-item').forEach(b => b.classList.remove('active'));

  const section = document.getElementById('tab-' + name);
  if (section) {
    section.classList.add('active');
    // Force browser reflow to register opacity/transform transition start state
    section.offsetHeight;
    section.classList.add('animate-in');
  }

  // Activate matching buttons on desktop, top mobile, and bottom mobile navigation
  const desktopBtn = document.getElementById('tab-btn-' + name);
  const topMobileBtn = document.getElementById('top-nav-' + name);
  const bottomNavBtn = document.getElementById('btn-nav-' + name);
  if (desktopBtn) desktopBtn.classList.add('active');
  if (topMobileBtn) topMobileBtn.classList.add('active');
  if (bottomNavBtn) bottomNavBtn.classList.add('active');

  updateMainNavPill(desktopBtn);

  window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });

  const footer = document.querySelector('footer.footer');
  if (footer) {
    footer.style.display = (name === 'napady') ? 'none' : 'block';
  }

  if (name === 'napady' || name === 'stats') {
    document.body.classList.add('has-dot-grid');
  } else {
    document.body.classList.remove('has-dot-grid');
  }

  if (name === 'media') {
    checkMediaStatus();
  } else if (name === 'napady') {
    loadIdeasTab();
  } else if (name === 'stats') {
    initStatsModule();
  } else if (name === 'smp-plus') {
    checkSmpPlusStatus();
    selectSmpTier(currentSmpTier);
  } else if (name === 'privacy' || name === 'terms') {
    if (typeof updateLegalProgressGlobal === 'function') {
      setTimeout(updateLegalProgressGlobal, 100);
    }
  } else if (name === 'rules') {
    if (typeof initOrRenderRulesQuiz === 'function') {
      initOrRenderRulesQuiz();
    }
  } else if (name === 'modtest') {
    if (typeof initOrRenderModTest === 'function') {
      initOrRenderModTest();
    }
  }

  if (typeof updateAllSegmentedPills === 'function') updateAllSegmentedPills();
  setTimeout(() => {
    if (typeof updateAllSegmentedPills === 'function') updateAllSegmentedPills();
    if (window.__switcherLiquidGlass) window.__switcherLiquidGlass.resetAllHidden();
  }, 40);
  setTimeout(() => {
    if (typeof updateAllSegmentedPills === 'function') updateAllSegmentedPills();
  }, 280);

  if (updateUrl && window.location.protocol !== 'file:') {
    let urlPath = '/' + name;
    if (name === 'smp-plus') urlPath = '/smpplus';
    else if (name === 'stats') urlPath = '/statistiky';
    else if (name === 'join') urlPath = '/howto';
    else if (name === 'bugs') urlPath = '/bug';
    else if (name === 'napady') urlPath = '/napady';
    else if (name === 'modtest') urlPath = '/modtest';
    else if (name === 'launcher') urlPath = '/launcher';
    else if (name === 'home') urlPath = '/';

    if (window.location.pathname !== urlPath) {
      try {
        history.pushState({ tab: name }, '', urlPath);
      } catch (e) {
        // Ignorováno pro file:/// a restriktivní lokální kontexty
      }
    }
  }

  // Trigger scroll calculations (like timeline progress) after tab transition
  setTimeout(() => {
    window.dispatchEvent(new Event('scroll'));
  }, 150);
}

// ---- MOBILE MENU ----
function toggleMenu() {
  const ham = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');
  ham.classList.toggle('open');
  menu.classList.toggle('open');
}

// ---- UNIVERSAL CLIPBOARD COPY HELPER (SECURE CONTEXT + FILE:/// FALLBACK) ----
function copyTextToClipboard(text) {
  if (!text) return Promise.resolve();

  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    return navigator.clipboard.writeText(text).catch(() => {
      return fallbackCopyTextToClipboard(text);
    });
  }

  return fallbackCopyTextToClipboard(text);
}

function fallbackCopyTextToClipboard(text) {
  return new Promise((resolve, reject) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "-9999px";
      textArea.style.opacity = "0";
      textArea.setAttribute('readonly', '');
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(0, 99999);
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) {
        resolve();
      } else {
        reject(new Error('execCommand copy returned false'));
      }
    } catch (err) {
      reject(err);
    }
  });
}

// ---- TACTILE BUTTON FEEDBACK HELPER (CRITICALLY DAMPED APPLE SPRING) ----
function triggerButtonFeedback(btnElement, copiedText = 'Zkopírováno') {
  if (!btnElement) return;

  btnElement.classList.add('copied', 'is-copied');

  // Critically damped tactile press feedback (no cartoon overshoot)
  if (!prefersReducedMotion() && typeof btnElement.animate === 'function') {
    btnElement.animate([
      { transform: 'scale(1)' },
      { transform: 'scale(0.975)' },
      { transform: 'scale(1)' }
    ], {
      duration: 180,
      easing: APPLE_SPRING_EASE
    });
  }

  // Subtle icon morph into confirmation state
  const iconWrap = btnElement.querySelector('.btn-copy-icon-wrap');
  if (iconWrap && !prefersReducedMotion() && typeof iconWrap.animate === 'function') {
    iconWrap.animate([
      { transform: 'scale(0.85)', opacity: 0.6 },
      { transform: 'scale(1)', opacity: 1 }
    ], {
      duration: 200,
      easing: APPLE_SPRING_EASE
    });
  }

  // If button has structured label
  const label = btnElement.querySelector('.btn-copy-label') || btnElement.querySelector('.btn-gm-label');
  let origLabel = null;
  if (label) {
    if (!label.dataset.origLabel) {
      label.dataset.origLabel = label.textContent;
    }
    origLabel = label.dataset.origLabel;
    label.textContent = copiedText;
  }

  // Clear existing timer if clicked multiple times
  if (btnElement._resetTimer) {
    clearTimeout(btnElement._resetTimer);
  }

  btnElement._resetTimer = setTimeout(() => {
    btnElement.classList.remove('copied', 'is-copied');
    if (label && origLabel !== null) {
      label.textContent = origLabel;
    }
    btnElement._resetTimer = null;
  }, 1800);
}

// ---- LAUNCHER OS SWITCHER & TERMINAL COPY ----
function detectUserOS() {
  const ua = (navigator.userAgentData?.platform || navigator.platform || navigator.userAgent || '').toLowerCase();
  if (ua.includes('linux')) return 'linux';
  return 'windows';
}

function switchLauncherOS(os, btn) {
  if (os !== 'linux' && os !== 'windows') {
    os = 'windows';
  }
  document.querySelectorAll('.os-nav-tab').forEach(t => {
    t.classList.remove('active');
    t.setAttribute('aria-selected', 'false');
  });
  const activeBtn = btn || document.querySelector(`.os-nav-tab[data-os="${os}"]`);
  if (activeBtn) {
    activeBtn.classList.add('active');
    activeBtn.setAttribute('aria-selected', 'true');
  }

  updateLauncherOsPill(activeBtn);

  document.querySelectorAll('.os-panel').forEach(p => {
    const isTarget = p.id === `os-panel-${os}`;
    p.classList.toggle('active', isTarget);
    if (isTarget && !prefersReducedMotion()) {
      p.style.opacity = '0';
      p.style.transform = 'translate3d(0, 6px, 0)';
      p.style.transition = `opacity 220ms ${APPLE_SPRING_EASE}, transform 220ms ${APPLE_SPRING_EASE}`;
      void p.offsetWidth;
      p.style.opacity = '1';
      p.style.transform = 'translate3d(0, 0, 0)';
    }
  });
}

function updateLauncherOsPill(targetBtn) {
  const container = document.querySelector('.os-selector-nav');
  const pill = document.getElementById('os-nav-pill');
  const btn = targetBtn || container?.querySelector('.os-nav-tab.active');
  if (!positionSegmentedPill(container, pill, btn)) return;
  if (window.__switcherLiquidGlass) window.__switcherLiquidGlass.syncContainer(container);
}

// ---- DYNAMIC LAUNCHER RELEASES & DOWNLOADS TRACKER ----
async function trackLauncherDownload(os = 'unknown') {
  try {
    const res = await apiFetch('/api/launcher/track-download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ os })
    }, 4000);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.downloads === 'number') {
        updateLauncherDownloadsUI(data.downloads);
      }
    }
  } catch (_err) {
    // Non-blocking telemetry
  }
}

function updateLauncherDownloadsUI(count) {
  const el = document.getElementById('launcher-downloads-count');
  if (!el) return;
  const num = Number(count) || 0;
  let text = `${num} stažení`;
  if (num === 1) text = '1 stažení';
  else if (num >= 2 && num <= 4) text = `${num} stažení`;
  el.textContent = text;
}

async function resolveLatestLauncherDownloads() {
  const winBtn = document.getElementById('btn-win-download');
  const linBtn = document.getElementById('btn-linux-download');
  const verTag = document.getElementById('launcher-version-tag');

  // 1. Zkusíme načíst data z našeho backendového endpointu (cache + spolehlivost)
  try {
    const apiRes = await apiFetch('/api/launcher/info', {}, 5000);
    if (apiRes.ok) {
      const info = await apiRes.json();
      if (info && info.success) {
        if (info.winUrl && winBtn) winBtn.href = info.winUrl;
        if (info.linuxUrl && linBtn) linBtn.href = info.linuxUrl;
        if (info.version && verTag) verTag.textContent = `Verze ${info.version}`;
        if (typeof info.downloads === 'number') {
          updateLauncherDownloadsUI(info.downloads);
        }
        return; // Hotovo, úspěšně načteno
      }
    }
  } catch (_e) {
    // Fallback na přímý GitHub API
  }

  // 2. Fallback na přímé GitHub API s AbortController timeoutem
  const ghController = new AbortController();
  const ghTimer = setTimeout(() => ghController.abort(), 6000);
  try {
    const res = await fetch('https://api.github.com/repos/mychalVidea/mychalsmp-launcher/releases/latest', {
      credentials: 'omit',
      signal: ghController.signal
    });
    if (!res.ok) return;
    const data = await res.json();
    const assets = data.assets || [];

    // Setup exe pro Windows
    const winAsset = assets.find(a => /setup.*\.exe$/i.test(a.name)) ||
      assets.find(a => /\.exe$/i.test(a.name));
    if (winAsset && winBtn) {
      winBtn.href = winAsset.browser_download_url;
    }

    // Tar.gz pro Linux
    const linAsset = assets.find(a => /\.tar\.gz$/i.test(a.name));
    if (linAsset && linBtn) {
      linBtn.href = linAsset.browser_download_url;
    }

    // Automatická aktualizace zobrazené verze
    if (verTag && data.tag_name) {
      verTag.textContent = `Verze ${data.tag_name}`;
    }

    let totalDl = 0;
    for (const a of assets) {
      totalDl += (a.download_count || 0);
    }
    updateLauncherDownloadsUI(totalDl);
  } catch (_err) {
    // Tichý fallback - tlačítka již mají výchozí fallback odkazy v HTML
  } finally {
    clearTimeout(ghTimer);
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    switchLauncherOS(detectUserOS());
    resolveLatestLauncherDownloads();
  });
}

function copyTermCommand(commandText, btn) {
  copyTextToClipboard(commandText).then(() => {
    triggerButtonFeedback(btn, 'Zkopírováno');
  }).catch(() => {
    triggerButtonFeedback(btn, 'Zkopírováno');
  });
}

// ---- COPY IP ----
function copyIP(event) {
  if (event) {
    if (typeof event.stopPropagation === 'function') event.stopPropagation();
    if (typeof event.preventDefault === 'function') event.preventDefault();
  }

  const ip = 'mychalsmp.xyz';

  // 1. Okamžitě najít tlačítko a kontejner pro hmatovou odezvu
  let btnToFeedback = null;
  let barToHighlight = null;

  const target = event ? (event.currentTarget || event.target) : null;
  if (target) {
    if (target.id === 'copy-btn') {
      btnToFeedback = target;
      barToHighlight = document.querySelector('.hero-ip-bar');
    } else if (target.classList.contains('hero-ip-bar') || target.closest('.hero-ip-bar')) {
      barToHighlight = target.classList.contains('hero-ip-bar') ? target : target.closest('.hero-ip-bar');
      btnToFeedback = barToHighlight.querySelector('#copy-btn') || barToHighlight.querySelector('button');
    } else if (target.classList.contains('quickstart-ip-box') || target.closest('.quickstart-ip-box')) {
      barToHighlight = target.classList.contains('quickstart-ip-box') ? target : target.closest('.quickstart-ip-box');
      btnToFeedback = barToHighlight.querySelector('.quickstart-copy-btn') || barToHighlight.querySelector('button');
    } else if (target.classList.contains('join-quick-ip-address') || target.closest('.join-quick-ip-card') || target.closest('.join-quick-ip-address')) {
      barToHighlight = target.closest('.join-quick-ip-card') || target.closest('.join-quick-ip-address') || target;
      btnToFeedback = barToHighlight.querySelector('.join-quick-copy-btn') || barToHighlight.querySelector('button');
    } else if (target.classList.contains('join-compact-ip-box') || target.closest('.join-compact-ip-box')) {
      barToHighlight = target.classList.contains('join-compact-ip-box') ? target : target.closest('.join-compact-ip-box');
      btnToFeedback = barToHighlight.querySelector('.join-compact-copy-btn') || barToHighlight.querySelector('button');
    } else {
      btnToFeedback = target.tagName === 'BUTTON' ? target : target.querySelector('button');
    }
  }

  if (!btnToFeedback) {
    btnToFeedback = document.getElementById('copy-btn');
  }

  // 2. Okamžitá lokální hmatová reakce a morph ikon v tlačítku
  if (btnToFeedback) {
    triggerButtonFeedback(btnToFeedback, 'Zkopírováno');
  }
  if (barToHighlight) {
    barToHighlight.classList.add('copied');
    setTimeout(() => barToHighlight.classList.remove('copied'), 1800);
  }

  // 3. Kopírování do schránky s automatickým fallbackem pro file:///
  copyTextToClipboard(ip).catch(err => {
    console.warn('Clipboard write fallback error:', err);
  });
}

// ---- COPY COMMAND TO CLIPBOARD ----
function copyCommand(cmd, el) {
  if (!cmd) return;
  if (el) {
    triggerButtonFeedback(el, 'Zkopírováno');
    el.classList.add('command-copied', 'copied');
    setTimeout(() => {
      el.classList.remove('command-copied', 'copied');
    }, 1800);
  }
  copyTextToClipboard(cmd).catch(err => {
    console.warn('Failed to copy command:', err);
  });
}

function copyTicketId(e) {
  if (e && e.stopPropagation) e.stopPropagation();
  const ticketIdEl = document.getElementById('ticket-id-display');
  if (!ticketIdEl) return;
  const text = ticketIdEl.textContent.trim();
  const btn = document.querySelector('.ticket-copy-btn');
  if (btn) {
    triggerButtonFeedback(btn, 'Zkopírováno');
  }
  copyTextToClipboard(text).catch(err => {
    console.warn('Failed to copy ticket ID:', err);
  });
}

// ---- CALM STATUS FALLBACK (Rules 24, 25: Local inline feedback preferred; zero corner slop toasts) ----
function showToast(message, anchorEl = null) {
  const raw = String(message || '').trim();
  if (!raw) return;

  let toastType = 'info';
  if (/chyba|selhal|neplatn|nedostupn|nepodař|musíš uvést/iu.test(raw)) {
    toastType = 'error';
  } else if (/úspěšně|zkopírován|schválen|odeslán|zpracován/iu.test(raw)) {
    toastType = 'success';
  } else if (/upozornění|musíš|vyplň|potvrď|maximálně|počkej/iu.test(raw)) {
    toastType = 'warning';
  }

  if (anchorEl) {
    showInlineFeedback(anchorEl, raw, toastType);
    return;
  }

  // Fallback: render subtle top-center inline status bar inside active section instead of corner floating toast
  const activeSection = document.querySelector('.tab-section.active') || document.body;
  let bar = document.getElementById('inline-status-fallback');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'inline-status-fallback';
    bar.className = 'inline-feedback-msg';
    bar.setAttribute('role', 'status');
    bar.setAttribute('aria-live', 'polite');
  }
  if (bar.parentElement !== activeSection) {
    activeSection.prepend(bar);
  }

  const iconMap = {
    error: UI_ICONS.x,
    warning: UI_ICONS.alert,
    success: UI_ICONS.check,
    info: UI_ICONS.info
  };

  bar.className = `inline-feedback-msg is-${toastType} is-visible`;
  bar.innerHTML = `<span class="inline-feedback-icon">${iconMap[toastType] || UI_ICONS.info}</span><span>${escapeHtml(raw)}</span>`;

  if (bar._hideTimer) clearTimeout(bar._hideTimer);
  bar._hideTimer = setTimeout(() => {
    bar.classList.remove('is-visible');
    bar._hideTimer = null;
  }, 3600);
}

function copyText(text, el) {
  copyTextToClipboard(text).then(() => {
    if (!el) return;
    const origHTML = el.innerHTML;
    el.innerHTML = '<svg class="ui-icon-svg ui-icon-svg--xs" viewBox="0 0 24 24" fill="none" stroke="#21DE00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    setTimeout(() => { el.innerHTML = origHTML; }, 1800);
  }).catch(() => {});
}

// ---- FAQ TOGGLE ----
function toggleFAQ(btn) {
  const card = btn.closest('.faq-card');
  if (!card) return;
  const content = card.querySelector('.faq-content');
  const isActive = card.classList.contains('active');

  // Close all cards
  document.querySelectorAll('.faq-card').forEach(c => {
    c.classList.remove('active');
    const cc = c.querySelector('.faq-content');
    if (cc) cc.style.maxHeight = '0px';
  });

  // Toggle the clicked one
  if (!isActive && content) {
    card.classList.add('active');
    content.style.maxHeight = content.scrollHeight + 'px';
  }
}

// ---- LIGHTBOX ----
let lightboxImages = [];
let lightboxIndex = 0;

function buildLightboxImages() {
  lightboxImages = Array.from(document.querySelectorAll('.gallery-item img')).map(img => img.src);
  // Also include preview images
  document.querySelectorAll('.preview-img').forEach(img => {
    if (!lightboxImages.includes(img.src)) lightboxImages.push(img.src);
  });
}

function openLightbox(src) {
  buildLightboxImages();
  lightboxIndex = lightboxImages.indexOf(src);
  if (lightboxIndex === -1) { lightboxImages.push(src); lightboxIndex = lightboxImages.length - 1; }
  document.getElementById('lightbox-img').src = src;
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

function closeLightboxOutside(e) {
  if (e.target === document.getElementById('lightbox')) closeLightbox();
}

function lightboxPrev(e) {
  e.stopPropagation();
  if (!lightboxImages.length) return;
  lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
  document.getElementById('lightbox-img').src = lightboxImages[lightboxIndex];
}

function lightboxNext(e) {
  e.stopPropagation();
  if (!lightboxImages.length) return;
  lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
  document.getElementById('lightbox-img').src = lightboxImages[lightboxIndex];
}

// Keyboard nav for lightbox & modals (Rule 32: Esc closes any open overlay)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const lb = document.getElementById('lightbox');
    if (lb && lb.classList.contains('open')) {
      closeLightbox();
      return;
    }
    const cancelModal = document.getElementById('smp-cancel-modal');
    if (cancelModal && cancelModal.style.display !== 'none' && cancelModal.style.display !== '') {
      closeCancelModal();
      return;
    }
    const ideaModal = document.getElementById('idea-modal');
    if (ideaModal && ideaModal.classList.contains('active')) {
      closeIdeaModal();
      return;
    }
    const approveModal = document.getElementById('idea-approve-modal');
    if (approveModal && approveModal.classList.contains('active')) {
      closeApproveIdeaModal();
      return;
    }
    const rejectModal = document.getElementById('idea-reject-modal');
    if (rejectModal && rejectModal.classList.contains('active')) {
      closeRejectIdeaModal();
      return;
    }
    return;
  }

  const lb = document.getElementById('lightbox');
  if (!lb || !lb.classList.contains('open')) return;
  if (e.key === 'ArrowLeft') lightboxPrev(e);
  if (e.key === 'ArrowRight') lightboxNext(e);
});

// ---- NAVBAR SCROLL EFFECT ----
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  if (window.scrollY > 40) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
}, { passive: true });

// ---- INTERSECTION OBSERVER (subtle optical reveal) ----
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translate3d(0, 0, 0)';
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.08 });

if (!prefersReducedMotion()) {
  document.querySelectorAll('.feature-card, .step-card, .rule-card, .gallery-item, .join-step, .smp-card, .smp-checkout-card, .smp-hero-left').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translate3d(0, 8px, 0)';
    el.style.transition = `opacity 260ms ${APPLE_SPRING_EASE}, transform 260ms ${APPLE_SPRING_EASE}`;
    observer.observe(el);
  });
}

function formatCompactNumber(num) {
  if (!num || isNaN(num)) return '0';
  const val = Math.round(num);
  if (val >= 1000000000) {
    const formatted = (val / 1000000000).toFixed(1).replace(/\.0$/, '');
    return formatted + 'B';
  }
  if (val >= 1000000) {
    const formatted = (val / 1000000).toFixed(1).replace(/\.0$/, '');
    return formatted + 'M';
  }
  if (val >= 1000) {
    const formatted = (val / 1000).toFixed(1).replace(/\.0$/, '');
    return formatted + 'k';
  }
  return val.toString();
}

// ---- FETCH DYNAMIC STATS ----
async function loadStats() {
  try {
    const apiEndpoints = [
      '/api/public-stats',
      'https://api.6767111.xyz/api/public-stats'
    ];
    let data = null;
    for (const url of apiEndpoints) {
      try {
        const res = await apiFetch(url, {}, 6000);
        if (res.ok) {
          data = await res.json();
          if (data && (data.whitelist_count !== undefined || data.total_money !== undefined)) break;
        }
      } catch (e) { }
    }

    if (data) {
      if (data.whitelist_count !== undefined) {
        updateStat('stat-whitelist', data.whitelist_count);
      }
      if (data.discord_members !== undefined) {
        updateStat('stat-discord', data.discord_members);
      }
      if (data.playtime_hours !== undefined) {
        updateStat('stat-playtime', data.playtime_hours);
      }
      if (data.total_deaths !== undefined) {
        updateStat('stat-deaths', data.total_deaths);
      }
      if (data.total_money !== undefined) {
        updateStat('stat-money', data.total_money);
      }
    }
  } catch (err) {
    console.warn('Failed to load dynamic stats:', err);
  }
}

// Global flag to track if stats scroll animation occurred
let statsAnimated = false;

function updateStat(id, newVal) {
  const el = document.getElementById(id);
  if (!el) return;
  const numVal = parseInt(newVal, 10) || 0;
  el.setAttribute('data-target', numVal);
  if (statsAnimated) {
    animateCounter(el, numVal);
  } else {
    if (el.id === 'stat-money') {
      el.textContent = '$' + formatCompactNumber(numVal);
    } else {
      const suffix = el.id === 'stat-deaths' ? '' : '+';
      el.textContent = numVal + suffix;
    }
  }
}

function animateCounter(el, targetValue) {
  if (!el) return;
  const numTarget = parseInt(targetValue, 10) || 0;

  // Cancel any previous running animation on this element
  if (el._statAnimFrameId) {
    cancelAnimationFrame(el._statAnimFrameId);
    el._statAnimFrameId = null;
  }

  const duration = 1500; // 1.5 seconds
  const start = el._currentAnimValue !== undefined ? el._currentAnimValue : 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out quadratic
    const easeProgress = progress * (2 - progress);
    const currentValue = Math.floor(start + easeProgress * (numTarget - start));
    el._currentAnimValue = currentValue;

    if (el.id === 'stat-money') {
      el.textContent = '$' + formatCompactNumber(currentValue);
    } else {
      const suffix = el.id === 'stat-deaths' ? '' : '+';
      el.textContent = currentValue + suffix;
    }

    if (progress < 1) {
      el._statAnimFrameId = requestAnimationFrame(update);
    } else {
      el._currentAnimValue = numTarget;
      el._statAnimFrameId = null;
      if (el.id === 'stat-money') {
        el.textContent = '$' + formatCompactNumber(numTarget);
      } else {
        const suffix = el.id === 'stat-deaths' ? '' : '+';
        el.textContent = numTarget + suffix;
      }
    }
  }
  el._statAnimFrameId = requestAnimationFrame(update);
}

let skinDebounceTimer = null;

// ---- LIVE IN-GAME RANK PREVIEW (CHAT, TABLIST, NAMETAG) ----
function updatePreviewName(val) {
  const preview = document.getElementById('smp-preview-name');
  const previewTab = document.getElementById('smp-preview-name-tab');
  const previewTag = document.getElementById('smp-preview-name-tag');
  const previewHead = document.getElementById('smp-preview-head');
  const previewHeadTab = document.getElementById('smp-preview-head-tab');
  const previewHeadTag = document.getElementById('smp-preview-head-tag');
  const inputHead = document.getElementById('nickname-input-head');

  const cleanVal = (val || '').trim();
  const displayName = cleanVal ? cleanVal : 'Hrac';

  if (preview) preview.textContent = displayName;
  if (previewTab) previewTab.textContent = displayName;
  if (previewTag) previewTag.textContent = displayName;

  // Debounce skin lookup to avoid spamming mc-heads
  clearTimeout(skinDebounceTimer);
  skinDebounceTimer = setTimeout(() => {
    const targetNick = (cleanVal && /^[a-zA-Z0-9_]{2,16}$/.test(cleanVal)) ? cleanVal : 'MHF_Question';
    const avatarUrl = `https://mc-heads.net/avatar/${encodeURIComponent(targetNick)}/28`;
    const avatarUrlSm = `https://mc-heads.net/avatar/${encodeURIComponent(targetNick)}/24`;
    const avatarUrlLg = `https://mc-heads.net/avatar/${encodeURIComponent(targetNick)}/42`;

    if (previewHead) {
      previewHead.src = avatarUrl;
      previewHead.classList.remove('avatar-pop');
      void previewHead.offsetWidth;
      previewHead.classList.add('avatar-pop');
    }
    if (previewHeadTab) previewHeadTab.src = avatarUrlSm;
    if (previewHeadTag) previewHeadTag.src = avatarUrlLg;
    if (inputHead) {
      inputHead.src = avatarUrlSm;
      inputHead.classList.remove('avatar-pop');
      void inputHead.offsetWidth;
      inputHead.classList.add('avatar-pop');
    }
  }, 280);
}

// Switch between Chat, Tablist, and Nametag previews
function switchSmpPreviewMode(mode) {
  const chatView = document.getElementById('smp-view-chat');
  const tabView = document.getElementById('smp-view-tab');
  const tagView = document.getElementById('smp-view-tag');

  const chatBtn = document.getElementById('smp-mode-chat-btn');
  const tabBtn = document.getElementById('smp-mode-tab-btn');
  const tagBtn = document.getElementById('smp-mode-tag-btn');

  [chatView, tabView, tagView].forEach(v => {
    if (v) {
      v.style.display = 'none';
      v.classList.remove('smp-preview-pane-anim');
    }
  });
  [chatBtn, tabBtn, tagBtn].forEach(b => { if (b) b.classList.remove('active'); });

  let activeBtn = chatBtn;
  let targetView = chatView;
  let displayType = 'flex';
  if (mode === 'tab') {
    activeBtn = tabBtn;
    targetView = tabView;
    displayType = 'block';
  } else if (mode === 'tag') {
    activeBtn = tagBtn;
    targetView = tagView;
    displayType = 'flex';
  }

  if (targetView) {
    transitionPanelVisibility(targetView, true, displayType);
    targetView.classList.add('smp-preview-pane-anim');
  }

  if (activeBtn) activeBtn.classList.add('active');
  updateSmpModePill(activeBtn);
}

function updateSmpModePill(targetBtn) {
  const container = document.querySelector('.smp-preview-modes');
  const pill = document.getElementById('smp-mode-pill');
  const btn = targetBtn || container?.querySelector('.smp-mode-btn.active') || document.getElementById('smp-mode-chat-btn');
  if (!positionSegmentedPill(container, pill, btn)) return;
  if (window.__switcherLiquidGlass) window.__switcherLiquidGlass.syncContainer(container);
}

// Live /cc color selector in the preview
function setPreviewNickColor(color, swatchEl) {
  const names = [
    document.getElementById('smp-preview-name'),
    document.getElementById('smp-preview-name-tab'),
    document.getElementById('smp-preview-name-tag')
  ];

  names.forEach(el => {
    if (el) {
      el.style.color = color;
      el.style.textShadow = 'none';
    }
  });

  // Highlight active swatch
  document.querySelectorAll('.smp-swatch').forEach(s => s.classList.remove('active'));
  if (swatchEl) {
    swatchEl.classList.add('active');
  } else {
    document.querySelectorAll('.smp-swatch').forEach(s => {
      if (s.getAttribute('style')?.includes(color)) s.classList.add('active');
    });
  }
}

// ---- TEBEX CHECKOUT CONFIG ----
const TEBEX_TIER_CONFIG = {
  smp_plus: {
    id: '7559669',
    slug: 'smppl',
    name: 'SMP+',
    price: '1.99',
    prefix: '+',
    tierClass: 'tier-plus',
    btnLabel: 'Aktivovat SMP+',
    btnSub: '1.99 € / měsíc · Okamžitá aktivace'
  },
  smp_pp: {
    id: '7777972',
    slug: 'smpplpl',
    name: 'SMP++',
    price: '3.79',
    prefix: '++',
    tierClass: 'tier-plusplus',
    btnLabel: 'Aktivovat SMP++',
    btnSub: '3.79 € / měsíc · Okamžitá aktivace'
  },
  smp_ppp: {
    id: '7777973',
    slug: 'smpplplpl',
    name: 'SMP+++',
    price: '3.99',
    prefix: '+++',
    tierClass: 'tier-plusplusplus',
    btnLabel: 'Aktivovat SMP+++',
    btnSub: '3.99 € / měsíc · Okamžitá aktivace'
  }
};

// ---- TEBEX WAREZ / OFFLINE CONFIG (smp+ v2) ----
const TEBEX_WAREZ_TIER_CONFIG = {
  smp_plus: {
    id: '7786829',
    name: 'SMP+',
    price: '1.99',
    prefix: '+',
    tierClass: 'tier-plus',
    btnLabel: 'Aktivovat SMP+ · Offline',
    btnSub: '1.99 € / měsíc · Offline účet'
  },
  smp_pp: {
    id: '7786831',
    name: 'SMP++',
    price: '3.79',
    prefix: '++',
    tierClass: 'tier-plusplus',
    btnLabel: 'Aktivovat SMP++ · Offline',
    btnSub: '3.79 € / měsíc · Offline účet'
  },
  smp_ppp: {
    id: '7786832',
    name: 'SMP+++',
    price: '3.99',
    prefix: '+++',
    tierClass: 'tier-plusplusplus',
    btnLabel: 'Aktivovat SMP+++ · Offline',
    btnSub: '3.99 € / měsíc · Offline účet'
  }
};

let currentSmpTier = 'smp_ppp';

function getTebexStoreUrl(tierKey) {
  const isCracked = document.getElementById('smp-cracked-check')?.checked;
  if (isCracked) {
    return 'https://smp-v2.tebex.store/';
  }
  const tier = TEBEX_TIER_CONFIG[tierKey || currentSmpTier] || TEBEX_TIER_CONFIG.smp_ppp;
  return `https://mychalsmp.tebex.store/package/${tier.slug || tier.id}`;
}

function updateTierSliderPosition() {
  const selector = document.getElementById('smp-tier-selector');
  const activeBtn = document.getElementById(`smp-tier-btn-${currentSmpTier}`);
  const indicator = document.getElementById('smp-tier-indicator');
  if (!selector || !activeBtn || !indicator) return;

  const selectorRect = selector.getBoundingClientRect();
  const btnRect = activeBtn.getBoundingClientRect();
  if (btnRect.width === 0) return;
  const leftOffset = btnRect.left - selectorRect.left;

  indicator.style.width = `${btnRect.width}px`;
  indicator.style.transform = `translate3d(${leftOffset}px, 0, 0)`;
}

function selectSmpTier(tierKey) {
  if (!TEBEX_TIER_CONFIG[tierKey]) return;
  currentSmpTier = tierKey;
  const cfg = TEBEX_TIER_CONFIG[tierKey];

  // Update 3 pricing cards active state
  document.querySelectorAll('.smp-pricing-card').forEach(card => {
    const isThis = card.id === `smp-card-${tierKey}`;
    card.classList.toggle('active-tier', isThis);
  });

  // Update selection buttons inside 3 pricing cards
  ['smp_plus', 'smp_pp', 'smp_ppp'].forEach(key => {
    const btn = document.getElementById(`btn-select-${key}`);
    const tCfg = TEBEX_TIER_CONFIG[key];
    if (btn && tCfg) {
      const isSelected = key === tierKey;
      btn.classList.toggle('active', isSelected);
      btn.textContent = isSelected ? `Vybráno · ${tCfg.name}` : `Zvolit ${tCfg.name}`;
    }
  });

  // Update checkout header badge indicator
  const activeNameEl = document.getElementById('checkout-active-tier-name');
  const activePriceEl = document.getElementById('checkout-active-tier-price');
  if (activeNameEl) {
    activeNameEl.textContent = cfg.name;
    activeNameEl.className = 'smp-checkout-tier-name ' + (
      tierKey === 'smp_ppp' ? 'smp-shimmer-text--ppp' :
        tierKey === 'smp_pp' ? 'smp-shimmer-text--pp' : 'smp-shimmer-text--plus'
    );
  }
  if (activePriceEl) {
    activePriceEl.textContent = `${cfg.price} € / měsíc`;
    activePriceEl.className = 'smp-checkout-tier-price ' + (
      tierKey === 'smp_ppp' ? 'smp-shimmer-price smp-shimmer-price--ppp' :
        tierKey === 'smp_pp' ? 'smp-shimmer-price smp-shimmer-price--pp' : 'smp-shimmer-price'
    );
  }

  // Update tabs if legacy slider is present
  document.querySelectorAll('.smp-tier-btn').forEach(btn => {
    const isThis = btn.id === `smp-tier-btn-${tierKey}`;
    btn.classList.toggle('active', isThis);
    btn.setAttribute('aria-selected', isThis ? 'true' : 'false');
  });
  updateTierSliderPosition();

  // Animate price display if legacy element exists
  const priceNumEl = document.getElementById('smp-display-price');
  if (priceNumEl) {
    priceNumEl.style.transform = 'scale(0.96)';
    setTimeout(() => {
      priceNumEl.textContent = cfg.price;
      priceNumEl.style.transform = 'scale(1)';
    }, 100);
  }

  // Update in-game rank preview plus sign (in preview box only)
  document.querySelectorAll('.smp-preview-box .smp-preview-plus').forEach(plusEl => {
    plusEl.textContent = cfg.prefix;
    plusEl.className = `smp-preview-plus ${cfg.tierClass}`;
  });

  // Update button texts
  const isCracked = document.getElementById('smp-cracked-check')?.checked;
  const activeCfg = (isCracked ? TEBEX_WAREZ_TIER_CONFIG : TEBEX_TIER_CONFIG)[tierKey] || cfg;
  const btnLabel = document.getElementById('btn-purchase-label');
  const btnSub = document.getElementById('btn-purchase-sub');

  if (btnLabel && btnSub) {
    btnLabel.textContent = activeCfg.btnLabel;
    btnSub.textContent = activeCfg.btnSub;
  }

  // Highlight column in comparison table
  document.querySelectorAll('.smp-compare-table th.col-tier, .smp-compare-table td.col-tier').forEach(cell => {
    const isCol = cell.classList.contains(`col-${tierKey}`);
    cell.classList.toggle('active-tier-col', isCol);
  });
}

function selectSmpTierAndScroll(tierKey) {
  selectSmpTier(tierKey);
  const checkoutTarget = document.querySelector('.smp-unified-checkout-card') || document.querySelector('.smp-checkout-section');
  if (checkoutTarget) {
    const nav = document.querySelector('.navbar');
    const navHeight = nav ? nav.offsetHeight : 70;
    const rect = checkoutTarget.getBoundingClientRect();
    const targetY = window.pageYOffset + rect.top - navHeight - 20;
    window.scrollTo({
      top: Math.max(0, targetY),
      behavior: prefersReducedMotion() ? 'auto' : 'smooth'
    });
  }
  const nickInput = document.getElementById('mc-username');
  if (nickInput) {
    setTimeout(() => {
      try {
        nickInput.focus({ preventScroll: true });
      } catch (e) {
        nickInput.focus();
      }
    }, 320);
  }
}

function handleCrackedToggle(isCracked) {
  const hint = document.getElementById('smp-cracked-hint');
  const activeCfg = (isCracked ? TEBEX_WAREZ_TIER_CONFIG : TEBEX_TIER_CONFIG)[currentSmpTier] || TEBEX_TIER_CONFIG.smp_ppp;
  const btnLabel = document.getElementById('btn-purchase-label');
  const btnSub = document.getElementById('btn-purchase-sub');

  if (hint) {
    transitionPanelVisibility(hint, Boolean(isCracked), 'block');
  }

  if (btnLabel && btnSub) {
    btnLabel.textContent = activeCfg.btnLabel;
    btnSub.textContent = activeCfg.btnSub;
  }
}

async function checkoutSMP() {
  const isCracked = Boolean(document.getElementById('smp-cracked-check')?.checked);
  const btn = document.querySelector('.btn-purchase');
  const feedbackAnchor = btn || document.getElementById('mc-username');

  // Check mandatory terms and immediate delivery consent
  const consentCb = document.getElementById('smp-consent-terms');
  if (consentCb && !consentCb.checked) {
    showInlineFeedback(feedbackAnchor, 'Pro nákup potvrď souhlas s Podmínkami služby a okamžitým plněním.', 'warning');
    const consentWrapper = document.getElementById('smp-consent-wrapper');
    if (consentWrapper) {
      consentWrapper.classList.remove('shake-input');
      void consentWrapper.offsetWidth;
      consentWrapper.classList.add('shake-input');
    }
    consentCb.focus();
    return;
  }

  const nickInput = document.getElementById('mc-username');
  const nickname = nickInput ? nickInput.value.trim() : '';

  if (!nickname) {
    showInlineFeedback(feedbackAnchor, 'Zadej svůj Minecraft nick.', 'warning');
    if (nickInput) {
      nickInput.focus();
      nickInput.classList.remove('shake-input');
      void nickInput.offsetWidth;
      nickInput.classList.add('shake-input');
    }
    return;
  }

  // Simple nick format check
  if (!/^[a-zA-Z0-9_]{2,16}$/.test(nickname)) {
    showInlineFeedback(feedbackAnchor, 'Neplatný nick. Použij 2 až 16 znaků: písmena, čísla nebo podtržítko.', 'warning');
    if (nickInput) {
      nickInput.classList.remove('shake-input');
      void nickInput.offsetWidth;
      nickInput.classList.add('shake-input');
    }
    return;
  }

  const originalText = btn ? btn.innerHTML : '';
  if (btn) {
    btn.innerHTML = '<span class="btn-spinner"></span> Načítám košík...';
    btn.disabled = true;
  }

  const activeMap = isCracked ? TEBEX_WAREZ_TIER_CONFIG : TEBEX_TIER_CONFIG;
  const cfg = activeMap[currentSmpTier] || activeMap.smp_ppp;
  try {
    const response = await apiFetch('https://api.6767111.xyz/api/tebex/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nickname,
        tier: currentSmpTier,
        isCracked,
        packageId: cfg.id
      })
    }, 15000);

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errMsg = data?.message || `Chyba při komunikaci s pokladnou (${response.status}).`;
      showInlineFeedback(feedbackAnchor, errMsg, 'error');

      // If user wasn't found on official Mojang store, auto-toggle cracked option
      if (errMsg.includes('nebyl na Tebexu nalezen') || errMsg.toLowerCase().includes('username') || data?.isInvalidUser) {
        const crackedCheck = document.getElementById('smp-cracked-check');
        if (crackedCheck && !crackedCheck.checked) {
          crackedCheck.checked = true;
          handleCrackedToggle(true);
        }
        const crackedToggle = document.getElementById('smp-cracked-toggle');
        if (crackedToggle) {
          crackedToggle.classList.remove('shake-input');
          void crackedToggle.offsetWidth;
          crackedToggle.classList.add('shake-input');
        }
      }
      return;
    }

    if (data && data.success && data.url) {
      // 1. Zkusíme otevřít platební bránu v novém okně
      const newWin = window.open(data.url, '_blank');
      // 2. Pokud prohlížeč zablokoval popup (časté na mobilech nebo po async fetchi v Safari / Chrome), přesměrujeme přímo
      if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
        window.location.href = data.url;
      }
    } else {
      const errMsg = data?.message || 'Nepodařilo se vytvořit platební odkaz.';
      showInlineFeedback(feedbackAnchor, errMsg, 'error');
    }
  } catch (err) {
    console.warn('[CHECKOUT ERR]', err);
    const fallbackMsg = (err && err.message && !err.message.startsWith('HTTP'))
      ? err.message
      : 'Herní pokladna je momentálně nedostupná. Zkus to za chvíli.';
    showInlineFeedback(feedbackAnchor, fallbackMsg, 'error');
  } finally {
    if (btn) {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  }
}

// ---- CURSOR SPOTLIGHT DISABLED (Rules 86, 107: Zero cursor tricks or redundant mousemove listeners) ----
function initVectorSpotlight() {
  // Intentionally disabled for calm native-software feel and zero main-thread mousemove overhead.
}

// ---- CRITICALLY DAMPED TACTILE PRESS FEEDBACK (Rules 4, 7, 12) ----
function initMicroInteractions() {
  document.addEventListener('click', (e) => {
    if (prefersReducedMotion()) return;
    const target = e.target.closest(
      'button, .btn, .nav-link, .rules-filter-btn, .bug-cat-chip, .smp-mode-btn, .gm-card-cmd-chip, .bottom-nav-item, .join-pill, .rules-banner-banned-btn'
    );
    if (!target || target.disabled || target.classList.contains('copied') || target.classList.contains('is-copied') || target.closest('.has-liquid-switcher')) return;

    if (typeof target.animate === 'function') {
      target.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(0.975)' },
        { transform: 'scale(1)' }
      ], {
        duration: 140,
        easing: APPLE_SPRING_EASE
      });
    }
  }, { passive: true });
}

// Load stats on page load
document.addEventListener('DOMContentLoaded', () => {
  loadStats();
  initVectorSpotlight();
  initMicroInteractions();

  // Init SMP Tier position & window resize listener
  selectSmpTier(currentSmpTier);
  window.addEventListener('resize', () => {
    updateTierSliderPosition();
  }, { passive: true });

  // Trigger transition for default active tab
  const activeTab = document.querySelector('.tab-section.active');
  if (activeTab) {
    activeTab.offsetHeight;
    activeTab.classList.add('animate-in');
  }

  // Check for token in URL (Discord Auth callback redirect) or route
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  if (token) {
    localStorage.setItem('auth_token', token);
    if (window.location.protocol !== 'file:') {
      try {
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        // Ignorováno pro restriktivní lokální prostředí
      }
    }
    const cleanPath = window.location.pathname.replace(/\/+$/, '').toLowerCase();
    if (cleanPath && cleanPath !== '/index.html') {
      handleUrlRouting();
    } else {
      showTab('media');
    }
  } else {
    const loginError = urlParams.get('error');
    if (loginError && typeof showToast === 'function') {
      const msgs = {
        not_in_guild: 'Pro přihlášení musíš být na našem Discordu.',
        login_failed: 'Přihlášení se nepovedlo, zkus to prosím znovu.',
        missing_code: 'Přihlášení bylo zrušeno.'
      };
      if (msgs[loginError]) showToast(msgs[loginError]);
      try { window.history.replaceState({}, document.title, window.location.pathname + window.location.hash); } catch (e) { }
    }
    handleUrlRouting();
  }

  // Initialize Stats Observer for Count-up
  const statsSection = document.querySelector('.stats-section');
  if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !statsAnimated) {
          statsAnimated = true;
          document.querySelectorAll('.stat-num').forEach(el => {
            const target = parseInt(el.getAttribute('data-target') || '0', 10);
            animateCounter(el, target);
          });
        }
      });
    }, { threshold: 0.1 });
    statsObserver.observe(statsSection);
  }

  // Initialize Join Timeline Progress & Active States
  const timelineWrapper = document.querySelector('.join-timeline-wrapper');
  const progressFill = document.querySelector('.join-timeline-progress-fill');
  const timelineRows = document.querySelectorAll('.join-timeline-row');

  if (timelineWrapper && progressFill) {
    let currentFillPercent = 0;
    let targetFillPercent = 0;
    let fillAnimFrame = null;

    // Smooth LERP loop for liquid spring inertia effect on the glowing ball & line
    const runFillLerpLoop = () => {
      const diff = targetFillPercent - currentFillPercent;
      // 0.07 step = smooth liquid inertia delay with ease-out curve!
      currentFillPercent += diff * 0.07;

      if (progressFill) {
        progressFill.style.height = currentFillPercent.toFixed(2) + '%';
      }

      const glowHead = progressFill ? progressFill.querySelector('.join-timeline-glow-head') : null;
      if (glowHead) {
        const ratio = currentFillPercent / 100;
        glowHead.style.opacity = ratio > 0.015 && ratio < 0.985 ? '1' : '0';
      }

      if (Math.abs(diff) > 0.01) {
        fillAnimFrame = requestAnimationFrame(runFillLerpLoop);
      } else {
        fillAnimFrame = null;
      }
    };

    const handleTimelineScroll = () => {
      const rect = timelineWrapper.getBoundingClientRect();
      const viewHeight = window.innerHeight;

      // Overall timeline progress calculation (0 to 1)
      const startOffset = viewHeight * 0.75;
      const totalHeight = rect.height || 1;
      const currentPos = startOffset - rect.top;
      const progressRatio = Math.min(Math.max(currentPos / totalHeight, 0), 1);

      targetFillPercent = progressRatio * 100;

      if (!fillAnimFrame) {
        fillAnimFrame = requestAnimationFrame(runFillLerpLoop);
      }

      // Continuous Apple-style interpolation per row
      timelineRows.forEach(row => {
        const rowRect = row.getBoundingClientRect();
        const rowCenter = rowRect.top + rowRect.height / 2;
        const screenCenter = viewHeight * 0.55;

        // Distance from active center zone
        const distFromCenter = (rowCenter - screenCenter) / (viewHeight * 0.5);

        if (rowRect.top < viewHeight * 0.92 && rowRect.bottom > 0) {
          row.classList.add('visible');

          // Active focus highlight when near center
          if (Math.abs(distFromCenter) < 0.45) {
            row.classList.add('active');
          } else {
            row.classList.remove('active');
          }
        } else {
          row.classList.remove('visible');
          row.classList.remove('active');
        }
      });
    };

    window.addEventListener('scroll', handleTimelineScroll, { passive: true });
    window.addEventListener('resize', handleTimelineScroll, { passive: true });
    // Initial trigger
    setTimeout(handleTimelineScroll, 80);
  }

  // Initialize PC Interactive Canvas Particles
  initHeroParticles();

  // Initialize Rules Situational Quiz if element exists
  if (typeof initOrRenderRulesQuiz === 'function') {
    initOrRenderRulesQuiz();
  }
});

// ---- DISCORD LOGIN ----
function loginViaDiscord() {
  window.location.href = 'https://api.6767111.xyz/api/auth/discord?from=' + encodeURIComponent(window.location.href);
}

// ---- GET AUTH HEADERS ----
function getAuthHeaders() {
  const token = localStorage.getItem('auth_token');
  return token ? { 'Authorization': token } : {};
}

// ---- SMP+ MEMBERSHIP MANAGEMENT & CANCELLATION ----
let cachedSmpNick = '';

async function checkSmpPlusStatus() {
  const container = document.getElementById('smp-manage-content');
  if (!container) return;

  const token = localStorage.getItem('auth_token');

  // 1. Not logged in
  if (!token) {
    container.innerHTML = `
      <div class="smp-manage-unauth">
        <div class="smp-manage-status-strip">
          <span class="smp-status-pill smp-status-pill--neutral">
            <span class="smp-status-dot"></span>
            Vyžaduje ověření
          </span>
          <span class="smp-manage-secure-badge">
            <svg class="ui-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Discord OAuth2
          </span>
        </div>

        <p class="smp-manage-desc">Pro zrušení nebo kontrolu stavu předplatného se přihlas přes Discord účet propojený s tvým herním nickem.</p>
        
        <button type="button" onclick="loginViaDiscord()" class="btn-discord-login" style="width: 100%; justify-content: center;">
          <svg class="ui-icon-svg" style="width: 16px; height: 16px; vertical-align: -2px; margin-right: 6px;" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
          <span>Přihlásit se přes Discord</span>
        </button>

        <div class="smp-manage-guarantees">
          <div class="smp-guarantee-line">
            <svg class="ui-icon-svg" viewBox="0 0 24 24" fill="none" stroke="#21DE00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span>Zrušení na 1 kliknutí bez sankcí</span>
          </div>
          <div class="smp-guarantee-line">
            <svg class="ui-icon-svg" viewBox="0 0 24 24" fill="none" stroke="#21DE00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span>Výhody zůstávají aktivní do konce předplatného</span>
          </div>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="smp-manage-loading">
      <span class="btn-spinner"></span>
      <span>Ověřuji stav předplatného a propojení...</span>
    </div>
  `;

  try {
    const res = await apiFetch('https://api.6767111.xyz/api/smpplus/status', {
      headers: getAuthHeaders()
    }, 8000);

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('auth_token');
      container.innerHTML = `
        <div class="smp-manage-unauth">
          <p class="smp-manage-desc">Tvé přihlášení vypršelo. Přihlas se prosím znovu přes Discord.</p>
          <button type="button" onclick="loginViaDiscord()" class="btn-discord-login" style="width: 100%; justify-content: center;">
            <svg class="ui-icon-svg" style="width: 16px; height: 16px; vertical-align: -2px; margin-right: 6px;" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg> Přihlásit se přes Discord
          </button>
        </div>
      `;
      return;
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();

    // 2. Logged in, but account NOT linked via /dlink
    if (!data.linked) {
      container.innerHTML = `
        <div class="smp-manage-unlinked">
          <div style="display: flex; align-items: flex-start; gap: 12px;">
            <svg class="ui-icon-svg" style="width: 22px; height: 22px; color: #0a67e5; flex-shrink: 0; margin-top: 2px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <div>
              <strong style="color: #ffffff; display: block; margin-bottom: 4px;">Nemáš propojený Minecraft účet</strong>
              <p class="smp-manage-desc">Pro získání role na Discordu a správu předplatného SMP+ musíš mít propojený účet. Připoj se na server <strong>mychalsmp.xyz</strong> a napiš do chatu:</p>
            </div>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.3); padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06);">
            <code class="dlink-code-badge" onclick="copyDlinkCmd(this)" aria-label="Zkopírovat příkaz /dlink" style="display: inline-flex; align-items: center; gap: 6px; cursor: pointer;">
              <span>/dlink</span>
              <svg class="ui-icon-svg" style="width: 13px; height: 13px; color: #0a67e5;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </code>
            <button type="button" onclick="checkSmpPlusStatus()" class="btn-secondary" style="padding: 8px 14px; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 6px;">
              <svg class="ui-icon-svg" style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
              <span>Zkontrolovat</span>
            </button>
          </div>
        </div>
      `;
      return;
    }

    // 3. Logged in & linked via /dlink
    cachedSmpNick = data.mcNick;
    const nickInput = document.getElementById('mc-username');
    if (nickInput && !nickInput.value && data.mcNick) {
      nickInput.value = data.mcNick;
      if (typeof updatePreviewName === 'function') updatePreviewName(data.mcNick);
    }

    if (data.hasSmpPlus) {
      const tierKey = (data.tier || 'smp_plus').toLowerCase();
      let tierDisplayName = 'SMP+';
      if (tierKey === 'smp_ppp' || tierKey === 'smpppp' || tierKey === 'smp+++') {
        tierDisplayName = 'SMP+++';
      } else if (tierKey === 'smp_pp' || tierKey === 'smppp' || tierKey === 'smp++') {
        tierDisplayName = 'SMP++';
      }

      let expiryText = 'Aktivní předplatné';
      if (data.expiresAt) {
        const d = new Date(data.expiresAt);
        expiryText = `Platné do: ${d.toLocaleDateString('cs-CZ')} (${d.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })})`;
      }

      container.innerHTML = `
        <div class="smp-manage-status-box">
          <div class="smp-user-info-row">
            <div class="smp-user-profile">
              <img src="https://mc-heads.net/avatar/${escapeHtml(data.mcNick)}/32" alt="${escapeHtml(data.mcNick)}">
              <div>
                <span class="nick">${escapeHtml(data.mcNick)}</span>
                <span style="display: block; font-size: 0.8rem; color: #94a3b8;">${expiryText}</span>
              </div>
            </div>
            <span class="smp-badge-active"><svg class="ui-icon-svg" style="width: 14px; height: 14px; color: #0a67e5; vertical-align: -2px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg> ${escapeHtml(tierDisplayName)}</span>
          </div>
          <p class="smp-manage-desc">Tvé předplatné <strong>${escapeHtml(tierDisplayName)}</strong> je aktivní. Pokud si přeješ členství ukončit a odebrat výhody, můžeš ho níže zrušit.</p>
          <button type="button" class="btn-cancel-smpplus" onclick="confirmCancelSmpPlus('${escapeHtml(tierDisplayName)}')">
            <svg class="ui-icon-svg" style="width: 14px; height: 14px; vertical-align: -2px; margin-right: 6px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 14.14 14.14"/></svg> Zrušit ${escapeHtml(tierDisplayName)} členství
          </button>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="smp-manage-status-box">
          <div class="smp-user-info-row">
            <div class="smp-user-profile">
              <img src="https://mc-heads.net/avatar/${escapeHtml(data.mcNick)}/32" alt="${escapeHtml(data.mcNick)}">
              <span class="nick">${escapeHtml(data.mcNick)}</span>
            </div>
            <span class="smp-badge-inactive">Neaktivní</span>
          </div>
          <p class="smp-manage-desc">Propojený účet <strong>${escapeHtml(data.mcNick)}</strong> momentálně nemá aktivní SMP+ členství.</p>
        </div>
      `;
    }
  } catch (err) {
    console.warn('[CHECK SMP+ STATUS ERR]', err);
    container.innerHTML = `
      <div class="smp-manage-status-box" style="text-align: center; padding: 20px;">
        <p class="smp-manage-desc" style="color: #94a3b8; margin-bottom: 12px;">Herní server nebo API je momentálně nedostupné. Tvé členství ve hře stále běží.</p>
        <button type="button" onclick="checkSmpPlusStatus()" class="btn-secondary" style="padding: 8px 16px; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 6px;">
          ${UI_ICONS.refresh}
          <span>Zkusit znovu</span>
        </button>
      </div>
    `;
  }
}

function copyDlinkCmd(btn) {
  const el = btn || (typeof event !== 'undefined' && event ? event.currentTarget : null);
  copyTextToClipboard('/dlink').catch(() => {});
  triggerButtonFeedback(el, 'Zkopírováno');
}

function confirmCancelSmpPlus(tierDisplayName = 'SMP+') {
  const modal = document.getElementById('smp-cancel-modal');
  const desc = document.getElementById('smp-cancel-modal-desc');
  if (desc && cachedSmpNick) {
    desc.innerHTML = `Opravdu si přeješ zrušit ${escapeHtml(tierDisplayName)} členství pro hráče <strong>${escapeHtml(cachedSmpNick)}</strong>?<br><br>Okamžitě přijdeš o výhody ${escapeHtml(tierDisplayName)} ve hře i na Discordu a <strong>opakované strhávání plateb na Tebexu i PayPalu bude trvale zrušeno</strong>.`;
  }
  if (modal) transitionPanelVisibility(modal, true, 'flex');
}

function closeCancelModal() {
  const modal = document.getElementById('smp-cancel-modal');
  if (modal) transitionPanelVisibility(modal, false, 'flex');
}

async function executeCancelSmpPlus() {
  const btn = document.getElementById('btn-confirm-cancel-smpplus');
  const spinner = document.getElementById('cancel-btn-spinner');
  const manageContainer = document.getElementById('smp-manage-content');
  if (btn) btn.disabled = true;
  if (spinner) spinner.style.display = 'inline-block';

  try {
    const res = await apiFetch('https://api.6767111.xyz/api/smpplus/cancel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    }, 10000);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    closeCancelModal();

    if (data.success) {
      showInlineFeedback(manageContainer, data.message || 'Předplatné bylo zrušeno.', 'success');
      checkSmpPlusStatus();
    } else {
      showInlineFeedback(manageContainer, data.message || 'Chyba při rušení členství.', 'error');
    }
  } catch (err) {
    console.warn('[CANCEL SMP+ ERR]', err);
    closeCancelModal();
    showInlineFeedback(manageContainer, 'Server je dočasně nedostupný. Zkus to za chvíli.', 'error');
  } finally {
    if (btn) btn.disabled = false;
    if (spinner) spinner.style.display = 'none';
  }
}

// ---- CHECK MEDIA STATUS ----
function showMediaView(activeKey) {
  const statusBox = document.getElementById('media-status-box');
  const applyForm = document.getElementById('media-apply-form');
  const loginBox = document.getElementById('media-login-box');
  if (statusBox) transitionPanelVisibility(statusBox, activeKey === 'status', 'block');
  if (applyForm) transitionPanelVisibility(applyForm, activeKey === 'form', 'block');
  if (loginBox) transitionPanelVisibility(loginBox, activeKey === 'login', 'block');
}

async function checkMediaStatus() {
  const token = localStorage.getItem('auth_token');
  const statusBox = document.getElementById('media-status-box');
  const applyForm = document.getElementById('media-apply-form');
  const loginBox = document.getElementById('media-login-box');

  if (!statusBox || !applyForm || !loginBox) return;

  if (!token) {
    showMediaView('login');
    return;
  }

  showMediaView('status');
  statusBox.innerHTML = `
    <div class="media-status-loading-center">
      <div class="media-pending-spinner-wrap">
        <svg class="media-pending-svg" viewBox="0 0 88 88" width="88" height="88">
          <circle class="media-spinner-track" cx="44" cy="44" r="38" />
          <circle class="media-spinner-arc" cx="44" cy="44" r="38" />
        </svg>
        <div class="media-pending-icon-inner">
          <svg class="ui-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
      </div>
      <p style="text-align:center; color: var(--text-muted); font-size: 0.94rem;">Ověřuji stav žádosti...</p>
    </div>
  `;

  try {
    const res = await apiFetch('https://api.6767111.xyz/api/media/status', {
      headers: getAuthHeaders()
    }, 8000);

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('auth_token');
      showMediaView('login');
      return;
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    // If user has no request — show the form
    if (!data.success || !data.hasRequest) {
      showMediaView('form');
      if (data.mcNick) {
        const mcInput = document.getElementById('media-mc-nick');
        if (mcInput && !mcInput.value) {
          mcInput.value = data.mcNick;
          handleMediaNickInput(data.mcNick);
        }
      }
      return;
    }

    const status = data.status;
    const mcNick = data.mcNick;
    const youtubeUrl = data.youtubeUrl;
    const kickUrl = data.kickUrl;
    const tiktokUrl = data.tiktokUrl;
    const twitchUrl = data.twitchUrl;
    const reason = data.reason;
    const daysLeft = data.daysLeft || 0;

    if (status === 'pending') {
      statusBox.innerHTML = `
        <div class="media-status-card media-status--pending">
          <div class="media-pending-spinner-wrap">
            <svg class="media-pending-svg" viewBox="0 0 88 88" width="88" height="88">
              <circle class="media-spinner-track" cx="44" cy="44" r="38" />
              <circle class="media-spinner-arc" cx="44" cy="44" r="38" />
            </svg>
            <div class="media-pending-icon-inner">
              <svg class="ui-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
          </div>
          <h3>Žádost se posuzuje</h3>
          <p>Tvoje žádost o Media Rank byla odeslána a čeká na schválení administrátorem.</p>
          
          <div class="media-pending-details-card">
            <div class="media-pending-head-row">
              <div class="media-pending-user">
                <img src="https://mc-heads.net/avatar/${encodeURIComponent(mcNick || 'MHF_Steve')}/36" class="media-pending-avatar" alt="${escapeHtml(mcNick || 'Nick')}" onerror="this.src='https://mc-heads.net/avatar/MHF_Steve/36'">
                <div class="media-pending-user-info">
                  <span class="media-pending-user-label">Minecraft Účet</span>
                  <strong class="media-pending-nick">${escapeHtml(mcNick || 'Nezadáno')}</strong>
                </div>
              </div>
              <div class="media-pending-status-pill">
                <span class="media-pending-pulse-dot"></span>
                <span>Ve frontě</span>
              </div>
            </div>

            <div class="media-pending-socials-grid">
              <div class="media-social-spec-item ${youtubeUrl ? 'is-connected' : 'is-empty'}">
                <div class="media-social-spec-left">
                  <svg class="ui-icon-svg ui-icon-svg--sm" viewBox="0 0 24 24" fill="#ff0000">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span>YouTube</span>
                </div>
                <div class="media-social-spec-val">
                  ${youtubeUrl ? `<a href="${escapeHtml(youtubeUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(youtubeUrl)}</a>` : '<span class="text-muted">Nepřipojeno</span>'}
                </div>
              </div>

              <div class="media-social-spec-item ${kickUrl ? 'is-connected' : 'is-empty'}">
                <div class="media-social-spec-left">
                  <svg class="ui-icon-svg ui-icon-svg--sm" viewBox="0 0 24 24" fill="none" stroke="#53fc18" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                  </svg>
                  <span>Kick</span>
                </div>
                <div class="media-social-spec-val">
                  ${kickUrl ? `<a href="${escapeHtml(kickUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(kickUrl)}</a>` : '<span class="text-muted">Nepřipojeno</span>'}
                </div>
              </div>

              <div class="media-social-spec-item ${tiktokUrl ? 'is-connected' : 'is-empty'}">
                <div class="media-social-spec-left">
                  <svg class="ui-icon-svg ui-icon-svg--sm" viewBox="0 0 24 24" fill="#00f2fe">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.98v8.63c-.02 2.45-.99 4.88-2.73 6.6-1.74 1.72-4.18 2.69-6.63 2.73-2.45-.02-4.89-.99-6.62-2.73C.34 21.52-.63 19.09-.61 16.64c.02-2.45.99-4.88 2.73-6.61 1.73-1.73 4.17-2.7 6.62-2.73.54.01 1.09.07 1.62.19v4.12c-.39-.12-.8-.19-1.21-.19-1.35-.01-2.69.52-3.66 1.48-.96.97-1.49 2.31-1.48 3.66.01 1.35.54 2.69 1.5 3.65.97.96 2.31 1.48 3.66 1.48 1.35-.01 2.69-.53 3.65-1.49.97-.96 1.49-2.3 1.48-3.65V.02z"/>
                  </svg>
                  <span>TikTok</span>
                </div>
                <div class="media-social-spec-val">
                  ${tiktokUrl ? `<a href="${escapeHtml(tiktokUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(tiktokUrl)}</a>` : '<span class="text-muted">Nepřipojeno</span>'}
                </div>
              </div>

              <div class="media-social-spec-item ${twitchUrl ? 'is-connected' : 'is-empty'}">
                <div class="media-social-spec-left">
                  <svg class="ui-icon-svg ui-icon-svg--sm" viewBox="0 0 24 24" fill="#a970ff">
                    <path d="M2.149 0L.537 4.119v16.836h5.731V24h3.224l3.045-3.045h4.657l6.269-6.269V0H2.149zm19.164 13.612l-3.582 3.582H12l-3.045 3.045v-3.045H4.119V2.149h17.194v11.463zm-3.582-7.343v6.269h-2.149V6.269h2.149zm-5.731 0v6.269H9.851V6.269h2.149z"/>
                  </svg>
                  <span>Twitch</span>
                </div>
                <div class="media-social-spec-val">
                  ${twitchUrl ? `<a href="${escapeHtml(twitchUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(twitchUrl)}</a>` : '<span class="text-muted">Nepřipojeno</span>'}
                </div>
              </div>
            </div>

            <div class="media-pending-footer-note">
              <svg class="ui-icon-svg ui-icon-svg--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>Administrátoři prověřují žádosti obvykle do 24–48 hodin.</span>
            </div>
          </div>
        </div>
      `;
    } else if (status === 'approved') {
      statusBox.innerHTML = `
        <div class="media-status-card media-status--approved">
          <div class="media-status-center">
            <div class="status-approved-icon">
              <svg class="ui-icon-svg ui-icon-svg--lg ui-icon-svg--green" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>
          <h3>Žádost schválena</h3>
          <p>Tvoje žádost o Media Rank byla schválena. Rank je aktivní ve hře i na Discordu.</p>
          <div style="margin-top: 20px; padding: 15px; background: rgba(33, 222, 0, 0.06); border-left: 4px solid var(--green, #21DE00); border-radius: 8px; text-align: left;">
            <strong style="color: var(--green, #21DE00); display: block; margin-bottom: 8px;">UPOZORNĚNÍ:</strong>
            Pro udržení Media ranku uváděj v popiscích IP <strong>mychalsmp.xyz</strong> a používej hashtag <strong>#mychalsmp</strong>.
          </div>
        </div>
      `;
    } else if (status === 'rejected') {
      // If server returned daysLeft > 0, show rejected state with countdown; otherwise allow reapply (show form)
      if (daysLeft > 0) {
        statusBox.innerHTML = `
          <div class="media-status-card media-status--rejected">
            <div class="media-status-center">
              <div class="status-rejected-icon">
                <svg class="ui-icon-svg ui-icon-svg--lg ui-icon-svg--red" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </div>
            </div>
            <h3>Žádost zamítnuta</h3>
            <p>Tvoje žádost o Media Rank byla zamítnuta.</p>
            <div class="reject-reason"><strong>Důvod zamítnutí:</strong> ${escapeHtml(reason) || 'Neuveden'}</div>
            <div style="margin-top:12px; color: var(--text-muted);">Znovu můžeš požádat za <strong>${daysLeft} dní</strong>.</div>
          </div>
        `;
      } else {
        // allow reapply
        showMediaView('form');
        return;
      }
    } else if (status === 'removed') {
      // Admin odebrán rank - může znovu podat
      statusBox.innerHTML = `
        <div class="media-status-card media-status--rejected">
          <div class="media-status-center">
            <div class="status-rejected-icon" style="background: rgba(245,158,11,0.15); border-color: rgba(245,158,11,0.5); color: #f59e0b; font-size: 1.8rem;">
              <svg class="ui-icon-svg ui-icon-svg--lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
          </div>
          <h3 style="color: #f59e0b;">Media Rank odebrán</h3>
          <p>Tvůj Media rank byl odebrán administrátorem.</p>
          ${reason ? `<div class="reject-reason"><strong>Důvod:</strong> ${escapeHtml(reason)}</div>` : ''}
          <div style="margin-top:16px;">
            <button type="button" class="btn-primary" onclick="showMediaView('form')" style="padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 0.95rem;">
              <svg class="ui-icon-svg ui-icon-svg--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
              </svg>
              <span>Podat žádost znovu</span>
            </button>
          </div>
        </div>
      `;
    }
  } catch (err) {
    console.warn('[CHECK MEDIA STATUS ERR]', err);
    statusBox.innerHTML = `
      <div class="media-status-card" style="text-align: center;">
        <div class="status-icon" style="color: #f59e0b; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px;">
          <svg class="ui-icon-svg ui-icon-svg--md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <h3>Ověření je dočasně nedostupné</h3>
        <p style="color: #94a3b8; margin: 10px 0 18px 0;">Nepodařilo se navázat spojení s ověřovacím serverem. Zkus to za okamžik.</p>
        <button type="button" onclick="checkMediaStatus()" class="btn-primary" style="padding: 10px 20px;">
          <svg class="ui-icon-svg ui-icon-svg--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
          </svg>
          <span>Obnovit stav</span>
        </button>
      </div>
    `;
  }
}

function resetMediaForm() {
  const applyForm = document.getElementById('media-apply-form');
  if (applyForm) {
    showMediaView('form');
    applyForm.reset();
    handleMediaNickInput('');
  }
}

let mediaNickTimeout = null;
function handleMediaNickInput(val) {
  const nick = (val || '').trim();
  const avatarImg = document.getElementById('media-nick-avatar');
  const previewChatHead = document.getElementById('media-preview-chat-head');
  const previewChatNick = document.getElementById('media-preview-chat-nick');
  const greeting = document.getElementById('media-nick-greeting');

  if (previewChatNick) {
    previewChatNick.textContent = (nick && nick.length >= 2) ? nick : 'TvujNick';
  }

  if (mediaNickTimeout) clearTimeout(mediaNickTimeout);
  mediaNickTimeout = setTimeout(() => {
    if (nick.length >= 2 && /^[a-zA-Z0-9_]{2,16}$/.test(nick)) {
      const skinUrl48 = `https://mc-heads.net/avatar/${encodeURIComponent(nick)}/48`;
      const skinUrl28 = `https://mc-heads.net/avatar/${encodeURIComponent(nick)}/28`;
      if (avatarImg) avatarImg.src = skinUrl48;
      if (previewChatHead) previewChatHead.src = skinUrl28;
      if (greeting) {
        greeting.textContent = nick;
        greeting.style.opacity = '1';
      }
    } else {
      if (avatarImg) avatarImg.src = 'https://mc-heads.net/avatar/MHF_Steve/48';
      if (previewChatHead) previewChatHead.src = 'https://mc-heads.net/avatar/MHF_Steve/28';
      if (greeting) {
        greeting.textContent = '';
        greeting.style.opacity = '0';
      }
    }
  }, 250);
}

// Toggle between Media and Media+ prefix in the live preview
function toggleMediaPreviewRank(type) {
  const singleBtn = document.getElementById('media-prev-single-btn');
  const plusBtn = document.getElementById('media-prev-plus-btn');
  const badge = document.getElementById('media-preview-prefix-badge');
  const msg = document.getElementById('media-preview-chat-msg');

  let activeBtn = singleBtn;
  if (type === 'media_plus') {
    if (singleBtn) singleBtn.classList.remove('active');
    if (plusBtn) plusBtn.classList.add('active');
    activeBtn = plusBtn;
    if (badge) {
      badge.innerHTML = `<span class="media-prefix-cam">${UI_ICONS.video}</span><span class="smp-preview-plus">+</span>`;
    }
    if (msg) msg.textContent = 'Streamujeme projekt na mychalsmp.xyz #mychalsmp';
  } else {
    if (singleBtn) singleBtn.classList.add('active');
    if (plusBtn) plusBtn.classList.remove('active');
    activeBtn = singleBtn;
    if (badge) {
      badge.innerHTML = `<span class="media-prefix-cam">${UI_ICONS.video}</span>`;
    }
    if (msg) msg.textContent = 'Nové video z mychalsmp.xyz je online #mychalsmp';
  }

  updateMediaTogglePill(activeBtn);
}

function updateMediaTogglePill(targetBtn) {
  const container = document.querySelector('.media-preview-toggle-wrap');
  const pill = document.getElementById('media-toggle-pill');
  const btn = targetBtn || container?.querySelector('.media-preview-toggle-btn.active');
  if (!positionSegmentedPill(container, pill, btn)) return;
  if (window.__switcherLiquidGlass) window.__switcherLiquidGlass.syncContainer(container);
}

// ---- SUBMIT MEDIA APPLICATION ----
async function submitMediaApplication(event) {
  event.preventDefault();

  const applyForm = document.getElementById('media-apply-form');
  const mcNick = document.getElementById('media-mc-nick')?.value.trim();
  const yt = document.getElementById('media-yt').value.trim();
  const tt = document.getElementById('media-tt').value.trim();
  const twitch = document.getElementById('media-twitch').value.trim();
  const kick = document.getElementById('media-kick').value.trim();
  const ageConfirm = document.getElementById('media-age-confirm')?.checked;

  if (!mcNick) {
    showInlineFeedback(applyForm, 'Vyplň svůj Minecraft nick.', 'warning');
    return;
  }
  if (!yt && !tt && !twitch && !kick) {
    showInlineFeedback(applyForm, 'Vyplň alespoň jeden kanál k ověření.', 'warning');
    return;
  }
  if (!ageConfirm) {
    showInlineFeedback(applyForm, 'Potvrď, že je ti více než 13 let.', 'warning');
    return;
  }

  const termsConfirm = document.getElementById('media-terms-confirm')?.checked;
  if (!termsConfirm) {
    showInlineFeedback(applyForm, 'Potvrď souhlas s pravidly serveru a ochranou údajů.', 'warning');
    return;
  }

  const statusBox = document.getElementById('media-status-box');
  showMediaView('status');

  // Render step-by-step checking progress
  statusBox.innerHTML = `
    <div class="verification-progress-box">
      <div class="media-pending-spinner-wrap" style="width: 72px; height: 72px; margin-bottom: 16px;">
        <svg class="media-pending-svg" viewBox="0 0 88 88" width="72" height="72">
          <circle class="media-spinner-track" cx="44" cy="44" r="38" />
          <circle class="media-spinner-arc" cx="44" cy="44" r="38" />
        </svg>
        <div class="media-pending-icon-inner" style="width: 48px; height: 48px;">
          <svg class="ui-icon-svg ui-icon-svg--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
        </div>
      </div>
      <h3>Ověřování kanálů</h3>
      <p style="color: var(--text-muted); font-size: 0.92rem; margin-bottom: 20px;">Ověřuji zadané odkazy a načítám data...</p>
      
      <div class="verification-steps">
        <div id="step-connect" class="verification-step-item checking">
          <span class="step-icon-status"></span>
          <span>Navazování spojení se serverem...</span>
        </div>
        <div id="step-scrape" class="verification-step-item pending">
          <span class="step-icon-status"></span>
          <span>Kontrola zadaných odkazů...</span>
        </div>
        <div id="step-db" class="verification-step-item pending">
          <span class="step-icon-status"></span>
          <span>Odesílání k posouzení...</span>
        </div>
      </div>
    </div>
  `;

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  await sleep(600);
  const stepConnect = document.getElementById('step-connect');
  const stepScrape = document.getElementById('step-scrape');
  if (stepConnect) stepConnect.className = 'verification-step-item success';
  if (stepScrape) stepScrape.className = 'verification-step-item checking';

  await sleep(600);

  try {
    const res = await apiFetch('https://api.6767111.xyz/api/media/apply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({
        mcNick: mcNick,
        youtubeUrl: yt,
        tiktokUrl: tt,
        twitchUrl: twitch,
        kickUrl: kick,
        ageConfirm: ageConfirm
      })
    }, 15000);

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('auth_token');
      showMediaView('login');
      return;
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();

    if (data.success) {
      const sScrape = document.getElementById('step-scrape');
      const sDb = document.getElementById('step-db');
      if (sScrape) sScrape.className = 'verification-step-item success';
      if (sDb) sDb.className = 'verification-step-item checking';
      await sleep(500);
      if (sDb) sDb.className = 'verification-step-item success';
      await sleep(300);

      statusBox.innerHTML = `
        <div class="media-status-card media-status--approved">
          <div class="media-status-center">
            <div class="status-approved-icon">
              <svg class="ui-icon-svg ui-icon-svg--lg ui-icon-svg--green" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>
          <h3>Žádost odeslána</h3>
          <p>Kanály byly ověřeny. Žádost byla předána administrátorům ke schválení.</p>
          <button type="button" onclick="checkMediaStatus()" class="btn-primary" style="margin-top: 25px; width: 100%;">
            <span>Zobrazit stav žádosti</span>
          </button>
        </div>
      `;
    } else {
      const sScrape = document.getElementById('step-scrape');
      if (sScrape) sScrape.className = 'verification-step-item failed';
      await sleep(400);
      const checksDetails = (data.checks || []).map(check => {
        const countLabel = check.count === null ? 'neznámý' : escapeHtml(check.count);
        const ok = (check.count !== null && check.count >= check.required);
        const statusLabel = ok ? 'OK' : 'Nesplněno';
        const color = ok ? '#21DE00' : '#f51515';
        return `<div class="media-check-detail"><strong>${escapeHtml(check.platform)}:</strong> <span style="color:${color};">${countLabel} / ${escapeHtml(check.required)} — ${statusLabel}</span></div>`;
      }).join('');
      statusBox.innerHTML = `
        <div class="media-status-card media-status--rejected">
          <div class="media-status-center">
            <div class="status-rejected-icon">
              <svg class="ui-icon-svg ui-icon-svg--lg ui-icon-svg--red" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </div>
          </div>
          <h3>Ověření selhalo</h3>
          <p style="color: #f51515; font-weight: 600; margin-bottom: 12px;">${escapeHtml(data.error) || 'Nebyly splněny požadavky pro Media Rank.'}</p>
          <p style="color: var(--text-muted); font-size: 0.92rem;">Zkontroluj počet odběratelů nebo sledujících a správnost odkazů.</p>
          ${checksDetails ? `<div class="media-checks-list" style="margin-top: 14px; text-align:left;">${checksDetails}</div>` : ''}
          ${data && data.raw ? `<pre style="text-align:left; margin-top:10px; background:rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.06); padding:10px; border-radius:8px; overflow:auto; max-height:180px; font-size:0.8rem;">${escapeHtml(JSON.stringify(data.raw, null, 2))}</pre>` : ''}
          <button type="button" onclick="resetMediaForm()" class="btn-primary" style="margin-top: 25px; width: 100%;">
            <span>Zpět na formulář</span>
          </button>
        </div>
      `;
    }
  } catch (err) {
    console.warn('[APPLY MEDIA ERR]', err);
    const sScrape = document.getElementById('step-scrape');
    if (sScrape) sScrape.className = 'verification-step-item failed';
    await sleep(400);
    statusBox.innerHTML = `
      <div class="media-status-card" style="text-align: center;">
        <div class="status-icon" style="color: #f59e0b; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px;">
          <svg class="ui-icon-svg ui-icon-svg--md" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <h3>Chyba spojení</h3>
        <p style="color: #94a3b8; margin: 10px 0 18px 0;">Ověřovací server momentálně neodpovídá. Zkus žádost odeslat za chvíli.</p>
        <button type="button" onclick="resetMediaForm()" class="btn-primary" style="margin-top: 15px; width: 100%;">
          <span>Zpět na formulář</span>
        </button>
      </div>
    `;
  }
}

// ---- NAVIGATE FROM MEDIA TO SMP+ COMPARISON TABLE ----
function openSmpMediaComparison() {
  executeTabSwitch('smp-plus', true);
  setTimeout(() => {
    const compSection = document.getElementById('smp-comparison');
    if (compSection) {
      compSection.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
      const mediaCols = compSection.querySelectorAll('.col-media');
      mediaCols.forEach(col => {
        col.classList.remove('col-media-pulse');
        void col.offsetWidth;
        col.classList.add('col-media-pulse');
      });
    }
  }, 180);
}

// ---- PC INTERACTIVE PARTICLES (Disabled for clean, premium performance) ----
function initHeroParticles() {
  // Disabled to eliminate visual noise, save battery/CPU, and keep idle state calm (Rule 20).
}

// ---- CASCADE FALLING GAME ICONS (Disabled per Rule 20 & 50) ----
function spawnFallingIcons() {
  // Intentionally disabled.
}

function triggerEpicVipTransition(callback) {
  if (callback) callback();
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

let bugSelectedFiles = [];

function removeBugImage(index) {
  bugSelectedFiles.splice(index, 1);
  renderBugImagesPreview();
}

function renderBugImagesPreview() {
  const container = document.getElementById('bug-images-chips');
  if (!container) return;
  container.innerHTML = '';
  if (bugSelectedFiles.length === 0) return;

  bugSelectedFiles.forEach((file, idx) => {
    const chip = document.createElement('div');
    chip.className = 'bug-image-chip';
    const objectUrl = URL.createObjectURL(file);
    chip.innerHTML = `
      <img src="${objectUrl}" alt="Snímek" class="bug-chip-preview-img" width="28" height="28">
      <span title="${escapeHtml(file.name)}">${escapeHtml(file.name.length > 16 ? file.name.substring(0, 13) + '...' : file.name)}</span>
      <button type="button" class="bug-chip-remove-btn" onclick="removeBugImage(${idx})" aria-label="Odstranit snímek" title="Odstranit">${UI_ICONS.x}</button>
    `;
    container.appendChild(chip);
  });
}

function processBugImage(file) {
  return new Promise((resolve) => {
    const fallback = () => {
      const reader = new FileReader();
      reader.onload = (e) => resolve({ name: file.name, data: e.target.result });
      reader.onerror = () => resolve({ name: file.name, data: '' });
      reader.readAsDataURL(file);
    };

    if (!file.type || !file.type.startsWith('image/')) {
      fallback();
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Resize to max 1280px to stay well within Nginx limits while keeping crisp detail
          let maxDimension = 1280;
          let width = img.width;
          let height = img.height;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          let quality = 0.78;
          let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

          // If still larger than 350KB, compress further to prevent 413 Payload Too Large
          if (compressedDataUrl.length > 450000) {
            quality = 0.65;
            compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          }

          const extName = (file.name || 'screenshot').replace(/\.[^/.]+$/, '') + '.jpg';
          resolve({ name: extName, data: compressedDataUrl });
        } catch (canvasErr) {
          fallback();
        }
      };
      img.onerror = () => fallback();
      img.src = e.target.result;
    };
    reader.onerror = () => fallback();
    reader.readAsDataURL(file);
  });
}

function handleBugImagesChange(input) {
  if (!input.files || input.files.length === 0) return;
  const bugForm = document.getElementById('bug-report-form') || input;

  const newFiles = Array.from(input.files);
  for (const file of newFiles) {
    if (bugSelectedFiles.length >= 3) {
      showInlineFeedback(bugForm, 'Přiložit lze maximálně 3 snímky.', 'warning');
      break;
    }
    if (file.size > 20 * 1024 * 1024) {
      showInlineFeedback(bugForm, `Obrázek "${file.name}" překračuje limit 20 MB.`, 'warning');
      continue;
    }
    bugSelectedFiles.push(file);
  }

  input.value = '';
  renderBugImagesPreview();
}

// Paste support for screenshots on bug report
document.addEventListener('paste', (e) => {
  const activeTab = document.querySelector('.tab-section.active') || document.querySelector('.tab-content.active');
  const isBugTab = activeTab && (activeTab.id === 'tab-bugs' || activeTab.querySelector('#bug-report-form'));
  if (!isBugTab) return;

  const items = (e.clipboardData || e.originalEvent?.clipboardData)?.items;
  if (!items) return;
  const bugForm = document.getElementById('bug-report-form');

  let pastedAny = false;
  for (const item of items) {
    if (item.type && item.type.indexOf('image') !== -1) {
      const file = item.getAsFile();
      if (file) {
        if (bugSelectedFiles.length >= 3) {
          showInlineFeedback(bugForm, 'Přiložit lze maximálně 3 snímky.', 'warning');
          break;
        }
        bugSelectedFiles.push(file);
        pastedAny = true;
      }
    }
  }

  if (pastedAny) {
    renderBugImagesPreview();
  }
});

// ---- MODERN BUG & UNBAN REPORTING ----
let currentBugCategory = 'game';
let bugNickTimeout = null;
let bugCooldownInterval = null;

function updateBugCatPill(targetBtn) {
  const container = document.querySelector('.bug-category-chips');
  const pill = document.getElementById('bug-cat-pill');
  const btn = targetBtn || container?.querySelector('.bug-cat-chip.active');
  if (!container || !pill || !btn) return;
  container.classList.add('has-indicator');
  pill.classList.add('is-ready');
  pill.classList.toggle('is-unban', btn.classList.contains('chip-unban'));
  if (!positionSegmentedPill(container, pill, btn, { vertical: true, matchRadius: true })) return;
  if (window.__switcherLiquidGlass) window.__switcherLiquidGlass.syncContainer(container);
}

function selectBugCategory(cat) {
  currentBugCategory = cat;
  let activeBtn = null;
  document.querySelectorAll('.bug-cat-chip').forEach(btn => {
    const isMatch = btn.dataset.cat === cat;
    btn.classList.toggle('active', isMatch);
    if (isMatch) activeBtn = btn;
  });
  updateBugCatPill(activeBtn);

  const descLabel = document.getElementById('bug-desc-label');
  const descInput = document.getElementById('bug-desc');
  const submitText = document.getElementById('btn-bug-text');

  if (cat === 'unban') {
    if (descLabel) descLabel.innerHTML = '<span><svg class="ui-icon-svg ui-icon-svg--inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg> Proč žádáš o unban?</span>';
    if (descInput) descInput.placeholder = 'Vysvětli situaci, za co jsi dostal trest a proč žádáš o unban...';
    if (submitText) submitText.innerHTML = '<svg class="ui-icon-svg ui-icon-svg--inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> <span>Odeslat žádost o unban</span>';
  } else {
    if (descLabel) descLabel.innerHTML = '<span><svg class="ui-icon-svg ui-icon-svg--inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> Co se přesně stalo?</span>';
    if (submitText) submitText.innerHTML = '<svg class="ui-icon-svg ui-icon-svg--inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> <span>Odeslat nahlášení</span>';

    if (descInput) {
      if (cat === 'economy') {
        descInput.placeholder = 'Popiš chybu v ekonomice, /shopu, mincích nebo tržnici...';
      } else if (cat === 'web') {
        descInput.placeholder = 'Popiš problém s webem, Discord botem nebo propojením účtu...';
      } else {
        descInput.placeholder = 'Popiš, kde se chyba nachází, co jsi dělal a co se stalo...';
      }
    }
  }
}

function handleBugNickInput(val) {
  const nick = (val || '').trim();
  const avatarImg = document.getElementById('bug-nick-avatar');
  const greeting = document.getElementById('bug-nick-greeting');

  if (bugNickTimeout) clearTimeout(bugNickTimeout);
  bugNickTimeout = setTimeout(() => {
    if (nick.length >= 2 && /^[a-zA-Z0-9_]{2,16}$/.test(nick)) {
      if (avatarImg) {
        avatarImg.src = `https://mc-heads.net/avatar/${encodeURIComponent(nick)}/48`;
      }
      if (greeting) {
        greeting.textContent = nick;
        greeting.style.opacity = '1';
      }
    } else {
      if (avatarImg) {
        avatarImg.src = 'https://mc-heads.net/avatar/MHF_Steve/48';
      }
      if (greeting) {
        greeting.textContent = '';
        greeting.style.opacity = '0';
      }
    }
  }, 250);
}

function startBugCooldownTimer(seconds) {
  const submitBtn = document.getElementById('btn-bug-submit');
  const submitText = document.getElementById('btn-bug-text');
  if (!submitBtn) return;

  if (bugCooldownInterval) clearInterval(bugCooldownInterval);
  let remaining = seconds;
  submitBtn.disabled = true;

  if (submitText) submitText.textContent = `Další odeslání za ${remaining}s`;

  bugCooldownInterval = setInterval(() => {
    remaining--;
    if (remaining <= 0) {
      clearInterval(bugCooldownInterval);
      bugCooldownInterval = null;
      submitBtn.disabled = false;
      selectBugCategory(currentBugCategory);
    } else {
      if (submitText) submitText.textContent = `Další odeslání za ${remaining}s`;
    }
  }, 1000);
}

async function submitBugReport(e) {
  if (e && e.preventDefault) e.preventDefault();
  const bugForm = document.getElementById('bug-report-form');
  const nickInput = document.getElementById('bug-nick');
  const descInput = document.getElementById('bug-desc');
  const imagesInput = document.getElementById('bug-images');
  const submitBtn = document.getElementById('btn-bug-submit');
  const submitText = document.getElementById('btn-bug-text');

  if (!nickInput || !descInput || !submitBtn) return;

  if (bugCooldownInterval) {
    showInlineFeedback(bugForm || submitBtn, 'Počkej chvíli před odesláním dalšího hlášení.', 'warning');
    return;
  }

  const nick = nickInput.value.trim();
  let bug = descInput.value.trim();
  const isUnban = (currentBugCategory === 'unban');

  if (!nick || !bug) {
    showInlineFeedback(bugForm || submitBtn, 'Vyplň herní nick a popis.', 'warning');
    return;
  }

  if (nick.length < 2) {
    showInlineFeedback(bugForm || submitBtn, 'Zadej platný herní nick s alespoň 2 znaky.', 'error');
    nickInput.focus();
    return;
  }
  if (bug.length < 5) {
    showInlineFeedback(bugForm || submitBtn, isUnban ? 'Popiš žádost o unban podrobněji, alespoň 5 znaky.' : 'Popiš chybu podrobněji, alespoň 5 znaky.', 'error');
    descInput.focus();
    return;
  }

  const bugConsent = document.getElementById('bug-consent');
  if (bugConsent && !bugConsent.checked) {
    showInlineFeedback(bugForm || submitBtn, 'Potvrď souhlas před odesláním.', 'warning');
    bugConsent.focus();
    return;
  }

  // Prepend category tag if not unban
  if (!isUnban) {
    const catLabels = { game: 'HERNÍ BUG', economy: 'EKONOMIKA', web: 'WEB/DISCORD' };
    const tag = catLabels[currentBugCategory] || 'BUG';
    bug = `[${tag}] ${bug}`;
  }

  const filesToUpload = bugSelectedFiles.length > 0 ? bugSelectedFiles : (imagesInput && imagesInput.files ? Array.from(imagesInput.files) : []);
  const images = [];

  if (filesToUpload.length > 0) {
    if (filesToUpload.length > 3) {
      showInlineFeedback(bugForm || submitBtn, 'Přiložit lze maximálně 3 obrázky.', 'warning');
      return;
    }
    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      try {
        const processed = await processBugImage(file);
        if (processed && processed.data) {
          images.push(processed);
        }
      } catch (err) {
        console.warn('Error processing image:', err);
        showInlineFeedback(bugForm || submitBtn, `Nepodařilo se načíst obrázek "${file.name}".`, 'error');
        return;
      }
    }
  }

  submitBtn.disabled = true;
  if (submitText) submitText.innerHTML = isUnban ? '<span class="btn-spinner"></span> <span>Odesílám žádost...</span>' : '<span class="btn-spinner"></span> <span>Odesílám nahlášení...</span>';

  try {
    const endpoints = ['/api/report-bug', 'https://api.6767111.xyz/api/report-bug'];
    let data = null;
    let successRes = false;
    let resErrorMsg = null;
    let resRetryAfter = null;

    for (const ep of endpoints) {
      try {
        const res = await apiFetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nick, bug, images, isUnban })
        }, 12000);
        const json = await res.json().catch(() => null);

        if (res.ok && json && json.success) {
          data = json;
          successRes = true;
          break;
        }

        if (res.status === 413) {
          resErrorMsg = 'Obrázky jsou příliš velké. Nahraj menší snímek nebo méně souborů.';
          break;
        }

        if (json && json.error) {
          resErrorMsg = json.error;
        }
        if (json && json.retryAfter) {
          resRetryAfter = json.retryAfter;
          break;
        }
      } catch (e) {
        console.warn('Endpoint error:', ep, e);
      }
    }

    if (successRes && data && data.success) {
      const ticketNum = (isUnban ? '#UNBAN-' : '#BUG-') + Math.floor(1000 + Math.random() * 9000);

      // Populate confirmation ticket card
      const ticketIdEl = document.getElementById('ticket-id-display');
      const ticketUserAvatar = document.getElementById('ticket-user-avatar');
      const ticketUserName = document.getElementById('ticket-user-name');
      const ticketTitle = document.getElementById('ticket-success-title');

      if (ticketIdEl) ticketIdEl.textContent = ticketNum;
      if (ticketUserAvatar) ticketUserAvatar.src = `https://mc-heads.net/avatar/${encodeURIComponent(nick)}/48`;
      if (ticketUserName) ticketUserName.textContent = nick;
      if (ticketTitle) ticketTitle.textContent = isUnban ? 'Žádost o unban byla odeslána' : 'Nahlášení bylo odesláno';

      // Smooth switch to ticket confirmation
      const cardFront = document.getElementById('bug-card-front');
      const cardBack = document.getElementById('bug-card-back');
      if (cardFront) transitionPanelVisibility(cardFront, false, 'block');
      if (cardBack) {
        transitionPanelVisibility(cardBack, true, 'block');
        cardBack.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
      }

      startBugCooldownTimer(60);
    } else {
      const errMsg = resErrorMsg || (data && data.error) || 'Systém pro nahlášení je momentálně nedostupný. Zkus to za chvíli.';
      showInlineFeedback(bugForm || submitBtn, errMsg, 'error');
      if (resRetryAfter || (data && data.retryAfter)) {
        startBugCooldownTimer(resRetryAfter || data.retryAfter);
      }
    }
  } catch (err) {
    console.warn('Error submitting bug:', err);
    showInlineFeedback(bugForm || submitBtn, 'Spojení se serverem selhalo. Zkus to za chvíli.', 'error');
  } finally {
    if (!bugCooldownInterval) {
      submitBtn.disabled = false;
      selectBugCategory(currentBugCategory);
    }
  }
}

function resetBugCardState() {
  const cardFront = document.getElementById('bug-card-front');
  const cardBack = document.getElementById('bug-card-back');
  if (cardBack) transitionPanelVisibility(cardBack, false, 'block');
  if (cardFront) transitionPanelVisibility(cardFront, true, 'block');

  const descInput = document.getElementById('bug-desc');
  const imagesInput = document.getElementById('bug-images');
  if (descInput) descInput.value = '';
  if (imagesInput) imagesInput.value = '';
  bugSelectedFiles = [];
  renderBugImagesPreview();
  selectBugCategory('game');
  if (cardFront) cardFront.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
}

window.addEventListener('popstate', handleUrlRouting);

// ---- NÁPADY / WHITEBOARD TAB ----
let currentIdeasData = null;

async function loadIdeasTab() {
  const userBar = document.getElementById('ideas-user-bar');
  const surface = document.getElementById('whiteboard-surface');

  if (!surface) return;

  surface.innerHTML = '<div class="whiteboard-empty"><span class="btn-spinner"></span><p>Načítám nápady...</p></div>';

  try {
    const res = await napadyApiFetch('/api/napady/list', {
      headers: getAuthHeaders()
    }, 8000);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    currentIdeasData = data;

    // Purge stale token if backend did not authenticate the session
    if (!data.isLoggedIn && localStorage.getItem('auth_token')) {
      localStorage.removeItem('auth_token');
    }

    // Render User Header Bar
    if (userBar) {
      if (!data.isLoggedIn || !data.user) {
        userBar.className = 'ideas-user-bar ideas-user-bar-guest';
        userBar.innerHTML = `
          <div class="ideas-guest-hint">
            ${UI_ICONS.lock} Pro přidání nápadu se přihlas přes Discord:
          </div>
          <button type="button" class="btn btn-discord btn-sm" onclick="loginViaDiscord()">
            <span>Přihlásit přes Discord</span>
          </button>
        `;
      } else {
        const u = data.user;
        const canAdd = u.pendingCount < 10;
        userBar.className = 'ideas-user-bar';
        userBar.innerHTML = `
          <div class="ideas-user-info-compact" title="${Number(u.pendingCount) || 0}/10 neschválených nápadů">
            <img src="${escapeHtml(u.avatar) || 'https://cdn.discordapp.com/embed/avatars/0.png'}" class="ideas-user-avatar-sm" alt="${escapeHtml(u.username)}" width="28" height="28" onerror="this.onerror=null; this.src='https://cdn.discordapp.com/embed/avatars/0.png';" />
            <span class="ideas-user-name-sm">${escapeHtml(u.username)}</span>
            <span class="ideas-user-badge-sm">${UI_ICONS.star} ${escapeHtml(u.points)}</span>
            ${u.isMajitel ? `<span style="color:#f59e0b; display:inline-flex; align-items:center; margin-left:2px;" title="Majitel">${UI_ICONS.crown}</span>` : ''}
          </div>
          <div class="ideas-inline-input-wrapper">
            <input 
              type="text" 
              id="idea-inline-input" 
              class="ideas-inline-input" 
              placeholder="${canAdd ? 'Napiš svůj návrh nebo nápad...' : 'Máš 10 neschválených nápadů'}" 
              maxlength="800"
              enterkeyhint="send"
              autocomplete="off"
              ${!canAdd ? 'disabled' : ''}
              onkeydown="handleIdeaInlineKeydown(event)"
            />
            <button 
              type="button"
              id="btn-submit-inline-idea" 
              class="ideas-inline-send-btn" 
              onclick="submitInlineIdea()" 
              aria-label="Odeslat nápad"
              title="Odeslat nápad"
              ${!canAdd ? 'disabled' : ''}
            >
              ${UI_ICONS.send}
            </button>
          </div>
        `;
      }
      getIdeasFeedbackAnchor(userBar);
    }

    // Render Idea Cards on Whiteboard
    if (!data.ideas || data.ideas.length === 0) {
      surface.innerHTML = `
        <div class="whiteboard-empty">
          ${UI_ICONS.lightbulb}
          <p>Zatím tu nejsou žádné nápady. Přidej první návrh pro MYCHAL SMP.</p>
        </div>
      `;
      return;
    }

    const isMajitel = data.user && data.user.isMajitel;

    // Sort ideas: Best to Worst (highest score first, lower score sorts to the right)
    data.ideas.sort((a, b) => {
      const scoreA = a.score || 0;
      const scoreB = b.score || 0;
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

    surface.innerHTML = data.ideas.map(idea => renderIdeaCardHtml(idea, isMajitel)).join('');
    setupIdeasSilentInterval();

  } catch (err) {
    console.warn('Error loading ideas tab:', err);
    surface.innerHTML = `
      <div class="whiteboard-empty">
        <span style="opacity: 0.4;">${UI_ICONS.lightbulb}</span>
        <p style="color: #94a3b8; margin: 8px 0 14px 0;">Nástěnka nápadů je dočasně nedostupná.</p>
        <button type="button" class="btn btn-secondary btn-sm" onclick="loadIdeasTab()">
          ${UI_ICONS.refresh} Zkusit znovu
        </button>
      </div>
    `;
  }
}

function renderIdeaCardHtml(idea, isMajitel) {
  const createdDate = new Date(idea.created_at).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric' });
  const hasAi = !!idea.ai_text;
  const authorPoints = idea.author_points || 0;
  const userVote = idea.user_vote || 0;
  const score = idea.score || 0;

  const scoreFormatted = score > 0 ? `+${score}` : score;
  const scoreClass = score > 0 ? 'score-positive' : (score < 0 ? 'score-negative' : '');

  return `
    <div class="idea-card" id="idea-card-${Number(idea.id) || 0}" style="--card-rotation: ${Number(idea.rotation) || 0}deg;">
      <div class="idea-card-pin">${UI_ICONS.pin}</div>
      <div class="idea-card-header">
        <img src="${escapeHtml(idea.author_avatar) || 'https://cdn.discordapp.com/embed/avatars/0.png'}" class="idea-card-avatar" alt="${escapeHtml(idea.author_name)}" width="28" height="28" onerror="this.onerror=null; this.src='https://cdn.discordapp.com/embed/avatars/0.png';" />
        <span class="idea-card-author">
          ${escapeHtml(idea.author_name)}
          <span class="idea-author-stars" title="Autor má ${authorPoints} hvězdiček">
            ${UI_ICONS.star} ${authorPoints}
          </span>
        </span>
        <span class="idea-card-time">${createdDate}</span>
      </div>
      <div class="idea-card-body">
        ${hasAi ? `
          <div class="idea-card-top-bar">
            <div class="idea-mode-indicator idea-mode-user">
              ${UI_ICONS.user} <span class="idea-mode-label">Návrh hráče</span>
            </div>
            <button type="button" class="idea-mode-switch-btn btn-is-ai" onclick="toggleIdeaView(${idea.id}, event)" title="Přepnout na AI rozpracování">
              ${UI_ICONS.sparkles} AI
            </button>
          </div>
          <div class="idea-text-content idea-text-original">${escapeHtml(idea.original_text)}</div>
          <div class="idea-text-content idea-text-ai" style="display:none;">${escapeHtml(idea.ai_text)}</div>
        ` : `
          <div class="idea-text-content">${escapeHtml(idea.original_text)}</div>
        `}
      </div>
      <div class="idea-card-footer">
        <div class="idea-vote-box" id="idea-vote-box-${idea.id}">
          <button 
            type="button"
            class="idea-vote-btn idea-vote-up ${userVote === 1 ? 'voted-up' : ''}" 
            onclick="voteIdea(${idea.id}, 'up', event)" 
            aria-label="Hlasovat pro nápad"
            title="Podpořit nápad"
          >
            ${UI_ICONS.thumbsUp}
          </button>
          <span class="idea-vote-score ${scoreClass}" id="idea-score-${idea.id}">${scoreFormatted}</span>
          <button 
            type="button"
            class="idea-vote-btn idea-vote-down ${userVote === -1 ? 'voted-down' : ''}" 
            onclick="voteIdea(${idea.id}, 'down', event)" 
            aria-label="Hlasovat proti nápadu"
            title="Nesouhlasit s nápadem"
          >
            ${UI_ICONS.thumbsDown}
          </button>
        </div>
        ${isMajitel ? `
          <div class="idea-card-actions">
            <button type="button" class="idea-btn-action idea-btn-ai" onclick="aiProcessIdea(${idea.id})" aria-label="Zpracovat pomocí AI" title="Zpracovat pomocí AI">${UI_ICONS.sparkles}</button>
            <button type="button" class="idea-btn-action idea-btn-approve" onclick="approveIdea(${idea.id})" aria-label="Schválit nápad" title="Schválit nápad">${UI_ICONS.check}</button>
            <button type="button" class="idea-btn-action idea-btn-reject" onclick="rejectIdea(${idea.id})" aria-label="Zamítnout nápad" title="Zamítnout nápad">${UI_ICONS.x}</button>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

let ideasSilentInterval = null;

function setupIdeasSilentInterval() {
  if (ideasSilentInterval) clearInterval(ideasSilentInterval);
  ideasSilentInterval = setInterval(() => {
    if ((currentActiveTab === 'napady' || currentActiveTab === 'ideas') && document.visibilityState === 'visible') {
      silentUpdateIdeas();
    }
  }, 10000);
}

async function silentUpdateIdeas() {
  try {
    const res = await apiFetch('https://api.6767111.xyz/api/napady/list', {
      headers: getAuthHeaders()
    }, 6000);
    if (!res.ok) return;
    const data = await res.json();
    if (!data.success || !data.ideas) return;

    const surface = document.getElementById('whiteboard-surface');
    if (!surface) return;

    const isMajitel = data.user && data.user.isMajitel;
    const ideaMap = new Map();
    data.ideas.forEach(i => ideaMap.set(i.id, i));

    // Remove deleted cards
    const currentCardElements = surface.querySelectorAll('.idea-card');
    currentCardElements.forEach(cardEl => {
      const id = parseInt(cardEl.id.replace('idea-card-', ''), 10);
      if (!ideaMap.has(id)) {
        cardEl.remove();
      }
    });

    // Update existing cards or prepend new ones silently
    data.ideas.forEach(idea => {
      let cardEl = document.getElementById(`idea-card-${idea.id}`);
      if (cardEl) {
        updateCardVoteState(idea.id, idea.score, idea.user_vote);
        const starsSpan = cardEl.querySelector('.idea-author-stars');
        if (starsSpan) {
          starsSpan.innerHTML = `${UI_ICONS.star} ${idea.author_points || 0}`;
        }
        if (idea.ai_text && !cardEl.querySelector('.idea-card-top-bar')) {
          const bodyEl = cardEl.querySelector('.idea-card-body');
          if (bodyEl) {
            bodyEl.innerHTML = `
              <div class="idea-card-top-bar">
                <div class="idea-mode-indicator idea-mode-user">
                  ${UI_ICONS.user} <span class="idea-mode-label">Návrh hráče</span>
                </div>
                <button type="button" class="idea-mode-switch-btn btn-is-ai" onclick="toggleIdeaView(${idea.id}, event)" title="Přepnout na AI rozpracování">
                  ${UI_ICONS.sparkles} AI
                </button>
              </div>
              <div class="idea-text-content idea-text-original">${escapeHtml(idea.original_text)}</div>
              <div class="idea-text-content idea-text-ai" style="display:none;">${escapeHtml(idea.ai_text)}</div>
            `;
          }
        }
      } else {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = renderIdeaCardHtml(idea, isMajitel);
        if (tempDiv.firstElementChild) {
          surface.insertBefore(tempDiv.firstElementChild, surface.firstChild);
        }
      }
    });

    const emptyDiv = surface.querySelector('.whiteboard-empty');
    if (emptyDiv && data.ideas.length > 0) {
      emptyDiv.remove();
    }
  } catch (e) {
    // Silent catch
  }
}

function getIdeasFeedbackAnchor(fallbackEl = null) {
  const userBar = document.getElementById('ideas-user-bar');
  if (!userBar || !userBar.parentElement) return fallbackEl;

  let host = document.getElementById('ideas-feedback-host');
  if (!host) {
    host = document.createElement('div');
    host.id = 'ideas-feedback-host';
    host.className = 'ideas-feedback-host';
    const slot = document.createElement('div');
    slot.id = 'ideas-feedback-slot';
    slot.hidden = true;
    host.appendChild(slot);
    userBar.insertAdjacentElement('afterend', host);
  } else if (host.previousElementSibling !== userBar) {
    userBar.insertAdjacentElement('afterend', host);
  }

  return document.getElementById('ideas-feedback-slot') || fallbackEl || userBar;
}

async function napadyApiFetch(endpointPath, options = {}, timeoutMs = 8000) {
  const primaryUrl = `https://api.6767111.xyz${endpointPath}`;
  try {
    return await apiFetch(primaryUrl, options, timeoutMs);
  } catch (primaryErr) {
    const canSameOriginFallback =
      typeof window !== 'undefined' &&
      window.location &&
      /(^|\.)mychalsmp\.xyz$/i.test(window.location.hostname);
    if (!canSameOriginFallback) {
      throw primaryErr;
    }
    return await apiFetch(`${window.location.origin}${endpointPath}`, options, timeoutMs);
  }
}

async function parseJsonSafe(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function handleNapadyAuthExpired(feedbackEl) {
  localStorage.removeItem('auth_token');
  showInlineFeedback(
    feedbackEl,
    'Platnost přihlášení vypršela. Přihlas se prosím znovu přes Discord.',
    'warning'
  );
  loadIdeasTab();
}

async function voteIdea(ideaId, type, event) {
  if (event) event.stopPropagation();
  const box = document.getElementById(`idea-vote-box-${ideaId}`);

  if (!currentIdeasData || !currentIdeasData.isLoggedIn) {
    showInlineFeedback(getIdeasFeedbackAnchor(box), 'Pro hlasování o nápadech se přihlas přes Discord.', 'warning');
    return;
  }

  if (box) box.classList.add('voting-busy');

  try {
    const res = await napadyApiFetch(`/api/napady/vote/${ideaId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ type })
    }, 8000);

    const data = await parseJsonSafe(res);
    if (res.status === 401) {
      handleNapadyAuthExpired(getIdeasFeedbackAnchor(box));
      return;
    }
    if (!res.ok) {
      showToast((data && data.message) || 'Chyba při hlasování.');
      return;
    }

    if (data && data.success) {
      updateCardVoteState(ideaId, data.score, data.userVote);
    } else {
      showToast((data && data.message) || 'Chyba při hlasování.');
    }
  } catch (e) {
    console.warn('Error voting on idea:', e);
    showToast('Spojení se serverem je dočasně nedostupné.');
  } finally {
    if (box) box.classList.remove('voting-busy');
  }
}

function updateCardVoteState(ideaId, score, userVote) {
  const box = document.getElementById(`idea-vote-box-${ideaId}`);
  if (!box) return;

  const upBtn = box.querySelector('.idea-vote-up');
  const downBtn = box.querySelector('.idea-vote-down');
  const scoreSpan = document.getElementById(`idea-score-${ideaId}`);

  if (upBtn) {
    if (userVote === 1) upBtn.classList.add('voted-up');
    else upBtn.classList.remove('voted-up');
  }
  if (downBtn) {
    if (userVote === -1) downBtn.classList.add('voted-down');
    else downBtn.classList.remove('voted-down');
  }
  if (scoreSpan) {
    scoreSpan.textContent = score > 0 ? `+${score}` : score;
    scoreSpan.className = 'idea-vote-score ' + (score > 0 ? 'score-positive' : (score < 0 ? 'score-negative' : ''));
  }

  // Re-sort cards dynamically from best to worst after vote update
  sortAndReorderIdeasDOM();
}

function sortAndReorderIdeasDOM() {
  const surface = document.getElementById('whiteboard-surface');
  if (!surface) return;
  const cards = Array.from(surface.querySelectorAll('.idea-card'));
  if (cards.length <= 1) return;

  cards.sort((a, b) => {
    const scoreSpanA = a.querySelector('.idea-vote-score');
    const scoreSpanB = b.querySelector('.idea-vote-score');
    const scoreA = scoreSpanA ? parseInt(scoreSpanA.textContent.replace('+', ''), 10) || 0 : 0;
    const scoreB = scoreSpanB ? parseInt(scoreSpanB.textContent.replace('+', ''), 10) || 0 : 0;
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }
    const idA = parseInt(a.id.replace('idea-card-', ''), 10) || 0;
    const idB = parseInt(b.id.replace('idea-card-', ''), 10) || 0;
    return idB - idA;
  });

  cards.forEach(card => surface.appendChild(card));
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function openIdeaModal() {
  const modal = document.getElementById('idea-modal');
  const textarea = document.getElementById('idea-input-text');
  if (textarea) textarea.value = '';
  updateIdeaCharCount();
  if (modal) modal.classList.add('active');
}

function closeIdeaModal() {
  const modal = document.getElementById('idea-modal');
  if (modal) modal.classList.remove('active');
}

function updateIdeaCharCount() {
  const textarea = document.getElementById('idea-input-text');
  const counter = document.getElementById('idea-char-count');
  if (textarea && counter) {
    counter.textContent = textarea.value.length;
  }
}

function handleIdeaInlineKeydown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    submitInlineIdea();
  }
}

async function submitInlineIdea() {
  const input = document.getElementById('idea-inline-input');
  const btn = document.getElementById('btn-submit-inline-idea');
  const userBar = document.getElementById('ideas-user-bar');
  const feedbackAnchor = getIdeasFeedbackAnchor(userBar || input);
  const text = input ? input.value.trim() : '';

  if (text.length < 5) {
    showInlineFeedback(feedbackAnchor, 'Napiš podrobnější nápad, alespoň 5 znaků.', 'warning');
    return;
  }

  if (btn) btn.disabled = true;

  try {
    const res = await napadyApiFetch('/api/napady/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ text })
    }, 10000);

    const data = await parseJsonSafe(res);
    if (res.status === 401) {
      handleNapadyAuthExpired(getIdeasFeedbackAnchor(userBar || input));
      return;
    }
    if (!res.ok) {
      showInlineFeedback(feedbackAnchor, (data && data.message) || 'Chyba při přidávání nápadu.', 'error');
      return;
    }

    if (data && data.success) {
      showInlineFeedback(feedbackAnchor, data.message || 'Nápad byl odeslán.', 'success');
      if (input) input.value = '';
      loadIdeasTab();
    } else {
      showInlineFeedback(feedbackAnchor, (data && data.message) || 'Chyba při přidávání nápadu.', 'error');
    }
  } catch (e) {
    console.warn('Error submitting inline idea:', e);
    showInlineFeedback(feedbackAnchor, 'Server je dočasně nedostupný. Zkus to za okamžik.', 'error');
  } finally {
    if (btn && btn.isConnected) btn.disabled = false;
  }
}

async function submitNewIdea() {
  const textarea = document.getElementById('idea-input-text');
  const text = textarea ? textarea.value.trim() : '';

  if (text.length < 5) {
    showInlineFeedback(textarea, 'Napiš podrobnější nápad, alespoň 5 znaků.', 'warning');
    return;
  }

  try {
    const res = await napadyApiFetch('/api/napady/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ text })
    }, 10000);

    const data = await parseJsonSafe(res);
    if (res.status === 401) {
      closeIdeaModal();
      handleNapadyAuthExpired(getIdeasFeedbackAnchor());
      return;
    }
    if (!res.ok) {
      showInlineFeedback(textarea, (data && data.message) || 'Chyba při přidávání nápadu.', 'error');
      return;
    }

    if (data && data.success) {
      closeIdeaModal();
      showToast(data.message || 'Nápad byl odeslán.');
      loadIdeasTab();
    } else {
      showInlineFeedback(textarea, (data && data.message) || 'Chyba při přidávání nápadu.', 'error');
    }
  } catch (e) {
    console.warn('Error submitting modal idea:', e);
    showInlineFeedback(textarea, 'Server je dočasně nedostupný. Zkus to za okamžik.', 'error');
  }
}

async function aiProcessIdea(id) {
  const card = document.getElementById(`idea-card-${id}`);
  const btn = card ? card.querySelector('.idea-btn-ai') : null;
  if (btn) btn.innerHTML = '<span class="btn-spinner"></span>';

  try {
    const res = await apiFetch(`https://api.6767111.xyz/api/napady/ai-process/${id}`, {
      method: 'POST',
      headers: getAuthHeaders()
    }, 10000);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    if (data.success) {
      showToast('Nápad byl zpracován a odeslán do Discordu.');
      loadIdeasTab();
    } else {
      showToast(data.message || 'Chyba při zpracování nápadu.');
      if (btn) btn.innerHTML = UI_ICONS.question;
    }
  } catch (e) {
    console.warn('Error AI processing idea:', e);
    showToast('Server je dočasně nedostupný.');
    if (btn) btn.innerHTML = UI_ICONS.question;
  }
}

let pendingApproveIdeaId = null;

function approveIdea(id) {
  pendingApproveIdeaId = id;
  const modal = document.getElementById('idea-approve-modal');
  const textarea = document.getElementById('idea-approve-reason');
  if (textarea) {
    textarea.value = '';
    setTimeout(() => textarea.focus(), 50);
  }
  if (modal) {
    modal.classList.add('active');
  } else {
    const note = prompt('Napiš krátce, co bylo implementováno:');
    if (note === null) return;
    executeApproveIdea(id, note.trim());
  }
}

function closeApproveIdeaModal() {
  pendingApproveIdeaId = null;
  const modal = document.getElementById('idea-approve-modal');
  if (modal) modal.classList.remove('active');
}

async function confirmApproveIdea() {
  if (!pendingApproveIdeaId) return;
  const textarea = document.getElementById('idea-approve-reason');
  const note = textarea ? textarea.value.trim() : '';
  const ideaId = pendingApproveIdeaId;
  closeApproveIdeaModal();
  await executeApproveIdea(ideaId, note);
}

async function executeApproveIdea(id, note) {
  const btn = document.getElementById('btn-confirm-approve-idea');
  if (btn) btn.disabled = true;

  try {
    const res = await apiFetch(`https://api.6767111.xyz/api/napady/approve/${id}`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ note })
    }, 15000);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    if (data.success) {
      showToast('Nápad byl schválen, autor získal bod a oznámení se odeslalo na Discord.');
      loadIdeasTab();
    } else {
      showToast(data.message || 'Chyba při schvalování nápadu.');
    }
  } catch (e) {
    console.warn('Error approving idea:', e);
    showToast('Server je dočasně nedostupný.');
  } finally {
    if (btn) btn.disabled = false;
  }
}

let pendingRejectIdeaId = null;

function rejectIdea(id) {
  pendingRejectIdeaId = id;
  const modal = document.getElementById('idea-reject-modal');
  const textarea = document.getElementById('idea-reject-reason');
  if (textarea) {
    textarea.value = '';
    setTimeout(() => textarea.focus(), 50);
  }
  if (modal) {
    modal.classList.add('active');
  } else {
    const reason = prompt('Zadej důvod zamítnutí nápadu:');
    if (reason === null) return;
    if (!reason.trim()) {
      showToast('Musíš uvést důvod zamítnutí.');
      return;
    }
    executeRejectIdea(id, reason.trim());
  }
}

function closeRejectIdeaModal() {
  pendingRejectIdeaId = null;
  const modal = document.getElementById('idea-reject-modal');
  if (modal) modal.classList.remove('active');
}

async function confirmRejectIdea() {
  if (!pendingRejectIdeaId) return;
  const textarea = document.getElementById('idea-reject-reason');
  const reason = textarea ? textarea.value.trim() : '';
  if (!reason) {
    showInlineFeedback(textarea, 'Musíš uvést důvod zamítnutí.', 'warning');
    if (textarea) textarea.focus();
    return;
  }
  const ideaId = pendingRejectIdeaId;
  closeRejectIdeaModal();
  await executeRejectIdea(ideaId, reason);
}

async function executeRejectIdea(id, reason) {
  const btn = document.getElementById('btn-confirm-reject-idea');
  if (btn) btn.disabled = true;

  try {
    const res = await apiFetch(`https://api.6767111.xyz/api/napady/reject/${id}`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reason })
    }, 15000);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    if (data.success) {
      showToast(data.dmSent ? 'Nápad byl zamítnut a odeslán do #nápady i autorovi do DM.' : 'Nápad byl zamítnut a odeslán do #nápady.');
      loadIdeasTab();
    } else {
      showToast(data.message || 'Chyba při zamítání nápadu.');
    }
  } catch (e) {
    console.warn('Error rejecting idea:', e);
    showToast('Server je dočasně nedostupný.');
  } finally {
    if (btn) btn.disabled = false;
  }
}

function toggleIdeaView(ideaId, event) {
  if (event) event.stopPropagation();
  const card = document.getElementById(`idea-card-${ideaId}`);
  if (!card) return;

  const originalText = card.querySelector('.idea-text-original');
  const aiText = card.querySelector('.idea-text-ai');
  const indicator = card.querySelector('.idea-mode-indicator');
  const switchBtn = card.querySelector('.idea-mode-switch-btn');

  if (originalText && aiText) {
    const isShowingOriginal = originalText.style.display !== 'none';

    if (isShowingOriginal) {
      // Switch to AI mode
      originalText.style.display = 'none';
      transitionPanelVisibility(aiText, true, 'block');
      if (indicator) {
        indicator.className = 'idea-mode-indicator idea-mode-ai';
        indicator.innerHTML = `${UI_ICONS.sparkles} <span class="idea-mode-label">AI rozpracováno</span>`;
      }
      if (switchBtn) {
        switchBtn.className = 'idea-mode-switch-btn btn-is-user';
        switchBtn.innerHTML = `${UI_ICONS.user} Hráč`;
        switchBtn.title = 'Přepnout na původní znění';
      }
    } else {
      // Switch to Original Player mode
      aiText.style.display = 'none';
      transitionPanelVisibility(originalText, true, 'block');
      if (indicator) {
        indicator.className = 'idea-mode-indicator idea-mode-user';
        indicator.innerHTML = `${UI_ICONS.user} <span class="idea-mode-label">Návrh hráče</span>`;
      }
      if (switchBtn) {
        switchBtn.className = 'idea-mode-switch-btn btn-is-ai';
        switchBtn.innerHTML = `${UI_ICONS.sparkles} AI`;
        switchBtn.title = 'Přepnout na AI rozpracování';
      }
    }
  }
}

// ---- GLOBAL MOUSE TRACKER DISABLED (Rules 86, 107: Zero cursor cones or redundant mousemove listeners) ----

// ==========================================================================
// INTERACTIVE STATISTIKY (STATS) TAB & LINE CHART MODULE
// ==========================================================================
let currentStatsMetric = 'players';
let currentStatsTimeframe = '1d';
let isStatsModuleInitialized = false;

const statsData = {
  players: {
    title: 'Počet hráčů online',
    unit: 'hráčů',
    color: '#0a67e5',
    glowColor: 'rgba(10, 103, 229, 0.45)',
    '1h': { labels: ['50m', '40m', '30m', '20m', '10m', 'Nyní'], values: [0, 0, 0, 0, 0, 0], curVal: '0 hráčů online' },
    '1d': { labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'Nyní'], values: [0, 0, 0, 0, 0, 0, 0], curVal: '0 hráčů online' },
    '1w': { labels: ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'], values: [0, 0, 0, 0, 0, 0, 0], curVal: '0 hráčů' },
    '1m': { labels: ['Týden 1', 'Týden 2', 'Týden 3', 'Týden 4'], values: [0, 0, 0, 0], curVal: '0 hráčů' }
  },
  playtime: {
    title: 'Celkový nahraný čas',
    unit: 'hodin',
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    '1h': { labels: ['50m', '40m', '30m', '20m', '10m', 'Nyní'], values: [0, 0, 0, 0, 0, 0], curVal: '0 nahraných hodin' },
    '1d': { labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'Nyní'], values: [0, 0, 0, 0, 0, 0, 0], curVal: '0 celkových hodin' },
    '1w': { labels: ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'], values: [0, 0, 0, 0, 0, 0, 0], curVal: '0 hodin tento týden' },
    '1m': { labels: ['Týden 1', 'Týden 2', 'Týden 3', 'Týden 4'], values: [0, 0, 0, 0], curVal: '0 celkem za měsíc' }
  },
  money: {
    title: 'Celkem peněz v ekonomice',
    unit: '$',
    color: '#21DE00',
    glowColor: 'rgba(33, 222, 0, 0.45)',
    '1h': { labels: ['50m', '40m', '30m', '20m', '10m', 'Nyní'], values: [0, 0, 0, 0, 0, 0], curVal: '$0 celkem' },
    '1d': { labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'Nyní'], values: [0, 0, 0, 0, 0, 0, 0], curVal: '$0 v oběhu' },
    '1w': { labels: ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'], values: [0, 0, 0, 0, 0, 0, 0], curVal: '$0 tento týden' },
    '1m': { labels: ['Týden 1', 'Týden 2', 'Týden 3', 'Týden 4'], values: [0, 0, 0, 0], curVal: '$0 celkově' }
  },
  visitors: {
    title: 'Unikátní hráči',
    unit: 'hráčů',
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.45)',
    '1h': { labels: ['50m', '40m', '30m', '20m', '10m', 'Nyní'], values: [0, 0, 0, 0, 0, 0], curVal: '0 unikátních hráčů' },
    '1d': { labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'Nyní'], values: [0, 0, 0, 0, 0, 0, 0], curVal: '0 nových za 24h' },
    '1w': { labels: ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'], values: [0, 0, 0, 0, 0, 0, 0], curVal: '0 nových za 7d' },
    '1m': { labels: ['Týden 1', 'Týden 2', 'Týden 3', 'Týden 4'], values: [0, 0, 0, 0], curVal: '0 nových za 30d' }
  },
  deaths: {
    title: 'Počet úmrtí na serveru',
    unit: 'úmrtí',
    color: '#f51515',
    glowColor: 'rgba(245, 21, 21, 0.45)',
    '1h': { labels: ['50m', '40m', '30m', '20m', '10m', 'Nyní'], values: [0, 0, 0, 0, 0, 0], curVal: '0 celkových úmrtí' },
    '1d': { labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'Nyní'], values: [0, 0, 0, 0, 0, 0, 0], curVal: '0 úmrtí dnes' },
    '1w': { labels: ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'], values: [0, 0, 0, 0, 0, 0, 0], curVal: '0 úmrtí tento týden' },
    '1m': { labels: ['Týden 1', 'Týden 2', 'Týden 3', 'Týden 4'], values: [0, 0, 0, 0], curVal: '0 celkem za měsíc' }
  }
};

function updateStatsMetricPill(targetBtn) {
  const container = document.querySelector('.stats-metric-selector');
  const pill = document.getElementById('stats-metric-pill');
  const btn = targetBtn || container?.querySelector('.stats-metric-btn.active') || document.getElementById('metric-btn-' + currentStatsMetric);
  if (!container || !pill || !btn) return;
  container.classList.add('has-indicator');
  pill.classList.add('is-ready');
  pill.dataset.metric = (btn.id || '').replace('metric-btn-', '') || currentStatsMetric || 'players';
  if (!positionSegmentedPill(container, pill, btn, { vertical: true, matchRadius: true })) return;
  if (window.__switcherLiquidGlass) window.__switcherLiquidGlass.syncContainer(container);
}

function initStatsModule() {
  renderStatsChart();
  fetchLiveServerStats();
  fetchOnlinePlayers();
  initMycoWayStream();
  updateStatsMetricPill();
  if (!isStatsModuleInitialized) {
    isStatsModuleInitialized = true;
    window.addEventListener('resize', () => {
      renderStatsChart();
      updateTimeframePill();
      updateStatsMetricPill();
    }, { passive: true });
    updateTimeframePill();
    setInterval(() => {
      if (currentActiveTab === 'stats') {
        if (!mycoWaySocket || mycoWaySocket.readyState !== WebSocket.OPEN) {
          fetchOnlinePlayers();
        }
      }
    }, 15000);
  }
}

function switchChartMetric(metric) {
  if (!statsData[metric]) return;
  currentStatsMetric = metric;

  document.querySelectorAll('.stats-metric-btn').forEach(btn => btn.classList.remove('active'));
  const targetBtn = document.getElementById('metric-btn-' + metric);
  if (targetBtn) targetBtn.classList.add('active');
  updateStatsMetricPill(targetBtn);

  // Highlight active bottom detail card if present
  document.querySelectorAll('.stat-detail-card').forEach(card => {
    const fnAttr = card.getAttribute('onclick') || '';
    if (fnAttr.includes(`'${metric}'`)) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });

  renderStatsChart();
}

function formatChartGridVal(val, unit) {
  if (unit === '$') {
    if (val >= 1e9) return '$' + (val / 1e9).toFixed(val % 1e9 === 0 ? 0 : 2) + 'B';
    if (val >= 1e6) return '$' + (val / 1e6).toFixed(val % 1e6 === 0 ? 0 : 1) + 'M';
    if (val >= 1e3) return '$' + (val / 1e3).toFixed(0) + 'k';
    return '$' + Math.round(val);
  }
  if (unit === 'hodin') {
    if (val >= 1e3) return (val / 1e3).toFixed(1) + 'k h';
    return Math.round(val) + ' h';
  }
  if (val >= 1e6) return (val / 1e6).toFixed(1) + 'M';
  if (val >= 1e3) return (val / 1e3).toFixed(1) + 'k';
  return Math.round(val).toString();
}

function computeSmoothCubicPath(points) {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  if (points.length === 2) return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} L ${points[1].x.toFixed(1)} ${points[1].y.toFixed(1)}`;

  const n = points.length;
  const tension = 0.3;
  let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

  for (let i = 0; i < n - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i < n - 2 ? points[i + 2] : p2;

    const cp1x = p1.x + (p2.x - p0.x) * tension;
    let cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    let cp2y = p2.y - (p3.y - p1.y) * tension;

    // Strict flatness constraint: if adjacent points share identical Y, keep horizontal
    if (p1.y === p2.y) {
      cp1y = p1.y;
      cp2y = p2.y;
    }

    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return path;
}

function switchTimeframe(timeframe) {
  currentStatsTimeframe = timeframe;

  document.querySelectorAll('.timeframe-btn').forEach(btn => btn.classList.remove('active'));
  const targetBtn = document.getElementById('timeframe-btn-' + timeframe);
  if (targetBtn) targetBtn.classList.add('active');

  updateTimeframePill(targetBtn);

  const periodLabels = {
    '1h': 'Poslední hodina',
    '1d': 'Posledních 24 hodin',
    '1w': 'Posledních 7 dní',
    '1m': 'Posledních 30 dní'
  };
  const periodText = document.getElementById('chart-period-text');
  if (periodText) {
    periodText.innerHTML = `${UI_ICONS.calendar} ${periodLabels[timeframe] || 'Posledních 24 hodin'}`;
  }

  fetchLiveServerStats();
}

function updateTimeframePill(targetBtn) {
  const container = document.getElementById('stats-timeframe-selector');
  const pill = document.getElementById('timeframe-pill');
  const btn = targetBtn || container?.querySelector('.timeframe-btn.active') || document.getElementById('timeframe-btn-' + currentStatsTimeframe);
  if (!positionSegmentedPill(container, pill, btn)) return;

  const metricObj = statsData[currentStatsMetric] || statsData.players;
  if (metricObj) {
    pill.style.backgroundColor = metricObj.color;
    pill.style.boxShadow = 'inset 0 1px 0 0 rgba(255, 255, 255, 0.24), 0 4px 12px rgba(0, 0, 0, 0.35)';
  }
  if (window.__switcherLiquidGlass) window.__switcherLiquidGlass.syncContainer(container);
}

function renderStatsChart() {
  const metricObj = statsData[currentStatsMetric] || statsData.players;
  const seriesData = metricObj[currentStatsTimeframe] || metricObj['1d'];

  const titleEl = document.getElementById('chart-current-title');
  const valEl = document.getElementById('chart-current-value');
  if (titleEl) titleEl.innerText = metricObj.title;
  if (valEl) valEl.innerText = seriesData.curVal;

  const svg = document.getElementById('stats-line-chart');
  const container = document.getElementById('svg-chart-container');
  if (!svg || !container) return;

  const areaPath = document.getElementById('chart-area-path');
  const linePath = document.getElementById('chart-line-path');
  const gridGroup = document.getElementById('chart-grid-lines');
  const labelsContainer = document.getElementById('chart-x-labels');

  if (linePath) linePath.setAttribute('stroke', metricObj.color);

  // Synchronize all gradient stops to active metric color
  document.querySelectorAll('#chartGlowGradient stop').forEach(stop => {
    stop.setAttribute('stop-color', metricObj.color);
  });

  // Synchronize timeframe sliding pill with active metric color & geometry (no duplicate button box)
  document.querySelectorAll('.timeframe-btn').forEach(btn => {
    btn.style.backgroundColor = '';
    btn.style.boxShadow = '';
  });
  updateTimeframePill();

  const values = seriesData.values || [0];
  const labels = seriesData.labels || [''];
  const count = values.length;

  let minVal = Math.min(...values);
  let maxVal = Math.max(...values);

  if (currentStatsMetric === 'players') {
    // For online players: always anchor baseline at 0 so player proportions are accurate
    minVal = 0;
    maxVal = Math.max(10, Math.ceil(maxVal * 1.25));
  } else {
    // For cumulative/financial totals: give a balanced, consistent margin
    if (minVal === maxVal) {
      const delta = minVal > 0 ? minVal * 0.2 : 10;
      minVal = Math.max(0, minVal - delta);
      maxVal = maxVal + delta;
    } else {
      const delta = maxVal - minVal;
      const padBottom = Math.max(delta * 0.2, maxVal * 0.08);
      const padTop = Math.max(delta * 0.15, maxVal * 0.05);
      minVal = Math.max(0, minVal - padBottom);
      maxVal = maxVal + padTop;
    }
  }

  const range = Math.max(1, maxVal - minVal);
  const padTop = 32;
  const padBottom = 26;
  const svgW = 800;
  const svgH = 280;
  const usableH = svgH - padTop - padBottom;

  // Edge-to-edge X coordinates (from 0 to svgW) eliminates awkward blank margins
  const points = values.map((val, idx) => {
    const x = (idx / Math.max(1, count - 1)) * svgW;
    const y = svgH - padBottom - ((val - minVal) / range) * usableH;
    const peakInfo = seriesData.peaks ? seriesData.peaks[idx] : null;
    const fullDateLabel = seriesData.fullDateLabels ? seriesData.fullDateLabels[idx] : null;
    return { x, y, val, label: labels[idx], peakInfo, fullDateLabel };
  });

  // Render Horizontal Grid Lines with clean Y-axis reference markers
  if (gridGroup) {
    let gridHtml = '';
    const gridLinesCount = 3;
    for (let i = 0; i <= gridLinesCount; i++) {
      const gY = padTop + (i / gridLinesCount) * usableH;
      const gridVal = maxVal - (i / gridLinesCount) * range;
      const formattedVal = formatChartGridVal(gridVal, metricObj.unit);
      gridHtml += `<line x1="0" y1="${gY.toFixed(1)}" x2="${svgW}" y2="${gY.toFixed(1)}" stroke="rgba(255, 255, 255, 0.05)" stroke-dasharray="4 4" stroke-width="1" />`;
      gridHtml += `<text x="6" y="${(gY - 5).toFixed(1)}" fill="rgba(255, 255, 255, 0.32)" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="600">${formattedVal}</text>`;
    }
    gridGroup.innerHTML = gridHtml;
  }

  // Render smooth Catmull-Rom Bézier spline
  const dLine = computeSmoothCubicPath(points);
  // Area extends edge-to-edge and anchors cleanly at SVG bottom (y = svgH = 280)
  const dArea = `${dLine} L ${svgW} ${svgH} L 0 ${svgH} Z`;

  if (linePath) linePath.setAttribute('d', dLine);
  if (areaPath) areaPath.setAttribute('d', dArea);

  // For dense charts (> 7 points), suppress permanent HTML dot clutter; show sleek interactive crosshair
  container.querySelectorAll('.chart-point-dot').forEach(el => el.remove());
  if (count <= 7) {
    points.forEach((p, idx) => {
      const dot = document.createElement('div');
      dot.className = 'chart-point-dot';
      dot.dataset.idx = idx;
      dot.style.left = `${(p.x / svgW) * 100}%`;
      dot.style.top = `${(p.y / svgH) * 100}%`;
      dot.style.backgroundColor = metricObj.color;
      dot.style.color = metricObj.color;
      container.appendChild(dot);
    });
  }

  // Render clean, evenly spaced X-Axis Labels (no awkward rounding like 19.10.)
  if (labelsContainer) {
    let targetIndices = [];
    if (count <= 7) {
      targetIndices = points.map((_, i) => i);
    } else if (currentStatsTimeframe === '1m') {
      targetIndices = [0, 5, 10, 15, 20, 25, count - 1];
    } else if (currentStatsTimeframe === '1d') {
      targetIndices = [0, 4, 8, 12, 16, 20, count - 1];
    } else if (currentStatsTimeframe === '1h') {
      targetIndices = [0, 2, 4, 6, 8, 10, count - 1];
    } else {
      const step = (count - 1) / 6;
      for (let i = 0; i <= 6; i++) {
        targetIndices.push(Math.round(i * step));
      }
    }
    const displayLabels = targetIndices.map(idx => (points[idx] ? points[idx].label : ''));
    labelsContainer.innerHTML = displayLabels.map(l => `<span>${l}</span>`).join('');
  }

  // Bind Mouse & Touch interaction for Crosshair & Tooltip
  setupChartHoverInteraction(points, metricObj);
}

function setupChartHoverInteraction(points, metricObj) {
  const container = document.getElementById('svg-chart-container');
  const tooltip = document.getElementById('chart-tooltip');
  const crosshair = document.getElementById('chart-crosshair');
  const focusDot = document.getElementById('chart-focus-dot');
  const timeEl = document.getElementById('tooltip-time');
  const valEl = document.getElementById('tooltip-val');
  const peakEl = document.getElementById('tooltip-peak');
  if (!container || !tooltip) return;

  const updateTooltipAtPos = (clientX) => {
    const rect = container.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, mouseX / rect.width));
    const pointIdx = Math.round(ratio * (points.length - 1));
    const pt = points[pointIdx];

    if (pt) {
      const leftPercent = (pt.x / 800) * 100;
      const topPercent = (pt.y / 280) * 100;

      if (crosshair) {
        crosshair.setAttribute('x1', pt.x.toFixed(1));
        crosshair.setAttribute('x2', pt.x.toFixed(1));
        crosshair.style.opacity = '1';
      }

      if (focusDot) {
        focusDot.style.left = `${leftPercent}%`;
        focusDot.style.top = `${topPercent}%`;
        focusDot.style.backgroundColor = metricObj.color;
        focusDot.style.color = metricObj.color;
        focusDot.classList.add('visible');
      }

      tooltip.style.left = `${leftPercent}%`;
      tooltip.style.top = `${topPercent}%`;
      if (leftPercent < 15) {
        tooltip.style.transform = 'translate(0%, -125%)';
      } else if (leftPercent > 85) {
        tooltip.style.transform = 'translate(-100%, -125%)';
      } else {
        tooltip.style.transform = 'translate(-50%, -125%)';
      }

      // Highlight active dot if low-density dots are rendered
      container.querySelectorAll('.chart-point-dot').forEach((d, idx) => {
        if (idx === pointIdx) d.classList.add('active');
        else d.classList.remove('active');
      });

      if (timeEl) timeEl.innerText = pt.fullDateLabel || pt.label;
      if (valEl) {
        if (metricObj.unit === '$') {
          valEl.innerText = '$' + pt.val.toLocaleString('cs-CZ');
        } else {
          valEl.innerText = pt.val.toLocaleString('cs-CZ') + ' ' + metricObj.unit;
        }
      }

      if (peakEl) {
        if (pt.peakInfo) {
          peakEl.innerHTML = `${UI_ICONS.bolt} ${escapeHtml(pt.peakInfo)}`;
          peakEl.classList.add('visible');
        } else {
          peakEl.classList.remove('visible');
        }
      }

      tooltip.classList.add('visible');
    }
  };

  const hideTooltip = () => {
    tooltip.classList.remove('visible');
    if (crosshair) crosshair.style.opacity = '0';
    if (focusDot) focusDot.classList.remove('visible');
    container.querySelectorAll('.chart-point-dot').forEach(d => d.classList.remove('active'));
  };

  container.onmousemove = (e) => {
    updateTooltipAtPos(e.clientX);
  };

  container.onclick = (e) => {
    updateTooltipAtPos(e.clientX);
  };

  container.onmouseleave = hideTooltip;

  // Touch Support for Mobile devices
  container.ontouchstart = (e) => {
    if (e.touches && e.touches[0]) {
      updateTooltipAtPos(e.touches[0].clientX);
    }
  };

  container.ontouchmove = (e) => {
    if (e.touches && e.touches[0]) {
      updateTooltipAtPos(e.touches[0].clientX);
    }
  };

  container.ontouchend = () => {
    setTimeout(hideTooltip, 3000);
  };
}

// Close mobile menu when clicking/tapping outside the navbar
document.addEventListener('click', (e) => {
  const navbar = document.getElementById('navbar');
  const menu = document.getElementById('mobile-menu');
  const ham = document.getElementById('hamburger');
  if (menu && menu.classList.contains('open') && navbar && !navbar.contains(e.target)) {
    menu.classList.remove('open');
    if (ham) ham.classList.remove('open');
  }
});

let chartSkeletonTimer = null;

// Fetch Live & Historical Stats from Backend SQLite Database (/api/server-stats)
async function fetchLiveServerStats() {
  const chartCard = document.querySelector('.stats-chart-card');

  // Show skeleton loader only if loading takes longer than 150ms (slow connection)
  if (chartCard && !chartCard.classList.contains('is-loading')) {
    chartSkeletonTimer = setTimeout(() => {
      chartCard.classList.add('is-loading');
      chartCard.setAttribute('aria-busy', 'true');
    }, 150);
  }

  try {
    const apiEndpoints = [
      `/api/server-stats?timeframe=${currentStatsTimeframe}`,
      `https://api.6767111.xyz/api/server-stats?timeframe=${currentStatsTimeframe}`
    ];

    let data = null;
    for (const url of apiEndpoints) {
      try {
        const res = await apiFetch(url, {}, 7000);
        if (res.ok) {
          data = await res.json();
          if (data && data.success) break;
        }
      } catch (e) { }
    }

    if (data && data.success && data.history && data.history.length > 0) {
      const history = data.history;
      const latest = data.latest || history[history.length - 1];

      // Update overview cards
      const valPlayers = document.getElementById('val-players');
      if (valPlayers) {
        valPlayers.innerText = `${latest.online_players || 0} / 50`;
        valPlayers.title = `${latest.online_players || 0} / 50 online hráčů`;
      }

      const valPlaytime = document.getElementById('val-playtime');
      if (valPlaytime) {
        const ptStr = `${(latest.playtime_hours || 0).toLocaleString('cs-CZ')} hod.`;
        valPlaytime.innerText = ptStr;
        valPlaytime.title = ptStr;
      }

      const valMoney = document.getElementById('val-money');
      if (valMoney) {
        const monStr = `$${(latest.total_money || 0).toLocaleString('cs-CZ')}`;
        valMoney.innerText = monStr;
        valMoney.title = monStr;
      }

      const valVisitors = document.getElementById('val-visitors');
      if (valVisitors) {
        const visStr = `${(latest.unique_visitors || 0).toLocaleString('cs-CZ')} hráčů`;
        valVisitors.innerText = visStr;
        valVisitors.title = visStr;
      }

      const valDeaths = document.getElementById('val-deaths');
      if (valDeaths) {
        const dthStr = `${(latest.total_deaths || 0).toLocaleString('cs-CZ')}`;
        valDeaths.innerText = dthStr;
        valDeaths.title = `${dthStr} úmrtí na serveru`;
      }

      // Build time series for current timeframe
      const labels = [];
      const fullDateLabels = [];
      const metrics = {
        players: { values: [], peaks: [] },
        playtime: { values: [], peaks: [] },
        money: { values: [], peaks: [] },
        visitors: { values: [], peaks: [] },
        deaths: { values: [], peaks: [] }
      };

      const daysOfWeek = ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'];
      const shortDays = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];

      history.forEach((row, idx) => {
        const d = new Date(row.timestamp);
        let timeLabel = '';
        let fullLabel = '';
        const isLast = (idx === history.length - 1);

        if (currentStatsTimeframe === '1h') {
          timeLabel = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
          fullLabel = isLast ? `Nyní (${timeLabel})` : `Dnes ${timeLabel}`;
        } else if (currentStatsTimeframe === '1d') {
          timeLabel = `${String(d.getHours()).padStart(2, '0')}:00`;
          fullLabel = isLast ? `Nyní (${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')})` : `${daysOfWeek[d.getDay()]} ${timeLabel}`;
        } else if (currentStatsTimeframe === '1w') {
          timeLabel = shortDays[d.getDay()];
          fullLabel = isLast ? `Dnes (${timeLabel} ${d.getDate()}.${d.getMonth() + 1}.)` : `${daysOfWeek[d.getDay()]} ${d.getDate()}.${d.getMonth() + 1}.`;
        } else if (currentStatsTimeframe === '1m') {
          timeLabel = `${d.getDate()}.${d.getMonth() + 1}.`;
          fullLabel = `${daysOfWeek[d.getDay()]} ${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
        }

        labels.push(timeLabel);
        fullDateLabels.push(fullLabel);

        metrics.players.values.push(row.online_players || 0);
        metrics.players.peaks.push((row.online_players !== undefined) ? `Aktivita: ${row.online_players} hráčů` : null);

        metrics.playtime.values.push(row.playtime_hours || 0);
        metrics.playtime.peaks.push(null);

        metrics.money.values.push(row.total_money || 0);
        metrics.money.peaks.push(null);

        metrics.visitors.values.push(row.unique_visitors || 0);
        metrics.visitors.peaks.push(null);

        metrics.deaths.values.push(row.total_deaths || 0);
        metrics.deaths.peaks.push(null);
      });

      // Update statsData object dynamically
      const metricKeys = ['players', 'playtime', 'money', 'visitors', 'deaths'];
      metricKeys.forEach(k => {
        const latestVal = latest[k === 'players' ? 'online_players' : (k === 'playtime' ? 'playtime_hours' : (k === 'money' ? 'total_money' : (k === 'visitors' ? 'unique_visitors' : 'total_deaths')))] || 0;
        let suffix = '';
        if (k === 'players') suffix = 'hráčů online právě teď';
        else if (k === 'playtime') suffix = 'hodin celkem';
        else if (k === 'money') suffix = 'v oběhu';
        else if (k === 'visitors') suffix = 'unikátních hráčů';
        else if (k === 'deaths') suffix = 'celkových úmrtí';

        const curValStr = k === 'money' ? `$${latestVal.toLocaleString('cs-CZ')} ${suffix}` : `${latestVal.toLocaleString('cs-CZ')} ${suffix}`;

        statsData[k][currentStatsTimeframe] = {
          labels: labels,
          fullDateLabels: fullDateLabels,
          values: metrics[k].values,
          peaks: metrics[k].peaks,
          curVal: curValStr
        };
      });

      renderStatsChart();
    }

    // Trigger online players update
    fetchOnlinePlayers();
  } catch (err) {
    console.warn('Failed to load server stats:', err);
  } finally {
    if (chartSkeletonTimer) {
      clearTimeout(chartSkeletonTimer);
      chartSkeletonTimer = null;
    }
    if (chartCard) {
      chartCard.classList.remove('is-loading');
      chartCard.removeAttribute('aria-busy');
    }
  }
}

function renderOnlinePlayersData(data) {
  const badge = document.getElementById('online-players-badge');
  const grid = document.getElementById('online-players-grid');
  if (!grid) return;

  const maxCount = data?.max || 50;

  if (!data || !data.players || data.players.length === 0) {
    if (badge) badge.innerHTML = `${UI_ICONS.users} 0 / ${maxCount}`;
    grid.innerHTML = `
      <div class="online-players-empty">
        <div class="empty-icon">${UI_ICONS.moon}</div>
        <div class="empty-text">
          <h4>Na serveru zrovna nikdo nehraje</h4>
          <p>Připoj se na <strong>mychalsmp.xyz</strong>.</p>
        </div>
        <button type="button" class="btn-copy-ip-mini" onclick="copyIP(event)">
          ${UI_ICONS.copy} <span class="btn-copy-label">Zkopírovat IP</span>
        </button>
      </div>
    `;
    return;
  }

  if (badge) badge.innerHTML = `${UI_ICONS.users} ${data.players.length} / ${maxCount}`;

  grid.innerHTML = data.players.map(player => {
    const badgeClass = player.rank_badge === 'owner' ? 'badge-owner' : (player.rank_badge === 'smpplus' ? 'badge-smpplus' : 'badge-player');
    const badgeIcon = player.rank_badge === 'owner' ? `${UI_ICONS.crown} ` : (player.rank_badge === 'smpplus' ? `${UI_ICONS.gem} ` : `${UI_ICONS.user} `);
    const avatarUrl = player.avatar || `https://mc-heads.net/avatar/${encodeURIComponent(player.name)}/64`;
    const playtime = player.playtime_hours !== undefined ? `${player.playtime_hours} hod.` : 'Nové';

    const safeName = escapeHtml(player.name);
    const safeRank = escapeHtml(player.rank || 'Hráč');
    const safeAvatar = escapeHtml(avatarUrl);

    return `
      <div class="player-card">
        <img src="${safeAvatar}" alt="${safeName}" class="player-card-avatar" width="40" height="40" loading="lazy" onerror="this.src='https://mc-heads.net/avatar/MHF_Steve/64'">
        <div class="player-card-info">
          <span class="player-card-name" title="${safeName}">${safeName}</span>
          <div class="player-card-meta">
            <span class="player-badge ${badgeClass}">${badgeIcon}${safeRank}</span>
            <span class="player-playtime">${UI_ICONS.clock} ${escapeHtml(playtime)}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Fetch and render live online players widget (HTTP fallback & initial load)
async function fetchOnlinePlayers() {
  try {
    const apiEndpoints = [
      '/api/online-players',
      'https://api.6767111.xyz/api/online-players'
    ];
    let data = null;
    for (const url of apiEndpoints) {
      try {
        const res = await apiFetch(url, {}, 5000);
        if (res.ok) {
          data = await res.json();
          if (data && data.success) break;
        }
      } catch (e) { }
    }
    renderOnlinePlayersData(data);
  } catch (err) {
    console.warn('[ONLINE PLAYERS] Error:', err);
  }
}

// ─── MYCOWAY REAL-TIME LIVE WEBSOCKET STREAM ─────────────────────────
let mycoWaySocket = null;
let mycoWayReconnectTimer = null;

function initMycoWayStream() {
  if (mycoWaySocket && (mycoWaySocket.readyState === WebSocket.OPEN || mycoWaySocket.readyState === WebSocket.CONNECTING)) return;

  const isDev = window.location.hostname === '127.0.0.1' || window.location.hostname.endsWith('.local');
  const protocol = isDev && window.location.protocol === 'http:' ? 'ws:' : 'wss:';
  const host = isDev ? window.location.host : 'api.6767111.xyz';
  const wsUrl = `${protocol}//${host}/mycoway/ws`;

  try {
    mycoWaySocket = new WebSocket(wsUrl);

    mycoWaySocket.onopen = () => {
      try {
        mycoWaySocket.send(JSON.stringify({ type: 'SUBSCRIBE', role: 'web' }));
      } catch (_) { }
    };

    mycoWaySocket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'INIT' || msg.type === 'PLAYERS_UPDATE') {
          renderOnlinePlayersData(msg);
        } else if (msg.type === 'PLAYER_JOIN' || msg.type === 'PLAYER_QUIT') {
          fetchOnlinePlayers();
        }
      } catch (_) { }
    };

    mycoWaySocket.onclose = () => {
      mycoWaySocket = null;
      clearTimeout(mycoWayReconnectTimer);
      mycoWayReconnectTimer = setTimeout(initMycoWayStream, 6000);
    };

    mycoWaySocket.onerror = () => {
      try { mycoWaySocket.close(); } catch (_) { }
    };
  } catch (_) {
    // V případě chyby běží HTTP fetch fallback
  }
}


// ─── PROMO COUNTDOWN ───────────────────────────────────────────────
(function () {
  // Aug 25 2026 20:00:00 Prague time (UTC+2)
  const END_DATE = new Date('2026-08-25T18:00:00Z'); // 20:00 CEST = 18:00 UTC

  const el = document.getElementById('promo-countdown');
  const banner = document.getElementById('promo-banner');
  if (!el || !banner) return;

  function pad(n) { return n < 10 ? '0' + n : n; }

  function tick() {
    const now = new Date();
    const diff = END_DATE - now;

    if (diff <= 0) {
      // Sleva skončila – skryjeme banner
      banner.style.display = 'none';
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let text = '';
    if (days > 0) {
      text = `Zbývá ${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
    } else if (hours > 0) {
      text = `Zbývá ${hours}h ${pad(minutes)}m ${pad(seconds)}s`;
    } else if (minutes > 0) {
      text = `Zbývá ${minutes}m ${pad(seconds)}s`;
    } else {
      text = `Posledních ${pad(seconds)}s`;
    }

    el.textContent = text;
  }

  tick();
  setInterval(tick, 1000);
})();

// ---- LEGAL DOCUMENTATION INTERACTIVE CONTROLS ----
function smoothScrollToLegal(targetId, event) {
  if (event) event.preventDefault();
  const el = document.getElementById(targetId);
  if (!el) return;
  const yOffset = -90; // kompenzace fixní navigace
  const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
  window.scrollTo({ top: y, behavior: 'smooth' });
}

let updateLegalProgressGlobal = function () { };

// Sledování průběhu čtení a aktivní kapitoly v TOC (Clamped Sticky Rail)
(function initLegalReader() {
  function updateLegalProgress() {
    const activeSection = document.querySelector('.tab-section.legal-section.active');
    if (!activeSection) return;

    const progressBar = activeSection.querySelector('.legal-progress-bar');
    const articles = activeSection.querySelectorAll('.legal-article');
    const tocLinks = activeSection.querySelectorAll('.legal-toc-link');

    if (!articles.length) return;

    const firstRect = articles[0].getBoundingClientRect();
    const lastRect = articles[articles.length - 1].getBoundingClientRect();
    const totalHeight = lastRect.bottom - firstRect.top;
    const scrollPos = (window.innerHeight * 0.35) - firstRect.top;

    const pct = Math.max(0, Math.min(100, Math.round((scrollPos / totalHeight) * 100)));
    if (progressBar) {
      progressBar.style.width = pct + '%';
    }

    let activeId = '';
    let closestDist = Infinity;
    const targetY = window.innerHeight * 0.35;

    articles.forEach(art => {
      const r = art.getBoundingClientRect();
      // Focus on the article nearest to the reading midline
      if (r.top <= targetY && r.bottom >= 60) {
        activeId = art.id;
      }
    });

    if (!activeId && articles.length) {
      if (articles[0].getBoundingClientRect().top > targetY) {
        activeId = articles[0].id;
      } else {
        activeId = articles[articles.length - 1].id;
      }
    }

    if (activeId && tocLinks.length) {
      tocLinks.forEach(link => {
        const href = (link.getAttribute('href') || '').replace('#', '');
        if (href === activeId) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  }

  updateLegalProgressGlobal = updateLegalProgress;
  window.addEventListener('scroll', updateLegalProgress, { passive: true });
  window.addEventListener('resize', updateLegalProgress, { passive: true });
})();

// ---- INTERACTIVE RULES FILTER ----
function updateRulesFilterPill(targetBtn) {
  const container = document.querySelector('.rules-filter-bar');
  const pill = document.getElementById('rules-filter-pill');
  const btn = targetBtn || container?.querySelector('.rules-filter-btn.active');
  if (!container || !pill || !btn) return;
  container.classList.add('has-indicator');
  pill.classList.add('is-ready');
  pill.classList.toggle('is-banned', btn.classList.contains('rules-filter-btn--banned'));
  if (!positionSegmentedPill(container, pill, btn, { vertical: true, matchRadius: true })) return;
  if (window.__switcherLiquidGlass) window.__switcherLiquidGlass.syncContainer(container);
}

function filterRules(category, btnElement) {
  if (btnElement) {
    const parent = btnElement.closest('.rules-filter-bar');
    if (parent) {
      parent.querySelectorAll('.rules-filter-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
    }
    btnElement.classList.add('active');
    btnElement.setAttribute('aria-selected', 'true');
    updateRulesFilterPill(btnElement);
  }

  const bannedBoard = document.getElementById('banned-players-board');
  const rulesGrid = document.getElementById('rules-card-grid');
  const rulesQuiz = document.getElementById('rules-quiz');

  if (category === 'banned') {
    if (rulesGrid) transitionPanelVisibility(rulesGrid, false, 'grid');
    if (rulesQuiz) transitionPanelVisibility(rulesQuiz, false, 'block');
    if (bannedBoard) {
      transitionPanelVisibility(bannedBoard, true, 'block');
      loadBannedPlayers();
      setTimeout(() => {
        bannedBoard.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
      }, 60);
    }
    return;
  }

  // Běžná kategorie pravidel: skryjeme nástěnku a obnovíme mřížku pravidel
  if (bannedBoard) transitionPanelVisibility(bannedBoard, false, 'block');
  if (rulesGrid) transitionPanelVisibility(rulesGrid, true, 'grid');
  if (rulesQuiz) transitionPanelVisibility(rulesQuiz, true, 'block');

  const cards = document.querySelectorAll('#rules-card-grid .rule-card');
  cards.forEach(card => {
    const cardCat = card.getAttribute('data-category');
    if (category === 'all' || cardCat === category) {
      card.classList.remove('rule-card-hidden');
    } else {
      card.classList.add('rule-card-hidden');
    }
  });
}

function closeBannedBoard() {
  const allBtn = document.querySelector('.rules-filter-bar button:first-child');
  filterRules('all', allBtn);
}

function toggleBannedBoard(btnElement) {
  const bannedBoard = document.getElementById('banned-players-board');
  if (bannedBoard && bannedBoard.style.display !== 'none') {
    closeBannedBoard();
  } else {
    filterRules('banned', btnElement || document.getElementById('btn-toggle-banned-board'));
  }
}

// ---- NÁSTĚNKA ZABANOVANÝCH HRÁČŮ ----
let bannedPlayersCache = null;
let currentBannedSearchQuery = '';

async function loadBannedPlayers(forceRefresh = false) {
  const loadingEl = document.getElementById('banned-loading-state');
  const errorEl = document.getElementById('banned-error-state');
  const gridEl = document.getElementById('banned-notes-grid');
  const countBadge = document.getElementById('banned-count-badge');

  if (bannedPlayersCache && !forceRefresh) {
    if (loadingEl) loadingEl.style.display = 'none';
    if (gridEl) gridEl.style.display = 'grid';
    renderBannedPlayers(bannedPlayersCache);
    return;
  }

  if (loadingEl) loadingEl.style.display = 'flex';
  if (errorEl) errorEl.style.display = 'none';
  if (gridEl) gridEl.style.display = 'none';
  if (countBadge) countBadge.textContent = 'Načítám cedulky...';

  try {
    const res = await apiFetch('/api/banned-players');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.players)) throw new Error('Neplatný formát dat');

    bannedPlayersCache = data.players;
    if (loadingEl) loadingEl.style.display = 'none';
    if (gridEl) gridEl.style.display = 'grid';
    renderBannedPlayers(bannedPlayersCache);
  } catch (err) {
    console.warn('[BANNED BOARD] Chyba při načítání:', err);
    if (loadingEl) loadingEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'flex';
    if (countBadge) countBadge.textContent = 'Chyba spojení';
  }
}

function handleBannedSearch(query) {
  currentBannedSearchQuery = (query || '').toLowerCase().trim();
  if (bannedPlayersCache) {
    renderBannedPlayers(bannedPlayersCache);
  }
}

function renderBannedPlayers(players) {
  const gridEl = document.getElementById('banned-notes-grid');
  const countBadge = document.getElementById('banned-count-badge');
  if (!gridEl) return;

  const query = currentBannedSearchQuery;
  const filtered = players.filter(p => {
    if (!query) return true;
    return (p.name && p.name.toLowerCase().includes(query)) ||
      (p.reason && p.reason.toLowerCase().includes(query)) ||
      (p.source && p.source.toLowerCase().includes(query));
  });

  if (countBadge) {
    countBadge.textContent = `Zobrazeno ${filtered.length} z ${players.length} hráčů`;
  }

  if (filtered.length === 0) {
    gridEl.innerHTML = `
      <div class="banned-board-empty">
        <p>Žádná vyvěšená cedulka neodpovídá hledání "${escapeHtml(query)}".</p>
      </div>
    `;
    return;
  }

  gridEl.innerHTML = filtered.map((p, idx) => {
    // Generování lehkého organického náklonu pro realistickou nástěnku (-2.4deg až +2.4deg)
    const rot = (((idx * 37) % 7) - 3) * 0.8;
    const safeName = escapeHtml(p.name);
    const safeMasked = escapeHtml(p.maskedName);
    const safeReason = escapeHtml(p.reason);
    const safeSource = escapeHtml(p.source || 'Server');
    let expiresText = 'Trvalý ban';
    if (p.expires && p.expires !== 'forever') {
      expiresText = escapeHtml(p.expires.split(' ')[0] || p.expires);
    }

    return `
      <div class="banned-paper-note" 
           style="--note-rot: ${rot}deg;" 
           tabindex="0" 
           role="button" 
           aria-label="Zabanovaný hráč ${safeMasked}, klikni nebo najeď pro detail"
           onclick="togglePaperNoteActive(this)"
           onkeydown="if(event.key==='Enter'||event.key===' '){togglePaperNoteActive(this); event.preventDefault();}">
        <!-- Mosazný špendlík -->
        <div class="banned-paper-pin"></div>
        
        <div class="banned-paper-inner">
          <div class="banned-paper-avatar-wrap">
            <img class="banned-paper-avatar" 
                 src="https://mc-heads.net/avatar/${encodeURIComponent(p.name)}/48" 
                 alt="${safeMasked}" 
                 loading="lazy" 
                 onerror="this.onerror=null; this.src='https://mc-heads.net/avatar/MHF_Steve/48';" />
          </div>

          <div class="banned-paper-name-wrap">
            <div class="banned-paper-name-masked">${safeMasked}</div>
            <div class="banned-paper-name-full">${safeName}</div>
          </div>

          <div class="banned-paper-stamp">ZABANOVÁN</div>

          <div class="banned-paper-reveal">
            <div class="banned-paper-reveal-title">Důvod banu:</div>
            <div class="banned-paper-reveal-reason">${safeReason}</div>
            <div class="banned-paper-reveal-meta">
              <span class="banned-paper-source" title="Systém nebo moderátor">${safeSource}</span>
              <span class="banned-paper-expires">${expiresText}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function togglePaperNoteActive(noteEl) {
  // Podpora pro dotyková zařízení (mobily / tablety)
  const wasActive = noteEl.classList.contains('active');
  document.querySelectorAll('.banned-paper-note.active').forEach(n => {
    if (n !== noteEl) n.classList.remove('active');
  });
  if (wasActive) {
    noteEl.classList.remove('active');
  } else {
    noteEl.classList.add('active');
  }
}

// ---- INTERACTIVE SITUATIONAL SERVER QUIZ (10 RANDOMIZED REAL-WORLD CASES) ----
const RULES_QUIZ_SCENARIOS = [
  {
    id: 'dup-covert',
    tag: 'SMP & Duplikace',
    question: 'Kámoš ti na serveru hodil 3 shulker boxy plné netherite bloků se slovy: „Rychle si to schovej do své ender truhly a nikomu nic neříkej, našel jsem nový dupe glitch.“ Co uděláš?',
    options: [
      {
        text: 'Věci v tichosti spálím v lávě a nikomu nic hlásit nebudu, abych do situace nebyl zatažen a vyhnul se jakémukoliv vyšetřování.',
        isCorrect: false
      },
      {
        text: 'Okamžitě vytvořím ticket na Discordu nebo napíšu /report s nickem kamaráda a věci odevzdám, protože přechovávání dupu je trestné.',
        isCorrect: true
      },
      {
        text: 'Věci si uložím do soukromého claimu a počkám, zda kamarád dostane ban; pokud systém nic nezachytí, suroviny si ponechám pro stavbu.',
        isCorrect: false
      }
    ],
    explanation: 'Správná volba. Přechovávání dupnutých věcí se posuzuje stejně přísně jako samotná duplikace a vede k banu a vymazání inventáře. Nahlášením chyby získáš odměnu v diamantových blocích.',
    wrongFeedback: 'Serverové logy zachycují přesuny itemů i obsah ender truhel. Přechovávání dupnutých itemů vede k banu a vymazání inventáře.'
  },
  {
    id: 'smp-raid',
    tag: 'SMP Svět (/smp)',
    question: 'Hraješ na SMP světě (/smp). Cizí klan ti pomocí TNT kanónů prorazil hradby, vyhodil základnu do povětří, zničil truhly a pobil tvůj tým. Jaká je správná reakce?',
    options: [
      {
        text: 'Otevřu ticket na Discordu s žádostí o prověření griefingu a vrácení zničených truhel administrátory, protože ničení základen je zakázané.',
        isCorrect: false
      },
      {
        text: 'Je to plně v rámci pravidel – na SMP světě (/smp) jsou přepady i ničení bází povoleny. Zabezpečím stavbu lépe a naplánuji herní odvetu.',
        isCorrect: true
      },
      {
        text: 'Nahlásím útočníky za neoprávněné použití TNT v blízkosti cizí stavby a budu po vedení požadovat kompenzaci ztracených netherite věcí.',
        isCorrect: false
      }
    ],
    explanation: 'Přesně tak. SMP svět je určený pro volný boj, přepady klanů a ničení bází. Pokud preferuješ klid a ochranu staveb, přepni se na klasický Survival.',
    wrongFeedback: 'Na SMP světě je ničení staveb a boj výslovně povoleno. Pro klidné stavění bez griefingu slouží svět /survival s ochranou pozemků.'
  },
  {
    id: 'survival-chest',
    tag: 'Survival Svět (/survival)',
    question: 'Na Survival světě (/survival) prozkoumáváš krajinu a narazíš na cizí rozestavěný dům. Truhly nejsou v claimu a nejsou uzamčené. Smíš je vybrat a suroviny si odnést?',
    options: [
      {
        text: 'Ano, pokud majitel neochránil své území claimem ani truhlu nezamkl, jedná se o volně ležící kořist, kterou si může kdokoliv vzít.',
        isCorrect: false
      },
      {
        text: 'Ne, na Survival světě je krádež i ničení cizích staveb zakázáno bez ohledu na to, zda má hráč vytvořený claim. Všechny akce logujeme.',
        isCorrect: true
      },
      {
        text: 'Smím si vzít pouze část surovin potřebných pro přežití a stavební bloky musím na místě nechat, aby stavba nebyla kompletně vybrána.',
        isCorrect: false
      }
    ],
    explanation: 'Správně. Na klasickém Survivalu platí zákaz krádeží a griefingu. Serverové logy evidují každý otevřený kontejner i zásah do bloků.',
    wrongFeedback: 'Na Survivalu je vybírání cizích truhel i ničení staveb bez svolení majitele přísně zakázáno i mimo claim.'
  },
  {
    id: 'irl-trade-psc',
    tag: 'Ekonomika & Účty',
    question: 'Hráč ti do soukromé zprávy (/msg) napíše: „Dám ti kód na 200 Kč Paysafecard, když mi ve hře dáš svůj full netherite gear a 50 000 coinů.“ Jak zareaguješ?',
    options: [
      {
        text: 'Nabídku přijmu pouze v případě, že mi hráč kód pošle jako první na Discord a unban riziko tím přejde kompletně na jeho stranu účtu.',
        isCorrect: false
      },
      {
        text: 'Odmítnu a hráče nahlásím adminům se screenshotem zprávy. Obchod za reálné peníze (IRL trade) je přísně zakázán pod trestem perma banu.',
        isCorrect: true
      },
      {
        text: 'Není to zakázané, pokud obchod probíhá přes soukromé zprávy a nevytváří se zbytečný spam v hlavním veřejném chatu celého serveru.',
        isCorrect: false
      }
    ],
    explanation: 'Správně. IRL obchodování je na MYCHAL SMP zakázáno. Za pokus o prodej či nákup za reálné peníze dostávají obě strany trvalý ban.',
    wrongFeedback: 'IRL obchodování za reálné peníze, kupóny či kryptoměny je přísně zakázáno a vede k trvalému banu pro obě strany.'
  },
  {
    id: 'xray-texture',
    tag: 'Fair-Play',
    question: 'Kamarád tvrdí: „Když si dáš průhledný X-Ray texture pack místo hack klienta, je to v pohodě, protože jde jen o vzhled bloků u tebe v počítači.“ Má pravdu?',
    options: [
      {
        text: 'Má pravdu, změna vzhledu textur je čistě vizuální úprava klienta a pravidla ji neřeší.',
        isCorrect: false
      },
      {
        text: 'Nemá pravdu, X-Ray texture packy jsou na serveru zakázané stejně jako hack klienti a vedou k banu a zabavení surovin.',
        isCorrect: true
      },
      {
        text: 'Textury jsou tolerovány na běžné suroviny jako je uhlí a železo, zakázané jsou pouze na hledání netheritu.',
        isCorrect: false
      }
    ],
    explanation: 'Správně. X-Ray texture packy jsou postaveny na roveň cheatům a vedou k banu i zabavení surovin.',
    wrongFeedback: 'X-Ray textury jsou posuzovány stejně jako cheaty a vedou k banu a zabavení surovin.'
  },
  {
    id: 'lag-machine',
    tag: 'Technická pravidla',
    question: 'Postavil jsi obří létající redstone stroj se 400 písty a sleduješ, že po jeho spuštění kleslo TPS celého serveru z 20 na 5. Co je tvou povinností udělat?',
    options: [
      {
        text: 'Stroj mohu nechat v chodu mimo špičku, pokud na serveru hraje méně než deset hráčů a nikoho to při běžném těžení zásadně neomezuje.',
        isCorrect: false
      },
      {
        text: 'Stroj okamžitě zastavím a upravím nebo zmenším. Vědomé i nedbalostní přetěžování serveru a shazování TPS je zakázáno pravidly.',
        isCorrect: true
      },
      {
        text: 'Zpomalím interval spouštění o pár sekund a počkám, zda mě administrátoři sami kontaktují, abych nemusel celý systém zbytečně bourat.',
        isCorrect: false
      }
    ],
    explanation: 'Správně. Automatické farmy a stroje jsou povolené, ale nesmí snižovat výkon serveru ostatním hráčům.',
    wrongFeedback: 'Stabilita serveru pro všechny hráče má přednost. Záměrné i nedbalostní přetěžování vede ke smazání mechanismu a postihu.'
  },
  {
    id: 'mute-evasion',
    tag: 'Komunita & Tresty',
    question: 'Dostal jsi od moderátora 2hodinový Mute za urážky v globálním chatu. Můžeš se připojit z bratrova účtu nebo psát hráčům přejmenováváním věcí v kovadlině?',
    options: [
      {
        text: 'Ano, mute postihuje pouze konkrétní uživatelské jméno a zákaz se nevztahuje na alternativní účty ani na herní předměty jako knihy.',
        isCorrect: false
      },
      {
        text: 'V žádném případě. Jakékoliv obcházení trestu přes alt účty, cedulky či kovadliny je zakázáno a trestá se dlouhodobým banem.',
        isCorrect: true
      },
      {
        text: 'Přejmenování itemů v kovadlině je povolené, pokud text neobsahuje vulgarismy a slouží výhradně k domluvě na obchodu v /shopu.',
        isCorrect: false
      }
    ],
    explanation: 'Přesně tak. Obcházení uděleného trestu je závažnější přestupek než původní prohřešek. Případné výhrady se řeší přes ticket na Discordu.',
    wrongFeedback: 'Obcházení mute přes druhý účet, přejmenované itemy či cedulky se trestá dlouhodobým banem.'
  },
  {
    id: 'replay-mod',
    tag: 'Klient & Mody',
    question: 'Chceš si natočit cinematic video své nové báze s volnou kamerou přes Replay Mod. Jaká pravidla pro tento mod platí?',
    options: [
      {
        text: 'Replay Mod je povolen pro všechny běžné hráče za podmínky, že volnou kameru nevyužívají ke špehování podzemí a cizích základen.',
        isCorrect: false
      },
      {
        text: 'Replay Mod je povolen výhradně pro schválené tvůrce s Media rankem. Běžní hráči jej nesmí mít aktivní kvůli riziku zneužití na Freecam.',
        isCorrect: true
      },
      {
        text: 'Replay Mod je na celém serveru kompletně zablokován a nesmí jej používat ani oficiální ověření partneři s vyšší hodností Media.',
        isCorrect: false
      }
    ],
    explanation: 'Správně. Replay Mod je povolen výhradně pro schválené tvůrce s Media rankem, aby zůstal zachován férový pohyb bez Freecamu.',
    wrongFeedback: 'Běžný hráč Replay Mod používat nesmí. Volná kamera bez ověřeného Media ranku se posuzuje jako zakázaný Freecam.'
  },
  {
    id: 'shop-glitch',
    tag: 'Ekonomika & /shop',
    question: 'V herním /shopu narazíš na chybu: při rychlém nákupu určitého itemu ti server neodečte peníze, ale naopak ti přičte $500 na konto. Jak se zachováš?',
    options: [
      {
        text: 'Chybu využiji k vydělání menší částky na nákup základního vybavení a teprve poté situaci soukromě oznámím týmu na Discordu.',
        isCorrect: false
      },
      {
        text: 'Chybu ihned přestanu využívat a nahlásím ji do ticketu na Discordu. Získám odměnu v diamantových blocích a ochráním ekonomiku.',
        isCorrect: true
      },
      {
        text: 'Nakoupím itemy do zásoby pro celý svůj tým a peníze převedu na týmový účet, aby nebyly dohledatelné v mém osobním zůstatku.',
        isCorrect: false
      }
    ],
    explanation: 'Správně. Nahlášení ekonomické chyby přináší odměnu v diamantových blocích. Zneužití chyby vede k banu a resetu konta.',
    wrongFeedback: 'Zneužívání chyb ekonomiky vede k trvalému banu a smazání veškerého majetku.'
  },
  {
    id: 'private-ads',
    tag: 'Chat & Komunita',
    question: 'Hráč ti do soukromé zprávy (/msg) zašle pozvánku na jiný Minecraft server: „Pojď k nám na server, rozdáváme VIP zdarma a máme lepší Survival.“ Co o této situaci platí?',
    options: [
      {
        text: 'Pozvánky v soukromých zprávách jsou povolené, pokud hráč neposílá odkazy opakovaně a neobtěžuje tím více než jednoho člověka.',
        isCorrect: false
      },
      {
        text: 'Reklama na cizí servery v jakékoliv formě včetně /msg je přísně zakázána a trestá se mutem, při opakování banem.',
        isCorrect: true
      },
      {
        text: 'Reklama se trestá pouze tehdy, pokud je v ní uveden přímý IP port nebo odkaz na web, pouhé zmínění názvu jiného serveru nevadí.',
        isCorrect: false
      }
    ],
    explanation: 'Správně. Zákaz reklamy na cizí servery a projekty platí bez výjimky ve všech komunikačních kanálech.',
    wrongFeedback: 'Zákaz propagace cizích projektů platí pro globální chat, /msg, mail i herní předměty a trestá se mutem či banem.'
  },
  {
    id: 'minimap-ban',
    tag: 'Klient & Minimapy',
    question: 'Můžeš na serveru používat Xaero\'s Minimap nebo JourneyMap, pokud si v nastavení modu vypneš radar na jeskyně, rudy a ostatní hráče?',
    options: [
      {
        text: 'Ano, pokud v konfiguračním souboru deaktivuješ zobrazení entit a jeskynního systému, čistá povrchová mapa je plně povolená.',
        isCorrect: false
      },
      {
        text: 'Ne, veškeré minimapy i vestavěné waypoint mody jsou na MYCHAL SMP přísně zakázány bez výjimky. Hráči se orientují dle F3 souřadnic.',
        isCorrect: true
      },
      {
        text: 'Minimapa je povolená pouze v těžebním světě pro snazší návrat k portálu, na hlavním SMP a Survival světě však musí být vypnutá.',
        isCorrect: false
      }
    ],
    explanation: 'Přesně tak. Pravidlo 1 serveru v /rules výslovně zakazuje veškeré minimapy a waypoint mody bez výjimky.',
    wrongFeedback: 'Pravidlo 1 v /rules výslovně zakazuje všechny minimapy i waypointy bez ohledu na jejich nastavení v klientovi.'
  }
];

let currentDynamicQuizScenarios = [];
let currentRulesQuestionIndex = 0;
let isRulesFlipping = false;

function shuffleQuizArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function renderCurrentRulesQuestionCard(isTransition = false) {
  const container = document.getElementById('rules-quiz-dynamic-questions');
  if (!container) return;

  const total = currentDynamicQuizScenarios.length || 4;

  if (currentRulesQuestionIndex >= total) {
    container.innerHTML = '';
    const successCard = document.getElementById('quiz-success-card');
    if (successCard) {
      transitionPanelVisibility(successCard, true, 'block');
      setTimeout(() => {
        successCard.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'nearest' });
      }, 200);
    }
    return;
  }

  const sc = currentDynamicQuizScenarios[currentRulesQuestionIndex];
  if (!sc) return;

  const qNumber = currentRulesQuestionIndex + 1;
  const safeTag = typeof escapeHtml === 'function' ? escapeHtml(sc.tag) : sc.tag;
  const safeQuestion = typeof escapeHtml === 'function' ? escapeHtml(sc.question) : sc.question;

  const optionsHtml = sc.shuffledOptions.map((opt, optIndex) => {
    const safeOptText = typeof escapeHtml === 'function' ? escapeHtml(opt.text) : opt.text;
    return `
      <button class="quiz-option-btn" type="button" data-optindex="${optIndex}" onclick="handleDynamicQuizAnswer(${optIndex}, ${opt.isCorrect}, this)">
        <span class="quiz-option-indicator" aria-hidden="true"></span>
        <span class="quiz-option-label">${safeOptText}</span>
      </button>
    `;
  }).join('');

  container.innerHTML = `
    <div class="quiz-question-box ${isTransition ? 'is-flipping-in' : ''}" id="quiz-active-box">
      <div class="quiz-question-head">
        <span class="quiz-number">${qNumber}</span>
        <div class="quiz-question-meta">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
            <span class="quiz-scenario-tag">${safeTag}</span>
            <span style="font-size: 0.8rem; color: #94a3b8; font-weight: 600;">Otázka ${qNumber} z ${total}</span>
          </div>
          <h4 class="quiz-question-text">${safeQuestion}</h4>
        </div>
      </div>
      <div class="quiz-options-grid">
        ${optionsHtml}
      </div>
      <div class="quiz-feedback-box" id="quiz-active-feedback"></div>
    </div>
  `;
}

function resetAndShuffleQuiz() {
  const container = document.getElementById('rules-quiz-dynamic-questions');
  if (!container) return;

  // Pick 4 random scenarios from the pool of 10
  const shuffledPool = shuffleQuizArray(RULES_QUIZ_SCENARIOS);
  const pickedScenarios = shuffledPool.slice(0, 4).map(sc => {
    return {
      ...sc,
      shuffledOptions: shuffleQuizArray(sc.options)
    };
  });

  currentDynamicQuizScenarios = pickedScenarios;
  currentRulesQuestionIndex = 0;
  isRulesFlipping = false;

  // Reset UI
  const bar = document.getElementById('rules-quiz-progress-bar');
  const counter = document.getElementById('rules-quiz-counter');
  const successCard = document.getElementById('quiz-success-card');
  if (bar) bar.style.width = '0%';
  if (counter) counter.textContent = 'Vyřešeno 0 ze 4 situací';
  if (successCard) successCard.style.display = 'none';

  renderCurrentRulesQuestionCard(false);
}

function handleDynamicQuizAnswer(optIndex, isCorrect, buttonElement) {
  if (isRulesFlipping) return;

  const scenario = currentDynamicQuizScenarios[currentRulesQuestionIndex];
  if (!scenario) return;

  const activeBox = document.getElementById('quiz-active-box');
  const feedbackBox = document.getElementById('quiz-active-feedback');
  if (!activeBox || !feedbackBox) return;

  if (isCorrect) {
    isRulesFlipping = true;
    const buttons = activeBox.querySelectorAll('.quiz-option-btn');
    buttons.forEach(b => {
      b.disabled = true;
      b.classList.remove('selected-wrong');
    });
    buttonElement.classList.add('selected-correct');
    activeBox.classList.add('is-completed');

    const safeExplanation = typeof escapeHtml === 'function' ? escapeHtml(scenario.explanation) : scenario.explanation;
    feedbackBox.className = 'quiz-feedback-box is-correct';
    feedbackBox.innerHTML = `
      <div class="modtest-feedback-header is-correct">
        <svg class="ui-icon-svg ui-icon-svg--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
        <span>SPRÁVNĚ</span>
      </div>
      <div class="modtest-feedback-content">${safeExplanation}</div>
    `;

    const total = currentDynamicQuizScenarios.length || 4;
    const currentCompleted = currentRulesQuestionIndex + 1;
    const pct = Math.round((currentCompleted / total) * 100);

    const bar = document.getElementById('rules-quiz-progress-bar');
    const counter = document.getElementById('rules-quiz-counter');
    if (bar) bar.style.width = pct + '%';
    if (counter) counter.textContent = `Vyřešeno ${currentCompleted} ze ${total} situací`;

    // Satisfying Apple 3D flip out to next question
    setTimeout(() => {
      activeBox.classList.remove('is-flipping-in');
      activeBox.classList.add('is-flipping-out');

      setTimeout(() => {
        currentRulesQuestionIndex++;
        isRulesFlipping = false;
        renderCurrentRulesQuestionCard(true);
      }, 380);
    }, 950);
  } else {
    buttonElement.classList.add('selected-wrong');
    const safeWrong = typeof escapeHtml === 'function' ? escapeHtml(scenario.wrongFeedback) : scenario.wrongFeedback;
    feedbackBox.className = 'quiz-feedback-box is-wrong';
    feedbackBox.innerHTML = `
      <div class="modtest-feedback-header is-wrong">
        <svg class="ui-icon-svg ui-icon-svg--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        <span>ŠPATNÁ ODPOVĚĎ</span>
      </div>
      <div class="modtest-feedback-content">${safeWrong}</div>
    `;

    setTimeout(() => {
      buttonElement.classList.remove('selected-wrong');
    }, 1400);
  }
}

function initOrRenderRulesQuiz() {
  const container = document.getElementById('rules-quiz-dynamic-questions');
  if (!container) return;
  if (currentDynamicQuizScenarios.length === 0 || container.children.length === 0) {
    resetAndShuffleQuiz();
  }
}

// =========================================================================
// SECRET MODERATOR APPLICANT TEST (/modtest) - POOL OF 52 AUTHENTIC SCENARIOS
// Dynamicky se náhodně losuje 20 otázek se zachováním klíčových situací
// =========================================================================

// =========================================================================
// ZABEZPEČENÝ MODERÁTORSKÝ TEST (/modtest) - SERVER-SIDE EVALUATED
// Otázky se generují a vyhodnocují bezpečně na straně serveru bez odhalení odpovědí
// =========================================================================

let modtestSessionId = null;
let currentActiveModTestScenarios = [];
let currentModTestIndex = 0;
let modtestScore = 0;
let isModTestFlipping = false;
let modtestAnswersHistory = [];
let isModTestLoading = false;

/**
 * Renders modtest text: escapes HTML, then converts **bold** markers to <strong>.
 * Only allows <strong> tags – no other HTML injection possible.
 */
function renderModtestText(str) {
  if (!str) return '';
  const escaped = str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  return escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

async function loadModTestQuestionsFromServer() {
  if (isModTestLoading) return;
  isModTestLoading = true;

  const activeCard = document.getElementById('modtest-active-card');
  const viewport = document.getElementById('modtest-viewport');
  const applicantForm = document.getElementById('modtest-applicant-form');
  const certCard = document.getElementById('modtest-certificate-card');

  if (applicantForm) transitionPanelVisibility(applicantForm, false, 'block');
  if (certCard) transitionPanelVisibility(certCard, false, 'block');
  if (viewport) transitionPanelVisibility(viewport, true, 'block');

  if (activeCard) {
    activeCard.className = 'modtest-card';
    activeCard.innerHTML = `
      <div class="modtest-card-head" style="text-align: center; padding: 40px 20px;">
        <div class="modtest-scenario-tag">ZABEZPEČENÝ TEST</div>
        <h3 class="modtest-question-title" style="margin-top: 15px;">Generuji test ze zabezpečeného serveru...</h3>
        <p class="modtest-question-desc" style="color: #94a3b8; max-width: 540px; margin: 10px auto 0;">Otázky a hodnocení probíhají v reálném čase přes ověřené API MYCHAL SMP.</p>
        <div style="margin-top: 25px;"><span class="btn-spinner"></span></div>
      </div>
    `;
  }

  try {
    const res = await apiFetch('/api/modtest/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    const data = await res.json();
    if (!data.success || !data.questions || data.questions.length === 0) {
      throw new Error(data.message || 'Nepodařilo se načíst otázky testu.');
    }

    modtestSessionId = data.sessionId;
    currentActiveModTestScenarios = data.questions;
    currentModTestIndex = 0;
    modtestScore = 0;
    modtestAnswersHistory = [];
    isModTestLoading = false;
    renderModTestCard(false);
  } catch (err) {
    isModTestLoading = false;
    if (activeCard) {
      activeCard.innerHTML = `
        <div class="modtest-card-head" style="text-align: center; padding: 40px 20px;">
          <div class="modtest-scenario-tag" style="background: rgba(245, 21, 21, 0.15); color: #f51515; border-color: rgba(245, 21, 21, 0.3);">CHYBA PŘIPOJENÍ</div>
          <h3 class="modtest-question-title" style="margin-top: 15px;">Nepodařilo se spojit se serverem testu</h3>
          <p class="modtest-question-desc" style="color: #94a3b8; max-width: 500px; margin: 10px auto 0;">Zkontroluj připojení k internetu nebo zkus načtení zopakovat.</p>
          <button type="button" class="btn-primary" onclick="restartModTest()" style="margin-top: 20px; display: inline-flex; align-items: center; gap: 8px;">
            ${UI_ICONS.refresh} <span>Zkusit znovu</span>
          </button>
        </div>
      `;
    }
  }
}

function updateModTestPhaseUI(phaseNumber) {
  const p1 = document.getElementById('modtest-pstep-1');
  const p2 = document.getElementById('modtest-pstep-2');
  const p3 = document.getElementById('modtest-pstep-3');
  if (!p1 || !p2 || !p3) return;

  p1.classList.remove('active', 'completed');
  p2.classList.remove('active', 'completed');
  p3.classList.remove('active', 'completed');

  if (phaseNumber === 1) {
    p1.classList.add('active');
  } else if (phaseNumber === 2) {
    p1.classList.add('completed');
    p2.classList.add('active');
  } else {
    p1.classList.add('completed');
    p2.classList.add('completed');
    p3.classList.add('active');
  }
}

function renderModTestCard(isTransition = false) {
  const activeCard = document.getElementById('modtest-active-card');
  const viewport = document.getElementById('modtest-viewport');
  const applicantForm = document.getElementById('modtest-applicant-form');
  const certCard = document.getElementById('modtest-certificate-card');

  if (!activeCard || !viewport) return;

  if (currentActiveModTestScenarios.length === 0) {
    loadModTestQuestionsFromServer();
    return;
  }

  const total = currentActiveModTestScenarios.length || 20;

  if (currentModTestIndex >= total) {
    viewport.style.display = 'none';
    if (certCard) certCard.style.display = 'none';
    if (applicantForm) {
      applicantForm.style.display = 'block';
      setTimeout(() => {
        applicantForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 200);
    }
    return;
  }

  const sc = currentActiveModTestScenarios[currentModTestIndex];
  if (!sc) return;

  updateModTestPhaseUI(sc.phase);

  const qNum = currentModTestIndex + 1;
  const safeTag = typeof escapeHtml === 'function' ? escapeHtml(sc.tag) : sc.tag;
  const safeTitle = typeof escapeHtml === 'function' ? escapeHtml(sc.title) : sc.title;
  const safeDesc = renderModtestText(sc.description);

  const optionsToRender = sc.options || [];
  const optionsHtml = optionsToRender.map((opt, optIndex) => {
    const safeText = typeof escapeHtml === 'function' ? escapeHtml(opt.text) : opt.text;
    const optId = (opt.id !== undefined) ? opt.id : optIndex;
    return `
      <button type="button" class="modtest-opt-btn" data-opt="${optId}" onclick="handleModTestAnswer(${optId}, this)">
        <span class="modtest-opt-indicator"></span>
        <span class="modtest-opt-text">${safeText}</span>
      </button>
    `;
  }).join('');

  activeCard.className = `modtest-card ${isTransition ? 'is-flipping-in' : ''}`;
  activeCard.innerHTML = `
    <div class="modtest-card-head">
      <div class="modtest-meta-line">
        <span class="modtest-scenario-tag">${safeTag}</span>
        <span class="modtest-counter-badge">Otázka ${qNum} z ${total}</span>
      </div>
      <h3 class="modtest-question-title">${safeTitle}</h3>
      <p class="modtest-question-desc">${safeDesc}</p>
    </div>
    <div class="modtest-options-list">
      ${optionsHtml}
    </div>
    <div class="modtest-feedback-box" id="modtest-feedback-box"></div>
  `;
}

async function handleModTestAnswer(optId, btnElement) {
  if (isModTestFlipping) return;

  const sc = currentActiveModTestScenarios[currentModTestIndex];
  if (!sc) return;

  const activeCard = document.getElementById('modtest-active-card');
  const feedbackBox = document.getElementById('modtest-feedback-box');
  if (!activeCard || !feedbackBox) return;

  isModTestFlipping = true;

  const allBtns = activeCard.querySelectorAll('.modtest-opt-btn');
  allBtns.forEach(b => b.disabled = true);
  btnElement.classList.add('selected-loading');

  try {
    const res = await apiFetch('/api/modtest/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        sessionId: modtestSessionId,
        questionIndex: currentModTestIndex,
        selectedOptionId: optId
      })
    });
    const result = await res.json();
    btnElement.classList.remove('selected-loading');

    if (!result.success) {
      throw new Error(result.message || 'Chyba při ověřování odpovědi na serveru.');
    }

    const isCorrect = !!result.isCorrect;
    const correctOptId = result.correctOptionId;
    const safeExplanation = renderModtestText(result.explanation);

    if (isCorrect) {
      btnElement.classList.add('selected-correct', 'is-selected-correct');
      modtestScore++;
      modtestAnswersHistory.push({ index: currentModTestIndex, correct: true });

      feedbackBox.className = 'modtest-feedback-box is-correct';
      feedbackBox.innerHTML = `
        <div class="modtest-feedback-header is-correct">
          <svg class="ui-icon-svg ui-icon-svg--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
          <span>SPRÁVNÉ ROZHODNUTÍ</span>
        </div>
        <div class="modtest-feedback-content">${safeExplanation}</div>
      `;
    } else {
      btnElement.classList.add('selected-wrong', 'is-selected-wrong');
      modtestAnswersHistory.push({ index: currentModTestIndex, correct: false });

      // Zvýrazníme správnou možnost, kterou potvrdil server
      allBtns.forEach(b => {
        if (Number(b.getAttribute('data-opt')) === Number(correctOptId)) {
          b.classList.add('selected-correct', 'is-selected-correct');
        }
      });

      feedbackBox.className = 'modtest-feedback-box is-wrong';
      feedbackBox.innerHTML = `
        <div class="modtest-feedback-header is-wrong">
          <svg class="ui-icon-svg ui-icon-svg--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          <span>CHYBNÝ POSTUP</span>
        </div>
        <div class="modtest-feedback-content">${safeExplanation}</div>
      `;
    }

    // Plynulý Apple 3D přechod na další otázku
    const flipDelay = isCorrect ? 1200 : 1800;
    setTimeout(() => {
      activeCard.classList.remove('is-flipping-in');
      activeCard.classList.add('is-flipping-out');

      setTimeout(() => {
        currentModTestIndex++;
        isModTestFlipping = false;
        renderModTestCard(true);
      }, 380);
    }, flipDelay);

  } catch (err) {
    isModTestFlipping = false;
    allBtns.forEach(b => b.disabled = false);
    btnElement.classList.remove('selected-loading');
    showInlineFeedback(activeCard, 'Chyba spojení se serverem při ověření odpovědi.', 'error');
  }
}

function initOrRenderModTest() {
  const viewport = document.getElementById('modtest-viewport');
  const applicantForm = document.getElementById('modtest-applicant-form');
  const certCard = document.getElementById('modtest-certificate-card');

  if (!viewport) return;

  if (currentActiveModTestScenarios.length === 0) {
    loadModTestQuestionsFromServer();
  }

  if (currentModTestIndex === 0 && (!applicantForm || applicantForm.style.display === 'none') && (!certCard || certCard.style.display === 'none')) {
    transitionPanelVisibility(viewport, true, 'block');
  }
}

async function submitModeratorApplication(event) {
  if (event && event.preventDefault) event.preventDefault();

  const nickInput = document.getElementById('modtest-nick');
  const discordInput = document.getElementById('modtest-discord');
  const btnSubmit = document.getElementById('btn-submit-modtest');
  const applicantForm = document.getElementById('modtest-applicant-form');

  const nick = nickInput ? nickInput.value.trim() : '';
  const discord = discordInput ? discordInput.value.trim() : '';

  if (!nick || !discord) {
    showInlineFeedback(applicantForm || btnSubmit, 'Vyplň svůj Minecraft nick i Discord.', 'warning');
    return;
  }

  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span class="btn-spinner"></span> <span>Ověřuji výsledek na serveru...</span>';
  }

  let finalScore = modtestScore;
  let finalTotal = currentActiveModTestScenarios.length || 20;
  let finalStress = Math.round((finalScore / finalTotal) * 100);
  let finalPassed = finalScore >= 16;
  let finalCertCode = '';

  try {
    const res = await apiFetch('/api/modtest/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        sessionId: modtestSessionId,
        mcNick: nick,
        discordTag: discord
      })
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Nepodařilo se ověřit přihlášku na serveru.');
    }

    finalScore = data.score;
    finalTotal = data.total;
    finalStress = data.stressScore;
    finalPassed = data.passed;
    finalCertCode = data.certCode;
  } catch (err) {
    console.warn('[MODTEST SUBMIT ERR]', err);
    showInlineFeedback(applicantForm || btnSubmit, 'Nepodařilo se odeslat přihlášku. Zkus to za chvíli.', 'error');
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = `
        <svg class="ui-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        <span>Vyhodnotit & Odeslat přihlášku</span>
      `;
    }
    return;
  }

  // Hide form and show certificate
  const certCard = document.getElementById('modtest-certificate-card');
  if (applicantForm) transitionPanelVisibility(applicantForm, false, 'block');

  if (certCard) {
    transitionPanelVisibility(certCard, true, 'block');

    const statScore = document.getElementById('modtest-stat-score');
    const statStress = document.getElementById('modtest-stat-stress');
    const statStatus = document.getElementById('modtest-stat-status');
    const certRank = document.getElementById('modtest-cert-rank');
    const certDesc = document.getElementById('modtest-cert-desc');
    const certCodeEl = document.getElementById('modtest-cert-code');

    if (statScore) statScore.textContent = `${finalScore} / ${finalTotal}`;
    if (statStress) statStress.textContent = `${finalStress} %`;

    if (statStatus) {
      if (finalPassed) {
        statStatus.textContent = 'SCHVÁLEN';
        statStatus.style.color = '#21DE00';
      } else {
        statStatus.textContent = 'NEPROŠEL';
        statStatus.style.color = '#f51515';
      }
    }

    if (certRank) {
      if (finalScore >= 19) {
        certRank.textContent = 'ELITNÍ MODERÁTOR';
        certRank.style.color = '#21DE00';
      } else if (finalScore >= 16) {
        certRank.textContent = 'ZKUŠENÝ MODERÁTOR';
        certRank.style.color = '#0a67e5';
      } else if (finalScore >= 11) {
        certRank.textContent = 'KANDIDÁT V PŘÍPRAVĚ';
        certRank.style.color = '#ffaa00';
      } else {
        certRank.textContent = 'NEDOPORUČENO';
        certRank.style.color = '#f51515';
      }
    }

    const safeNick = typeof escapeHtml === 'function' ? escapeHtml(nick) : nick;
    if (certDesc) {
      if (finalPassed) {
        certDesc.innerHTML = `<strong>${safeNick}</strong> prokázal jistou znalost pravidel i odolnost vůči manipulaci s výsledkem ${finalScore} z ${finalTotal}. Zkopíruj kód níže a pošli ho do ticketu na Discordu.`;
      } else {
        certDesc.innerHTML = `<strong>${safeNick}</strong> dosáhl výsledku ${finalScore} z ${finalTotal}. Projdi si pravidla serveru a zkus test znovu s novou sadou otázek.`;
      }
    }

    if (certCodeEl) certCodeEl.textContent = finalCertCode;

    setTimeout(() => {
      certCard.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'nearest' });
    }, 200);
  }

  if (btnSubmit) {
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = `
      <svg class="ui-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      <span>Vyhodnotit & Odeslat přihlášku</span>
    `;
  }
}

function copyModTestResult() {
  const codeEl = document.getElementById('modtest-cert-code');
  if (!codeEl) return;
  const text = codeEl.textContent.trim();
  const btn = document.querySelector('.btn-copy-code');
  copyTextToClipboard(text).then(() => {
    if (btn) {
      triggerButtonFeedback(btn, 'Zkopírováno');
      if (!btn.querySelector('.btn-copy-label')) {
        const orig = btn.textContent;
        btn.textContent = 'Zkopírováno';
        setTimeout(() => { btn.textContent = orig; }, 1800);
      }
    }
  }).catch(() => {
    showInlineFeedback(btn || codeEl, `Kód certifikátu: ${text}`, 'info');
  });
}

function restartModTest() {
  modtestSessionId = null;
  currentActiveModTestScenarios = [];
  currentModTestIndex = 0;
  modtestScore = 0;
  isModTestFlipping = false;
  modtestAnswersHistory = [];

  const viewport = document.getElementById('modtest-viewport');
  const applicantForm = document.getElementById('modtest-applicant-form');
  const certCard = document.getElementById('modtest-certificate-card');

  if (applicantForm) transitionPanelVisibility(applicantForm, false, 'block');
  if (certCard) transitionPanelVisibility(certCard, false, 'block');
  if (viewport) transitionPanelVisibility(viewport, true, 'block');

  loadModTestQuestionsFromServer();
  window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}

// Global window exposure for inline handlers
window.RULES_QUIZ_SCENARIOS = RULES_QUIZ_SCENARIOS;
window.resetAndShuffleQuiz = resetAndShuffleQuiz;
window.handleDynamicQuizAnswer = handleDynamicQuizAnswer;
window.initOrRenderRulesQuiz = initOrRenderRulesQuiz;

window.currentActiveModTestScenarios = currentActiveModTestScenarios;
window.initOrRenderModTest = initOrRenderModTest;
window.handleModTestAnswer = handleModTestAnswer;
window.submitModeratorApplication = submitModeratorApplication;
window.copyModTestResult = copyModTestResult;
window.restartModTest = restartModTest;

// Survival backup archive was retired per owner specifications (Closed · RIP).
window.openArchiveModal = function () { };
window.closeArchiveModal = function () { };
window.closeArchiveModalOutside = function () { };
window.handleArchiveDownload = function () { };

// ─── PERMAFROST LAUNCH COUNTDOWN (10. 10. 2026 V 20:00) ──────────────
(function () {
  // Oct 10, 2026 20:00:00 CEST (18:00:00 UTC)
  const LAUNCH_DATE = new Date('2026-10-10T20:00:00+02:00');
  const timerEl = document.getElementById('stray-countdown-val');
  if (!timerEl) return;

  function pad(n) { return n < 10 ? '0' + n : n; }

  function updatePermafrostCountdown() {
    const now = new Date();
    const diff = LAUNCH_DATE - now;

    if (diff <= 0) {
      timerEl.innerHTML = '<span class="badge-live-pulse-cyan"></span> OTEVŘENO · SPUŠTĚNO';
      timerEl.style.color = '#21DE00';
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    timerEl.textContent = `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  }

  updatePermafrostCountdown();
  setInterval(updatePermafrostCountdown, 1000);
})();

// ─── UNIFIED SEGMENTED TABS & SLIDING PILLS GEOMETRY ─────────────────
function updateAllSegmentedPills() {
  if (typeof updateMainNavPill === 'function') updateMainNavPill();
  if (typeof updateSmpModePill === 'function') updateSmpModePill();
  if (typeof updateTimeframePill === 'function') updateTimeframePill();
  if (typeof updateStatsMetricPill === 'function') updateStatsMetricPill();
  if (typeof updateTierSliderPosition === 'function') updateTierSliderPosition();
  if (typeof updateLauncherOsPill === 'function') updateLauncherOsPill();
  if (typeof updateMediaTogglePill === 'function') updateMediaTogglePill();
  if (typeof updateRulesFilterPill === 'function') updateRulesFilterPill();
  if (typeof updateBugCatPill === 'function') updateBugCatPill();
}

window.addEventListener('resize', updateAllSegmentedPills, { passive: true });
window.addEventListener('load', () => {
  setTimeout(updateAllSegmentedPills, 60);
});
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(updateAllSegmentedPills, 20);
  initTombstoneCandle();
});

// ─── TOMBSTONE MEMORIAL CANDLE TRIBUTE (Live API Tracked) ─────────────────
let isTombstoneCandleSubmitting = false;

async function initTombstoneCandle() {
  const btn = document.getElementById('tombstone-candle-btn');
  const countEl = document.getElementById('tombstone-candle-count');
  const textEl = document.getElementById('tombstone-candle-text');
  if (!btn || !countEl) return;

  // 1. Okamžitý lokální render bez probliknutí
  const baseCount = 43;
  const localLit = localStorage.getItem('smp_tombstone_candle_lit') === 'true';
  const localBonus = parseInt(localStorage.getItem('smp_tombstone_candle_bonus') || '0', 10);
  const initialCount = baseCount + (localBonus > 0 ? 1 : 0);

  countEl.textContent = initialCount.toLocaleString('cs-CZ');
  if (localLit) {
    btn.classList.add('lit');
    if (textEl) textEl.textContent = 'Svíčka hoří · Odpočívej v pokoji';
  } else {
    btn.classList.remove('lit');
    if (textEl) textEl.textContent = 'Vzdát úctu · Zapálit svíčku';
  }

  // 2. Asynchronní synchronizace s reálnou databází
  try {
    const res = await apiFetch('/api/tombstone/candles', {}, 4000);
    if (res && res.ok) {
      const data = await res.json();
      if (data && typeof data.count === 'number') {
        countEl.textContent = data.count.toLocaleString('cs-CZ');
        if (data.userLit) {
          btn.classList.add('lit');
          if (textEl) textEl.textContent = 'Svíčka hoří · Odpočívej v pokoji';
          localStorage.setItem('smp_tombstone_candle_lit', 'true');
          localStorage.setItem('smp_tombstone_candle_bonus', '1');
        } else {
          btn.classList.remove('lit');
          if (textEl) textEl.textContent = 'Vzdát úctu · Zapálit svíčku';
          localStorage.setItem('smp_tombstone_candle_lit', 'false');
          localStorage.setItem('smp_tombstone_candle_bonus', '0');
        }
      }
    }
  } catch (err) {
    // Tichý fallback na lokální data
  }
}

async function tributeTombstone(btn) {
  if (!btn || isTombstoneCandleSubmitting) return;

  const textEl = document.getElementById('tombstone-candle-text');
  const countEl = document.getElementById('tombstone-candle-count');
  const wasLit = btn.classList.contains('lit');
  const currentCountText = countEl ? countEl.textContent.replace(/\D/g, '') : '43';
  let curCount = parseInt(currentCountText, 10) || 43;

  // Klientský debounce / ochrana proti spamu
  isTombstoneCandleSubmitting = true;
  setTimeout(() => { isTombstoneCandleSubmitting = false; }, 1200);

  // Optimistický okamžitý lokální update v UI (Rule 25: local inline state)
  if (wasLit) {
    btn.classList.remove('lit');
    curCount = Math.max(43, curCount - 1);
    if (textEl) textEl.textContent = 'Vzdát úctu · Zapálit svíčku';
    if (countEl) countEl.textContent = curCount.toLocaleString('cs-CZ');
    localStorage.setItem('smp_tombstone_candle_lit', 'false');
    localStorage.setItem('smp_tombstone_candle_bonus', '0');
  } else {
    btn.classList.add('lit');
    curCount += 1;
    if (textEl) textEl.textContent = 'Svíčka hoří · Odpočívej v pokoji';
    if (countEl) countEl.textContent = curCount.toLocaleString('cs-CZ');
    localStorage.setItem('smp_tombstone_candle_lit', 'true');
    localStorage.setItem('smp_tombstone_candle_bonus', '1');
  }

  // Reálné odeslání do API s rate limitem
  try {
    const res = await apiFetch('/api/tombstone/candle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: wasLit ? 'extinguish' : 'light' })
    }, 5000);

    if (res) {
      if (res.status === 429) {
        if (textEl) {
          textEl.textContent = 'Počkej chvíli před dalším zapálením';
          setTimeout(() => {
            textEl.textContent = wasLit ? 'Svíčka hoří · Odpočívej v pokoji' : 'Vzdát úctu · Zapálit svíčku';
          }, 2200);
        }
        if (wasLit) {
          btn.classList.add('lit');
        } else {
          btn.classList.remove('lit');
        }
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.count === 'number') {
          if (countEl) countEl.textContent = data.count.toLocaleString('cs-CZ');
          if (data.lit) {
            btn.classList.add('lit');
            if (textEl) textEl.textContent = 'Svíčka hoří · Odpočívej v pokoji';
            localStorage.setItem('smp_tombstone_candle_lit', 'true');
            localStorage.setItem('smp_tombstone_candle_bonus', '1');
          } else {
            btn.classList.remove('lit');
            if (textEl) textEl.textContent = 'Vzdát úctu · Zapálit svíčku';
            localStorage.setItem('smp_tombstone_candle_lit', 'false');
            localStorage.setItem('smp_tombstone_candle_bonus', '0');
          }
        }
      }
    }
  } catch (err) {
    // V případě síťové chyby zůstává optimistický stav v localStorage
  }
}


