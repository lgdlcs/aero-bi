// ============ PLANNING — Google Sheet integration ============
const SHEET_CONFIG = {
  // K-loo: coller ici la clé publiée (la partie "2PACX-xxx" de l'URL)
  publishedKey: ''
};

(function initPlanning() {
  var section = document.getElementById('planning');
  var loading = document.getElementById('planning-loading');
  var error = document.getElementById('planning-error');
  var tableContainer = document.getElementById('planning-table-container');
  var tbody = document.getElementById('planning-body');

  if (!section || !tbody) return;
  if (!SHEET_CONFIG.publishedKey) return; // section stays hidden

  section.style.display = '';

  var url = 'https://docs.google.com/spreadsheets/d/e/' +
    SHEET_CONFIG.publishedKey + '/pub?gid=0&single=true&output=csv';

  fetch(url)
    .then(function(res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.text();
    })
    .then(function(csv) {
      var rows = parseCSV(csv);
      if (rows.length < 2) throw new Error('empty');
      renderTable(tbody, rows.slice(1));
      loading.style.display = 'none';
      tableContainer.style.display = '';
    })
    .catch(function() {
      loading.style.display = 'none';
      error.style.display = '';
    });
})();

function parseCSV(text) {
  var rows = [];
  var row = [];
  var field = '';
  var inQuotes = false;

  for (var i = 0; i < text.length; i++) {
    var c = text[i];
    var next = text[i + 1];

    if (inQuotes) {
      if (c === '"' && next === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ',') {
        row.push(field.trim());
        field = '';
      } else if (c === '\n' || (c === '\r' && next === '\n')) {
        row.push(field.trim());
        rows.push(row);
        row = [];
        field = '';
        if (c === '\r') i++;
      } else {
        field += c;
      }
    }
  }
  if (field || row.length) {
    row.push(field.trim());
    rows.push(row);
  }
  return rows;
}

function renderTable(tbody, dataRows) {
  tbody.innerHTML = dataRows.map(function(cols) {
    var date = cols[0] || '';
    var activity = cols[1] || '';
    var duration = cols[2] || '';
    var spots = cols[3] || '';
    var notes = cols[4] || '';

    var actClass = getActivityClass(activity);
    var spotsClass = getSpotsClass(spots);

    return '<tr>' +
      '<td>' + escapeHtml(date) + '</td>' +
      '<td><span class="badge-activity ' + actClass + '">' + escapeHtml(activity) + '</span></td>' +
      '<td>' + escapeHtml(duration) + '</td>' +
      '<td><span class="badge-spots ' + spotsClass + '">' + escapeHtml(spots) + '</span></td>' +
      '<td>' + escapeHtml(notes) + '</td>' +
      '</tr>';
  }).join('');
}

function getActivityClass(activity) {
  var a = activity.toLowerCase();
  if (a.indexOf('parapente') !== -1 || a.indexOf('paraglid') !== -1) return 'badge-parapente';
  if (a.indexOf('speed') !== -1) return 'badge-speedriding';
  if (a.indexOf('mini') !== -1) return 'badge-minivoile';
  return 'badge-default';
}

function getSpotsClass(spots) {
  var s = spots.toLowerCase();
  if (s === 'complet' || s === 'full' || s === '0') return 'badge-spots-full';
  var n = parseInt(spots, 10);
  if (!isNaN(n) && n <= 2) return 'badge-spots-limited';
  return 'badge-spots-available';
}

function escapeHtml(str) {
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
document.querySelectorAll('a[href="#stage-parapente"], a[href="#stage-minivoile"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = link.getAttribute('href');
    const tabMap = { '#stage-parapente': 'parapente', '#stage-minivoile': 'minivoile' };
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
    
    // Fermer tous les autres accordéons
    document.querySelectorAll('.stage-details').forEach(detail => {
      if (detail !== details) {
        detail.style.display = 'none';
      }
    });
    document.querySelectorAll('.stage-toggle').forEach(btn => {
      if (btn !== toggle) {
        btn.classList.remove('active');
        btn.textContent = 'En savoir +';
      }
    });
    
    // Toggle l'accordéon actuel
    if (isVisible) {
      details.classList.add('closing');
      setTimeout(() => {
        details.style.display = 'none';
        details.classList.remove('closing');
      }, 300);
      toggle.classList.remove('active');
      toggle.textContent = 'En savoir +';
    } else {
      details.style.display = 'block';
      toggle.classList.add('active');
      toggle.textContent = 'Masquer';
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
