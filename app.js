// Small, dependency-free motion for the landing page. Everything degrades to a static page.
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Opening animation: once per visit, skippable, never for reduced motion or automated screenshots.
(() => {
  const intro = document.getElementById('intro');
  let seen = false;
  try {
    seen = sessionStorage.getItem('vc-intro') === '1';
    sessionStorage.setItem('vc-intro', '1');
  } catch {}
  if (reduced || seen || navigator.webdriver) {
    intro.remove();
    return;
  }
  const ticks = intro.querySelector('.intro-ticks');
  for (let i = 0; i < 12; i++) {
    const a = (i * 30 * Math.PI) / 180;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', 100 + 92 * Math.sin(a));
    line.setAttribute('y1', 100 - 92 * Math.cos(a));
    line.setAttribute('x2', 100 + 82 * Math.sin(a));
    line.setAttribute('y2', 100 - 82 * Math.cos(a));
    line.style.setProperty('--d', `${0.35 + i * 0.04}s`);
    ticks.appendChild(line);
  }
  document.documentElement.style.overflow = 'hidden';
  let done = false;
  const open = () => {
    if (done) return;
    done = true;
    intro.classList.add('out');
    document.documentElement.style.overflow = '';
    setTimeout(() => intro.remove(), 950);
  };
  setTimeout(() => intro.classList.add('shake'), 1800);
  setTimeout(open, 2900);
  intro.addEventListener('click', open);
  addEventListener('keydown', open, { once: true });
})();

const COUNTRIES = [
  ['spain', 'Испания', '¡Hola!'], ['portugal', 'Португалия', 'Olá!'], ['italy', 'Италия', 'Ciao!'],
  ['france', 'Франция', 'Bonjour!'], ['uae', 'ОАЭ', 'مرحبا'], ['turkey', 'Турция', 'Merhaba!'],
  ['japan', 'Япония', 'こんにちは'], ['thailand', 'Таиланд', 'สวัสดี'], ['uk', 'Великобритания', 'Hello!'], ['usa', 'США', 'Hey!'],
];

// Country cards: the scene still, and its living loop on hover.
const islands = document.querySelector('.islands');
COUNTRIES.forEach(([id, name, hello]) => {
  const card = document.createElement('article');
  card.className = 'island';
  card.setAttribute('role', 'listitem');
  card.innerHTML = `<img src="media/scenes/${id}.jpg" alt="${name}" loading="lazy"><video muted loop playsinline preload="none" src="media/loops/${id}.mp4" aria-hidden="true"></video><div class="label"><small>${hello}</small><b>${name}</b></div>`;
  const video = card.querySelector('video');
  if (!reduced) {
    card.addEventListener('mouseenter', () => video.play().catch(() => {}));
    card.addEventListener('mouseleave', () => video.pause());
  }
  islands.appendChild(card);
});

// Stamp page: impressions are pressed one by one when the section comes into view.
const STAMPS = ['first_step', 'country_spain', 'country_japan', 'country_italy', 'first_chat', 'country_uk', 'country_france', 'country_usa', 'country_thailand'];
const grid = document.querySelector('.stamp-grid');
STAMPS.forEach((id, i) => {
  const img = document.createElement('img');
  img.src = `media/stamps/${id}.png`;
  img.alt = '';
  img.style.setProperty('--r', `${((i * 37) % 19) - 9}deg`);
  img.style.setProperty('--d', `${i * 0.16}s`);
  grid.appendChild(img);
});

// Compass ring ticks.
const ticks = document.querySelector('.ring .ticks');
for (let a = 0; a < 360; a += 6) {
  const major = a % 30 === 0;
  const r1 = 190, r2 = major ? 172 : 180, rad = (a * Math.PI) / 180;
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', 200 + r1 * Math.sin(rad));
  line.setAttribute('y1', 200 - r1 * Math.cos(rad));
  line.setAttribute('x2', 200 + r2 * Math.sin(rad));
  line.setAttribute('y2', 200 - r2 * Math.cos(rad));
  line.setAttribute('stroke', major ? '#FFB627' : 'rgba(255,255,255,.45)');
  line.setAttribute('stroke-width', major ? 2.5 : 1);
  ticks.appendChild(line);
}

// Sakura over the phone, as in the app's Japan scene.
if (!reduced) {
  const sakura = document.querySelector('.sakura');
  for (let i = 0; i < 16; i++) {
    const p = document.createElement('i');
    p.style.left = `${Math.random() * 100}%`;
    p.style.animationDuration = `${6 + Math.random() * 6}s`;
    p.style.animationDelay = `${-Math.random() * 10}s`;
    p.style.setProperty('--dx', `${Math.random() * 80 - 20}px`);
    p.style.transform = `scale(${0.6 + Math.random() * 0.8})`;
    sakura.appendChild(p);
  }
}

// Scroll reveal, staggered within each section.
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('on');
    io.unobserve(e.target);
  }),
  { threshold: 0.18 },
);
document.querySelectorAll('section, .marquee').forEach((section) => {
  section.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.setProperty('--delay', `${Math.min(i, 6) * 0.08}s`);
    io.observe(el);
  });
});
io.observe(grid);

// Local files and the admin only open on the team's machine; for everyone else these cards describe, not link.
if (!['localhost', '127.0.0.1'].includes(location.hostname)) {
  document.querySelectorAll('.res').forEach((a) => {
    a.removeAttribute('href');
    a.classList.add('static');
  });
  document.querySelector('#resources .kicker').textContent = 'Что входит в проект';
}

// Nav turns solid after the hero; the glow follows the cursor.
const nav = document.querySelector('.nav');
addEventListener('scroll', () => nav.classList.toggle('solid', scrollY > 80), { passive: true });
if (!reduced) {
  addEventListener('pointermove', (e) => {
    document.documentElement.style.setProperty('--mx', `${e.clientX}px`);
    document.documentElement.style.setProperty('--my', `${e.clientY}px`);
  }, { passive: true });
}
