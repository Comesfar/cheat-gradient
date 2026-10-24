// CheatGradient - XenForo & CheatGlobal Content Script

(function () {
  'use strict';

  const PRESETS = [
    { name: 'Cyberpunk', colors: ['#ff007f', '#7928ca', '#00f0ff'] },
    { name: 'CG Vibe', colors: ['#ff2a55', '#ffaa00', '#00ffcc'] },
    { name: 'Gökkuşağı', colors: ['#ff0055', '#ffaa00', '#00ff66', '#00c3ff', '#a855f7'] },
    { name: 'Sunset', colors: ['#ff416c', '#ff4b2b'] },
    { name: 'Altın', colors: ['#ffd700', '#f59f00', '#e65100'] },
    { name: 'Neon Mor', colors: ['#d946ef', '#8b5cf6', '#3b82f6'] },
    { name: 'Buz & Ateş', colors: ['#00f5d4', '#7b2cbf', '#f72585'] },
    { name: 'Venom', colors: ['#00ff87', '#60efff'] }
  ];

  let activePreset = PRESETS[0];
  let activeMode = 'char';
  let isBold = true;
  let autoInsertOnPaste = true; // "Yapıştırınca doğrudan mesaja yazdır"
  let floatingBadge = null;
  let activeTarget = null;
  let savedRange = null;

  // Listen for messages from extension popup / background
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'insert_gradient_text') {
      const success = insertIntoXenForoEditor(request.bbcode, request.html);
      if (success) {
        showPageToast('Renkli metin editöre eklendi!');
      }
      sendResponse({ success });
      return true;
    }
    if (request.action === 'context_menu_gradient' && request.text) {
      activeTarget = {
        editor: getXenForoEditor(),
        text: request.text
      };
      openModal(request.text);
    }
  });

  // Color math
  function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const val = parseInt(hex, 16);
    return { r: (val >> 16) & 255, g: (val >> 8) & 255, b: val & 255 };
  }

  function rgbToHex(r, g, b) {
    const toHex = c => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  function interpolateColors(colors, factor) {
    if (factor <= 0) return colors[0];
    if (factor >= 1) return colors[colors.length - 1];
    const segs = colors.length - 1;
    const seg = Math.min(Math.floor(factor * segs), segs - 1);
    const local = (factor - seg / segs) * segs;
    const c1 = hexToRgb(colors[seg]);
    const c2 = hexToRgb(colors[seg + 1]);
    return rgbToHex(
      c1.r + (c2.r - c1.r) * local,
      c1.g + (c2.g - c1.g) * local,
      c1.b + (c2.b - c1.b) * local
    );
  }

  function generateGradientData(text, colors, mode) {
    if (!text) return [];
    const parts = [];

    if (mode === 'word') {
      const words = text.split(/(\s+)/);
      const nonSpaceCount = words.filter(w => !/^\s+$/.test(w) && w.length > 0).length;
      let wIdx = 0;
      words.forEach(w => {
        if (!w) return;
        if (/^\s+$/.test(w)) {
          parts.push({ text: w, color: null, isSpace: true });
        } else {
          const factor = nonSpaceCount > 1 ? wIdx / (nonSpaceCount - 1) : 0;
          parts.push({ text: w, color: interpolateColors(colors, factor), isSpace: false });
          wIdx++;
        }
      });
    } else {
      const chars = Array.from(text);
      const nonSpaceIndices = [];
      chars.forEach((c, idx) => {
        if (!/\s/.test(c)) nonSpaceIndices.push(idx);
      });
      const total = nonSpaceIndices.length;
      let curr = 0;
      chars.forEach(c => {
        if (/\s/.test(c)) {
          parts.push({ text: c, color: null, isSpace: true });
        } else {
          const factor = total > 1 ? curr / (total - 1) : 0;
          parts.push({ text: c, color: interpolateColors(colors, factor), isSpace: false });
          curr++;
        }
      });
    }
    return parts;
  }

  function toBBCode(parts, bold = true) {
    let res = '';
    parts.forEach(p => {
      if (p.isSpace || !p.color) res += p.text;
      else res += `[COLOR=${p.color.toUpperCase()}]${p.text}[/COLOR]`;
    });
    return bold ? `[B]${res}[/B]` : res;
  }

  function toHTML(parts, bold = true) {
    let res = '';
    parts.forEach(p => {
      if (p.isSpace || !p.color) res += p.text.replace(/\n/g, '<br>');
      else res += `<span style="color: ${p.color};">${p.text}</span>`;
    });
    return bold ? `<b>${res}</b>` : res;
  }

  // Find XenForo Froala or Textarea Editor
  function getXenForoEditor() {
    // 1. Froala Editor rich text view
    const froala = document.querySelector('.fr-element.fr-view[contenteditable="true"]');
    if (froala && froala.offsetParent !== null) return { type: 'froala', el: froala };

    // 2. XenForo BBCode raw textarea (when BBCode mode toggle is active)
    const textarea = document.querySelector('textarea.bbCodeEditorContainer, textarea.js-editor, textarea[name="message"], .bbCodeEditorContainer textarea');
    if (textarea && textarea.offsetParent !== null) return { type: 'textarea', el: textarea };

    // 3. Fallback active element
    if (document.activeElement && (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.isContentEditable)) {
      return {
        type: document.activeElement.tagName === 'TEXTAREA' ? 'textarea' : 'froala',
        el: document.activeElement
      };
    }
    return null;
  }

  function showPageToast(message) {
    const existing = document.getElementById('cgPageToast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'cgPageToast';
    toast.className = 'cg-page-toast';
    toast.innerHTML = `<span>✨</span> <span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) toast.remove();
    }, 2500);
  }

  // Insert formatted content into XenForo editor
  function insertIntoXenForoEditor(bbcode, html, customSavedRange = null) {
    const editor = getXenForoEditor();
    if (!editor) return false;

    if (editor.type === 'froala') {
      editor.el.focus();
      const sel = window.getSelection();
      const rangeToUse = customSavedRange || savedRange;

      if (rangeToUse) {
        try {
          sel.removeAllRanges();
          sel.addRange(rangeToUse);
        } catch (e) {}
      }

      // Try execCommand first (safest for Froala's internal undo stack)
      const success = document.execCommand('insertHTML', false, html + '&nbsp;');
      if (!success) {
        // Fallback contextual fragment insertion
        try {
          if (sel && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            range.deleteContents();
            const frag = document.createRange().createContextualFragment(html + '&nbsp;');
            range.insertNode(frag);
          } else {
            editor.el.innerHTML += html + '&nbsp;';
          }
        } catch (err) {
          editor.el.innerHTML += html + '&nbsp;';
        }
      }

      // Trigger XenForo auto-save listeners
      editor.el.dispatchEvent(new Event('input', { bubbles: true }));
      editor.el.dispatchEvent(new Event('change', { bubbles: true }));
      editor.el.dispatchEvent(new Event('keyup', { bubbles: true }));
      return true;
    } else if (editor.type === 'textarea') {
      const textarea = editor.el;
      const start = textarea.selectionStart || textarea.value.length;
      const end = textarea.selectionEnd || textarea.value.length;
      const before = textarea.value.substring(0, start);
      const after = textarea.value.substring(end);
      textarea.value = before + bbcode + ' ' + after;
      textarea.selectionStart = textarea.selectionEnd = start + bbcode.length + 1;
      textarea.focus();
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
    return false;
  }

  // Floating button when text is selected in XenForo editor
  document.addEventListener('mouseup', handleTextSelection);

  function handleTextSelection(e) {
    if (e.target.closest('#cgGradientModal') || e.target.closest('#cgFloatingBadge')) {
      return;
    }

    setTimeout(() => {
      const sel = window.getSelection();
      const selectedText = sel ? sel.toString().trim() : '';

      const editor = getXenForoEditor();
      if (!selectedText || !editor) {
        removeFloatingBadge();
        return;
      }

      let isInsideEditor = false;
      if (editor.type === 'froala' && editor.el.contains(sel.anchorNode)) {
        isInsideEditor = true;
      } else if (editor.type === 'textarea' && editor.el === document.activeElement) {
        isInsideEditor = true;
      }

      if (isInsideEditor && selectedText.length > 0) {
        savedRange = sel.rangeCount > 0 ? sel.getRangeAt(0).cloneRange() : null;
        activeTarget = {
          editor,
          text: selectedText
        };
        showFloatingBadge(e.pageX, e.pageY);
      } else {
        removeFloatingBadge();
      }
    }, 50);
  }

  function showFloatingBadge(x, y) {
    removeFloatingBadge();
    floatingBadge = document.createElement('div');
    floatingBadge.id = 'cgFloatingBadge';
    floatingBadge.className = 'cg-floating-badge';
    floatingBadge.innerHTML = '<span>🌈</span> Gradyan Yap';
    floatingBadge.style.left = `${Math.max(10, x - 40)}px`;
    floatingBadge.style.top = `${Math.max(10, y - 10)}px`;

    floatingBadge.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openModal(activeTarget.text);
      removeFloatingBadge();
    });

    document.body.appendChild(floatingBadge);
  }

  function removeFloatingBadge() {
    if (floatingBadge) {
      floatingBadge.remove();
      floatingBadge = null;
    }
  }

  // Quick In-Page Modal for XenForo
  function openModal(initialText = '') {
    const existing = document.getElementById('cgGradientModal');
    if (existing) existing.remove();

    const currentSavedRange = savedRange;

    const overlay = document.createElement('div');
    overlay.id = 'cgGradientModal';
    overlay.className = 'cg-modal-overlay';

    const box = document.createElement('div');
    box.className = 'cg-modal-box';

    // Header
    const header = document.createElement('div');
    header.className = 'cg-modal-header';
    header.innerHTML = `
      <div class="cg-modal-title">🌈 CheatGradient &bull; Yazı Renklendirici</div>
      <button class="cg-modal-close" title="Kapat">&times;</button>
    `;

    // Body
    const body = document.createElement('div');
    body.className = 'cg-modal-body';

    // Input Group
    const inputGroup = document.createElement('div');
    inputGroup.className = 'cg-input-group';
    inputGroup.innerHTML = `
      <div class="cg-modal-label">
        <span>Metin:</span>
        <span style="font-size:10px; color:#64748b; font-weight:normal;">(Yapıştırabilir veya yazabilirsiniz)</span>
      </div>
    `;

    const textarea = document.createElement('textarea');
    textarea.className = 'cg-modal-input';
    textarea.placeholder = 'Metninizi buraya yapıştırın... (Ctrl+V)';
    textarea.value = initialText || '';
    inputGroup.appendChild(textarea);

    // Live Preview
    const preview = document.createElement('div');
    preview.className = 'cg-modal-preview';

    // Presets Grid
    const presetsLabel = document.createElement('div');
    presetsLabel.className = 'cg-modal-label';
    presetsLabel.textContent = 'RENK PALETİ SEÇİN:';

    const presetsGrid = document.createElement('div');
    presetsGrid.className = 'cg-modal-presets-grid';

    PRESETS.forEach(p => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cg-modal-preset' + (p.name === activePreset.name ? ' selected' : '');
      btn.textContent = p.name;
      btn.style.background = `linear-gradient(90deg, ${p.colors.join(', ')})`;
      btn.addEventListener('click', () => {
        activePreset = p;
        presetsGrid.querySelectorAll('.cg-modal-preset').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        updateModalPreview();
      });
      presetsGrid.appendChild(btn);
    });

    // Options Bar: Mode + Auto Insert on Paste toggle
    const optionsBar = document.createElement('div');
    optionsBar.className = 'cg-modal-options';

    const modeToggle = document.createElement('div');
    modeToggle.className = 'cg-mode-toggle';
    modeToggle.innerHTML = `
      <button type="button" class="cg-mode-btn ${activeMode === 'char' ? 'active' : ''}" data-mode="char">Karakter</button>
      <button type="button" class="cg-mode-btn ${activeMode === 'word' ? 'active' : ''}" data-mode="word">Kelime</button>
    `;

    modeToggle.querySelectorAll('.cg-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeMode = btn.dataset.mode;
        modeToggle.querySelectorAll('.cg-mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateModalPreview();
      });
    });

    const autoInsertToggle = document.createElement('label');
    autoInsertToggle.className = 'cg-auto-insert-toggle';
    autoInsertToggle.title = 'Kutudayken Ctrl+V ile yapıştırdığınız an doğrudan editöre renkli olarak yazar';
    autoInsertToggle.innerHTML = `
      <input type="checkbox" id="cgAutoInsertCheck" ${autoInsertOnPaste ? 'checked' : ''}>
      <span>⚡ Yapıştırınca direk mesaja yaz</span>
    `;

    const autoInsertCheck = autoInsertToggle.querySelector('#cgAutoInsertCheck');
    autoInsertCheck.addEventListener('change', (e) => {
      autoInsertOnPaste = e.target.checked;
    });

    optionsBar.appendChild(modeToggle);
    optionsBar.appendChild(autoInsertToggle);

    body.appendChild(inputGroup);
    body.appendChild(preview);
    body.appendChild(presetsLabel);
    body.appendChild(presetsGrid);
    body.appendChild(optionsBar);

    // Footer
    const footer = document.createElement('div');
    footer.className = 'cg-modal-footer';
    footer.innerHTML = `
      <div class="cg-footer-info">İpucu: Enter tuşuyla da ekleyebilirsiniz</div>
      <div class="cg-btn-actions">
        <button type="button" class="cg-btn-cancel">İptal</button>
        <button type="button" class="cg-btn-apply">✨ Editöre Yazdır</button>
      </div>
    `;

    box.appendChild(header);
    box.appendChild(body);
    box.appendChild(footer);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    function updateModalPreview() {
      const currentText = textarea.value.trim() || initialText || 'Önizleme Metni';
      const parts = generateGradientData(currentText, activePreset.colors, activeMode);
      preview.innerHTML = toHTML(parts, isBold);
    }
    updateModalPreview();

    // Helper: Execute insertion into XenForo
    function applyAndClose(textToInsert) {
      const text = textToInsert || textarea.value;
      if (!text || !text.trim()) {
        textarea.focus();
        return;
      }

      const parts = generateGradientData(text, activePreset.colors, activeMode);
      const bbcode = toBBCode(parts, isBold);
      const html = toHTML(parts, isBold);

      const inserted = insertIntoXenForoEditor(bbcode, html, currentSavedRange);
      if (inserted) {
        showPageToast('Renkli metin editöre eklendi!');
      } else {
        // Fallback: Copy to clipboard if editor wasn't found
        navigator.clipboard.writeText(bbcode);
        showPageToast('BBCode panoya kopyalandı!');
      }

      overlay.remove();
    }

    // ⭐ USER'S KEY REQUIREMENT:
    // When text is pasted into the modal input, immediately write to editor if auto-insert is checked!
    textarea.addEventListener('paste', (e) => {
      if (autoInsertOnPaste) {
        e.preventDefault();
        const clipboardText = (e.clipboardData || window.clipboardData).getData('text');
        if (clipboardText && clipboardText.trim()) {
          textarea.value = clipboardText;
          updateModalPreview();
          setTimeout(() => {
            applyAndClose(clipboardText);
          }, 60);
        }
      } else {
        setTimeout(updateModalPreview, 10);
      }
    });

    textarea.addEventListener('input', updateModalPreview);

    // Keyboard shortcuts: Enter or Ctrl+Enter to apply
    textarea.addEventListener('keydown', (e) => {
      if ((e.ctrlKey && e.key === 'Enter') || (e.key === 'Enter' && !e.shiftKey)) {
        e.preventDefault();
        applyAndClose();
      }
    });

    // Auto-focus input
    setTimeout(() => {
      textarea.focus();
      if (textarea.value) {
        textarea.select();
      }
    }, 50);

    // Event handlers
    header.querySelector('.cg-modal-close').addEventListener('click', () => overlay.remove());
    footer.querySelector('.cg-btn-cancel').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    footer.querySelector('.cg-btn-apply').addEventListener('click', () => {
      applyAndClose();
    });
  }

  // Inject a toolbar button into XenForo Froala toolbar
  function tryInjectToolbarButton() {
    const toolbar = document.querySelector('.fr-toolbar');
    if (!toolbar || toolbar.querySelector('.cg-toolbar-btn')) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'fr-command fr-btn cg-toolbar-btn';
    btn.title = 'CheatGradient - Gradyanlı Renkli Yazı Ekle';
    btn.innerHTML = '<span style="font-size: 16px;">🌈</span>';

    btn.addEventListener('mousedown', () => {
      // Save current selection before button click steals focus
      const sel = window.getSelection();
      savedRange = sel && sel.rangeCount > 0 ? sel.getRangeAt(0).cloneRange() : null;
    });

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const sel = window.getSelection();
      const text = sel ? sel.toString().trim() : '';
      openModal(text);
    });

    // Append to toolbar
    const buttonGroup = toolbar.querySelector('.fr-btn-grp') || toolbar;
    buttonGroup.appendChild(btn);
  }

  // Observe DOM for XenForo Froala toolbar loading dynamically
  const observer = new MutationObserver(() => {
    tryInjectToolbarButton();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  tryInjectToolbarButton();

})();
