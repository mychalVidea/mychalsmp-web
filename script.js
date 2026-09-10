/* =============================================
   MYCHAL SMP – script.js
   ============================================= */

// ---- TAB SWITCHING & ROUTING ----
function showTab(name) {
  executeTabSwitch(name, true);
}

function handleUrlRouting() {
  const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
  const hash = window.location.hash.toLowerCase().replace(/^#/, '');
  const route = hash || path.split('/').pop();

  if (route === 'smpplus' || route === 'smp-plus' || route === 'vip' || route === 'smp+') {
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
  } else if (route === 'napady' || route === 'napad' || route === 'ideas') {
    executeTabSwitch('napady', false);
  } else if (route === 'privacy' || route === 'gdpr' || route === 'soukromi' || route === 'data') {
    executeTabSwitch('privacy', false);
  } else if (route === 'terms' || route === 'tos' || route === 'podminky') {
    executeTabSwitch('terms', false);
  } else if (route === 'home' || route === '' || route === 'index.html') {
    executeTabSwitch('home', false);
  }
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

  window.scrollTo({ top: 0, behavior: 'smooth' });

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
  }

  if (updateUrl) {
    let urlPath = '/' + name;
    if (name === 'smp-plus') urlPath = '/smpplus';
    else if (name === 'stats') urlPath = '/statistiky';
    else if (name === 'join') urlPath = '/howto';
    else if (name === 'bugs') urlPath = '/bug';
    else if (name === 'napady') urlPath = '/napady';
    else if (name === 'home') urlPath = '/';

    if (window.location.pathname !== urlPath) {
      history.pushState({ tab: name }, '', urlPath);
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

// ---- COPY IP ----
function copyIP(event) {
  const ip = 'mychalsmp.xyz';
  navigator.clipboard.writeText(ip).then(() => {
    // 1. Show beautiful toast notification
    showToast('📋 IP zkopírována!');

    // 2. Local feedback updates
    if (event && event.currentTarget) {
      const element = event.currentTarget;

      // If it's the copy button on the Home hero
      if (element.id === 'copy-btn' || element.classList.contains('hero-ip-bar')) {
        const copyBtn = document.getElementById('copy-btn');
        if (copyBtn) {
          const origText = copyBtn.innerHTML;
          copyBtn.innerHTML = '✅ Zkopírováno!';
          copyBtn.classList.add('copied');
          setTimeout(() => {
            copyBtn.innerHTML = origText;
            copyBtn.classList.remove('copied');
          }, 2000);
        }
      }
      // If it's the quickstart ip box
      else if (element.classList.contains('quickstart-ip-box')) {
        const copyBtn = element.querySelector('.quickstart-copy-btn');
        if (copyBtn) {
          const origText = copyBtn.innerHTML;
          copyBtn.innerHTML = '<i class="fa-solid fa-check" style="color: #4ade80;"></i>';
          setTimeout(() => {
            copyBtn.innerHTML = origText;
          }, 2000);
        }
      }
      // If it's the join-ip-container in the header
      else if (element.classList.contains('join-ip-container')) {
        const copyBtn = element.querySelector('.join-ip-copy-btn');
        if (copyBtn) {
          const origText = copyBtn.innerHTML;
          copyBtn.innerHTML = '✅ Zkopírováno!';
          copyBtn.classList.add('copied');
          setTimeout(() => {
            copyBtn.innerHTML = origText;
            copyBtn.classList.remove('copied');
          }, 2000);
        }
      }
      // If it's the join-timeline-ip container in step 2
      else if (element.classList.contains('join-timeline-ip')) {
        const indicator = element.querySelector('.join-copy-indicator');
        if (indicator) {
          const origText = indicator.innerHTML;
          indicator.innerHTML = '✅ Zkopírováno!';
          element.classList.add('copied');
          setTimeout(() => {
            indicator.innerHTML = origText;
            element.classList.remove('copied');
          }, 2000);
        }
      }
    }
  }).catch(err => {
    console.error('Failed to copy: ', err);
  });
}

function copyTicketId(e) {
  if (e && e.stopPropagation) e.stopPropagation();
  const ticketIdEl = document.getElementById('ticket-id-display');
  if (!ticketIdEl) return;
  const text = ticketIdEl.textContent.trim();
  navigator.clipboard.writeText(text).then(() => {
    showToast(`📋 Číslo tiketu ${text} zkopírováno!`);
    const btn = document.querySelector('.ticket-copy-btn');
    if (btn) {
      const orig = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-check" style="color: #4ade80;"></i>';
      setTimeout(() => { btn.innerHTML = orig; }, 2000);
    }
  }).catch(() => {
    showToast(`Číslo tiketu: ${text}`);
  });
}

// ---- FLOATING TOAST NOTIFICATION ----
function showToast(message) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.innerHTML = message;

  container.appendChild(toast);

  // Trigger animations in next frames
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Transition out and cleanup
  setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hide');
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 2200);
}

function copyText(text, el) {
  navigator.clipboard.writeText(text).then(() => {
    const orig = el.textContent;
    el.textContent = '✅';
    setTimeout(() => el.textContent = orig, 1800);
  });
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

// Keyboard nav for lightbox
document.addEventListener('keydown', (e) => {
  const lb = document.getElementById('lightbox');
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') lightboxPrev(e);
  if (e.key === 'ArrowRight') lightboxNext(e);
});

// ---- NAVBAR SCROLL EFFECT ----
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (window.scrollY > 40) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
}, { passive: true });

// ---- INTERSECTION OBSERVER (animate cards) ----
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.feature-card, .step-card, .rule-card, .gallery-item, .join-step, .smp-card, .smp-checkout-card, .smp-hero-left').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity .5s ease, transform .5s ease';
  observer.observe(el);
});

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
        const res = await fetch(url);
        if (res.ok) {
          data = await res.json();
          if (data && (data.whitelist_count !== undefined || data.total_money !== undefined)) break;
        }
      } catch (e) { }
    }

    if (data) {
      console.log('[PUBLIC STATS] loaded:', data);
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
  el.setAttribute('data-target', newVal);
  if (statsAnimated) {
    animateCounter(el, newVal);
  }
}

function animateCounter(el, targetValue) {
  const duration = 1500; // 1.5 seconds
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out quadratic
    const easeProgress = progress * (2 - progress);
    const currentValue = Math.floor(start + easeProgress * (targetValue - start));

    if (el.id === 'stat-money') {
      el.textContent = '$' + formatCompactNumber(currentValue);
    } else {
      const suffix = el.id === 'stat-deaths' ? '' : '+';
      el.textContent = currentValue + suffix;
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      if (el.id === 'stat-money') {
        el.textContent = '$' + formatCompactNumber(targetValue);
      } else {
        const suffix = el.id === 'stat-deaths' ? '' : '+';
        el.textContent = targetValue + suffix;
      }
    }
  }
  requestAnimationFrame(update);
}

let skinDebounceTimer = null;

// ---- LIVE CHAT PREVIEW & REALTIME SKIN AVATAR ----
function updatePreviewName(val) {
  const preview = document.getElementById('smp-preview-name');
  const previewHead = document.getElementById('smp-preview-head');
  const inputHead = document.getElementById('nickname-input-head');

  const cleanVal = val.trim();
  if (preview) {
    preview.textContent = cleanVal ? cleanVal : 'Hrac';
  }

  // Debounce skin lookup to avoid spamming mc-heads
  clearTimeout(skinDebounceTimer);
  skinDebounceTimer = setTimeout(() => {
    const targetNick = (cleanVal && /^[a-zA-Z0-9_]{2,16}$/.test(cleanVal)) ? cleanVal : 'MHF_Question';
    const avatarUrl = `https://mc-heads.net/avatar/${encodeURIComponent(targetNick)}/28`;

    [previewHead, inputHead].forEach(head => {
      if (head) {
        head.src = avatarUrl;
        head.classList.remove('avatar-pop');
        void head.offsetWidth; // Trigger reflow for animation restart
        head.classList.add('avatar-pop');
      }
    });
  }, 280);
}

// ---- TEBEX CHECKOUT CONFIG ----
async function checkoutSMP() {
  const nickInput = document.getElementById('mc-username');
  const nickname = nickInput ? nickInput.value.trim() : '';

  if (!nickname) {
    showToast('⚠️ Zadej nejprve svůj Minecraft nick!');
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
    showToast('⚠️ Neplatný nick! Použij 2-16 znaků (a-z, 0-9, _).');
    if (nickInput) {
      nickInput.classList.remove('shake-input');
      void nickInput.offsetWidth;
      nickInput.classList.add('shake-input');
    }
    return;
  }

  // Check mandatory terms and immediate delivery consent
  const consentCb = document.getElementById('smp-consent-terms');
  if (consentCb && !consentCb.checked) {
    showToast('⚠️ Pro nákup musíš potvrdit souhlas s Podmínkami služby a okamžitým plněním!');
    const consentWrapper = document.getElementById('smp-consent-wrapper');
    if (consentWrapper) {
      consentWrapper.classList.remove('shake-input');
      void consentWrapper.offsetWidth;
      consentWrapper.classList.add('shake-input');
    }
    consentCb.focus();
    return;
  }

  const btn = document.querySelector('.btn-purchase');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<span class="btn-spinner"></span> Načítám košík...';
  btn.disabled = true;

  try {
    const response = await fetch('https://api.6767111.xyz/api/tebex/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nickname })
    });

    const data = await response.json();
    if (data.success && data.url) {
      window.open(data.url, '_blank');
    } else {
      alert('Chyba: ' + (data.message || 'Nepodařilo se vytvořit checkout odkaz. Zkontroluj konfiguraci v .env.'));
    }
  } catch (err) {
    console.error(err);
    alert('Chyba při komunikaci se serverem.');
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

// Load stats on page load
document.addEventListener('DOMContentLoaded', () => {
  loadStats();

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
    window.history.replaceState({}, document.title, window.location.pathname);
    showTab('media');
  } else {
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
        <p class="smp-manage-desc">Pro zrušení nebo správu svého SMP+ členství se musíš nejprve přihlásit přes Discord.</p>
        <button type="button" onclick="loginViaDiscord()" class="btn-discord-login" style="width: 100%; justify-content: center;">
          <i class="fa-brands fa-discord"></i> Přihlásit se přes Discord
        </button>
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
    const res = await fetch('https://api.6767111.xyz/api/smpplus/status', {
      headers: getAuthHeaders()
    });

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('auth_token');
      container.innerHTML = `
        <div class="smp-manage-unauth">
          <p class="smp-manage-desc">Tvé přihlášení vypršelo. Přihlas se prosím znovu přes Discord.</p>
          <button type="button" onclick="loginViaDiscord()" class="btn-discord-login" style="width: 100%; justify-content: center;">
            <i class="fa-brands fa-discord"></i> Přihlásit se přes Discord
          </button>
        </div>
      `;
      return;
    }

    const data = await res.json();

    // 2. Logged in, but account NOT linked via /dlink
    if (!data.linked) {
      container.innerHTML = `
        <div class="smp-manage-unlinked">
          <div style="display: flex; align-items: flex-start; gap: 12px;">
            <span style="font-size: 1.5rem; line-height: 1;">⚠️</span>
            <div>
              <strong style="color: #f59e0b; display: block; margin-bottom: 4px;">Nemáš propojený Minecraft účet!</strong>
              <p class="smp-manage-desc">Pro správu nebo zrušení SMP+ musíš mít účet spárovaný. Připoj se na server <strong>mychalsmp.xyz</strong> a napiš do chatu:</p>
            </div>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.25); padding: 10px 14px; border-radius: 8px;">
            <code class="dlink-code-badge" onclick="copyDlinkCmd()" title="Kliknutím zkopíruješ">/dlink <i class="fa-regular fa-copy" style="font-size: 0.85em; opacity: 0.8;"></i></code>
            <button type="button" onclick="checkSmpPlusStatus()" class="btn-secondary" style="padding: 8px 14px; font-size: 0.85rem;">
              <i class="fa-solid fa-arrows-rotate"></i> Zkontrolovat
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
      let expiryText = 'Aktivní předplatné';
      if (data.expiresAt) {
        const d = new Date(data.expiresAt);
        expiryText = `Platné do: ${d.toLocaleDateString('cs-CZ')} (${d.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })})`;
      }

      container.innerHTML = `
        <div class="smp-manage-status-box">
          <div class="smp-user-info-row">
            <div class="smp-user-profile">
              <img src="https://mc-heads.net/avatar/${data.mcNick}/32" alt="${data.mcNick}">
              <div>
                <span class="nick">${data.mcNick}</span>
                <span style="display: block; font-size: 0.8rem; color: #94a3b8;">${expiryText}</span>
              </div>
            </div>
            <span class="smp-badge-active"><i class="fa-solid fa-crown"></i> SMP+</span>
          </div>
          <p class="smp-manage-desc">Tvé předplatné je aktivní. Pokud si přeješ členství ukončit a odebrat výhody, můžeš ho níže zrušit.</p>
          <button type="button" class="btn-cancel-smpplus" onclick="confirmCancelSmpPlus()">
            <i class="fa-solid fa-ban"></i> Zrušit SMP+ členství
          </button>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="smp-manage-status-box">
          <div class="smp-user-info-row">
            <div class="smp-user-profile">
              <img src="https://mc-heads.net/avatar/${data.mcNick}/32" alt="${data.mcNick}">
              <span class="nick">${data.mcNick}</span>
            </div>
            <span class="smp-badge-inactive">Neaktivní</span>
          </div>
          <p class="smp-manage-desc">Propojený účet <strong>${data.mcNick}</strong> momentálně nemá aktivní SMP+ členství.</p>
        </div>
      `;
    }
  } catch (err) {
    console.error('[CHECK SMP+ STATUS ERR]', err);
    container.innerHTML = `
      <div style="color: #ef4444; padding: 10px 0;">
        Nepodařilo se načíst stav členství. <button type="button" onclick="checkSmpPlusStatus()" style="background: none; border: none; color: #38bdf8; cursor: pointer; text-decoration: underline;">Zkusit znovu</button>
      </div>
    `;
  }
}

function copyDlinkCmd() {
  navigator.clipboard.writeText('/dlink').then(() => {
    if (typeof showToast === 'function') {
      showToast('📋 Příkaz /dlink byl zkopírován do schránky!');
    }
  }).catch(() => { });
}

function confirmCancelSmpPlus() {
  const modal = document.getElementById('smp-cancel-modal');
  const desc = document.getElementById('smp-cancel-modal-desc');
  if (desc && cachedSmpNick) {
    desc.innerHTML = `Opravdu si přeješ zrušit SMP+ členství pro hráče <strong>${cachedSmpNick}</strong>?<br><br>Okamžitě přijdeš o všechny výhody SMP+ (větší Ender truhla, barva nicku, rychlejší teleporty, 14 domovů) ve hře i na Discordu.`;
  }
  if (modal) modal.style.display = 'flex';
}

function closeCancelModal() {
  const modal = document.getElementById('smp-cancel-modal');
  if (modal) modal.style.display = 'none';
}

async function executeCancelSmpPlus() {
  const btn = document.getElementById('btn-confirm-cancel-smpplus');
  const spinner = document.getElementById('cancel-btn-spinner');
  if (btn) btn.disabled = true;
  if (spinner) spinner.style.display = 'inline-block';

  try {
    const res = await fetch('https://api.6767111.xyz/api/smpplus/cancel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });

    const data = await res.json();
    closeCancelModal();

    if (data.success) {
      if (typeof showToast === 'function') {
        showToast('✅ ' + data.message);
      }
      checkSmpPlusStatus();
    } else {
      if (typeof showToast === 'function') {
        showToast('❌ ' + (data.message || 'Chyba při rušení členství.'));
      }
    }
  } catch (err) {
    console.error('[CANCEL SMP+ ERR]', err);
    closeCancelModal();
    if (typeof showToast === 'function') {
      showToast('❌ Chyba při komunikaci se serverem.');
    }
  } finally {
    if (btn) btn.disabled = false;
    if (spinner) spinner.style.display = 'none';
  }
}

// ---- CHECK MEDIA STATUS ----
async function checkMediaStatus() {
  const token = localStorage.getItem('auth_token');
  const statusBox = document.getElementById('media-status-box');
  const applyForm = document.getElementById('media-apply-form');
  const loginBox = document.getElementById('media-login-box');

  if (!statusBox || !applyForm || !loginBox) return;

  if (!token) {
    statusBox.style.display = 'none';
    applyForm.style.display = 'none';
    loginBox.style.display = 'block';
    return;
  }

  statusBox.style.display = 'block';
  applyForm.style.display = 'none';
  loginBox.style.display = 'none';
  statusBox.innerHTML = '<div class="media-status-center"><div class="status-pending-icon"><span class="status-question">?</span><div class="status-spinner"></div></div><p style="text-align:center; margin-top:12px;">Ověřuji stav tvé žádosti...</p></div>';

  try {
    const res = await fetch('https://api.6767111.xyz/api/media/status', {
      headers: getAuthHeaders()
    });

    if (res.status === 401) {
      localStorage.removeItem('auth_token');
      statusBox.style.display = 'none';
      applyForm.style.display = 'none';
      loginBox.style.display = 'block';
      return;
    }

    const data = await res.json();
    // If user has no request — show the form
    // If user has no request — show the form
    if (!data.success || !data.hasRequest) {
      statusBox.style.display = 'none';
      applyForm.style.display = 'block';
      loginBox.style.display = 'none';
      if (data.mcNick) {
        const mcInput = document.getElementById('media-mc-nick');
        if (mcInput && !mcInput.value) mcInput.value = data.mcNick;
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
          <div class="media-status-center">
            <div class="status-pending-icon"><span class="status-question">?</span><div class="status-spinner"></div></div>
          </div>
          <h3>Žádost se posuzuje</h3>
          <p>Tvoje žádost o Media Rank byla odeslána a čeká na schválení administrátorem.</p>
          <div class="status-details">
            ${mcNick ? `<div><strong>Minecraft Nick:</strong> ${mcNick}</div>` : ''}
            <div><strong>YouTube:</strong> ${youtubeUrl || 'Nepřipojeno'}</div>
            <div><strong>Kick:</strong> ${kickUrl || 'Nepřipojeno'}</div>
            <div><strong>TikTok:</strong> ${tiktokUrl || 'Nepřipojeno'}</div>
            <div><strong>Twitch:</strong> ${twitchUrl || 'Nepřipojeno'}</div>
          </div>
        </div>
      `;
    } else if (status === 'approved') {
      statusBox.innerHTML = `
        <div class="media-status-card media-status--approved">
          <div class="media-status-center">
            <div class="status-approved-icon">✓</div>
          </div>
          <h3>Žádost Schválena!</h3>
          <p>Gratulujeme! Tvoje žádost o Media Rank byla schválena. Rank máš aktivní ve hře i na Discordu.</p>
          <div style="margin-top: 20px; padding: 15px; background: rgba(10, 167, 100, 0.06); border-left: 4px solid #16a34a; border-radius: 4px; text-align: left;">
            <strong style="color: #16a34a; display: block; margin-bottom: 8px;">✅ UPOZORNĚNÍ:</strong>
            Pro udržení Media ranku uváděj v popiscích IP <strong>join.mychalsmp.xyz</strong> nebo <strong>mychalsmp.xyz</strong> a používej hashtag <strong>#mychalsmp</strong>.
          </div>
        </div>
      `;
    } else if (status === 'rejected') {
      // If server returned daysLeft > 0, show rejected state with countdown; otherwise allow reapply (show form)
      if (daysLeft > 0) {
        statusBox.innerHTML = `
          <div class="media-status-card media-status--rejected">
            <div class="media-status-center">
              <div class="status-rejected-icon">✕</div>
            </div>
            <h3>Žádost Zamítnuta</h3>
            <p>Tvoje žádost o Media Rank byla zamítnuta.</p>
            <div class="reject-reason"><strong>Důvod zamítnutí:</strong> ${reason || 'Neuveden'}</div>
            <div style="margin-top:12px; color: var(--text-muted);">Znovu můžeš požádat za <strong>${daysLeft} dní</strong>.</div>
          </div>
        `;
      } else {
        // allow reapply
        statusBox.style.display = 'none';
        applyForm.style.display = 'block';
        loginBox.style.display = 'none';
        return;
      }
    } else if (status === 'removed') {
      // Admin odebrán rank - může znovu podat
      statusBox.innerHTML = `
        <div class="media-status-card media-status--rejected">
          <div class="media-status-center">
            <div class="status-rejected-icon" style="background: rgba(245,158,11,0.15); border-color: rgba(245,158,11,0.5); color: #f59e0b; font-size: 1.8rem;">!</div>
          </div>
          <h3 style="color: #f59e0b;">Media Rank Odebrán</h3>
          <p>Tvůj Media rank byl odebrán administrátorem.</p>
          ${reason ? `<div class="reject-reason"><strong>Důvod:</strong> ${reason}</div>` : ''}
          <div style="margin-top:16px;">
            <button class="btn-primary" onclick="
              document.getElementById('media-status-box').style.display='none';
              document.getElementById('media-apply-form').style.display='block';
            " style="background: linear-gradient(135deg, #f59e0b, #d97706); border: none; color: white; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 1rem;">🔄 Podat žádost znovu</button>
          </div>
        </div>
      `;
    }
  } catch (err) {

    statusBox.innerHTML = '<p class="error-text" style="color: #ef4444; text-align: center;">Chyba při komunikaci se serverem.</p>';
  }
}

function resetMediaForm() {
  const statusBox = document.getElementById('media-status-box');
  const applyForm = document.getElementById('media-apply-form');
  if (statusBox && applyForm) {
    statusBox.style.display = 'none';
    applyForm.style.display = 'block';
    applyForm.reset();
  }
}

// ---- SUBMIT MEDIA APPLICATION (WITH ADVANCED ANIMATION) ----
async function submitMediaApplication(event) {
  event.preventDefault();

  const mcNick = document.getElementById('media-mc-nick')?.value.trim();
  const yt = document.getElementById('media-yt').value.trim();
  const tt = document.getElementById('media-tt').value.trim();
  const twitch = document.getElementById('media-twitch').value.trim();
  const kick = document.getElementById('media-kick').value.trim();
  const ageConfirm = document.getElementById('media-age-confirm')?.checked;

  if (!mcNick) {
    alert('Vyplň svůj Minecraft nick!');
    return;
  }
  if (!yt && !tt && !twitch && !kick) {
    alert('Vyplň aspoň jeden kanál k ověření!');
    return;
  }
  if (!ageConfirm) {
    alert('Pro podání žádosti potvrď, že je ti více než 10 let.');
    return;
  }

  const termsConfirm = document.getElementById('media-terms-confirm')?.checked;
  if (!termsConfirm) {
    alert('Pro odeslání žádosti potvrď souhlas s pravidly serveru a ochranou údajů.');
    return;
  }

  const statusBox = document.getElementById('media-status-box');
  const applyForm = document.getElementById('media-apply-form');

  applyForm.style.display = 'none';
  statusBox.style.display = 'block';

  // Render step-by-step checking animation
  statusBox.innerHTML = `
    <div class="verification-progress-box">
      <div class="spinner-circle"></div>
      <h3>Ověřování kanálů</h3>
      <p style="color: var(--text-muted); font-size: 0.9rem;">Scrapuji sociální sítě a načítám data...</p>
      
      <div class="verification-steps">
        <div id="step-connect" class="verification-step-item checking">
          <span class="step-icon-status"></span>
          <span>Navazování spojení se serverem...</span>
        </div>
        <div id="step-scrape" class="verification-step-item pending">
          <span class="step-icon-status"></span>
          <span>Analýza zadaných odkazů...</span>
        </div>
        <div id="step-db" class="verification-step-item pending">
          <span class="step-icon-status"></span>
          <span>Odesílání k posouzení...</span>
        </div>
      </div>
    </div>
  `;

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  await sleep(1200);
  document.getElementById('step-connect').className = 'verification-step-item success';
  document.getElementById('step-scrape').className = 'verification-step-item checking';

  await sleep(1500);

  try {
    const res = await fetch('https://api.6767111.xyz/api/media/apply', {
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
    });

    const data = await res.json();

    if (data.success) {
      document.getElementById('step-scrape').className = 'verification-step-item success';
      document.getElementById('step-db').className = 'verification-step-item checking';
      await sleep(1200);
      document.getElementById('step-db').className = 'verification-step-item success';
      await sleep(800);

      statusBox.innerHTML = `
        <div class="media-status-card">
          <div class="status-icon">🎉</div>
          <h3>Žádost odeslána!</h3>
          <p>Tvoje kanály byly úspěšně ověřeny. Žádost byla odeslána administrátorům ke schválení.</p>
          <button onclick="checkMediaStatus()" class="btn-primary" style="margin-top: 25px; width: 100%;">Zobrazit stav</button>
        </div>
      `;
    } else {
      document.getElementById('step-scrape').className = 'verification-step-item failed';
      await sleep(1000);
      const checksDetails = (data.checks || []).map(check => {
        const countLabel = check.count === null ? 'neznámý' : check.count.toString();
        const ok = (check.count !== null && check.count >= check.required);
        const statusLabel = ok ? 'OK' : 'Nesplněno';
        const color = ok ? '#16a34a' : '#ef4444';
        return `<div class="media-check-detail"><strong>${check.platform}:</strong> <span style="color:${color};">${countLabel} / ${check.required} — ${statusLabel}</span></div>`;
      }).join('');
      statusBox.innerHTML = `
        <div class="media-status-card">
          <div class="status-icon">❌</div>
          <h3>Ověření selhalo</h3>
          <p style="color: #ef4444; font-weight: bold; margin-bottom: 15px;">${data.error || 'Nebyly splněny požadavky pro Media Rank.'}</p>
          <p>Ujisti se, že máš dostatečný počet odběratelů/sledujících a zadal jsi správné odkazy.</p>
          ${checksDetails ? `<div class="media-checks-list" style="margin-top: 12px; text-align:left;">${checksDetails}</div>` : ''}
          ${data && data.raw ? `<pre style="text-align:left; margin-top:10px; background:rgba(0,0,0,0.12); padding:10px; border-radius:8px; overflow:auto; max-height:180px;">${JSON.stringify(data.raw, null, 2)}</pre>` : ''}
          <button onclick="resetMediaForm()" class="btn-primary" style="margin-top: 25px; width: 100%;">Zpět na formulář</button>
        </div>
      `;
    }
  } catch (err) {
    document.getElementById('step-scrape').className = 'verification-step-item failed';
    await sleep(1000);
    statusBox.innerHTML = `
      <div class="media-status-card">
        <div class="status-icon">❌</div>
        <h3>Chyba spojení</h3>
        <p>Nepodařilo se navázat spojení s ověřovacím serverem. Zkus to prosím později.</p>
        <button onclick="resetMediaForm()" class="btn-primary" style="margin-top: 25px; width: 100%;">Zpět na formulář</button>
      </div>
    `;
  }
}

// ---- PC INTERACTIVE PARTICLES (Disabled for clean, premium performance) ----
function initHeroParticles() {
  // Disabled to eliminate visual noise, save battery/CPU, and avoid generic AI template look.
}

// ---- CASCADE FALLING GAME ICONS ----
function spawnFallingIcons(container) {
  if (!container) return;
  const iconUrls = [
    'imgs/icons/minecraft-world-icon-14.webp',
    'imgs/icons/Heart.webp',
    'imgs/icons/trophy.webp',
    'imgs/icons/blue_speed particles.webp',
    'imgs/icons/White_Particles.webp'
  ];

  const count = 30;
  for (let i = 0; i < count; i++) {
    const img = document.createElement('img');
    img.src = iconUrls[Math.floor(Math.random() * iconUrls.length)];
    img.className = 'falling-web-icon';

    // Set random position, speed and rotation
    img.style.left = Math.random() * 85 + 5 + '%';
    img.style.top = -30 - Math.random() * 80 + 'px';
    const size = Math.random() * 20 + 16;
    img.style.width = size + 'px';
    img.style.height = size + 'px';

    img.style.animationDelay = Math.random() * 1.5 + 's';
    img.style.animationDuration = (Math.random() * 2 + 2) + 's';

    container.appendChild(img);

    img.addEventListener('animationend', () => {
      img.remove();
    });
  }
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
      <img src="${objectUrl}" alt="Snímek" class="bug-chip-preview-img">
      <span title="${file.name}">${file.name.length > 16 ? file.name.substring(0, 13) + '...' : file.name}</span>
      <button type="button" class="bug-chip-remove-btn" onclick="removeBugImage(${idx})" title="Odstranit">✕</button>
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

  const newFiles = Array.from(input.files);
  for (const file of newFiles) {
    if (bugSelectedFiles.length >= 3) {
      showToast('⚠️ Můžeš přiložit maximálně 3 fotky!');
      break;
    }
    if (file.size > 20 * 1024 * 1024) {
      showToast(`⚠️ Obrázek "${file.name}" je příliš velký (max 20 MB).`);
      continue;
    }
    bugSelectedFiles.push(file);
  }

  input.value = '';
  renderBugImagesPreview();
}

// Paste support for screenshots on bug report
document.addEventListener('paste', (e) => {
  const activeTab = document.querySelector('.tab-content.active');
  const isBugTab = activeTab && (activeTab.id === 'tab-bugs' || activeTab.querySelector('#bug-report-form'));
  if (!isBugTab) return;

  const items = (e.clipboardData || e.originalEvent.clipboardData)?.items;
  if (!items) return;

  let pastedAny = false;
  for (const item of items) {
    if (item.type && item.type.indexOf('image') !== -1) {
      const file = item.getAsFile();
      if (file) {
        if (bugSelectedFiles.length >= 3) {
          showToast('⚠️ Můžeš přiložit maximálně 3 fotky!');
          break;
        }
        bugSelectedFiles.push(file);
        pastedAny = true;
      }
    }
  }

  if (pastedAny) {
    showToast('📷 Snímek vložen ze schránky!');
    renderBugImagesPreview();
  }
});

// ---- MODERN BUG & UNBAN REPORTING ----
let currentBugCategory = 'game';
let bugNickTimeout = null;
let bugCooldownInterval = null;

function selectBugCategory(cat) {
  currentBugCategory = cat;
  document.querySelectorAll('.bug-cat-chip').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.cat === cat);
  });

  const descLabel = document.getElementById('bug-desc-label');
  const descInput = document.getElementById('bug-desc');
  const submitText = document.getElementById('btn-bug-text');

  if (cat === 'unban') {
    if (descLabel) descLabel.innerHTML = '<span><i class="fa-solid fa-scale-balanced"></i> Proč žádáš o unban?</span>';
    if (descInput) descInput.placeholder = 'Vysvětli situaci, za co jsi dostal trest a proč bys měl dostat unban...';
    if (submitText) submitText.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Odeslat žádost o unban';
  } else {
    if (descLabel) descLabel.innerHTML = '<span><i class="fa-solid fa-align-left"></i> Co se přesně stalo?</span>';
    if (submitText) submitText.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Odeslat nahlášení';

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
        greeting.textContent = `Ahoj, ${nick}! 👋`;
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

  if (submitText) submitText.innerHTML = `⏳ Další odeslání za ${remaining}s`;

  bugCooldownInterval = setInterval(() => {
    remaining--;
    if (remaining <= 0) {
      clearInterval(bugCooldownInterval);
      bugCooldownInterval = null;
      submitBtn.disabled = false;
      selectBugCategory(currentBugCategory);
    } else {
      if (submitText) submitText.innerHTML = `⏳ Další odeslání za ${remaining}s`;
    }
  }, 1000);
}

async function submitBugReport(e) {
  if (e && e.preventDefault) e.preventDefault();
  const nickInput = document.getElementById('bug-nick');
  const descInput = document.getElementById('bug-desc');
  const imagesInput = document.getElementById('bug-images');
  const submitBtn = document.getElementById('btn-bug-submit');
  const submitText = document.getElementById('btn-bug-text');

  if (!nickInput || !descInput || !submitBtn) return;

  if (bugCooldownInterval) {
    showToast('⏳ Počkej prosím chvíli před odesláním dalšího hlášení.');
    return;
  }

  const nick = nickInput.value.trim();
  let bug = descInput.value.trim();
  const isUnban = (currentBugCategory === 'unban');

  if (!nick || !bug) {
    showToast('⚠️ Vyplň prosím svůj herní nick a popis!');
    return;
  }

  if (nick.length < 2) {
    showToast('❌ Zadej platný herní nick (min. 2 znaky).');
    nickInput.focus();
    return;
  }
  if (bug.length < 5) {
    showToast(isUnban ? '❌ Popiš svou žádost o unban podrobněji (min. 5 znaků).' : '❌ Popiš chybu podrobněji (min. 5 znaků).');
    descInput.focus();
    return;
  }

  const bugConsent = document.getElementById('bug-consent');
  if (bugConsent && !bugConsent.checked) {
    showToast('⚠️ Potvrď prosím souhlas.');
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
      showToast('⚠️ Můžeš přiložit maximálně 3 obrázky!');
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
        console.error('Error processing image:', err);
        showToast(`❌ Chyba při načítání obrázku "${file.name}".`);
        return;
      }
    }
  }

  submitBtn.disabled = true;
  if (submitText) submitText.innerHTML = isUnban ? '⏳ Odesílám žádost...' : '⏳ Odesílám nahlášení...';

  try {
    const endpoints = ['/api/report-bug', 'https://api.6767111.xyz/api/report-bug'];
    let data = null;
    let successRes = false;
    let resErrorMsg = null;
    let resRetryAfter = null;

    for (const ep of endpoints) {
      try {
        const res = await fetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nick, bug, images, isUnban })
        });
        const json = await res.json().catch(() => null);

        if (res.ok && json && json.success) {
          data = json;
          successRes = true;
          break;
        }

        if (res.status === 413) {
          resErrorMsg = 'Obrázky jsou příliš velké. Zkus nahrát menší snímek nebo jen 1 fotku.';
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
      showToast(isUnban ? '✅ Žádost o unban byla úspěšně odeslána!' : '✅ Nahlášení bylo úspěšně odesláno!');

      // Populate confirmation ticket card
      const ticketIdEl = document.getElementById('ticket-id-display');
      const ticketUserAvatar = document.getElementById('ticket-user-avatar');
      const ticketUserName = document.getElementById('ticket-user-name');
      const ticketTitle = document.getElementById('ticket-success-title');

      if (ticketIdEl) ticketIdEl.textContent = ticketNum;
      if (ticketUserAvatar) ticketUserAvatar.src = `https://mc-heads.net/avatar/${encodeURIComponent(nick)}/48`;
      if (ticketUserName) ticketUserName.textContent = nick;
      if (ticketTitle) ticketTitle.textContent = isUnban ? 'Žádost o unban byla úspěšně odeslána!' : 'Nahlášení bylo úspěšně odesláno!';

      // Smooth switch to ticket confirmation
      const cardFront = document.getElementById('bug-card-front');
      const cardBack = document.getElementById('bug-card-back');
      if (cardFront) cardFront.style.display = 'none';
      if (cardBack) {
        cardBack.style.display = 'block';
        cardBack.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      startBugCooldownTimer(60);
    } else {
      const errMsg = resErrorMsg || (data && data.error) || 'Nepodařilo se odeslat nahlášení.';
      showToast(`❌ ${errMsg}`);
      if (resRetryAfter || (data && data.retryAfter)) {
        startBugCooldownTimer(resRetryAfter || data.retryAfter);
      }
    }
  } catch (err) {
    console.error('Error submitting bug:', err);
    showToast('❌ Chyba při odesílání.');
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
  if (cardFront) cardFront.style.display = 'block';
  if (cardBack) cardBack.style.display = 'none';

  const descInput = document.getElementById('bug-desc');
  const imagesInput = document.getElementById('bug-images');
  if (descInput) descInput.value = '';
  if (imagesInput) imagesInput.value = '';
  bugSelectedFiles = [];
  renderBugImagesPreview();
  selectBugCategory('game');
  cardFront.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

window.addEventListener('popstate', handleUrlRouting);

// ---- NÁPADY / WHITEBOARD TAB ----
let currentIdeasData = null;

async function loadIdeasTab() {
  const userBar = document.getElementById('ideas-user-bar');
  const surface = document.getElementById('whiteboard-surface');
  const board = document.getElementById('whiteboard-board');

  if (board && !board.dataset.mouseTracked) {
    board.dataset.mouseTracked = 'true';
    let mouseAnimFrame = null;
    board.addEventListener('mousemove', (e) => {
      const rect = board.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (!mouseAnimFrame) {
        mouseAnimFrame = requestAnimationFrame(() => {
          board.style.setProperty('--mouse-x', `${x}px`);
          board.style.setProperty('--mouse-y', `${y}px`);
          mouseAnimFrame = null;
        });
      }
    });
  }

  if (!surface) return;

  surface.innerHTML = '<div class="whiteboard-empty"><i class="fa-solid fa-spinner fa-spin"></i><p>Načítám nápady...</p></div>';

  try {
    const res = await fetch('https://api.6767111.xyz/api/napady/list', {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    currentIdeasData = data;

    // Render User Header Bar
    if (userBar) {
      if (!data.isLoggedIn || !data.user) {
        userBar.className = 'ideas-user-bar ideas-user-bar-guest';
        userBar.innerHTML = `
          <div class="ideas-guest-hint">
            <i class="fa-solid fa-lock"></i> Pro přidání nápadu se musíte přihlásit přes Discord:
          </div>
          <button class="btn btn-discord btn-sm" onclick="loginViaDiscord()">
            <i class="fa-brands fa-discord"></i> Přihlásit přes Discord
          </button>
        `;
      } else {
        const u = data.user;
        const canAdd = u.pendingCount < 10;
        userBar.className = 'ideas-user-bar';
        userBar.innerHTML = `
          <div class="ideas-user-info-compact" title="${u.pendingCount}/10 neschválených nápadů">
            <img src="${u.avatar}" class="ideas-user-avatar-sm" alt="${u.username}" />
            <span class="ideas-user-name-sm">${u.username}</span>
            <span class="ideas-user-badge-sm"><i class="fa-solid fa-star"></i> ${u.points}</span>
            ${u.isMajitel ? '<span style="color:#f59e0b; font-size:0.8rem; margin-left:2px;">👑</span>' : ''}
          </div>
          <div class="ideas-inline-input-wrapper">
            <input 
              type="text" 
              id="idea-inline-input" 
              class="ideas-inline-input" 
              placeholder="${canAdd ? 'Napiš svojí myšlenku nebo nápad... (Stiskni Enter pro odeslání)' : 'Máš již 10 neschválených nápadů...'}" 
              maxlength="800"
              ${!canAdd ? 'disabled' : ''}
              onkeydown="handleIdeaInlineKeydown(event)"
            />
            <button 
              id="btn-submit-inline-idea" 
              class="ideas-inline-send-btn" 
              onclick="submitInlineIdea()" 
              title="Odeslat nápad"
              ${!canAdd ? 'disabled' : ''}
            >
              <i class="fa-solid fa-paper-plane"></i>
            </button>
          </div>
        `;
      }
    }

    // Render Idea Cards on Whiteboard
    if (!data.ideas || data.ideas.length === 0) {
      surface.innerHTML = `
        <div class="whiteboard-empty">
          <i class="fa-solid fa-lightbulb"></i>
          <p>Zatím tu nejsou žádné nápady. Buď první a přidej svůj nápad pro MYCHAL SMP!</p>
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
    console.error('Error loading ideas tab:', err);
    surface.innerHTML = '<div class="whiteboard-empty"><i class="fa-solid fa-circle-exclamation"></i><p>Chyba při načítání nápadů z API.</p></div>';
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
    <div class="idea-card" id="idea-card-${idea.id}" style="--card-rotation: ${idea.rotation || 0}deg;">
      <div class="idea-card-pin">📍</div>
      <div class="idea-card-header">
        <img src="${idea.author_avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'}" class="idea-card-avatar" alt="${idea.author_name}" />
        <span class="idea-card-author">
          ${escapeHtml(idea.author_name)}
          <span class="idea-author-stars" title="Autor má ${authorPoints} hvězdiček">
            <i class="fa-solid fa-star"></i> ${authorPoints}
          </span>
        </span>
        <span class="idea-card-time">${createdDate}</span>
      </div>
      <div class="idea-card-body">
        ${hasAi ? `
          <div class="idea-card-top-bar">
            <div class="idea-mode-indicator idea-mode-user">
              <i class="fa-solid fa-user"></i> <span class="idea-mode-label">Návrh hráče</span>
            </div>
            <button class="idea-mode-switch-btn btn-is-ai" onclick="toggleIdeaView(${idea.id}, event)" title="Přepnout na AI vylepšení">
              <i class="fa-solid fa-wand-magic-sparkles"></i> AI
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
            class="idea-vote-btn idea-vote-up ${userVote === 1 ? 'voted-up' : ''}" 
            onclick="voteIdea(${idea.id}, 'up', event)" 
            title="Líbí se mi nápad (+1)"
          >
            <i class="fa-solid fa-thumbs-up"></i>
          </button>
          <span class="idea-vote-score ${scoreClass}" id="idea-score-${idea.id}">${scoreFormatted}</span>
          <button 
            class="idea-vote-btn idea-vote-down ${userVote === -1 ? 'voted-down' : ''}" 
            onclick="voteIdea(${idea.id}, 'down', event)" 
            title="Nelíbí se mi nápad (-1)"
          >
            <i class="fa-solid fa-thumbs-down"></i>
          </button>
        </div>
        ${isMajitel ? `
          <div class="idea-card-actions">
            <button class="idea-btn-action idea-btn-ai" onclick="aiProcessIdea(${idea.id})" title="Rozpracovat a vylepšit pomocí AI Gemini">❓</button>
            <button class="idea-btn-action idea-btn-approve" onclick="approveIdea(${idea.id})" title="Schválit nápad (+1 bod autorovi)">✅</button>
            <button class="idea-btn-action idea-btn-reject" onclick="rejectIdea(${idea.id})" title="Zamítnout nápad (smaže z nástěnky)">❌</button>
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
    const res = await fetch('https://api.6767111.xyz/api/napady/list', {
      headers: getAuthHeaders()
    });
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
          starsSpan.innerHTML = `<i class="fa-solid fa-star"></i> ${idea.author_points || 0}`;
        }
        if (idea.ai_text && !cardEl.querySelector('.idea-card-top-bar')) {
          const bodyEl = cardEl.querySelector('.idea-card-body');
          if (bodyEl) {
            bodyEl.innerHTML = `
              <div class="idea-card-top-bar">
                <div class="idea-mode-indicator idea-mode-user">
                  <i class="fa-solid fa-user"></i> <span class="idea-mode-label">Návrh hráče</span>
                </div>
                <button class="idea-mode-switch-btn btn-is-ai" onclick="toggleIdeaView(${idea.id}, event)" title="Přepnout na AI vylepšení">
                  <i class="fa-solid fa-wand-magic-sparkles"></i> AI
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

async function voteIdea(ideaId, type, event) {
  if (event) event.stopPropagation();

  if (!currentIdeasData || !currentIdeasData.isLoggedIn) {
    showToast('🔒 Pro hlasování o nápadech se musíš přihlásit.');
    return;
  }

  const box = document.getElementById(`idea-vote-box-${ideaId}`);
  if (box) box.classList.add('voting-busy');

  try {
    const res = await fetch(`https://api.6767111.xyz/api/napady/vote/${ideaId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ type })
    });
    const data = await res.json();
    if (data.success) {
      updateCardVoteState(ideaId, data.score, data.userVote);
    } else {
      showToast('❌ ' + (data.message || 'Chyba při hlasování.'));
    }
  } catch (e) {
    console.error('Error voting on idea:', e);
    showToast('❌ Chyba při spojení se serverem.');
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
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
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
  const text = input ? input.value.trim() : '';

  if (text.length < 5) {
    showToast('❌ Napiš prosím podrobnější nápad (min. 5 znaků).');
    return;
  }

  if (btn) btn.disabled = true;

  try {
    const res = await fetch('https://api.6767111.xyz/api/napady/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ text })
    });
    const data = await res.json();
    if (data.success) {
      showToast('✅ ' + data.message);
      if (input) input.value = '';
      loadIdeasTab();
    } else {
      showToast('❌ ' + (data.message || 'Chyba při přidávání nápadu.'));
    }
  } catch (e) {
    console.error('Error submitting inline idea:', e);
    showToast('❌ Spojení se serverem selhalo.');
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function aiProcessIdea(id) {
  const card = document.getElementById(`idea-card-${id}`);
  const btn = card ? card.querySelector('.idea-btn-ai') : null;
  if (btn) btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

  try {
    const res = await fetch(`https://api.6767111.xyz/api/napady/ai-process/${id}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (data.success) {
      showToast('🤖 Nápad byl zpracován AI a odeslán do Discord roomky!');
      loadIdeasTab();
    } else {
      showToast('❌ ' + (data.message || 'Chyba při zpracování AI.'));
      if (btn) btn.innerHTML = '❓';
    }
  } catch (e) {
    console.error('Error AI processing idea:', e);
    showToast('❌ Chyba při spojení se serverem.');
    if (btn) btn.innerHTML = '❓';
  }
}

async function approveIdea(id) {
  if (!confirm('Opravdu chceš tento nápad SCHVÁLIT? Udělí autorovi +1 bod a pošle oznámení do Discordu.')) return;

  try {
    const res = await fetch(`https://api.6767111.xyz/api/napady/approve/${id}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (data.success) {
      showToast('🎉 Nápad byl schválen a autor získal +1 bod!');
      loadIdeasTab();
    } else {
      showToast('❌ ' + (data.message || 'Chyba při schvalování nápadu.'));
    }
  } catch (e) {
    console.error('Error approving idea:', e);
    showToast('❌ Chyba při spojení se serverem.');
  }
}

async function rejectIdea(id) {
  if (!confirm('Opravdu chceš tento nápad ZAMÍTNUT a smazat z nástěnky?')) return;

  try {
    const res = await fetch(`https://api.6767111.xyz/api/napady/reject/${id}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (data.success) {
      showToast('🗑️ Nápad byl zamítnut a odstraněn.');
      loadIdeasTab();
    } else {
      showToast('❌ ' + (data.message || 'Chyba při zamítání nápadu.'));
    }
  } catch (e) {
    console.error('Error rejecting idea:', e);
    showToast('❌ Chyba při spojení se serverem.');
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
      aiText.style.display = 'block';
      if (indicator) {
        indicator.className = 'idea-mode-indicator idea-mode-ai';
        indicator.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> <span class="idea-mode-label">AI Rozpracováno</span>';
      }
      if (switchBtn) {
        switchBtn.className = 'idea-mode-switch-btn btn-is-user';
        switchBtn.innerHTML = '<i class="fa-solid fa-user"></i> Hráč';
        switchBtn.title = 'Přepnout na původní znění od hráče';
      }
    } else {
      // Switch to Original Player mode
      aiText.style.display = 'none';
      originalText.style.display = 'block';
      if (indicator) {
        indicator.className = 'idea-mode-indicator idea-mode-user';
        indicator.innerHTML = '<i class="fa-solid fa-user"></i> <span class="idea-mode-label">Návrh hráče</span>';
      }
      if (switchBtn) {
        switchBtn.className = 'idea-mode-switch-btn btn-is-ai';
        switchBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> AI';
        switchBtn.title = 'Přepnout na AI vylepšení';
      }
    }
  }
}

// ---- GLOBAL MOUSE TRACKER FOR AMBIENT GLOW & RADIAL GRID ILLUMINATION ----
(function initGlobalMouseTracker() {
  let mouseAnimFrame = null;
  document.addEventListener('mousemove', (e) => {
    if (!mouseAnimFrame) {
      mouseAnimFrame = requestAnimationFrame(() => {
        document.body.style.setProperty('--mouse-x', `${e.clientX}px`);
        document.body.style.setProperty('--mouse-y', `${e.clientY}px`);
        mouseAnimFrame = null;
      });
    }
  });
})();

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
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    '1h': { labels: ['50m', '40m', '30m', '20m', '10m', 'Nyní'], values: [0, 0, 0, 0, 0, 0], curVal: '0 hráčů online' },
    '1d': { labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'Nyní'], values: [0, 0, 0, 0, 0, 0, 0], curVal: '0 hráčů online' },
    '1w': { labels: ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'], values: [0, 0, 0, 0, 0, 0, 0], curVal: '0 hráčů' },
    '1m': { labels: ['Týden 1', 'Týden 2', 'Týden 3', 'Týden 4'], values: [0, 0, 0, 0], curVal: '0 hráčů' }
  },
  playtime: {
    title: 'Celkový nahranný čas (Playtime)',
    unit: 'hodin',
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    '1h': { labels: ['50m', '40m', '30m', '20m', '10m', 'Nyní'], values: [0, 0, 0, 0, 0, 0], curVal: '0 nahranných hodin' },
    '1d': { labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'Nyní'], values: [0, 0, 0, 0, 0, 0, 0], curVal: '0 celkových hodin' },
    '1w': { labels: ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'], values: [0, 0, 0, 0, 0, 0, 0], curVal: '0 hodin tento týden' },
    '1m': { labels: ['Týden 1', 'Týden 2', 'Týden 3', 'Týden 4'], values: [0, 0, 0, 0], curVal: '0 celkem za měsíc' }
  },
  money: {
    title: 'Celkem peněz v ekonomice',
    unit: '$',
    color: '#22c55e',
    glowColor: 'rgba(34, 197, 94, 0.45)',
    '1h': { labels: ['50m', '40m', '30m', '20m', '10m', 'Nyní'], values: [0, 0, 0, 0, 0, 0], curVal: '$0 celkem' },
    '1d': { labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'Nyní'], values: [0, 0, 0, 0, 0, 0, 0], curVal: '$0 v oběhu' },
    '1w': { labels: ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'], values: [0, 0, 0, 0, 0, 0, 0], curVal: '$0 tento týden' },
    '1m': { labels: ['Týden 1', 'Týden 2', 'Týden 3', 'Týden 4'], values: [0, 0, 0, 0], curVal: '$0 celkově' }
  },
  visitors: {
    title: 'Unikátní návštěvníci (Hráči)',
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
    color: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.45)',
    '1h': { labels: ['50m', '40m', '30m', '20m', '10m', 'Nyní'], values: [0, 0, 0, 0, 0, 0], curVal: '0 celkových úmrtí' },
    '1d': { labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'Nyní'], values: [0, 0, 0, 0, 0, 0, 0], curVal: '0 úmrtí dnes' },
    '1w': { labels: ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'], values: [0, 0, 0, 0, 0, 0, 0], curVal: '0 úmrtí tento týden' },
    '1m': { labels: ['Týden 1', 'Týden 2', 'Týden 3', 'Týden 4'], values: [0, 0, 0, 0], curVal: '0 celkem za měsíc' }
  }
};

function initStatsModule() {
  renderStatsChart();
  fetchLiveServerStats();
  fetchOnlinePlayers();
  if (!isStatsModuleInitialized) {
    isStatsModuleInitialized = true;
    window.addEventListener('resize', renderStatsChart);
    setInterval(() => {
      if (currentActiveTab === 'stats') {
        fetchOnlinePlayers();
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

  renderStatsChart();
}

function computeMonotoneCubicPath(points, svgH, padY) {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;

  const n = points.length;
  const m = new Array(n - 1);
  for (let i = 0; i < n - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    m[i] = dx !== 0 ? (points[i + 1].y - points[i].y) / dx : 0;
  }

  const d = new Array(n);
  d[0] = m[0];
  d[n - 1] = m[n - 2];
  for (let i = 1; i < n - 1; i++) {
    if (m[i - 1] * m[i] <= 0) {
      d[i] = 0;
    } else {
      d[i] = (m[i - 1] + m[i]) / 2;
    }
  }

  let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const dx = (points[i + 1].x - points[i].x) / 3;
    const cp1x = points[i].x + dx;
    const cp1y = points[i].y + d[i] * dx;
    const cp2x = points[i + 1].x - dx;
    const cp2y = points[i + 1].y - d[i + 1] * dx;

    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${points[i + 1].x.toFixed(1)} ${points[i + 1].y.toFixed(1)}`;
  }
  return path;
}

function switchTimeframe(timeframe) {
  currentStatsTimeframe = timeframe;

  document.querySelectorAll('.timeframe-btn').forEach(btn => btn.classList.remove('active'));
  const targetBtn = document.getElementById('timeframe-btn-' + timeframe);
  if (targetBtn) targetBtn.classList.add('active');

  const periodLabels = {
    '1h': 'Poslední hodina',
    '1d': 'Posledních 24 hodin',
    '1w': 'Posledních 7 dní',
    '1m': 'Posledních 30 dní'
  };
  const periodText = document.getElementById('chart-period-text');
  if (periodText) {
    periodText.innerHTML = `<i class="fa-regular fa-calendar-days"></i> ${periodLabels[timeframe] || 'Posledních 24 hodin'}`;
  }

  fetchLiveServerStats();
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
  const gradientStop0 = document.querySelectorAll('#chartGlowGradient stop')[0];

  if (linePath) linePath.setAttribute('stroke', metricObj.color);
  if (gradientStop0) gradientStop0.setAttribute('stop-color', metricObj.color);

  // Update active timeframe button background to match active metric color
  document.querySelectorAll('.timeframe-btn').forEach(btn => {
    if (btn.classList.contains('active')) {
      btn.style.backgroundColor = metricObj.color;
      btn.style.color = '#0f172a';
      btn.style.boxShadow = `0 2px 10px ${metricObj.glowColor || metricObj.color}`;
    } else {
      btn.style.backgroundColor = '';
      btn.style.color = '';
      btn.style.boxShadow = '';
    }
  });

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
    // For cumulative/financial totals: give a balanced, consistent margin (never 100% artificial swing)
    if (minVal === maxVal) {
      const pad = Math.max(1, minVal * 0.1);
      minVal = Math.max(0, minVal - pad);
      maxVal = maxVal + pad;
    } else {
      const delta = maxVal - minVal;
      const minPadding = maxVal * 0.05;
      const pad = Math.max(delta * 0.2, minPadding);
      minVal = Math.max(0, minVal - pad);
      maxVal = maxVal + pad;
    }
  }

  const range = Math.max(1, maxVal - minVal);
  const padY = 30;
  const padX = 20;
  const svgW = 800;
  const svgH = 280;
  const usableW = svgW - 2 * padX;
  const usableH = svgH - 2 * padY;

  const points = values.map((val, idx) => {
    const x = padX + (idx / Math.max(1, count - 1)) * usableW;
    const y = svgH - padY - ((val - minVal) / range) * usableH;
    const peakInfo = seriesData.peaks ? seriesData.peaks[idx] : null;
    const fullDateLabel = seriesData.fullDateLabels ? seriesData.fullDateLabels[idx] : null;
    return { x, y, val, label: labels[idx], peakInfo, fullDateLabel };
  });

  // Render Horizontal Grid Lines (4 lines)
  if (gridGroup) {
    let gridHtml = '';
    for (let i = 0; i <= 3; i++) {
      const gY = padY + (i / 3) * usableH;
      gridHtml += `<line x1="0" y1="${gY}" x2="${svgW}" y2="${gY}" stroke="rgba(255, 255, 255, 0.06)" stroke-dasharray="4 4" stroke-width="1" />`;
    }
    gridGroup.innerHTML = gridHtml;
  }

  // Render Accurate Monotone Cubic Spline (No overshoots, oscillations, or dipping)
  const dLine = computeMonotoneCubicPath(points, svgH, padY);
  const dArea = `${dLine} L ${points[points.length - 1].x} ${svgH - padY} L ${points[0].x} ${svgH - padY} Z`;

  if (linePath) linePath.setAttribute('d', dLine);
  if (areaPath) areaPath.setAttribute('d', dArea);

  // Render Perfectly Round HTML Overlay Dots (Eliminates flat bean SVG deformation)
  // Remove any existing dots
  container.querySelectorAll('.chart-point-dot').forEach(el => el.remove());
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

  // Render Clean, Evenly Spaced X-Axis Labels (Max 6-7 labels)
  if (labelsContainer) {
    const maxLabels = Math.min(7, count);
    const displayLabels = [];
    for (let i = 0; i < maxLabels; i++) {
      const idx = Math.round((i / Math.max(1, maxLabels - 1)) * (count - 1));
      displayLabels.push(labels[idx]);
    }
    labelsContainer.innerHTML = displayLabels.map(l => `<span>${l}</span>`).join('');
  }

  // Bind Mouse Hover & Click Interaction for Tooltip
  setupChartHoverInteraction(points, metricObj);
}

function setupChartHoverInteraction(points, metricObj) {
  const container = document.getElementById('svg-chart-container');
  const tooltip = document.getElementById('chart-tooltip');
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

      tooltip.style.left = `${leftPercent}%`;
      tooltip.style.top = `${topPercent}%`;

      // Highlight active dot
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
          peakEl.innerHTML = `<i class="fa-solid fa-bolt"></i> ${pt.peakInfo}`;
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
        const res = await fetch(url);
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
      if (valPlayers) valPlayers.innerText = `${latest.online_players || 0} / 50`;

      const valPlaytime = document.getElementById('val-playtime');
      if (valPlaytime) valPlaytime.innerText = `${(latest.playtime_hours || 0).toLocaleString('cs-CZ')} hod.`;

      const valMoney = document.getElementById('val-money');
      if (valMoney) valMoney.innerText = `$${(latest.total_money || 0).toLocaleString('cs-CZ')}`;

      const valVisitors = document.getElementById('val-visitors');
      if (valVisitors) valVisitors.innerText = `${(latest.unique_visitors || 0).toLocaleString('cs-CZ')} hráčů`;

      const valDeaths = document.getElementById('val-deaths');
      if (valDeaths) valDeaths.innerText = `${(latest.total_deaths || 0).toLocaleString('cs-CZ')}`;

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

// Fetch and render live online players widget
async function fetchOnlinePlayers() {
  const badge = document.getElementById('online-players-badge');
  const grid = document.getElementById('online-players-grid');
  if (!grid) return;

  try {
    const apiEndpoints = [
      '/api/online-players',
      'https://api.6767111.xyz/api/online-players'
    ];
    let data = null;
    for (const url of apiEndpoints) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          data = await res.json();
          if (data && data.success) break;
        }
      } catch (e) { }
    }

    const maxCount = data?.max || 50;

    if (!data || !data.players || data.players.length === 0) {
      if (badge) badge.innerHTML = `<i class="fa-solid fa-users"></i> 0 / ${maxCount}`;
      grid.innerHTML = `
        <div class="online-players-empty">
          <div class="empty-icon"><i class="fa-solid fa-moon"></i></div>
          <div class="empty-text">
            <h4>Na serveru zrovna nikdo nehraje</h4>
            <p>Buď první a připoj se na <strong>mychalsmp.xyz</strong>!</p>
          </div>
          <button class="btn-copy-ip-mini" onclick="copyIP(event)">
            <i class="fa-solid fa-copy"></i> Zkopírovat IP
          </button>
        </div>
      `;
      return;
    }

    if (badge) badge.innerHTML = `<i class="fa-solid fa-users"></i> ${data.players.length} / ${maxCount}`;

    grid.innerHTML = data.players.map(player => {
      const badgeClass = player.rank_badge === 'owner' ? 'badge-owner' : (player.rank_badge === 'smpplus' ? 'badge-smpplus' : 'badge-player');
      const badgeIcon = player.rank_badge === 'owner' ? '<i class="fa-solid fa-crown"></i> ' : (player.rank_badge === 'smpplus' ? '<i class="fa-solid fa-gem"></i> ' : '<i class="fa-solid fa-user"></i> ');
      const avatarUrl = player.avatar || `https://mc-heads.net/avatar/${encodeURIComponent(player.name)}/64`;
      const playtime = player.playtime_hours !== undefined ? `${player.playtime_hours} hod.` : 'Nové';

      return `
        <div class="player-card">
          <img src="${avatarUrl}" alt="${player.name}" class="player-card-avatar" loading="lazy" onerror="this.src='https://mc-heads.net/avatar/MHF_Steve/64'">
          <div class="player-card-info">
            <span class="player-card-name" title="${player.name}">${player.name}</span>
            <div class="player-card-meta">
              <span class="player-badge ${badgeClass}">${badgeIcon}${player.rank || 'Hráč'}</span>
              <span class="player-playtime"><i class="fa-regular fa-clock"></i> ${playtime}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.warn('[ONLINE PLAYERS] Error:', err);
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
      text = `⏳ Zbývá ${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
    } else if (hours > 0) {
      text = `⏳ Zbývá ${hours}h ${pad(minutes)}m ${pad(seconds)}s`;
    } else if (minutes > 0) {
      text = `⚡ Zbývá jen ${minutes}m ${pad(seconds)}s!`;
    } else {
      text = `🔥 Skoro konec! ${pad(seconds)}s`;
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

// Sledování průběhu čtení a aktivní kapitoly v TOC
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
    const scrollPos = (window.innerHeight / 2) - firstRect.top;

    const pct = Math.max(0, Math.min(100, Math.round((scrollPos / totalHeight) * 100)));
    if (progressBar) {
      progressBar.style.width = pct + '%';
    }

    let activeId = '';
    articles.forEach(art => {
      const r = art.getBoundingClientRect();
      if (r.top <= 200 && r.bottom >= 100) {
        activeId = art.id;
      }
    });

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

  window.addEventListener('scroll', updateLegalProgress, { passive: true });
  window.addEventListener('resize', updateLegalProgress, { passive: true });
})();
