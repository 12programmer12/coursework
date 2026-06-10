import i18n from '../i18n.js';

let activeConfirm = null;

function closeConfirm(modal, resolve, result) {
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    setTimeout(() => {
        modal.remove();
        if (activeConfirm === modal) {
            activeConfirm = null;
        }
    }, 250);
    resolve(result);
}

export function showConfirm({
    title,
    message,
    confirmText,
    cancelText,
    danger = false
} = {}) {
    return new Promise((resolve) => {
        if (activeConfirm) {
            activeConfirm.remove();
            activeConfirm = null;
        }

        const modal = document.createElement('div');
        modal.className = 'modal confirm-modal active';
        modal.setAttribute('role', 'alertdialog');
        modal.setAttribute('aria-modal', 'true');
        modal.innerHTML = `
            <div class="modal__content modal__content--confirm">
                <div class="modal__header">
                    <h3 class="modal__title">${title || i18n.t('common.confirmTitle')}</h3>
                </div>
                <div class="modal__body">
                    <p class="confirm-modal__message">${message || ''}</p>
                </div>
                <div class="modal__footer confirm-modal__footer">
                    <button type="button" class="btn btn--outline" data-confirm-cancel>
                        ${cancelText || i18n.t('common.cancel')}
                    </button>
                    <button type="button" class="btn ${danger ? 'btn--danger' : 'btn--primary'}" data-confirm-ok>
                        ${confirmText || i18n.t('common.confirm')}
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.classList.add('modal-open');
        document.body.style.overflow = 'hidden';
        activeConfirm = modal;

        modal.querySelector('[data-confirm-ok]').focus();

        modal.querySelector('[data-confirm-ok]').addEventListener('click', () => {
            closeConfirm(modal, resolve, true);
        });

        modal.querySelector('[data-confirm-cancel]').addEventListener('click', () => {
            closeConfirm(modal, resolve, false);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeConfirm(modal, resolve, false);
            }
        });

        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeConfirm(modal, resolve, false);
            }
        });
    });
}

export default showConfirm;
