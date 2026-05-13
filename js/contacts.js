import ThemeManager from './theme.js';
import i18n from './i18n.js';
import AccessibilityManager from "./accessibility.js";

function getPagePath(pageName) {
    const currentPath = window.location.pathname;
    if (currentPath.includes('/pages/')) {
        return `${pageName}.html`;
    }
    return `pages/${pageName}.html`;
}

function initProfileButton() {
    const userBtn = document.querySelector('[data-user-menu]');
    if (!userBtn) return;

    userBtn.addEventListener('click', () => {
        const storedUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        const currentUser = storedUser ? JSON.parse(storedUser) : null;

        if (!currentUser) {
            window.location.href = getPagePath('login');
        } else {
            const roleRoutes = {
                'renter': getPagePath('profile'),
                'landlord': getPagePath('landlord-profile'),
                'admin': getPagePath('admin')
            };
            window.location.href = roleRoutes[currentUser.role] || getPagePath('profile');
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    await i18n.init();
    ThemeManager.init();
    AccessibilityManager.init();
    initProfileButton();
    applyTranslations();

    document.addEventListener('languageChanged', () => {
        applyTranslations();
    });
});

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = i18n.t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        element.placeholder = i18n.t(element.getAttribute('data-i18n-placeholder'));
    });
}
