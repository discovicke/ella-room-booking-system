// Usage:
// import { createModal } from '/utils/modal.js';
// const modal = createModal({ title, content, onSubmit, ... });
// modal.open();
'use strict';

let stylesInjected = false;

/* --- Helpers --- */
function injectStyles() {
  if (stylesInjected) return;
  stylesInjected = true;
  const css = `
/* Modal Backdrop */
.ella-modal-backdrop {
  position: fixed;
  inset: 0;
  margin: 0;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 60px;
  background: #1f293766;
  backdrop-filter: blur(4px);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  z-index: 2500;
}

.ella-modal-backdrop.open {
  opacity: 1;
  pointer-events: auto;
}

/* Modal Content */
.ella-modal-content {
  background: var(--color-bg-panel);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  box-shadow: 0 2px 6px #0000000a;
  padding: 20px;
  max-width: 500px;
  width: 100%;
  transform: scale(0.9) translateY(-20px);
  transition: transform 0.4s var(--ease-elastic), opacity 0.3s ease;
  opacity: 0;
  max-height: calc(100vh - 120px);
  overflow: auto;
  position: relative;
  box-sizing: border-box;
}

.ella-modal-backdrop.open .ella-modal-content {
  transform: scale(1) translateY(0);
  opacity: 1;
}

/* Animations */
.ella-modal-content.nudge {
  animation: ella-modal-nudge 0.3s ease-in-out;
}

.ella-modal-content.pop-in {
  animation: ella-modal-pop-in 0.35s;
  animation-fill-mode: both;
}

@keyframes ella-modal-nudge {
  0%, 100% { transform: scale(1) translateY(0); }
  25% { transform: scale(1.02) translateY(-4px); }
  50% { transform: scale(0.98) translateY(2px); }
  75% { transform: scale(1.01) translateY(-2px); }
}

@keyframes ella-modal-pop-in {
  0% { transform: scale(0.8) translateY(-30px); opacity: 0; }
  50% { transform: scale(1.05) translateY(5px); }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

/* Header */
.ella-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.ella-modal-title {
  font-family: "Nunito Sans", sans-serif;
  color: var(--color-primary);
  margin: 0;
  font-size: var(--font-base);
  font-weight: 700;
  line-height: var(--leading-tight);
}

.ella-modal-close {
  background: transparent;
  border: none;
  font-size: 22px;
  line-height: 1;
  color: #6b6b6b;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.ella-modal-close:hover {
  background: var(--color-bg-card);
  color: var(--color-danger);
  scale: 1.01;
}

/* Description */
.ella-modal-description {
  font-family: "Nunito Sans", sans-serif;
  margin: 4px 0 12px;
  font-size: var(--font-sm);
  line-height: var(--leading-normal);
  color: var(--color-text-muted);
}

/* Body (custom content container) */
.ella-modal-body {
  margin: 12px 0;
}

/* Form Styles */
.ella-modal-body form {
  margin: 0;
}

.ella-modal-body form label {
  font-family: "Nunito Sans", sans-serif;
  display: block;
  margin-bottom: 0.5em;
  margin-top: 1em;
  font-size: var(--font-sm);
  font-weight: 600;
  color: var(--color-text-muted);
}

.ella-modal-body form label:first-child {
  margin-top: 0;
}

.ella-modal-body form input[type="date"] {
  position: relative;
  padding-right: 40px;
  cursor: pointer;
  color: var(--color-text-main);
  font-weight: 500;
}

.ella-modal-body form input[type="date"]::-webkit-calendar-picker-indicator {
  position: absolute;
  right: 12px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s ease, transform 0.2s ease;
  filter: var(--calendar-icon-filter, invert(30%) sepia(20%) saturate(500%) hue-rotate(220deg));
}

.ella-modal-body form input[type="date"]:focus::-webkit-calendar-picker-indicator {
  opacity: 1;
}

.ella-modal-body form input[type="date"]::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
  transform: scale(1.1);
  filter: var(--calendar-icon-filter-hover, invert(30%) sepia(80%) saturate(2000%) hue-rotate(260deg) brightness(0.95));
}

.ella-modal-body form input[type="date"]::-webkit-calendar-picker-indicator:active {
  transform: scale(0.95);
}

.ella-modal-body form input[type="date"].selected,
.ella-modal-body form select.selected {
  border-color: var(--color-primary);
  background: var(--color-primary-surface);
  animation: pulse-border 1.5s infinite;
}

.ella-modal-body form input,
.ella-modal-body form textarea,
.ella-modal-body form select {
  font-family: "Nunito Sans", sans-serif;
  display: block;
  width: 100%;
  box-sizing: border-box;
  margin-top: 8px;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: var(--font-sm);
  line-height: var(--leading-normal);
  color: var(--color-asset-text);
  background: var(--color-asset-bg);
  transition: all 0.2s ease;
}

.ella-modal-body form input:focus,
.ella-modal-body form textarea:focus,
.ella-modal-body form select:focus {
  outline: 2px solid rgba(144, 54, 200, 0.12);
  border-color: var(--color-primary-hover);
}

.ella-modal-body form textarea {
  min-height: 80px;
  max-height: 300px;
  overflow: auto;
  resize: vertical;
}

/* Footer Actions */
.ella-modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.ella-modal-btn {
  font-family: "Nunito Sans", sans-serif;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: var(--font-base);
  font-weight: 700;
  line-height: var(--leading-normal);
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 100px;
}

.ella-modal-btn-primary {
  background: var(--color-success);
  color: var(--color-text-on-primary);
}

.ella-modal-btn-primary:hover {
  background: var(--color-success-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.ella-modal-btn-primary:active {
  background: var(--color-success-click);
  transform: scale(0.98) translateY(0);
}

.ella-modal-btn-danger {
  background: var(--color-danger);
  color: var(--color-text-on-primary);
}

.ella-modal-btn-danger:hover {
  background: var(--color-danger-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.ella-modal-btn-danger:active {
  background: var(--color-danger-click);
  transform: scale(0.98) translateY(0);
}

.ella-modal-btn-secondary {
  background: var(--color-bg-secondary);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.ella-modal-btn-secondary:hover {
  background: var(--color-bg-hover);
}

.ella-modal-btn-secondary:active {
  transform: scale(0.98);
}

/* Full width button for single-button modals */
.ella-modal-btn-full {
  width: 100%;
}

/* Scrollbar styling for modal content */
.ella-modal-content::-webkit-scrollbar {
  width: 8px;
}

.ella-modal-content::-webkit-scrollbar-track {
  background: var(--color-bg-secondary);
  border-radius: 4px;
}

.ella-modal-content::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
}

.ella-modal-content::-webkit-scrollbar-thumb:hover {
  background: var(--color-primary);
}
`;

  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);
}

function ensureContainer() {
  injectStyles();
  let container = document.getElementById('ella-modal-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'ella-modal-container';
    document.body.appendChild(container);
  }
  return container;
}

/* --- Main Modal Class --- */
export class Modal {
  constructor(options = {}) {
    const {
      title = 'Dialog',
      description = '',
      content = '',
      maxWidth = '500px',
      buttons = [],
      closeButton = true,
      closeOnEscape = true,
      closeOnBackdrop = false,
      onClose = null,
      className = ''
    } = options;

    this.options = options;
    this.title = title;
    this.description = description;
    this.content = content;
    this.maxWidth = maxWidth;
    this.buttons = buttons;
    this.closeButton = closeButton;
    this.closeOnEscape = closeOnEscape;
    this.closeOnBackdrop = closeOnBackdrop;
    this.onClose = onClose;
    this.className = className;

    this.backdrop = null;
    this.contentEl = null;
    this.bodyEl = null;
    this.isOpen = false;

    this.container = ensureContainer();
  }

  render() {
    // Create backdrop
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'ella-modal-backdrop';

    // Create content
    this.contentEl = document.createElement('div');
    this.contentEl.className = `ella-modal-content ${this.className}`;
    this.contentEl.style.maxWidth = this.maxWidth;

    // Header
    const header = document.createElement('div');
    header.className = 'ella-modal-header';

    const titleEl = document.createElement('h3');
    titleEl.className = 'ella-modal-title';
    titleEl.textContent = this.title;
    header.appendChild(titleEl);

    if (this.closeButton) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'ella-modal-close';
      closeBtn.innerHTML = '×';
      closeBtn.setAttribute('aria-label', 'Stäng dialog');
      closeBtn.addEventListener('click', () => this.close());
      header.appendChild(closeBtn);
    }

    this.contentEl.appendChild(header);

    // Description
    if (this.description) {
      const descEl = document.createElement('p');
      descEl.className = 'ella-modal-description';
      descEl.textContent = this.description;
      this.contentEl.appendChild(descEl);
    }

    // Body
    this.bodyEl = document.createElement('div');
    this.bodyEl.className = 'ella-modal-body';

    if (typeof this.content === 'string') {
      this.bodyEl.innerHTML = this.content;
    } else if (this.content instanceof HTMLElement) {
      this.bodyEl.appendChild(this.content);
    }

    this.contentEl.appendChild(this.bodyEl);

    // Footer with buttons
    if (this.buttons.length > 0) {
      const footer = document.createElement('div');
      footer.className = 'ella-modal-footer';

      this.buttons.forEach(btn => {
        const button = document.createElement('button');
        button.className = `ella-modal-btn ${btn.className || 'ella-modal-btn-secondary'}`;
        button.textContent = btn.text;

        if (btn.onClick) {
          button.addEventListener('click', async (e) => {
            const result = await btn.onClick(e, this);
            // Close modal if onClick doesn't return false
            if (result !== false) {
              this.close();
            }
          });
        }

        footer.appendChild(button);
      });

      this.contentEl.appendChild(footer);
    }

    // Append to backdrop
    this.backdrop.appendChild(this.contentEl);
    this.container.appendChild(this.backdrop);

    // Event listeners
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Close on backdrop click (with nudge)
    this.backdrop.addEventListener('click', (e) => {
      if (e.target === this.backdrop) {
        if (this.closeOnBackdrop) {
          this.close();
        } else {
          this.nudge();
        }
      }
    });

    // Prevent clicks inside content from bubbling
    this.contentEl.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Close on Escape
    if (this.closeOnEscape) {
      this.escapeHandler = (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      };
      document.addEventListener('keydown', this.escapeHandler);
    }
  }

  open() {
    if (this.isOpen) return;

    this.render();
    this.isOpen = true;

    // Trigger open animation
    requestAnimationFrame(() => {
      this.backdrop.classList.add('open');

      // Pop-in animation
      this.contentEl.classList.add('pop-in');
      setTimeout(() => {
        this.contentEl.classList.remove('pop-in');
      }, 350);
    });
  }

  close() {
    if (!this.isOpen) return;

    this.isOpen = false;
    this.backdrop.classList.remove('open');

    // Remove after animation
    setTimeout(() => {
      if (this.backdrop && this.backdrop.parentNode) {
        this.container.removeChild(this.backdrop);
      }

      // Remove escape listener
      if (this.escapeHandler) {
        document.removeEventListener('keydown', this.escapeHandler);
      }

      // Call onClose callback
      if (this.onClose) {
        this.onClose();
      }
    }, 300);
  }

  nudge() {
    if (!this.contentEl) return;
    this.contentEl.classList.remove('nudge');
    void this.contentEl.offsetWidth; // Force reflow
    this.contentEl.classList.add('nudge');
    setTimeout(() => {
      this.contentEl.classList.remove('nudge');
    }, 300);
  }

  // Update content dynamically
  updateContent(newContent) {
    if (!this.bodyEl) return;

    if (typeof newContent === 'string') {
      this.bodyEl.innerHTML = newContent;
    } else if (newContent instanceof HTMLElement) {
      this.bodyEl.innerHTML = '';
      this.bodyEl.appendChild(newContent);
    }
  }

  // Update title dynamically
  updateTitle(newTitle) {
    const titleEl = this.contentEl?.querySelector('.ella-modal-title');
    if (titleEl) {
      titleEl.textContent = newTitle;
    }
  }
}

/* --- Convenience Functions --- */

// Simple alert-style modal
export function showAlert(message, title = 'Information') {
  const modal = new Modal({
    title,
    content: `<p style="margin: 0; color: var(--color-text-main);">${message}</p>`,
    maxWidth: '400px',
    buttons: [
      {
        text: 'OK',
        className: 'ella-modal-btn-primary ella-modal-btn-full',
        onClick: () => true
      }
    ]
  });
  modal.open();
  return modal;
}

// Create a form modal
export function createFormModal(options = {}) {
  const {
    title,
    description,
    fields = [],
    submitText = 'Spara',
    cancelText = 'Avbryt',
    onSubmit,
    maxWidth = '500px'
  } = options;

  // Build form HTML
  let formHTML = '<form id="ella-modal-form">';

  fields.forEach(field => {
    formHTML += `
      <label for="${field.id}">
        ${field.label}${field.required ? ' <span style="color: var(--color-danger);">*</span>' : ''}
      </label>
    `;

    if (field.type === 'textarea') {
      formHTML += `
        <textarea 
          id="${field.id}" 
          name="${field.name || field.id}"
          placeholder="${field.placeholder || ''}"
          ${field.required ? 'required' : ''}
          ${field.rows ? `rows="${field.rows}"` : ''}
        >${field.value || ''}</textarea>
      `;
    } else if (field.type === 'select') {
      formHTML += `<select id="${field.id}" name="${field.name || field.id}" ${field.required ? 'required' : ''}>`;
      (field.options || []).forEach(opt => {
        const selected = opt.value === field.value ? 'selected' : '';
        formHTML += `<option value="${opt.value}" ${selected}>${opt.label}</option>`;
      });
      formHTML += '</select>';
    } else {
      formHTML += `
        <input 
          type="${field.type || 'text'}" 
          id="${field.id}" 
          name="${field.name || field.id}"
          placeholder="${field.placeholder || ''}"
          value="${field.value || ''}"
          ${field.required ? 'required' : ''}
          ${field.min ? `min="${field.min}"` : ''}
          ${field.max ? `max="${field.max}"` : ''}
          ${field.step ? `step="${field.step}"` : ''}
        />
      `;
    }
  });

  formHTML += '</form>';

  const modal = new Modal({
    title,
    description,
    content: formHTML,
    maxWidth,
    buttons: [
      {
        text: cancelText,
        className: 'ella-modal-btn-secondary',
        onClick: () => true // Close modal
      },
      {
        text: submitText,
        className: 'ella-modal-btn-primary',
        onClick: async (e, modalInstance) => {
          const form = document.getElementById('ella-modal-form');
          if (!form.checkValidity()) {
            form.reportValidity();
            modalInstance.nudge();
            return false; // Don't close
          }

          const formData = new FormData(form);
          const data = Object.fromEntries(formData.entries());

          if (onSubmit) {
            const result = await onSubmit(data, modalInstance);
            // If onSubmit returns false, keep modal open
            return result !== false;
          }
          return true; // Close modal
        }
      }
    ]
  });

  modal.open();
  return modal;
}

// Create a custom modal
export function createModal(options) {
  const modal = new Modal(options);
  return modal;
}

// Export default
export default {
  Modal,
  createModal,
  createFormModal,
  showAlert
};

