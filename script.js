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
  const answer = btn.nextElementSibling;
  const isOpen = answer.classList.contains('open');
  // close all
  document.querySelectorAll('.faq-a').forEach(a => a.classList.remove('open'));
  document.querySelectorAll('.faq-q').forEach(b => b.classList.remove('open'));
  if (!isOpen) {
    answer.classList.add('open');
    btn.classList.add('open');
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

document.querySelectorAll('.feature-card, .step-card, .rule-card, .gallery-item, .join-step').forEach(el => {
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

// Load stats on page load
document.addEventListener('DOMContentLoaded', loadStats);
