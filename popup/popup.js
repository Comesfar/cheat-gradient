// CheatGradient - Popup Logic

const PRESETS = [
  { name: 'Cyberpunk', colors: ['#ff007f', '#7928ca', '#00f0ff'] },
  { name: 'CG Vibe', colors: ['#ff2a55', '#ffaa00', '#00ffcc'] },
  { name: 'Gökkuşağı', colors: ['#ff0055', '#ffaa00', '#00ff66', '#00c3ff', '#a855f7'] },
  { name: 'Sunset', colors: ['#ff416c', '#ff4b2b'] },
  { name: 'Altın / Gold', colors: ['#ffd700', '#f59f00', '#e65100'] },
  { name: 'Neon Mor', colors: ['#d946ef', '#8b5cf6', '#3b82f6'] },
  { name: 'Buz & Ateş', colors: ['#00f5d4', '#7b2cbf', '#f72585'] },
  { name: 'Venom', colors: ['#00ff87', '#60efff'] }
];

let state = {
  text: 'İyi Kullanımlar Dileriz / CheatGlobal Ailesi',
  colors: ['#ff007f', '#7928ca', '#00f0ff'],
  mode: 'char', // 'char' or 'word'
  bold: true,
  italic: false,
  center: false
};

// DOM Elements
const inputText = document.getElementById('inputText');
const livePreview = document.getElementById('livePreview');
const charCount = document.getElementById('charCount');
const presetsContainer = document.getElementById('presetsContainer');
const colorStopsContainer = document.getElementById('colorStopsContainer');
const addColorBtn = document.getElementById('addColorBtn');
const modeCharBtn = document.getElementById('modeChar');
const modeWordBtn = document.getElementById('modeWord');
const toggleBoldBtn = document.getElementById('toggleBold');
const toggleItalicBtn = document.getElementById('toggleItalic');
const toggleCenterBtn = document.getElementById('toggleCenter');
const copyBbcodeBtn = document.getElementById('copyBbcodeBtn');
const copyHtmlBtn = document.getElementById('copyHtmlBtn');
const insertToEditorBtn = document.getElementById('insertToEditorBtn');
const toastEl = document.getElementById('toast');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadSavedState();
  initPresets();
  renderColorStops();
  updatePreview();
  bindEvents();
});

function loadSavedState() {
  chrome.storage.local.get(['cg_state'], (result) => {
    if (result && result.cg_state) {
      state = { ...state, ...result.cg_state };
      inputText.value = state.text;
      updateModeButtons();
      updateStyleButtons();
      renderColorStops();
      updatePreview();
    }
  });
}

function saveState() {
  chrome.storage.local.set({ cg_state: state });
}

// Setup Presets UI
function initPresets() {
  presetsContainer.innerHTML = '';
  PRESETS.forEach((preset) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'preset-btn';
    btn.textContent = preset.name;
    btn.style.background = `linear-gradient(90deg, ${preset.colors.join(', ')})`;
    btn.addEventListener('click', () => {
      state.colors = [...preset.colors];
      renderColorStops();
      updatePreview();
      saveState();
      highlightActivePreset(btn);
    });
    presetsContainer.appendChild(btn);
  });
}

function highlightActivePreset(activeBtn) {
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
  if (activeBtn) activeBtn.classList.add('active');
}

// Render Color Stops
function renderColorStops() {
  colorStopsContainer.innerHTML = '';
  state.colors.forEach((color, index) => {
    const item = document.createElement('div');
    item.className = 'color-stop-item';

    const input = document.createElement('input');
    input.type = 'color';
    input.value = color;
    input.title = `Renk ${index + 1}`;
    input.addEventListener('input', (e) => {
      state.colors[index] = e.target.value;
      updatePreview();
      saveState();
    });

    item.appendChild(input);

    if (state.colors.length > 2) {
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'remove-stop-btn';
      removeBtn.innerHTML = '&#215;';
      removeBtn.title = 'Bu rengi kaldır';
      removeBtn.addEventListener('click', () => {
        state.colors.splice(index, 1);
        renderColorStops();
        updatePreview();
        saveState();
      });
      item.appendChild(removeBtn);
    }

    colorStopsContainer.appendChild(item);
  });
}

// Color Interpolation Utilities
function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  const intVal = parseInt(hex, 16);
  return {
    r: (intVal >> 16) & 255,
    g: (intVal >> 8) & 255,
    b: intVal & 255
  };
}

function rgbToHex(r, g, b) {
  const toHex = c => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function interpolateColors(colorArray, factor) {
  if (factor <= 0) return colorArray[0];
  if (factor >= 1) return colorArray[colorArray.length - 1];

  const segments = colorArray.length - 1;
  const segment = Math.min(Math.floor(factor * segments), segments - 1);
  const localFactor = (factor - segment / segments) * segments;

  const c1 = hexToRgb(colorArray[segment]);
  const c2 = hexToRgb(colorArray[segment + 1]);

  const r = c1.r + (c2.r - c1.r) * localFactor;
  const g = c1.g + (c2.g - c1.g) * localFactor;
  const b = c1.b + (c2.b - c1.b) * localFactor;

  return rgbToHex(r, g, b);
}

// Generate Gradient Data for given text
function generateGradientParts(text, colors, mode) {
  if (!text) return [];

  const parts = [];

  if (mode === 'word') {
    // Split by whitespace while preserving spaces
    const words = text.split(/(\s+)/);
    const nonSpaceCount = words.filter(w => !/^\s+$/.test(w) && w.length > 0).length;
    let wordIndex = 0;

    words.forEach((chunk) => {
      if (!chunk) return;
      if (/^\s+$/.test(chunk)) {
        parts.push({ text: chunk, color: null, isSpace: true });
      } else {
        const factor = nonSpaceCount > 1 ? wordIndex / (nonSpaceCount - 1) : 0;
        const color = interpolateColors(colors, factor);
        parts.push({ text: chunk, color: color, isSpace: false });
        wordIndex++;
      }
    });
  } else {
    // Character by character
    const chars = Array.from(text);
    // Find non-whitespace characters to calculate gradient progress accurately
    const nonSpaceIndices = [];
    chars.forEach((c, idx) => {
      if (!/\s/.test(c)) nonSpaceIndices.push(idx);
    });

    const totalNonSpace = nonSpaceIndices.length;
    let activeNonSpace = 0;

    chars.forEach((c) => {
      if (/\s/.test(c)) {
        parts.push({ text: c, color: null, isSpace: true });
      } else {
        const factor = totalNonSpace > 1 ? activeNonSpace / (totalNonSpace - 1) : 0;
        const color = interpolateColors(colors, factor);
        parts.push({ text: c, color: color, isSpace: false });
        activeNonSpace++;
      }
    });
  }

  return parts;
}

// Generate BBCode
function buildBBCode(parts) {
  let bbcode = '';
  parts.forEach((p) => {
    if (p.isSpace || !p.color) {
      bbcode += p.text;
    } else {
      bbcode += `[COLOR=${p.color.toUpperCase()}]${p.text}[/COLOR]`;
    }
  });

  if (state.bold) bbcode = `[B]${bbcode}[/B]`;
  if (state.italic) bbcode = `[I]${bbcode}[/I]`;
  if (state.center) bbcode = `[CENTER]${bbcode}[/CENTER]`;

  return bbcode;
}

// Generate HTML
function buildHTML(parts) {
  let html = '';
  parts.forEach((p) => {
    if (p.isSpace || !p.color) {
      html += p.text.replace(/\n/g, '<br>');
    } else {
      html += `<span style="color: ${p.color};">${p.text}</span>`;
    }
  });

  if (state.bold) html = `<b>${html}</b>`;
  if (state.italic) html = `<i>${html}</i>`;
  if (state.center) html = `<div style="text-align: center;">${html}</div>`;

  return html;
}

// Update Live Preview Box
function updatePreview() {
  state.text = inputText.value;
  charCount.textContent = `${state.text.length} karakter`;

  if (!state.text.trim()) {
    livePreview.innerHTML = '<span style="color: #64748b;">(Önizleme burada görünecektir)</span>';
    return;
  }

  const parts = generateGradientParts(state.text, state.colors, state.mode);
  livePreview.innerHTML = buildHTML(parts);

  if (state.bold) livePreview.style.fontWeight = 'bold';
  else livePreview.style.fontWeight = 'normal';

  if (state.italic) livePreview.style.fontStyle = 'italic';
  else livePreview.style.fontStyle = 'normal';

  if (state.center) livePreview.style.textAlign = 'center';
  else livePreview.style.textAlign = 'left';
}

function updateModeButtons() {
  modeCharBtn.classList.toggle('active', state.mode === 'char');
  modeWordBtn.classList.toggle('active', state.mode === 'word');
}

function updateStyleButtons() {
  toggleBoldBtn.classList.toggle('active', state.bold);
  toggleItalicBtn.classList.toggle('active', state.italic);
  toggleCenterBtn.classList.toggle('active', state.center);
}

// Toast Feedback
function showToast(message = 'Kopyalandı!') {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  setTimeout(() => {
    toastEl.classList.remove('show');
  }, 2200);
}

// Event Bindings
function bindEvents() {
  inputText.addEventListener('input', () => {
    updatePreview();
    saveState();
  });

  addColorBtn.addEventListener('click', () => {
    if (state.colors.length >= 7) {
      showToast('En fazla 7 renk eklenebilir');
      return;
    }
    // Interpolate midpoint or pick random vibrant color
    const lastColor = state.colors[state.colors.length - 1];
    state.colors.push('#ffffff');
    renderColorStops();
    updatePreview();
    saveState();
  });

  modeCharBtn.addEventListener('click', () => {
    state.mode = 'char';
    updateModeButtons();
    updatePreview();
    saveState();
  });

  modeWordBtn.addEventListener('click', () => {
    state.mode = 'word';
    updateModeButtons();
    updatePreview();
    saveState();
  });

  toggleBoldBtn.addEventListener('click', () => {
    state.bold = !state.bold;
    updateStyleButtons();
    updatePreview();
    saveState();
  });

  toggleItalicBtn.addEventListener('click', () => {
    state.italic = !state.italic;
    updateStyleButtons();
    updatePreview();
    saveState();
  });

  toggleCenterBtn.addEventListener('click', () => {
    state.center = !state.center;
    updateStyleButtons();
    updatePreview();
    saveState();
  });

  // Copy BBCode
  copyBbcodeBtn.addEventListener('click', () => {
    const parts = generateGradientParts(state.text, state.colors, state.mode);
    const bbcode = buildBBCode(parts);
    navigator.clipboard.writeText(bbcode).then(() => {
      showToast('BBCode Panoya Kopyalandı! 📋');
    }).catch(() => {
      fallbackCopy(bbcode);
    });
  });

  // Copy HTML
  copyHtmlBtn.addEventListener('click', () => {
    const parts = generateGradientParts(state.text, state.colors, state.mode);
    const html = buildHTML(parts);
    navigator.clipboard.writeText(html).then(() => {
      showToast('HTML Kopyalandı!');
    }).catch(() => {
      fallbackCopy(html);
    });
  });

  // Insert Directly into XenForo Editor in active tab
  insertToEditorBtn.addEventListener('click', () => {
    const parts = generateGradientParts(state.text, state.colors, state.mode);
    const bbcode = buildBBCode(parts);
    const html = buildHTML(parts);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || tabs.length === 0) {
        showToast('Aktif sekme bulunamadı');
        return;
      }

      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'insert_gradient_text',
        bbcode: bbcode,
        html: html
      }, (response) => {
        if (chrome.runtime.lastError || !response || !response.success) {
          // If content script wasn't able to insert directly, copy BBCode and tell user
          navigator.clipboard.writeText(bbcode);
          showToast('CheatGlobal editörü bulunamadı. BBCode panoya kopyalandı! (Ctrl+V ile yapıştırabilirsiniz)');
        } else {
          showToast('Editöre başarıyla eklendi! ✨');
        }
      });
    });
  });
}

function fallbackCopy(text) {
  const el = document.createElement('textarea');
  el.value = text;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  showToast('Kopyalandı!');
}
