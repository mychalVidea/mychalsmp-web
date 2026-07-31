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

  // Activate matching buttons on both menus
  const desktopBtn = document.getElementById('tab-btn-' + name);
  const mobileBtn = document.getElementById('btn-nav-' + name);
  if (desktopBtn) desktopBtn.classList.add('active');
  if (mobileBtn) mobileBtn.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });

  const footer = document.querySelector('footer.footer');
  if (footer) {
    footer.style.display = (name === 'napady') ? 'none' : 'block';
  }

  if (name === 'media') {
    checkMediaStatus();
  } else if (name === 'napady') {
    loadIdeasTab();
  }

  if (updateUrl) {
    let urlPath = '/' + name;
    if (name === 'smp-plus') urlPath = '/smpplus';
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
      if (element.id === 'copy-btn') {
        const origText = element.innerHTML;
        element.innerHTML = '✅ Zkopírováno!';
        element.classList.add('copied');
        setTimeout(() => {
          element.innerHTML = origText;
          element.classList.remove('copied');
        }, 2000);
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
    const res = await fetch('https://api.6767111.xyz/api/public-stats');
    if (!res.ok) return;
    const data = await res.json();
    console.log('[PUBLIC STATS] response:', data);

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
    if (!data.success || !data.hasRequest) {
      statusBox.style.display = 'none';
      applyForm.style.display = 'block';
      loginBox.style.display = 'none';
      return;
    }

    const status = data.status;
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

  const yt = document.getElementById('media-yt').value.trim();
  const tt = document.getElementById('media-tt').value.trim();
  const twitch = document.getElementById('media-twitch').value.trim();
  const kick = document.getElementById('media-kick').value.trim();
  const ageConfirm = document.getElementById('media-age-confirm')?.checked;

  if (!yt && !tt && !twitch && !kick) {
    alert('Vyplň aspoň jeden kanál k ověření!');
    return;
  }
  if (!ageConfirm) {
    alert('Pro podání žádosti potvrď, že je ti více než 10 let.');
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

// ---- PC INTERACTIVE PARTICLES ----
function initHeroParticles() {
  const canvas = document.getElementById('hero-particles-canvas');
  if (!canvas) return;

  // Only run on desktop
  if (window.innerWidth <= 768) {
    canvas.style.display = 'none';
    return;
  }

  const ctx = canvas.getContext('2d');
  let animationFrameId;
  const particles = [];
  const particleCount = 55;
  const colors = ['#0a67e5', '#ffbb00', '#ef4444', '#00b4cc'];
  const mouse = { x: null, y: null, radius: 140 };

  const hero = document.querySelector('.hero');

  function resizeCanvas() {
    canvas.width = hero.clientWidth;
    canvas.height = hero.clientHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  hero.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.radius = Math.random() * 3.5 + 1.5;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = (Math.random() - 0.5) * 0.6;
      this.baseRadius = this.radius;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = 0.55;
      ctx.fill();
    }

    update() {
      // Basic movement
      this.x += this.vx;
      this.y += this.vy;

      // Wrap boundaries
      if (this.x < 0) this.x = canvas.width;
      if (this.x > canvas.width) this.x = 0;
      if (this.y < 0) this.y = canvas.height;
      if (this.y > canvas.height) this.y = 0;

      // Mouse repulsion
      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);

          this.x += Math.cos(angle) * force * 3;
          this.y += Math.sin(angle) * force * 3;

          this.radius = this.baseRadius * (1 + force * 0.8);
        } else {
          if (this.radius > this.baseRadius) {
            this.radius -= 0.1;
          }
        }
      } else {
        if (this.radius > this.baseRadius) {
          this.radius -= 0.1;
        }
      }
    }
  }

  // Instantiate particles
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Connect particles with thin lines
    ctx.lineWidth = 0.55;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 85) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = '#0a67e5';
          ctx.globalAlpha = (1 - dist / 85) * 0.12;
          ctx.stroke();
        }
      }
    }

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    animationFrameId = requestAnimationFrame(animate);
  }

  animate();
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

function handleBugImagesChange(input) {
  const preview = document.getElementById('bug-images-preview');
  if (!preview) return;
  if (!input.files || input.files.length === 0) {
    preview.style.display = 'none';
    preview.innerHTML = '';
    return;
  }

  if (input.files.length > 2) {
    showToast('⚠️ Můžeš vybrat maximálně 2 obrázky!');
    input.value = '';
    preview.style.display = 'none';
    return;
  }

  const names = [];
  for (let i = 0; i < input.files.length; i++) {
    const file = input.files[i];
    if (file.size > 10 * 1024 * 1024) {
      showToast(`⚠️ Obrázek "${file.name}" přesahuje limit 10 MB!`);
      input.value = '';
      preview.style.display = 'none';
      return;
    }
    names.push(file.name);
  }

  preview.style.display = 'block';
  preview.innerHTML = `📷 Vybrané fotky (${input.files.length}/2): ${names.join(', ')}`;
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

// ---- BUG REPORTING ----
async function submitBugReport(e) {
  e.preventDefault();
  const nickInput = document.getElementById('bug-nick');
  const descInput = document.getElementById('bug-desc');
  const imagesInput = document.getElementById('bug-images');
  const submitBtn = document.getElementById('btn-bug-submit');
  const statusDiv = document.getElementById('bug-response-status');

  if (!nickInput || !descInput || !submitBtn) return;

  const nick = nickInput.value.trim();
  const bug = descInput.value.trim();

  if (!nick || !bug) {
    showToast('⚠️ Vyplň prosím všechna povinná pole!');
    return;
  }

  const images = [];
  if (imagesInput && imagesInput.files && imagesInput.files.length > 0) {
    if (imagesInput.files.length > 2) {
      showToast('⚠️ Můžeš přiložit maximálně 2 obrázky!');
      return;
    }
    for (let i = 0; i < imagesInput.files.length; i++) {
      const file = imagesInput.files[i];
      if (file.size > 10 * 1024 * 1024) {
        showToast(`⚠️ Soubor "${file.name}" přesahuje limit 10 MB!`);
        return;
      }
      try {
        const base64Data = await readFileAsBase64(file);
        images.push({ name: file.name, data: base64Data });
      } catch (err) {
        console.error('Error reading file:', err);
        showToast('❌ Chyba při načítání obrázku.');
        return;
      }
    }
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = '⏳ Odesílám...';

  try {
    const res = await fetch('https://api.6767111.xyz/api/report-bug', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nick, bug, images })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      showToast('✅ Bug byl úspěšně nahlášen!');
      nickInput.value = '';
      descInput.value = '';
      if (imagesInput) imagesInput.value = '';
      const preview = document.getElementById('bug-images-preview');
      if (preview) { preview.style.display = 'none'; preview.innerHTML = ''; }

      if (statusDiv) {
        statusDiv.style.display = 'block';
        statusDiv.innerHTML = '<div style="color:#2ecc71; font-weight:600; padding:15px; background:rgba(46,204,113,0.1); border-radius:10px; border: 1px solid rgba(46,204,113,0.3);">✅ Děkujeme! Tvoje nahlášení bylo odesláno do systému ke kontrole. Po posouzení obdržíš odměnu přímo ve hře!</div>';
      }
    } else {
      showToast('❌ ' + (data.error || 'Chyba při odesílání'));
      if (statusDiv) {
        statusDiv.style.display = 'block';
        statusDiv.innerHTML = `<div style="color:#e74c3c; font-weight:600; padding:15px; background:rgba(231,76,60,0.1); border-radius:10px; border: 1px solid rgba(231,76,60,0.3);">❌ ${data.error || 'Nepodařilo se odeslat bug.'}</div>`;
      }
    }
  } catch (err) {
    console.error('Error submitting bug:', err);
    showToast('❌ Chyba při spojení se serverem');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '🐛 Odeslat nahlášení';
  }
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


