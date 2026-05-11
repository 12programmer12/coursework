import ThemeManager from './theme.js';
import AccessibilityManager from './accessibility.js';
import BurgerMenu from './components/burger-menu.js';
import Slider from './components/slider.js';
import Accordion from './components/accordion.js';
import Modal from './components/modal.js';
import API from './api.js';
import i18n from './i18n.js';

document.addEventListener('DOMContentLoaded', async () => {
    const preloader = document.querySelector('[data-preloader]');
    if (preloader) {
        setTimeout(() => {
            preloader.classList.add('hidden');
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
    initHeaderScroll();
    await loadCatalog();
    i18n.translateCards();
    initSearch();
    initFilters();
    initFavorites();
    initForms();
    initSmoothScroll();
    initLazyLoading();

    console.log('DOMIKTUT application initialized successfully!');
});


function initHeaderScroll() {
    const header = document.querySelector('[data-header]');
    if (!header) return;

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
}

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

        const houses = await API.getHouses({ sort: 'rating', order: 'desc' });

        catalogGrid.innerHTML = '';

        houses.slice(0, 8).forEach(house => {
            const card = createHouseCard(house);
            catalogGrid.appendChild(card);
        });

    } catch (error) {
        console.error('Error loading catalog:', error);
        catalogGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__title">Ошибка загрузки</div>
        <div class="empty-state__text">Не удалось загрузить каталог. Попробуйте позже.</div>
      </div>
    `;
    }
}

function createHouseCard(house) {
    const card = document.createElement('article');
    card.className = 'catalog-card';
    card.setAttribute('data-house-card', '');
    card.setAttribute('data-house-id', house.id);

    const isFavorite = isHouseFavorite(house.id);

    const houseName = house.name_i18n?.[i18n.currentLang] || house.name;
    const houseDesc = house.description_i18n?.[i18n.currentLang] || house.description || '';

    const featuresTranslations = {
        'Баня': { ru: 'Баня', be: 'Баня', en: 'Sauna' },
        'Бассейн': { ru: 'Бассейн', be: 'Басейн', en: 'Pool' },
        'Настольный теннис': { ru: 'Настольный теннис', be: 'Настольны тэніс', en: 'Table tennis' },
        'Сауна': { ru: 'Сауна', be: 'Саўна', en: 'Sauna' },
        'Барбекю': { ru: 'Барбекю', be: 'Барбекю', en: 'BBQ' },
        'Бильярд': { ru: 'Бильярд', be: 'Більярд', en: 'Billiards' },
        'Караоке': { ru: 'Караоке', be: 'Караоке', en: 'Karaoke' },
        'Русская баня': { ru: 'Русская баня', be: 'Руская баня', en: 'Russian banya' },
        'Вид на реку': { ru: 'Вид на реку', be: 'Від на раку', en: 'River view' },
        'Камин': { ru: 'Камин', be: 'Камін', en: 'Fireplace' },
        'Терраса': { ru: 'Терраса', be: 'Тэраса', en: 'Terrace' },
        'Парковка': { ru: 'Парковка', be: 'Паркоўка', en: 'Parking' },
        'Детская площадка': { ru: 'Детская площадка', be: 'Дзіцячая пляцоўка', en: 'Playground' },
        'Мангал': { ru: 'Мангал', be: 'Мангал', en: 'Grill' },
        'Wi-Fi': { ru: 'Wi-Fi', be: 'Wi-Fi', en: 'Wi-Fi' },
        'Озеро': { ru: 'Озеро', be: 'Возера', en: 'Lake' },
        'Рыбалка': { ru: 'Рыбалка', be: 'Рыбалка', en: 'Fishing' },
        'Беседка': { ru: 'Беседка', be: 'Альтанка', en: 'Gazebo' },
        'Банкетный зал': { ru: 'Банкетный зал', be: 'Банкетная зала', en: 'Banquet hall' },
        'Сцена': { ru: 'Сцена', be: 'Сцэна', en: 'Stage' },
        'Охрана': { ru: 'Охрана', be: 'Ахова', en: 'Security' },
        'Баня на дровах': { ru: 'Баня на дровах', be: 'Баня на дровах', en: 'Wood-fired sauna' },
        'Чан': { ru: 'Чан', be: 'Чан', en: 'Hot tub' },
        'Лес': { ru: 'Лес', be: 'Лес', en: 'Forest' },
        'Тишина': { ru: 'Тишина', be: 'Цішыня', en: 'Quiet' },
        'Эко-материалы': { ru: 'Эко-материалы', be: 'Эка-матэрыялы', en: 'Eco materials' },
        'Гриль': { ru: 'Гриль', be: 'Грыль', en: 'Grill' }
    };

    const translatedFeatures = house.features?.map(feature =>
        featuresTranslations[feature]?.[i18n.currentLang] || feature
    ) || [];

    card.innerHTML = `
    <div class="catalog-card__image">
      <img src="${house.images?.[0] || 'assets/images/placeholder.jpg'}" alt="${houseName}" loading="lazy">
      ${house.isHit ? '<span class="catalog-card__badge" data-i18n="catalog.hit">Хит</span>' : ''}
      <button class="catalog-card__favorite ${isFavorite ? 'active' : ''}" 
              data-favorite="${house.id}"
              aria-label="${i18n.t('catalog.addToFavorites')}"
              data-i18n-aria="catalog.addToFavorites">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="${isFavorite ? 'currentColor' : 'none'}">
          <path d="M10 2.5l1.903 3.854a1 1 0 00.754.547l4.243.616-3.07 3.003a1 1 0 00-.288.884l.724 4.226L10 13.5l-3.766 1.98.724-4.226a1 1 0 00-.288-.884l-3.07-3.003 4.243-.616a1 1 0 00.754-.547L10 2.5z" 
                stroke="currentColor" 
                stroke-width="1.5"/>
        </svg>
      </button>
      <span class="catalog-card__guests">${i18n.t('common.guests')} ${house.guests}</span>
    </div>
    <div class="catalog-card__content">
      <h3 class="catalog-card__title" data-house-name>${houseName}</h3>
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
      <a href="pages/product.html?id=${house.id}" class="catalog-card__button" data-i18n="common.more">Подробнее</a>
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
        console.log('Search results:', results);
    } catch (error) {
        console.error('Search error:', error);
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
                console.log('Filtered houses:', houses);
            } catch (error) {
                console.error('Filter error:', error);
            }
        });
    });
}

function initFavorites() {
    document.addEventListener('click', async (e) => {
        if (e.target.closest('[data-favorite]')) {
            const btn = e.target.closest('[data-favorite]');
            const houseId = parseInt(btn.getAttribute('data-favorite'));

            await toggleFavorite(houseId, btn);
        }
    });
}

async function toggleFavorite(houseId, btn) {
    const isFavorite = btn.classList.contains('active');

    try {
        if (isFavorite) {
            await API.removeFromFavorites(houseId);
            btn.classList.remove('active');
            showNotification('Удалено из избранного', 'success');
        } else {
            await API.addToFavorites({ houseId });
            btn.classList.add('active');
            showNotification('Добавлено в избранное', 'success');
        }
    } catch (error) {
        console.error('Favorite error:', error);
        showNotification('Ошибка при работе с избранным', 'error');
    }
}

function isHouseFavorite(houseId) {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    return favorites.includes(houseId);
}

function initForms() {
    const selectionForm = document.querySelector('[data-selection-form]');
    if (selectionForm) {
        selectionForm.addEventListener('submit', handleSelectionRequest);
    }

    const bookingForm = document.querySelector('[data-booking-form]');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBooking);
    }

    const contactForm = document.querySelector('[data-contact-form]');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
}

async function handleSelectionRequest(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
        await API.createSelectionRequest(data);
        showNotification('Заявка успешно отправлена!', 'success');
        e.target.reset();
    } catch (error) {
        console.error('Selection request error:', error);
        showNotification('Ошибка при отправке заявки', 'error');
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
        console.error('Booking error:', error);
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
        console.error('Contact form error:', error);
        showNotification('Ошибка при отправке', 'error');
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
    <div class="notification__message">${message}</div>
  `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';

        setTimeout(() => {
            notification.remove();
        }, 300);
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
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
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

document.querySelectorAll('[data-lang]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const lang = e.target.getAttribute('data-lang');
        i18n.setLanguage(lang);

        document.querySelectorAll('[data-lang]').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
    });
});

document.querySelectorAll('[data-accessibility-toggle]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const mode = e.target.getAttribute('data-accessibility-toggle');
        document.documentElement.setAttribute('data-accessibility', mode);
        localStorage.setItem('accessibility', mode);

        document.querySelectorAll('[data-accessibility-toggle]').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
    });
});

document.querySelector('[data-settings-reset]')?.addEventListener('click', () => {
    localStorage.removeItem('language');
    localStorage.removeItem('theme');
    localStorage.removeItem('accessibility');
    location.reload();
});

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
        if (!settingsMenu.contains(e.target) && !settingsDropdown.hidden) {
            settingsDropdown.hidden = true;
            settingsBtn.setAttribute('aria-expanded', 'false');
        }
    });
}

document.querySelectorAll('[data-lang]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const lang = e.target.getAttribute('data-lang');

        document.querySelectorAll('[data-lang]').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        if (typeof i18n !== 'undefined') {
            i18n.setLanguage(lang);
        }

        localStorage.setItem('language', lang);

        if (settingsDropdown) {
            settingsDropdown.hidden = true;
            settingsBtn.setAttribute('aria-expanded', 'false');
        }
    });
});

document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const theme = e.target.getAttribute('data-theme-toggle');

        document.querySelectorAll('[data-theme-toggle]').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        document.documentElement.setAttribute('data-theme', theme);

        localStorage.setItem('theme', theme);

        if (settingsDropdown) {
            settingsDropdown.hidden = true;
            settingsBtn.setAttribute('aria-expanded', 'false');
        }
    });
});

document.querySelectorAll('[data-accessibility-toggle]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const mode = e.target.getAttribute('data-accessibility-toggle');

        document.querySelectorAll('[data-accessibility-toggle]').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        document.documentElement.setAttribute('data-accessibility', mode);

        localStorage.setItem('accessibility', mode);

        if (settingsDropdown) {
            settingsDropdown.hidden = true;
            settingsBtn.setAttribute('aria-expanded', 'false');
        }
    });
});

document.querySelector('[data-i18n="settings.reset"]')?.addEventListener('click', () => {
    localStorage.removeItem('language');
    localStorage.removeItem('theme');
    localStorage.removeItem('accessibility');

    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.setAttribute('data-accessibility', 'normal');
    document.documentElement.lang = 'ru';

    document.querySelectorAll('[data-lang]').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('[data-theme-toggle]').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('[data-accessibility-toggle]').forEach(b => b.classList.remove('active'));

    document.querySelector('[data-lang="ru"]')?.classList.add('active');
    document.querySelector('[data-theme-toggle="light"]')?.classList.add('active');
    document.querySelector('[data-accessibility-toggle="normal"]')?.classList.add('active');

    if (settingsDropdown) {
        settingsDropdown.hidden = true;
        settingsBtn.setAttribute('aria-expanded', 'false');
    }

    location.reload();
});

function loadSavedSettings() {
    // Загружаем язык
    const savedLang = localStorage.getItem('language') || 'ru';
    document.querySelectorAll('[data-lang]').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-lang="${savedLang}"]`)?.classList.add('active');

    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.querySelectorAll('[data-theme-toggle]').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-theme-toggle="${savedTheme}"]`)?.classList.add('active');

    const savedAccessibility = localStorage.getItem('accessibility') || 'normal';
    document.documentElement.setAttribute('data-accessibility', savedAccessibility);
    document.querySelectorAll('[data-accessibility-toggle]').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-accessibility-toggle="${savedAccessibility}"]`)?.classList.add('active');
}

loadSavedSettings();

export {
    showNotification,
    createHouseCard,
    loadCatalog
};
