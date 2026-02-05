(function() {
  'use strict';

  // Configuration
  var BASE_URL = 'https://certiread.de'; // Change in production
  var BADGE_SELECTOR = 'script[data-certification]';

  // Styles
  var styles = `
    .certiread-badge {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      text-decoration: none;
      color: inherit;
    }
    .certiread-badge:hover {
      border-color: #10b981;
      box-shadow: 0 4px 6px rgba(16, 185, 129, 0.1);
    }
    .certiread-badge-icon {
      width: 24px;
      height: 24px;
      background: #10b981;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .certiread-badge-icon svg {
      width: 14px;
      height: 14px;
      color: white;
    }
    .certiread-badge-text {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }
    .certiread-badge-title {
      font-size: 12px;
      font-weight: 600;
      color: #111827;
      line-height: 1.2;
    }
    .certiread-badge-subtitle {
      font-size: 10px;
      color: #6b7280;
      line-height: 1.2;
    }
    .certiread-badge.invalid {
      opacity: 0.6;
    }
    .certiread-badge.invalid .certiread-badge-icon {
      background: #ef4444;
    }
    .certiread-popup {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      opacity: 0;
      visibility: hidden;
      transition: all 0.2s ease;
    }
    .certiread-popup.visible {
      opacity: 1;
      visibility: visible;
    }
    .certiread-popup-content {
      background: white;
      border-radius: 12px;
      max-width: 400px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }
    .certiread-popup-header {
      padding: 16px;
      background: #10b981;
      border-radius: 12px 12px 0 0;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .certiread-popup-header.invalid {
      background: #ef4444;
    }
    .certiread-popup-header-icon {
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .certiread-popup-header-icon svg {
      width: 20px;
      height: 20px;
      color: white;
    }
    .certiread-popup-header-text {
      color: white;
    }
    .certiread-popup-header-title {
      font-size: 16px;
      font-weight: 600;
    }
    .certiread-popup-header-subtitle {
      font-size: 12px;
      opacity: 0.9;
    }
    .certiread-popup-body {
      padding: 16px;
    }
    .certiread-popup-section {
      margin-bottom: 16px;
    }
    .certiread-popup-section:last-child {
      margin-bottom: 0;
    }
    .certiread-popup-section-title {
      font-size: 11px;
      font-weight: 500;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 8px;
    }
    .certiread-popup-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .certiread-popup-tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      background: #d1fae5;
      color: #065f46;
      border-radius: 9999px;
      font-size: 12px;
    }
    .certiread-popup-tag svg {
      width: 12px;
      height: 12px;
    }
    .certiread-popup-footer {
      padding: 12px 16px;
      background: #f9fafb;
      border-radius: 0 0 12px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .certiread-popup-footer-text {
      font-size: 11px;
      color: #6b7280;
    }
    .certiread-popup-footer-link {
      font-size: 12px;
      color: #10b981;
      text-decoration: none;
      font-weight: 500;
    }
    .certiread-popup-footer-link:hover {
      text-decoration: underline;
    }
    .certiread-popup-close {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 32px;
      height: 32px;
      background: rgba(255, 255, 255, 0.2);
      border: none;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    .certiread-popup-close:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  `;

  // Inject styles
  function injectStyles() {
    if (document.getElementById('certiread-styles')) return;
    var styleEl = document.createElement('style');
    styleEl.id = 'certiread-styles';
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  }

  // Create badge element
  function createBadge(data, code) {
    var badge = document.createElement('a');
    badge.className = 'certiread-badge' + (data.valid ? '' : ' invalid');
    badge.href = BASE_URL + '/verify/' + code;
    badge.target = '_blank';
    badge.rel = 'noopener noreferrer';

    badge.innerHTML = `
      <div class="certiread-badge-icon">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          ${data.valid
            ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>'
            : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>'}
        </svg>
      </div>
      <div class="certiread-badge-text">
        <span class="certiread-badge-title">${data.valid ? 'Transparenz-Zertifikat' : 'Zertifikat widerrufen'}</span>
        <span class="certiread-badge-subtitle">Verifiziert von Certiread</span>
      </div>
    `;

    // Add click handler for popup
    badge.addEventListener('click', function(e) {
      e.preventDefault();
      showPopup(data, code);
    });

    return badge;
  }

  // Show popup
  function showPopup(data, code) {
    var existingPopup = document.getElementById('certiread-popup');
    if (existingPopup) existingPopup.remove();

    var popup = document.createElement('div');
    popup.id = 'certiread-popup';
    popup.className = 'certiread-popup';

    var tagsHtml = data.creationProcess.map(function(p) {
      return '<span class="certiread-popup-tag"><svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>' + p + '</span>';
    }).join('');

    popup.innerHTML = `
      <div class="certiread-popup-content" style="position: relative;">
        <button class="certiread-popup-close" onclick="document.getElementById('certiread-popup').classList.remove('visible')">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        <div class="certiread-popup-header ${data.valid ? '' : 'invalid'}">
          <div class="certiread-popup-header-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              ${data.valid
                ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>'
                : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>'}
            </svg>
          </div>
          <div class="certiread-popup-header-text">
            <div class="certiread-popup-header-title">${data.valid ? 'Verifiziertes Transparenz-Zertifikat' : 'Zertifikat widerrufen'}</div>
            <div class="certiread-popup-header-subtitle">Ausgestellt von ${data.publisher}</div>
          </div>
        </div>
        <div class="certiread-popup-body">
          <div class="certiread-popup-section">
            <div class="certiread-popup-section-title">Erstellungsprozess</div>
            <div class="certiread-popup-tags">${tagsHtml}</div>
          </div>
          ${data.author ? `
          <div class="certiread-popup-section">
            <div class="certiread-popup-section-title">Autor</div>
            <div style="font-size: 14px; color: #111827;">${data.author}</div>
          </div>
          ` : ''}
          ${data.hasSourcesCited || data.hasFactCheck ? `
          <div class="certiread-popup-section">
            <div class="certiread-popup-section-title">Qualitätssicherung</div>
            <div class="certiread-popup-tags">
              ${data.hasSourcesCited ? '<span class="certiread-popup-tag"><svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>Quellen angegeben</span>' : ''}
              ${data.hasFactCheck ? '<span class="certiread-popup-tag"><svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>Faktencheck</span>' : ''}
            </div>
          </div>
          ` : ''}
        </div>
        <div class="certiread-popup-footer">
          <span class="certiread-popup-footer-text">Zertifikat-Code: ${code}</span>
          <a href="${BASE_URL}/verify/${code}" target="_blank" rel="noopener noreferrer" class="certiread-popup-footer-link">Vollständiges Zertifikat →</a>
        </div>
      </div>
    `;

    document.body.appendChild(popup);

    // Close on background click
    popup.addEventListener('click', function(e) {
      if (e.target === popup) {
        popup.classList.remove('visible');
      }
    });

    // Show popup with animation
    requestAnimationFrame(function() {
      popup.classList.add('visible');
    });
  }

  // Initialize badges
  function init() {
    injectStyles();

    var scripts = document.querySelectorAll(BADGE_SELECTOR);

    scripts.forEach(function(script) {
      var code = script.getAttribute('data-certification');
      if (!code) return;

      // Create placeholder
      var placeholder = document.createElement('div');
      placeholder.className = 'certiread-badge';
      placeholder.innerHTML = '<span style="font-size: 12px; color: #9ca3af;">Lade...</span>';
      script.parentNode.insertBefore(placeholder, script.nextSibling);

      // Fetch badge data
      fetch(BASE_URL + '/api/badge/' + code)
        .then(function(res) { return res.json(); })
        .then(function(data) {
          if (data.error) {
            placeholder.innerHTML = '<span style="font-size: 12px; color: #ef4444;">Zertifikat nicht gefunden</span>';
            return;
          }

          var badge = createBadge(data, code);
          placeholder.replaceWith(badge);
        })
        .catch(function() {
          placeholder.innerHTML = '<span style="font-size: 12px; color: #ef4444;">Fehler beim Laden</span>';
        });
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
