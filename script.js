/* =============================================
   MYCHAL SMP – script.js
   ============================================= */

// ---- TAB SWITCHING ----
function showTab(name) {
  document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));

  const section = document.getElementById('tab-' + name);
  const btn = document.getElementById('tab-btn-' + name);
  if (section) section.classList.add('active');
  if (btn) btn.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (name === 'media') {
    checkMediaStatus();
  }
}

// ---- MOBILE MENU ----
function toggleMenu() {
  const ham = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');
  ham.classList.toggle('open');
  menu.classList.toggle('open');
}

// ---- COPY IP ----
function copyIP() {
  const ip = document.getElementById('server-ip').textContent.trim();
  navigator.clipboard.writeText(ip).then(() => {
    const btn = document.getElementById('copy-btn');
    const orig = btn.innerHTML;
    btn.innerHTML = '✅ Zkopírováno!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.innerHTML = orig;
      btn.classList.remove('copied');
    }, 2000);
  });
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

    if (data.whitelist_count !== undefined) {
      document.getElementById('stat-whitelist').textContent = data.whitelist_count + '+';
    }
    if (data.discord_members !== undefined) {
      document.getElementById('stat-discord').textContent = data.discord_members + '+';
    }
    if (data.playtime_hours !== undefined) {
      document.getElementById('stat-playtime').textContent = data.playtime_hours + '+';
    }
  } catch (err) {
    console.warn('Failed to load dynamic stats:', err);
  }
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
    alert('Tento herní nick vypadá neplatně! Použij pouze písmena, čísla a podtržítka (délka 2-16).');
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
    preview.textContent = cleanVal ? cleanVal : 'Hráč';
  }
}

// Load stats on page load
document.addEventListener('DOMContentLoaded', () => {
  loadStats();
  
  // Check for token in URL (Discord Auth callback redirect)
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  if (token) {
    localStorage.setItem('auth_token', token);
    window.history.replaceState({}, document.title, window.location.pathname);
    showTab('media');
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
  statusBox.innerHTML = '<div class="spinner-circle"></div><p style="text-align:center;">Ověřuji stav tvé žádosti...</p>';
  
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
    if (!data.success || !data.request) {
      statusBox.style.display = 'none';
      applyForm.style.display = 'block';
      loginBox.style.display = 'none';
      return;
    }
    
    const req = data.request;
    if (req.status === 'pending') {
      statusBox.innerHTML = `
        <div class="media-status-card">
          <div class="status-icon">⏳</div>
          <h3>Žádost se posuzuje</h3>
          <p>Tvoje žádost o Media Rank byla úspěšně odeslána a čeká na schválení administrátorem.</p>
          <div class="status-details">
            <div><strong>YouTube:</strong> ${req.youtube_url || 'Nepřipojeno'}</div>
            <div><strong>Kick:</strong> ${req.kick_url || 'Nepřipojeno'}</div>
            <div><strong>TikTok:</strong> ${req.tiktok_url || 'Nepřipojeno'}</div>
            <div><strong>Twitch:</strong> ${req.twitch_url || 'Nepřipojeno'}</div>
          </div>
        </div>
      `;
    } else if (req.status === 'approved') {
      statusBox.innerHTML = `
        <div class="media-status-card">
          <div class="status-icon">🎉</div>
          <h3>Žádost Schválena!</h3>
          <p>Gratulujeme! Tvoje žádost o Media Rank byla schválena. Rank máš aktivní ve hře i na Discordu.</p>
          <div style="margin-top: 20px; padding: 15px; background: rgba(241, 196, 15, 0.1); border-left: 4px solid #f1c40f; border-radius: 4px; text-align: left;">
            <strong style="color: #f1c40f; display: block; margin-bottom: 8px;">⚠️ DŮLEŽITÉ UPOZORNĚNÍ:</strong>
            Pro udržení Media ranku musíte v popiscích videí a streamů uvádět IP/odkaz <strong>join.mychalsmp.xyz</strong> nebo <strong>mychalsmp.xyz</strong> a používat hashtag <strong>#mychalsmp</strong>. Aktivita je pravidelně kontrolována naším botem.
          </div>
        </div>
      `;
    } else if (req.status === 'rejected') {
      statusBox.innerHTML = `
        <div class="media-status-card">
          <div class="status-icon">❌</div>
          <h3>Žádost Zamítnuta</h3>
          <p>Tvoje žádost o Media Rank byla zamítnuta.</p>
          <div class="reject-reason"><strong>Důvod zamítnutí:</strong> ${req.reason || 'Neuveden'}</div>
          <button onclick="resetMediaForm()" class="btn-primary" style="margin-top: 25px; width: 100%;">Zkusit znovu zažádat</button>
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
        const statusLabel = check.count !== null && check.count >= check.required ? 'OK' : 'Nesplněno';
        return `<div class="media-check-detail"><strong>${check.platform}:</strong> ${countLabel} / ${check.required} (${statusLabel})</div>`;
      }).join('');
      statusBox.innerHTML = `
        <div class="media-status-card">
          <div class="status-icon">❌</div>
          <h3>Ověření selhalo</h3>
          <p style="color: #ef4444; font-weight: bold; margin-bottom: 15px;">${data.error || 'Nebyly splněny požadavky pro Media Rank.'}</p>
          <p>Ujisti se, že máš dostatečný počet odběratelů/sledujících a zadal jsi správné odkazy.</p>
          ${checksDetails ? `<div class="media-checks-list" style="margin-top: 12px; text-align:left;">${checksDetails}</div>` : ''}
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
