import ThemeManager from './theme.js';
import AccessibilityManager from './accessibility.js';
import BurgerMenu from './components/burger-menu.js';
import Slider from './components/slider.js';
import Accordion from './components/accordion.js';
import Modal from './components/modal.js';
import API from './api.js';
import i18n from './i18n.js';
import { enrichHousesWithReviews, sortHouses } from './reviews.js';
import { initHeaderBehavior } from './header-behavior.js';



document.addEventListener('DOMContentLoaded', async () => {
    const preloader = document.querySelector('[data-preloader]');
    if (preloader) {
        setTimeout(() => {
            preloader.classList.add('hidden');
            preloader.style.display = 'none';
        }, 500);
    }

    await i18n.init();
    ThemeManager.init();
    AccessibilityManager.init();
    BurgerMenu.init();
    Accordion.init();
    Modal.init();

    const heroSlider = new Slider('[data-hero-slider]', {
        autoplay: true,
        autoplaySpeed: 6000
    });

    initHeaderBehavior();
    await loadCatalog();
    i18n.translateCards();
    initSearch();
    initFilters();
    await initFavorites();
    initForms();
    initSmoothScroll();
    initLazyLoading();
    initSettingsDropdown();
    initLanguageSwitcher();
    initThemeSwitcher();
    initResetSettings();
    initUserMenu();

    console.log('✅ DOMIKTUT application initialized successfully!');
});

async function loadCatalog() {
    const catalogGrid = document.querySelector('[data-catalog-grid]');
    if (!catalogGrid) return;

    try {
        catalogGrid.innerHTML = `
            <div class="catalog-card" data-skeleton>
                <div class="catalog-card__image"></div>
                <div class="catalog-card__content">
                    <div class="catalog-card__title"></div>
                    <div class="catalog-card__features"></div>
                    <div class="catalog-card__price"></div>
                </div>
            </div>
            <div class="catalog-card" data-skeleton>
                <div class="catalog-card__image"></div>
                <div class="catalog-card__content">
                    <div class="catalog-card__title"></div>
                    <div class="catalog-card__features"></div>
                    <div class="catalog-card__price"></div>
                </div>
            </div>
            <div class="catalog-card" data-skeleton>
                <div class="catalog-card__image"></div>
                <div class="catalog-card__content">
                    <div class="catalog-card__title"></div>
                    <div class="catalog-card__features"></div>
                    <div class="catalog-card__price"></div>
                </div>
            </div>
        `;

        let houses = await API.getHouses();
        houses = await enrichHousesWithReviews(houses);
        houses = sortHouses(houses, 'rating-desc');
        catalogGrid.innerHTML = '';

        houses.slice(0, 8).forEach(house => {
            const card = createHouseCard(house);
            catalogGrid.appendChild(card);
        });

        await updateFavoriteButtons();

    } catch (error) {
        console.error('❌ Error loading catalog:', error);
        catalogGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state__title">Ошибка загрузки</div>
                <div class="empty-state__text">Не удалось загрузить каталог. Попробуйте позже.</div>
            </div>
        `;
    }
}






function createHouseCard(house) {
    const getProductPath = (houseId) => {
        const currentPath = window.location.pathname;
        if (currentPath.includes('/pages/')) {
            return `product.html?id=${houseId}`;
        }
        return `pages/product.html?id=${houseId}`;
    };

    const card = document.createElement('article');
    card.className = 'catalog-card';
    card.setAttribute('data-house-card', '');
    card.setAttribute('data-house-id', house.id);

    const houseName = house.name_i18n?.[i18n.currentLang] || house.name;
    const imagePath = fixImagePath(house.images?.[0] || 'assets/images/placeholder.jpg');
    const translatedFeatures = house.features_i18n?.[i18n.currentLang] || house.features || [];

    card.innerHTML = `
        <div class="catalog-card__image">
            <img src="${imagePath}" alt="${houseName}" loading="lazy">
            ${house.isHit ? '<span class="catalog-card__badge" data-i18n="catalog.hit">Хит</span>' : ''}
            <button class="catalog-card__favorite" 
                    data-favorite="${house.id}"
                    aria-label="${i18n.t('catalog.addToFavorites')}"
                    data-i18n-aria="catalog.addToFavorites">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2.5l1.903 3.854a1 1 0 00.754.547l4.243.616-3.07 3.003a1 1 0 00-.288.884l.724 4.226L10 13.5l-3.766 1.98.724-4.226a1 1 0 00-.288-.884l-3.07-3.003 4.243-.616a1 1 0 00.754-.547L10 2.5z" 
                          stroke="currentColor" stroke-width="1.5"/>
                </svg>
            </button>
            <span class="catalog-card__guests">${i18n.t('common.guests')} ${house.guests}</span>
        </div>
        <div class="catalog-card__content">
            <h3 class="catalog-card__title" data-house-name>${houseName}</h3>
            <div class="catalog-card__rating">
                <span class="catalog-card__rating-stars">★ ${house.rating || '0'}</span>
                <span class="catalog-card__rating-count">${i18n.t('reviews.count').replace('{count}', house.reviews || 0)}</span>
            </div>
            <div class="catalog-card__features">
                <span class="catalog-card__feature" data-house-feature>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 1L1 6v9h6v-6h2v6h6V6L8 1z" fill="currentColor"/>
                    </svg>
                    ${house.bedrooms} ${i18n.t('common.bedrooms')}
                </span>
                <span class="catalog-card__feature" data-house-feature>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 1L1 6v9h6v-6h2v6h6V6L8 1z" fill="currentColor"/>
                    </svg>
                    ${house.bathrooms} ${i18n.t('common.bathrooms')}
                </span>
                ${translatedFeatures.slice(0, 2).map(f => `
                    <span class="catalog-card__feature" data-house-feature>${f}</span>
                `).join('')}
            </div>
            <div class="catalog-card__price">
                ${i18n.t('common.from')} ${house.price.toLocaleString(i18n.currentLang === 'ru' ? 'ru-RU' : i18n.currentLang === 'be' ? 'be-BY' : 'en-US')} BYN 
                <span>${i18n.t('common.perNight')}</span>
            </div>
            <a href="${getProductPath(house.id)}" class="catalog-card__button" data-i18n="common.more">Подробнее</a>
        </div>
    `;

    return card;
}

function initSearch() {
    const searchInput = document.querySelector('[data-search-input]');
    if (!searchInput) return;

    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const query = e.target.value.trim();
            if (query.length >= 2) {
                performSearch(query);
            }
        }, 300);
    });
}

async function performSearch(query) {
    try {
        const results = await API.getHouses({ search: query });
        console.log('🔍 Search results:', results);
    } catch (error) {
        console.error('❌ Search error:', error);
    }
}

function initFilters() {
    const filterButtons = document.querySelectorAll('[data-category]');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            const category = btn.getAttribute('data-category');
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            try {
                const houses = await API.getHouses({ category });
                console.log('🔧 Filtered houses:', houses);
            } catch (error) {
                console.error('❌ Filter error:', error);
            }
        });
    });
}

let favoritesInitialized = false;

async function initFavorites() {
    localStorage.removeItem('favorites');

    if (favoritesInitialized) {
        await updateFavoriteButtons();
        return;
    }

    favoritesInitialized = true;

    document.addEventListener('click', async (e) => {
        const favoriteBtn = e.target.closest('[data-favorite]');
        if (!favoriteBtn) return;

        e.preventDefault();
        e.stopPropagation();

        const houseId = favoriteBtn.getAttribute('data-favorite');
        if (!houseId) return;

        await handleFavoriteClick(houseId, favoriteBtn);
    });

    document.querySelectorAll('.header__favorites').forEach(btn => {
        btn.addEventListener('click', () => {
            const user = getCurrentUser();
            const profilePath = window.location.pathname.includes('/pages/')
                ? 'profile.html#favorites'
                : 'pages/profile.html#favorites';
            const loginPath = window.location.pathname.includes('/pages/')
                ? 'login.html'
                : 'pages/login.html';

            window.location.href = user ? profilePath : loginPath;
        });
    });

    await updateFavoriteButtons();
}

async function handleFavoriteClick(houseId, btn) {
    const user = getCurrentUser();

    if (!user) {
        showNotification(i18n.t('favorites.authRequired'), 'info');
        return;
    }

    try {
        const records = await API.getFavorites(user.id);
        const existing = records.find(item => String(item.houseId) === String(houseId));

        if (existing) {
            await API.removeFromFavorites(existing.id);
            btn.classList.remove('active');
            const svg = btn.querySelector('svg path');
            if (svg) svg.setAttribute('fill', 'none');
            showNotification(i18n.t('common.removedFromFavorites'), 'success');
        } else {
            await API.addToFavorites({
                userId: user.id,
                houseId,
                createdAt: new Date().toISOString()
            });
            btn.classList.add('active');
            const svg = btn.querySelector('svg path');
            if (svg) svg.setAttribute('fill', 'currentColor');
            showNotification(i18n.t('common.addedToFavorites'), 'success');
        }

        if (window.location.pathname.includes('profile.html')) {
            window.dispatchEvent(new CustomEvent('favoritesChanged'));
        }
    } catch (error) {
        console.error('❌ Favorite error:', error);
        showNotification(i18n.t('common.error'), 'error');
    }
}

async function getFavorites() {
    const user = getCurrentUser();
    if (!user) return [];

    try {
        const records = await API.getFavorites(user.id);
        return records.map(item => String(item.houseId));
    } catch (error) {
        console.error('❌ Error loading favorites:', error);
        return [];
    }
}

async function updateFavoriteButtons() {
    const favorites = await getFavorites();

    document.querySelectorAll('[data-favorite]').forEach(btn => {
        const houseId = btn.getAttribute('data-favorite');
        const isFavorite = favorites.includes(String(houseId));
        btn.classList.toggle('active', isFavorite);

        const svg = btn.querySelector('svg path');
        if (svg) {
            svg.setAttribute('fill', isFavorite ? 'currentColor' : 'none');
        }
    });
}

function initForms() {
    const searchBtn = document.querySelector('.search-form__btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();

            const checkIn = document.querySelector('.search-form__input[type="date"]:nth-of-type(1)')?.value || '';
            const checkOut = document.querySelector('.search-form__input[type="date"]:nth-of-type(2)')?.value || '';
            const guests = document.querySelector('.search-form__input[type="number"]')?.value || '';
            const priceFrom = document.querySelector('.search-form__price-from')?.value || '';
            const priceTo = document.querySelector('.search-form__price-to')?.value || '';

            const params = new URLSearchParams();
            if (checkIn) params.append('checkIn', checkIn);
            if (checkOut) params.append('checkOut', checkOut);
            if (guests) params.append('guests', guests);
            if (priceFrom) params.append('priceFrom', priceFrom);
            if (priceTo) params.append('priceTo', priceTo);

            const catalogUrl = `pages/catalog.html${params.toString() ? '?' + params.toString() : ''}`;
            window.location.href = catalogUrl;
        });
    }

    const selectionForm = document.querySelector('[data-selection-form]');
    if (selectionForm) {
        selectionForm.addEventListener('submit', handleSelectionRequest);
    }

    document.querySelectorAll('[data-modal-open="selection-modal"]').forEach(btn => {
        btn.addEventListener('click', () => {
            requestAnimationFrame(() => prefillSelectionForm());
        });
    });

    const bookingForm = document.querySelector('[data-booking-form]');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBooking);
    }

    const contactForm = document.querySelector('[data-contact-form]');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
}

function getCurrentUser() {
    const stored = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
}

function prefillSelectionForm() {
    const user = getCurrentUser();
    const nameInput = document.getElementById('selectionName');
    const phoneInput = document.getElementById('selectionPhone');

    if (!user) return;

    if (nameInput) {
        const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
        nameInput.value = fullName || user.name || '';
    }

    if (phoneInput && user.phone) {
        phoneInput.value = user.phone;
    }
}

async function handleSelectionRequest(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const user = getCurrentUser();

    const data = {
        name: formData.get('name')?.trim(),
        phone: formData.get('phone')?.trim(),
        checkIn: formData.get('checkIn') || null,
        checkOut: formData.get('checkOut') || null,
        guests: formData.get('guests') ? parseInt(formData.get('guests'), 10) : null,
        budget: formData.get('budget') ? parseInt(formData.get('budget'), 10) : null,
        requirements: formData.get('requirements')?.trim() || null,
        applicantType: user?.role === 'renter' ? 'renter' : 'guest',
        userId: user?.id || null,
        userEmail: user?.email || null,
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    try {
        await API.createSelectionRequest(data);
        showNotification(i18n.t('modal.success.title'), 'success');
        e.target.reset();

        const selectionModal = document.querySelector('[data-modal="selection-modal"]');
        if (selectionModal) {
            Modal.close(selectionModal);
        }

        const successModal = document.querySelector('[data-modal="success-modal"]');
        if (successModal) {
            Modal.open('success-modal');
        }
    } catch (error) {
        console.error('❌ Selection request error:', error);
        showNotification(i18n.t('common.error'), 'error');
    }
}

async function handleBooking(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
        await API.createBooking(data);
        showNotification('Бронирование успешно создано!', 'success');
        e.target.reset();
    } catch (error) {
        console.error('❌ Booking error:', error);
        showNotification('Ошибка при бронировании', 'error');
    }
}

async function handleContactForm(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
        showNotification('Сообщение отправлено!', 'success');
        e.target.reset();
    } catch (error) {
        console.error('❌ Contact form error:', error);
        showNotification('Ошибка при отправке', 'error');
    }
}

function showNotification(message, type = 'info') {
    document.querySelectorAll('.notification').forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `<div class="notification__message">${message}</div>`;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('hiding');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                }
            });
        });
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

function fixImagePath(path) {
    if (window.location.pathname.includes('/pages/')) {
        if (!path.startsWith('../') && !path.startsWith('http://') && !path.startsWith('https://')) {
            return '../' + path;
        }
    }
    return path;
}

function initSettingsDropdown() {
    const settingsMenu = document.querySelector('[data-settings-menu]');
    const settingsDropdown = document.querySelector('.header__settings-dropdown');
    const settingsBtn = document.querySelector('.header__settings-btn');

    if (settingsBtn && settingsDropdown) {
        settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            settingsDropdown.hidden = !settingsDropdown.hidden;
            settingsBtn.setAttribute('aria-expanded', !settingsDropdown.hidden);
        });

        document.addEventListener('click', (e) => {
            if (!settingsMenu?.contains(e.target) && !settingsDropdown.hidden) {
                settingsDropdown.hidden = true;
                settingsBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }
}

function initLanguageSwitcher() {
    document.querySelectorAll('[data-lang]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const lang = e.target.getAttribute('data-lang');
            if (typeof i18n !== 'undefined') {
                i18n.setLanguage(lang);
            }
            document.querySelectorAll('[data-lang]').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            localStorage.setItem('language', lang);
            const settingsDropdown = document.querySelector('.header__settings-dropdown');
            if (settingsDropdown) {
                settingsDropdown.hidden = true;
                document.querySelector('.header__settings-btn')?.setAttribute('aria-expanded', 'false');
            }
        });
    });
}

function initThemeSwitcher() {
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const theme = e.target.getAttribute('data-theme-toggle');
            if (typeof ThemeManager !== 'undefined') {
                ThemeManager.setTheme(theme);
            }
            document.querySelectorAll('[data-theme-toggle]').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const settingsDropdown = document.querySelector('.header__settings-dropdown');
            if (settingsDropdown) {
                settingsDropdown.hidden = true;
                document.querySelector('.header__settings-btn')?.setAttribute('aria-expanded', 'false');
            }
        });
    });
}

function initResetSettings() {
    document.querySelector('[data-i18n="settings.reset"]')?.addEventListener('click', () => {
        localStorage.removeItem('language');
        localStorage.removeItem('theme');
        localStorage.removeItem('accessibility');
        location.reload();
    });
}

function initUserMenu() {
    const userBtn = document.querySelector('[data-user-menu]');
    if (userBtn) {
        userBtn.addEventListener('click', () => {
            const storedUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
            const currentUser = storedUser ? JSON.parse(storedUser) : null;

            const getPagePath = (pageName) => {
                const currentPath = window.location.pathname;
                if (currentPath.includes('/pages/')) {
                    return `${pageName}.html`;
                }
                return `pages/${pageName}.html`;
            };

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
}

export {
    showNotification,
    createHouseCard,
    loadCatalog,
    fixImagePath,
    initFavorites,
    getFavorites,
    updateFavoriteButtons,
    getCurrentUser
};
