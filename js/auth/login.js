import API from '../api.js';
import i18n from '../i18n.js';
import ThemeManager from '../theme.js';
import AccessibilityManager from "../accessibility.js";

function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-theme-toggle') === savedTheme);
    });
}

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = i18n.t(key);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        element.placeholder = i18n.t(key);
    });
}

const Login = {
    init() {
        i18n.init();
        ThemeManager.init();
        AccessibilityManager.init();
        loadSavedTheme();
        applyTranslations();

        this.bindEvents();
    },

    bindEvents() {
        document.querySelector('.password-toggle')?.addEventListener('click', () => {
            const input = document.getElementById('loginPassword');
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
        });

        const form = document.getElementById('loginForm');
        form?.querySelectorAll('input').forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearError(input.name));
        });

        form?.addEventListener('submit', (e) => this.handleSubmit(e));

        document.querySelectorAll('[data-modal-close]').forEach(btn => {
            btn.addEventListener('click', () => this.hideLoginError());
        });

        document.querySelector('[data-modal="login-error"]')?.addEventListener('click', (e) => {
            if (e.target.matches('[data-modal="login-error"]')) {
                this.hideLoginError();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideLoginError();
            }
        });
    },

    validateField(input) {
        const value = input.value.trim();

        if (!value) {
            this.showError(input.name, i18n.t('validation.required'));
            return false;
        }

        if (input.name === 'identifier') {
            const isEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
            const isPhone = /^\+375\s?\(?(29|33|25|44)\)?\s?\d{3}-?\d{2}-?\d{2}$/.test(value);
            if (!isEmail && !isPhone) {
                this.showError('identifier', i18n.t('validation.invalidEmail'));
                return false;
            }
        }

        this.clearError(input.name);
        return true;
    },

    showError(field, message) {
        const errorEl = document.querySelector(`[data-error="${field}"]`);
        if (errorEl) errorEl.textContent = message;
    },

    clearError(field) {
        const errorEl = document.querySelector(`[data-error="${field}"]`);
        if (errorEl) errorEl.textContent = '';
    },

    showLoginError(message) {
        const modal = document.querySelector('[data-modal="login-error"]');
        const messageEl = document.getElementById('loginErrorMessage');

        if (messageEl) {
            messageEl.textContent = message;
        }

        if (!modal) return;

        modal.removeAttribute('hidden');
        modal.classList.add('active');
        document.body.classList.add('modal-open');
        document.body.style.overflow = 'hidden';
        modal.querySelector('[data-modal-close]')?.focus();
    },

    hideLoginError() {
        const modal = document.querySelector('[data-modal="login-error"]');
        if (!modal) return;

        modal.classList.remove('active');
        modal.setAttribute('hidden', '');
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
    },

    async handleSubmit(e) {
        e.preventDefault();

        let valid = true;
        document.querySelectorAll('#loginForm [required]').forEach(input => {
            if (!this.validateField(input)) valid = false;
        });
        if (!valid) return;

        const submitBtn = document.getElementById('loginSubmit');
        submitBtn.disabled = true;

        try {
            const identifier = document.getElementById('loginIdentifier').value.trim();
            const password = document.getElementById('loginPassword').value;
            const remember = document.getElementById('rememberMe')?.checked;

            const users = await API.getUsers();
            const user = users.find(u =>
                (u.email === identifier || u.phone === identifier.replace(/\D/g, '')) &&
                u.password === password
            );

            if (!user) {
                throw new Error('Invalid credentials');
            }

            const session = {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.firstName,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone
            };

            if (remember) {
                localStorage.setItem('currentUser', JSON.stringify(session));
            } else {
                sessionStorage.setItem('currentUser', JSON.stringify(session));
            }

            const redirect = {
                renter: '../pages/catalog.html',
                landlord: '../pages/landlord-profile.html',
                admin: '../pages/admin.html'
            };
            window.location.href = redirect[user.role] || '../index.html';

        } catch (error) {
            console.error('Login error:', error);
            this.showLoginError(i18n.t('auth.login.errorText'));
        } finally {
            submitBtn.disabled = false;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Login.init();
});
