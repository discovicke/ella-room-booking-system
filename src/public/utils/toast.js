// Usage:
// import { showToast, success, error, info } from '/utils/toast.js';
// showToast('Saved'); success('Saved successfully');
'use strict';

const DEFAULT_DURATION = 6000; // ms
let stylesInjected = false;

/* --- Helpers --- */
function injectStyles() {
    if (stylesInjected) return;
    stylesInjected = true;
    const css = `
/* Toast container */
#toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 2000;
  pointer-events: none;
}

/* Toast card */
.toast {
  pointer-events: auto;
  background: var(--color-bg-toast);
  border-left: 4px solid #10B981;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 280px;
  transform: translateX(120%);
  animation: toast-slide-in 450ms cubic-bezier(.2,.9,.2,1) forwards;
  position: relative;
  overflow: hidden;
  font-family: "Nunito Sans", sans-serif;
  font-size: var(--font-base);
  line-height: var(--leading-normal);
}

/* types */
.toast.toast-success { border-left-color: var(--color-success); }
.toast.toast-error   { border-left-color: var(--color-danger); }
.toast.toast-info    { border-left-color: var(--color-primary); }

.toast .toast-icon { font-size: var(--font-sm); }
.toast .toast-content { flex: 1; }
.toast .toast-title { 
  color: var(--color-text-main); 
  font-weight: 700; 
  font-size: var(--font-sm); 
  line-height: var(--leading-tight);
  margin-bottom: 2px; 
}
.toast .toast-desc { 
  font-size: var(--font-sm); 
  line-height: var(--leading-normal);
  color: var(--color-text-muted); 
}

/* progress */
.toast .toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: currentColor;
  width: 100%;
  transform-origin: left center;
  animation: toast-progress var(--toast-duration, 5000ms) linear forwards;
}

/* default color mapping for progress per type */
.toast-success .toast-progress { background: var(--color-success); }
.toast-error .toast-progress { background:var(--color-danger);  }
.toast-info .toast-progress { background: var(--color-primary); }

/* hover pauses progress (visual; JS also pauses timer) */
.toast:hover .toast-progress { animation-play-state: paused; }

/* exit */
@keyframes toast-slide-in {
  from { transform: translateX(120%); opacity: 0; }
  to   { transform: translateX(0); opacity: 1; }
}
@keyframes toast-slide-out {
  from { transform: translateX(0); opacity: 1; }
  to   { transform: translateX(120%); opacity: 0; }
}
@keyframes toast-progress {
  from { width: 100%; }
  to   { width: 0%; }
}

/* small close button */
.toast .toast-close {
  font-family: "Nunito Sans", sans-serif;
  margin-left: 8px;
  background: transparent;
  border: none;
  font-size: var(--font-base);
  font-weight: 700;
  line-height: var(--leading-normal);
  color: var(--color-danger);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s ease;
}
.toast .toast-close:hover {
  color: var(--color-danger-hover);
}
.toast .toast-close:active {
   color: var(--color-danger-click);
}
`;
    const s = document.createElement('style');
    s.id = 'toast-styles';
    s.textContent = css;
    document.head.appendChild(s);
}

function ensureContainer() {
    injectStyles();
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    return container;
}

/* --- Core showToast --- */
export function showToast(message = '', opts = {}) {
    const { title = '', type = '', duration = DEFAULT_DURATION } = opts;
    const container = ensureContainer();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.setProperty('--toast-duration', `${Math.max(500, duration)}ms`);
    toast.setAttribute('role', 'status');

    const icon = {
        success: '️🎉',
        error: '⚠️',
        info: '🔔',
    }[type] || '🔔';

    toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-content">
      ${title 
        ? `<div class="toast-title">${title}</div>` 
        : ''}
      <div class="toast-desc">${message}</div>
    </div>
    <button class="toast-close" aria-label="Close">&times;</button>
    <div class="toast-progress"></div>
  `;

    container.appendChild(toast);

    let remaining = duration;
    let removeTimer = setTimeout(removeNow, remaining);
    let start = Date.now();

    function removeNow() {
        toast.style.animation = 'toast-slide-out 300ms forwards';

        const prog = toast.querySelector('.toast-progress');
        if (prog) prog.style.animationPlayState = 'paused';
        setTimeout(() => toast.remove(), 320);
    }

    function pause() {
        clearTimeout(removeTimer);
        const elapsed = Date.now() - start;
        remaining = Math.max(0, remaining - elapsed);
        const prog = toast.querySelector('.toast-progress');
        if (prog) prog.style.animationPlayState = 'paused';
    }

    function resume() {
        start = Date.now();
        const prog = toast.querySelector('.toast-progress');
        if (prog) prog.style.animationPlayState = 'running';
        removeTimer = setTimeout(removeNow, remaining);
    }

    toast.addEventListener('mouseenter', pause);
    toast.addEventListener('focusin', pause);
    toast.addEventListener('mouseleave', resume);
    toast.addEventListener('focusout', resume);

    toast.querySelector('.toast-close')?.addEventListener('click', () => {
        clearTimeout(removeTimer);
        removeNow();
    });

    toast.addEventListener('click', (e) => {
        if ((e.target).closest('.toast-close')) return;
        clearTimeout(removeTimer);
        removeNow();
    });

    return {
        dismiss: () => {
            clearTimeout(removeTimer);
            removeNow();
        },
    };
}

/* Convenience helpers */
export const showSuccess = (msg, opts = {}) => showToast(msg, { ...opts, type: 'success', title: opts.title || 'Success' });
export const showError = (msg, opts = {}) => showToast(msg, { ...opts, type: 'error', title: opts.title || 'Error' });
export const showInfo  = (msg, opts = {}) => showToast(msg, { ...opts, type: 'info',  title: opts.title || 'Info' });