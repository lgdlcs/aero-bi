// ============ PLANNING — Google Sheet integration ============
// INSTRUCTIONS:
// 1. Créer un Google Sheet avec colonnes: mois | jour | jour_nom | type | note
// 2. Types valides: INITIATION, PROGRESSION, PERFECTIONNEMENT, INIT MINI VOILE (ou vide)
// 3. Fichier → Partager → Publier sur le Web → CSV
// 4. Coller l'ID du sheet ci-dessous
const PLANNING_SHEET_ID = '1dOMlrbUE90ALgJm8atHsT-zGMRcD9hQNjfxUXzJDFLg';

// Fallback: planning local (utilisé quand pas de Google Sheet)
const PLANNING_FALLBACK = 'planning-template.csv';

(function initPlanning() {
  var container = document.getElementById('planning-container');
  if (!container) return;

  var url = PLANNING_SHEET_ID
    ? 'https://docs.google.com/spreadsheets/d/' + PLANNING_SHEET_ID + '/gviz/tq?tqx=out:csv'
    : PLANNING_FALLBACK;

  fetch(url)
    .then(function(res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.text();
    })
    .then(function(csv) {
      var rows = parsePlanningCSV(csv);
      if (rows.length < 2) throw new Error('empty');
      renderPlanning(container, rows.slice(1)); // skip header
    })
    .catch(function(err) {
      container.innerHTML = '<p style="text-align:center;color:#999;padding:40px 0;">Planning temporairement indisponible.</p>';
    });
})();

function parsePlanningCSV(text) {
  var rows = [];
  var row = [];
  var field = '';
  var inQuotes = false;
  for (var i = 0; i < text.length; i++) {
    var c = text[i], next = text[i + 1];
    if (inQuotes) {
      if (c === '"' && next === '"') { field += '"'; i++; }
      else if (c === '"') { inQuotes = false; }
      else { field += c; }
    } else {
      if (c === '"') { inQuotes = true; }
      else if (c === ',') { row.push(field.trim()); field = ''; }
      else if (c === '\n' || (c === '\r' && next === '\n')) {
        row.push(field.trim()); rows.push(row); row = []; field = '';
        if (c === '\r') i++;
      } else { field += c; }
    }
  }
  if (field || row.length) { row.push(field.trim()); rows.push(row); }
  return rows;
}

function renderPlanning(container, dataRows) {
  // Group by month
  var months = {};
  var monthOrder = [];
  dataRows.forEach(function(cols) {
    var mois = (cols[0] || '').trim();
    var jour = (cols[1] || '').trim();
    var jourNom = (cols[2] || '').trim();
    var type = (cols[3] || '').trim();
    var note = (cols[4] || '').trim();
    if (!mois || !jour) return;
    if (!months[mois]) { months[mois] = []; monthOrder.push(mois); }
    months[mois].push({ jour: jour, jourNom: jourNom, type: type, note: note });
  });

  var typeClasses = {
    'INITIATION': 'initiation',
    'PROGRESSION': 'progression',
    'PERFECTIONNEMENT': 'perfectionnement',
    'INIT MINI VOILE': 'init-mini-voile'
  };

  var html = '<div class="planning-grid">';
  monthOrder.forEach(function(mois) {
    html += '<div class="planning-month">';
    html += '<div class="planning-month-header">' + escHtml(mois) + '</div>';
    html += '<table><thead><tr><th>Jour</th><th></th><th>Stage</th><th></th></tr></thead><tbody>';
    months[mois].forEach(function(d) {
      var isWeekend = (d.jourNom === 'S' || d.jourNom === 'D');
      var cls = typeClasses[d.type.toUpperCase()] || 'empty';
      var hasNote = d.note ? ' has-note' : '';
      var label = d.type || '';
      // Shorten labels
      if (label === 'PERFECTIONNEMENT') label = 'Perf.';
      else if (label === 'INIT MINI VOILE') label = 'Mini Voile';
      else if (label === 'INITIATION') label = 'Init.';
      else if (label === 'PROGRESSION') label = 'Prog.';

      html += '<tr class="' + (isWeekend ? 'weekend' : '') + hasNote + '">';
      html += '<td class="day-num">' + escHtml(d.jour) + '</td>';
      html += '<td class="day-name">' + escHtml(d.jourNom) + '</td>';
      html += '<td class="day-type ' + cls + '">' + (cls !== 'empty' ? escHtml(label) : '') + '</td>';
      html += '<td class="day-note">' + (d.note ? escHtml(d.note) : '') + '</td>';
      html += '</tr>';
    });
    html += '</tbody></table></div>';
  });
  html += '</div>';

  container.innerHTML = html;
}

function escHtml(str) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

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

// Deep-link to stage tabs from nav
document.querySelectorAll('a[href="#stage-parapente"], a[href="#stage-minivoile"], a[href="#speedriding"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = link.getAttribute('href');
    const tabMap = { '#stage-parapente': 'parapente', '#stage-minivoile': 'minivoile', '#speedriding': 'speedriding' };
    const tabName = tabMap[target];
    if (tabName) {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      const tab = document.querySelector(`.tab[data-tab="${tabName}"]`);
      if (tab) tab.classList.add('active');
      const content = document.getElementById('tab-' + tabName);
      if (content) content.classList.add('active');
    }
  });
});

// Stage details toggles (accordéon "En savoir +")
document.querySelectorAll('.stage-toggle').forEach(toggle => {
  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = toggle.getAttribute('data-target');
    const details = document.getElementById(targetId);
    
    if (!details) return;
    
    const isVisible = details.style.display !== 'none';
    const isEnglish = document.documentElement.lang === 'en';
    const showMoreText = isEnglish ? 'Learn more' : 'En savoir +';
    const hideText = isEnglish ? 'Hide' : 'Masquer';
    
    // Fermer tous les autres accordéons
    document.querySelectorAll('.stage-details').forEach(detail => {
      if (detail !== details) {
        detail.style.display = 'none';
      }
    });
    document.querySelectorAll('.stage-toggle').forEach(btn => {
      if (btn !== toggle) {
        btn.classList.remove('active');
        btn.textContent = showMoreText;
      }
    });
    
    if (isVisible) {
      details.classList.add('closing');
      setTimeout(() => {
        details.style.display = 'none';
        details.classList.remove('closing');
      }, 300);
      toggle.classList.remove('active');
      toggle.textContent = showMoreText;
    } else {
      details.style.display = 'block';
      toggle.classList.add('active');
      toggle.textContent = hideText;
    }
  });
});

// ============ YOUTUBE FALLBACK for file:// protocol ============
(function initYouTubeFallback() {
  // Only activate on file:// protocol
  if (window.location.protocol !== 'file:') return;

  var iframes = document.querySelectorAll('iframe[src*="youtube"]');
  
  iframes.forEach(function(iframe) {
    var src = iframe.src;
    var videoIdMatch = src.match(/embed\/([a-zA-Z0-9_-]+)/);
    
    if (!videoIdMatch) return;
    
    var videoId = videoIdMatch[1];
    var title = iframe.title || 'Vidéo YouTube';
    var thumbnailUrl = 'https://img.youtube.com/vi/' + videoId + '/maxresdefault.jpg';
    var youtubeUrl = 'https://www.youtube.com/watch?v=' + videoId;
    
    // Create fallback link with thumbnail
    var fallback = document.createElement('a');
    fallback.href = youtubeUrl;
    fallback.target = '_blank';
    fallback.rel = 'noopener';
    fallback.className = 'youtube-fallback';
    fallback.style.cssText = 'display: block; position: relative; overflow: hidden; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.3); transition: transform 0.2s; text-decoration: none;';
    
    var img = document.createElement('img');
    img.src = thumbnailUrl;
    img.alt = title;
    img.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
    img.loading = 'lazy';
    
    var playBtn = document.createElement('div');
    playBtn.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 68px; height: 48px; background: rgba(255,0,0,0.8); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px; cursor: pointer;';
    playBtn.innerHTML = '▶';
    
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.7)); padding: 16px; color: white; font-size: 14px; font-weight: 500;';
    overlay.textContent = title;
    
    fallback.appendChild(img);
    fallback.appendChild(playBtn);
    fallback.appendChild(overlay);
    
    // Add hover effect
    fallback.addEventListener('mouseenter', function() {
      fallback.style.transform = 'scale(1.02)';
    });
    fallback.addEventListener('mouseleave', function() {
      fallback.style.transform = 'scale(1)';
    });
    
    // Replace iframe
    iframe.parentNode.replaceChild(fallback, iframe);
  });
})();
