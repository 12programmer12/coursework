const Modal = {
    activeModal: null,

    init() {
        this.bindEvents();
    },

    open(modalId) {
        const modal = document.querySelector(`[data-modal="${modalId}"]`);
        if (!modal) return;

        this.activeModal = modal;
        modal.classList.add('active');
        modal.hidden = false;
        document.body.style.overflow = 'hidden';

        const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            firstFocusable.focus();
        }

        this.trapFocus(modal);
    },

    close(modal) {
        if (!modal) {
            modal = this.activeModal;
        }

        if (!modal) return;

        modal.classList.remove('active');
        setTimeout(() => {
            modal.hidden = true;
        }, 300);

        document.body.style.overflow = '';
        this.activeModal = null;
    },

    closeAll() {
        document.querySelectorAll('[data-modal].active').forEach(modal => {
            this.close(modal);
        });
    },

    trapFocus(modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        modal.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    lastFocusable.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    firstFocusable.focus();
                    e.preventDefault();
                }
            }
        });
    },

    bindEvents() {
        document.querySelectorAll('[data-modal-open]').forEach(btn => {
            btn.addEventListener('click', () => {
                const modalId = btn.getAttribute('data-modal-open');
                this.open(modalId);
            });
        });

        document.querySelectorAll('[data-modal-close]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.close();
            });
        });

        document.querySelectorAll('[data-modal]').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.close(modal);
                }
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModal) {
                this.close();
            }
        });
    }
};

export default Modal;
