/* =============================================
   MYCHAL SMP – script.js
   ============================================= */

// ---- TAB SWITCHING ----
function showTab(name) {
  if (name === 'smp-plus' && !document.getElementById('tab-smp-plus').classList.contains('active')) {
    triggerEpicVipTransition(() => {
      executeTabSwitch('smp-plus');
    });
    return;
  }
  executeTabSwitch(name);
}

function executeTabSwitch(name) {
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

  if (name === 'media') {
    checkMediaStatus();
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

    const suffix = el.id === 'stat-deaths' ? '' : '+';
    el.textContent = currentValue + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = targetValue + suffix;
    }
  }
  requestAnimationFrame(update);
}

// ---- TEBEX CHECKOUT CONFIG ----
async function checkoutSMP() {
  const nickInput = document.getElementById('mc-username');
  const nickname = nickInput.value.trim();
  if (!nickname) {
    alert('Prosím, zadej svůj Minecraft nick!');
    nickInput.focus();
    return;
  }

  // Simple nick format check
  if (!/^[a-zA-Z0-9_]{2,16}$/.test(nickname)) {
    alert('Tento nick vypadá neplatně! Použij pouze písmena, čísla a podtržítka (délka 2-16).');
    return;
  }

  const btn = document.querySelector('.btn-purchase');
  const originalText = btn.innerHTML;
  btn.innerHTML = '⌛ Generuji košík...';
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

// ---- LIVE CHAT PREVIEW ----
function updatePreviewName(val) {
  const preview = document.getElementById('smp-preview-name');
  if (preview) {
    const cleanVal = val.trim();
    preview.textContent = cleanVal ? cleanVal : 'Hrac';
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

  // Check for token in URL (Discord Auth callback redirect)
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  if (token) {
    localStorage.setItem('auth_token', token);
    window.history.replaceState({}, document.title, window.location.pathname);
    showTab('media');
  } else {
    // Sync bottom navigation active state on load
    const activeSection = document.querySelector('.tab-section.active');
    if (activeSection) {
      const name = activeSection.id.replace('tab-', '');
      const mobileBtn = document.getElementById('btn-nav-' + name);
      if (mobileBtn) mobileBtn.classList.add('active');
    }
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
    const handleTimelineScroll = () => {
      const rect = timelineWrapper.getBoundingClientRect();
      const viewHeight = window.innerHeight;

      // Progress calculation based on window scrolling position relative to timeline
      const startPoint = viewHeight * 0.75;
      const totalHeight = rect.height || 1;
      const currentPos = startPoint - rect.top;

      let progressPercent = Math.min(Math.max(currentPos / totalHeight, 0), 1) * 100;
      progressFill.style.height = progressPercent + '%';

      timelineRows.forEach(row => {
        const rowRect = row.getBoundingClientRect();
        if (rowRect.top < viewHeight * 0.75) {
          row.classList.add('visible');
          row.classList.add('active');
        } else {
          row.classList.remove('active');
        }
      });
    };

    window.addEventListener('scroll', handleTimelineScroll);
    window.addEventListener('resize', handleTimelineScroll);
    // Initial trigger
    setTimeout(handleTimelineScroll, 100);
  }

  // Initialize PC Interactive Canvas Particles
  initHeroParticles();

  // Initialize 3D Tilter on cards
  initCardTilts();
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

// ---- 3D CARD TILT ----
function initCardTilts() {
  if (window.innerWidth <= 768) return;

  const targetCards = document.querySelectorAll('.smp-card, .rule-card, .media-benefit-card, .smp-checkout-card');

  targetCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const xc = rect.width / 2;
      const yc = rect.height / 2;

      const angleX = (yc - y) / (yc / 8);
      const angleY = (x - xc) / (xc / 8);

      card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale3d(1.02, 1.02, 1.02)`;

      const percentX = (x / rect.width) * 100;
      const percentY = (y / rect.height) * 100;
      card.style.boxShadow = `0 15px 35px rgba(0, 0, 0, 0.35), inset 0 0 0 1px rgba(255, 255, 255, 0.12)`;
      card.style.backgroundImage = `radial-gradient(circle at ${percentX}% ${percentY}%, rgba(10, 103, 229, 0.08) 0%, transparent 65%)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      card.style.boxShadow = '';
      card.style.backgroundImage = '';
    });
  });
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

// ---- EPIC VIP TRANSITION ----
function triggerEpicVipTransition(callback) {
  const overlay = document.createElement('div');
  overlay.className = 'vip-portal-overlay';

  const gateLeft = document.createElement('div');
  gateLeft.className = 'vip-portal-gate gate-left';

  const gateRight = document.createElement('div');
  gateRight.className = 'vip-portal-gate gate-right';

  const content = document.createElement('div');
  content.className = 'vip-portal-content';

  const crown = document.createElement('div');
  crown.className = 'vip-portal-crown';
  crown.innerHTML = '👑';

  const title = document.createElement('div');
  title.className = 'vip-portal-title';
  title.innerHTML = 'SMP+ PŘEDPLATNÉ';

  const subtitle = document.createElement('div');
  subtitle.className = 'vip-portal-subtitle';
  subtitle.innerHTML = 'Exkluzivní výhody čekají';

  content.appendChild(crown);
  content.appendChild(title);
  content.appendChild(subtitle);

  overlay.appendChild(gateLeft);
  overlay.appendChild(gateRight);
  overlay.appendChild(content);

  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    overlay.classList.add('active');
  });

  setTimeout(() => {
    if (callback) callback();
  }, 850);

  setTimeout(() => {
    overlay.classList.add('exiting');
  }, 1550);

  setTimeout(() => {
    overlay.remove();
  }, 2350);
}
