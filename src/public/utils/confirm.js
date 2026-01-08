// Usage:
// import { showConfirm } from '/utils/confirm.js';
// const confirmed = await showConfirm('Är du säker?');
// if (confirmed) { ... }
'use strict';

let stylesInjected = false;

/* --- Helpers --- */
function injectStyles() {
  if (stylesInjected) return;
  stylesInjected = true;
  const css = `
/* Confirm modal */
.confirm-modal-backdrop {
  position: fixed;
  inset: 0;
  margin: 0;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #1f293766;
  backdrop-filter: blur(4px);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  z-index: 3000;
}

.confirm-modal-backdrop.open {
  opacity: 1;
  pointer-events: auto;
}

.confirm-modal-content {
  background: var(--color-bg-panel);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  box-shadow: 0 2px 6px #0000000a;
  padding: 24px;
  max-width: 420px;
  width: 100%;
  transform: scale(0.9) translateY(-20px);
  transition: transform 0.4s var(--ease-elastic), opacity 0.3s ease;
  opacity: 0;
  position: relative;
  box-sizing: border-box;
}

.confirm-modal-backdrop.open .confirm-modal-content {
  transform: scale(1) translateY(0);
  opacity: 1;
}

.confirm-modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.confirm-modal-icon {
  font-size: 24px;
  line-height: 1;
}

.confirm-modal-title {
  font-family: "Nunito Sans", sans-serif;
  color: var(--color-primary);
  margin: 0;
  font-size: var(--font-lg);
  font-weight: 700;
  line-height: var(--leading-tight);
}

.confirm-modal-message {
  font-family: "Nunito Sans", sans-serif;
  margin: 0 0 24px;
  font-size: var(--font-base);
  line-height: var(--leading-normal);
  color: var(--color-text);
}

.confirm-modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.confirm-modal-btn {
  font-family: "Nunito Sans", sans-serif;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: var(--font-base);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;
}

.confirm-modal-btn-cancel {
  background: var(--color-bg-secondary);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.confirm-modal-btn-cancel:hover {
  background: var(--color-bg-hover);
}

.confirm-modal-btn-confirm {
  background: var(--color-danger);
  color: white;
}

.confirm-modal-btn-confirm:hover {
  background: var(--color-danger-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.confirm-modal-btn-confirm:active {
  transform: translateY(0);
}

/* Animation */
.confirm-modal-content.shake {
  animation: nudge 0.3s ease-in-out;
}
`;

  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);
}

function ensureContainer() {
  injectStyles();
  let container = document.getElementById('confirm-modal-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'confirm-modal-container';
    document.body.appendChild(container);
  }
  return container;
}

/* --- Main Function --- */
export async function showConfirm(message, options = {}) {
  const {
    title = 'Bekräfta',
    confirmText = 'Ja',
    cancelText = 'Avbryt',
    icon = '⚠️',
    dangerConfirm = true
  } = options;

  return new Promise((resolve) => {
    const container = ensureContainer();

    // Create modal HTML
    const backdrop = document.createElement('div');
    backdrop.className = 'confirm-modal-backdrop';

    const content = document.createElement('div');
    content.className = 'confirm-modal-content';

    content.innerHTML = `
      <div class="confirm-modal-header">
        <span class="confirm-modal-icon">${icon}</span>
        <h3 class="confirm-modal-title">${title}</h3>
      </div>
      <p class="confirm-modal-message">${message}</p>
      <div class="confirm-modal-actions">
        <button class="confirm-modal-btn confirm-modal-btn-cancel" data-action="cancel">
          ${cancelText}
        </button>
        <button class="confirm-modal-btn confirm-modal-btn-confirm ${dangerConfirm ? '' : 'confirm-modal-btn-primary'}" data-action="confirm">
          ${confirmText}
        </button>
      </div>
    `;

    backdrop.appendChild(content);
    container.appendChild(backdrop);

    // Function to close modal
    const closeModal = (result) => {
      backdrop.classList.remove('open');
      setTimeout(() => {
        container.removeChild(backdrop);
        resolve(result);
      }, 300);
    };

    // Function to nudge modal
    const nudgeModal = () => {
      content.classList.remove('shake');
      void content.offsetWidth; // Force reflow
      content.classList.add('shake');
      setTimeout(() => content.classList.remove('shake'), 300);
    };

    // Event listeners
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        nudgeModal(); // Nudge instead of closing
      }
    });

    content.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      if (action === 'cancel') {
        closeModal(false);
      } else if (action === 'confirm') {
        closeModal(true);
      }
    });

    // Keyboard support
    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        closeModal(false);
        document.removeEventListener('keydown', handleKeydown);
      } else if (e.key === 'Enter') {
        closeModal(true);
        document.removeEventListener('keydown', handleKeydown);
      }
    };
    document.addEventListener('keydown', handleKeydown);

    // Open modal
    requestAnimationFrame(() => {
      backdrop.classList.add('open');
    });
  });
}

// Convenience function for dangerous actions
export async function showDangerConfirm(message, title = 'Varning') {
  return showConfirm(message, {
    title,
    icon: '⚠️',
    confirmText: 'Ta bort',
    cancelText: 'Avbryt',
    dangerConfirm: true
  });
}

// Convenience function for standard confirmations
export async function showStandardConfirm(message, title = 'Bekräfta') {
  return showConfirm(message, {
    title,
    icon: '❓',
    confirmText: 'Ja',
    cancelText: 'Nej',
    dangerConfirm: false
  });
}

