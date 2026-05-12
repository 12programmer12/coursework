import API from '../api.js';
import i18n from '../i18n.js';
import ThemeManager from '../theme.js';

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
const Register = {
    nicknameAttempts: 0,
    maxNicknameAttempts: 5,

    init() {
        i18n.init();
        ThemeManager.init();
        loadSavedTheme();
        applyTranslations();

        this.bindEvents();
        this.setMaxBirthDate();
        this.updatePasswordRequirements();
    },

    setMaxBirthDate() {
        const input = document.getElementById('birthDate');
        if (input) {
            const minDate = new Date();
            minDate.setFullYear(minDate.getFullYear() - 16);
            input.max = minDate.toISOString().split('T')[0];
        }
    },

    bindEvents() {
        document.querySelectorAll('input[name="passwordMethod"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const manual = document.getElementById('manualPasswordFields');
                const auto = document.getElementById('autoPasswordFields');

                if (e.target.value === 'manual') {
                    manual.hidden = false;
                    auto.hidden = true;
                } else {
                    manual.hidden = true;
                    auto.hidden = false;
                    this.generateAutoPassword();
                }
                this.checkFormValidity();
            });
        });

        document.querySelectorAll('.password-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const input = btn.closest('.password-input-wrapper').querySelector('input');
                const isPassword = input.type === 'password';
                input.type = isPassword ? 'text' : 'password';
                btn.setAttribute('aria-label', isPassword ? 'Скрыть пароль' : 'Показать пароль');
            });
        });

        const password = document.getElementById('password');
        password?.addEventListener('input', () => this.updatePasswordRequirements());

        const passwordConfirm = document.getElementById('passwordConfirm');
        passwordConfirm?.addEventListener('input', () => this.validatePasswordMatch());

        const phone = document.getElementById('phone');
        phone?.addEventListener('input', (e) => this.formatPhone(e.target));

        document.getElementById('generateNickname')?.addEventListener('click', () => this.generateNickname());
        document.getElementById('regeneratePassword')?.addEventListener('click', () => this.generateAutoPassword());
        document.getElementById('copyPassword')?.addEventListener('click', () => this.copyPassword());

        document.querySelectorAll('.auth-form input').forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => {
                this.clearError(input);
                this.checkFormValidity();
            });
        });

        document.getElementById('agreement')?.addEventListener('change', () => this.checkFormValidity());

        document.getElementById('registerForm')?.addEventListener('submit', (e) => this.handleSubmit(e));

        document.getElementById('goToCatalog')?.addEventListener('click', () => {
            window.location.href = '../pages/catalog.html';
        });
    },

    formatPhone(input) {
        let value = input.value.replace(/\D/g, '');

        if (value.startsWith('375')) {
            value = '+' + value;
        } else if (value.startsWith('8')) {
            value = '+375' + value.slice(1);
        } else if (!value.startsWith('+')) {
            value = '+375' + value;
        }

        const match = value.match(/^\+375(\d{0,2})(\d{0,3})(\d{0,2})(\d{0,2})$/);
        if (match) {
            let formatted = '+375';
            if (match[1]) formatted += ` (${match[1]}`;
            if (match[2]) formatted += `) ${match[2]}`;
            if (match[3]) formatted += `-${match[3]}`;
            if (match[4]) formatted += `-${match[4]}`;
            input.value = formatted;
        }
    },

    updatePasswordRequirements() {
        const password = document.getElementById('password')?.value || '';
        const requirements = {
            length: password.length >= 8 && password.length <= 20,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[@$!%*?&]/.test(password)
        };

        Object.entries(requirements).forEach(([key, valid]) => {
            const el = document.querySelector(`[data-requirement="${key}"]`);
            if (el) {
                el.classList.toggle('valid', valid);
            }
        });

        this.checkFormValidity();
    },

    validatePasswordMatch() {
        const passwordMethod = document.querySelector('input[name="passwordMethod"]:checked')?.value;
        if (passwordMethod === 'auto') {
            this.clearError('passwordConfirm');
            return true;
        }

        const password = document.getElementById('password')?.value;
        const confirm = document.getElementById('passwordConfirm')?.value;

        if (confirm && password !== confirm) {
            this.showError('passwordConfirm', i18n.t('validation.passwordMatch'));
            return false;
        }
        this.clearError('passwordConfirm');
        return true;
    },

    generateAutoPassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&';
        let password = '';

        password += 'A';
        password += 'a';
        password += '1';
        password += '@';
        for (let i = 4; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        password = password.split('').sort(() => Math.random() - 0.5).join('');

        document.getElementById('autoPassword').value = password;
        this.checkFormValidity();
    },

    copyPassword() {
        const input = document.getElementById('autoPassword');
        input?.select();
        document.execCommand('copy');

        const btn = document.getElementById('copyPassword');
        const originalText = btn.textContent;
        btn.textContent = 'Скопировано!';
        setTimeout(() => btn.textContent = originalText, 2000);
    },

    generateNickname() {
        if (this.nicknameAttempts >= this.maxNicknameAttempts) {
            document.getElementById('nickname').disabled = false;
            document.getElementById('nicknameAttempts').hidden = true;
            document.getElementById('generateNickname').disabled = true;
            return;
        }

        this.nicknameAttempts++;
        document.getElementById('attemptsCount').textContent = this.nicknameAttempts;
        document.getElementById('nicknameAttempts').hidden = false;

        const adjectives = ['happy', 'swift', 'bright', 'calm', 'wise', 'bold', 'kind', 'free'];
        const nouns = ['wolf', 'eagle', 'bear', 'fox', 'hawk', 'deer', 'owl', 'lynx'];
        const numbers = Math.floor(Math.random() * 900) + 100;

        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];

        document.getElementById('nickname').value = `${adj}${noun}${numbers}`;
        this.checkFormValidity();
    },

    validateField(input) {
        const name = input.name;
        const value = input.value.trim();
        const errorEl = document.querySelector(`[data-error="${name}"]`);

        if (input.required && !value) {
            this.showError(name, i18n.t('validation.required'));
            return false;
        }

        switch (name) {
            case 'firstName':
            case 'lastName':
            case 'patronymic':
                if (value && !/^[А-Яа-яA-Za-zЁё]{2,}$/.test(value)) {
                    this.showError(name, i18n.t('validation.invalidName'));
                    return false;
                }
                break;
            case 'phone':
                if (!/^\+375\s?\(?(29|33|25|44)\)?\s?\d{3}-?\d{2}-?\d{2}$/.test(value)) {
                    this.showError(name, i18n.t('validation.invalidPhone'));
                    return false;
                }
                break;
            case 'email':
                if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
                    this.showError(name, i18n.t('validation.invalidEmail'));
                    return false;
                }
                break;
            case 'birthDate':
                if (value) {
                    const birth = new Date(value);
                    const today = new Date();
                    let age = today.getFullYear() - birth.getFullYear();
                    const m = today.getMonth() - birth.getMonth();
                    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
                    if (age < 16) {
                        this.showError(name, i18n.t('validation.ageRequirement'));
                        return false;
                    }
                }
                break;
            case 'nickname':
                if (!/^[a-zA-Z0-9_]{3,20}$/.test(value)) {
                    this.showError(name, i18n.t('validation.nicknameFormat'));
                    return false;
                }
                break;
        }

        this.clearError(name);
        return true;
    },

    showError(field, message) {
        const errorEl = document.querySelector(`[data-error="${field}"]`);
        if (errorEl) {
            errorEl.textContent = message;
        }
        const input = document.querySelector(`[name="${field}"]`);
        if (input) input.classList.add('form-group--error');
    },

    clearError(field) {
        const errorEl = document.querySelector(`[data-error="${field}"]`);
        if (errorEl) errorEl.textContent = '';
        const input = document.querySelector(`[name="${field}"]`);
        if (input) input.classList.remove('form-group--error');
    },

    checkFormValidity() {
        const form = document.getElementById('registerForm');
        const submitBtn = document.getElementById('registerSubmit');

        const passwordMethod = document.querySelector('input[name="passwordMethod"]:checked')?.value;

        let isPasswordValid = false;
        if (passwordMethod === 'auto') {
            const autoPassword = document.getElementById('autoPassword')?.value || '';
            isPasswordValid = autoPassword.length >= 8 &&
                /[A-Z]/.test(autoPassword) &&
                /[a-z]/.test(autoPassword) &&
                /\d/.test(autoPassword) &&
                /[@$!%*?&]/.test(autoPassword);
        } else {
            isPasswordValid = document.querySelectorAll('.requirement.valid').length === 5 &&
                this.validatePasswordMatch();
        }

        const agreement = document.getElementById('agreement')?.checked;
        const requiredFields = form.querySelectorAll('[required]');

        const allFilled = Array.from(requiredFields).every(input => {
            if (passwordMethod === 'auto' && input.name === 'passwordConfirm') {
                return true;
            }
            if (passwordMethod === 'auto' &&
                (input.id === 'password' || input.id === 'passwordConfirm')) {
                return true;
            }
            if (input.type === 'checkbox') return input.checked;
            return input.value.trim() !== '';
        });

        submitBtn.disabled = !(isPasswordValid && agreement && allFilled);
    },

    async handleSubmit(e) {
        e.preventDefault();

        let isValid = true;
        document.querySelectorAll('.auth-form [required]').forEach(input => {
            const passwordMethod = document.querySelector('input[name="passwordMethod"]:checked')?.value;
            if (passwordMethod === 'auto' && input.name === 'passwordConfirm') {
                return;
            }
            if (!this.validateField(input)) isValid = false;
        });

        if (!isValid) return;

        const submitBtn = document.getElementById('registerSubmit');
        submitBtn.disabled = true;
        submitBtn.textContent = i18n.t('common.loading');

        try {
            const formData = new FormData(e.target);
            const passwordMethod = formData.get('passwordMethod');

            const userData = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                patronymic: formData.get('patronymic') || null,
                birthDate: formData.get('birthDate'),
                phone: formData.get('phone').replace(/\D/g, ''),
                email: formData.get('email'),
                nickname: formData.get('nickname'),
                role: formData.get('role'),
                password: passwordMethod === 'auto'
                    ? document.getElementById('autoPassword').value
                    : formData.get('password'),
                createdAt: new Date().toISOString(),
                favorites: [],
                bookings: []
            };

            console.log('📤 Creating user via API:', userData);

            const createdUser = await API.createUser(userData);
            console.log('✅ User created with ID:', createdUser.id);

            const user = {
                id: createdUser.id,
                ...createdUser
            };
            localStorage.setItem('currentUser', JSON.stringify(user));

            document.getElementById('successUsername').textContent = createdUser.firstName;
            const modal = document.querySelector('[data-modal="register-success"]');
            modal.classList.add('active');
            modal.hidden = false;

        } catch (error) {
            console.error('❌ Registration error:', error);
            alert(i18n.t('common.error') + ': ' + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = i18n.t('auth.register.submit');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Register.init();
});
