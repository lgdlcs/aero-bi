// Mobile nav toggle
const toggle = document.getElementById('nav-toggle');
const links = document.getElementById('nav-links');
toggle.addEventListener('click', () => links.classList.toggle('open'));
links.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => links.classList.remove('open'));
});

// Nav scroll effect — transparent → solid
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

// Paragliders follow cursor
const hero = document.getElementById('hero');
const paragliders = document.querySelectorAll('.paraglider');

hero.addEventListener('mousemove', (e) => {
  const rect = hero.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const mouseX = e.clientX - rect.left - centerX;
  const mouseY = e.clientY - rect.top - centerY;

  paragliders.forEach((pg) => {
    const speed = parseFloat(pg.dataset.speed) || 0.03;
    const offsetX = mouseX * speed;
    const offsetY = mouseY * speed * 0.6;
    const tilt = mouseX * speed * 0.15;
    pg.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(${tilt}deg)`;
  });
});

hero.addEventListener('mouseleave', () => {
  paragliders.forEach((pg) => {
    pg.style.transform = 'translate(0, 0) rotate(0deg)';
  });
});

// Tabs
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
  });
});
