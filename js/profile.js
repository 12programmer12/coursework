import API from './api.js';
import i18n from './i18n.js';
import { fixImagePath, getFavorites, updateFavoriteButtons } from './main.js';

const Profile = {
    currentUser: null,

    async init() {
        this.checkAuth();
        await this.loadUserData();
        this.bindEvents();
        this.switchTab('bookings');
        window.addEventListener('favoritesChanged', () => {
            this.loadFavorites();
        });
    },

    async loadFavorites() {
        try {
            console.log('❤️ Loading favorites...');
            const favorites = getFavorites(); // Берем из localStorage
            const container = document.getElementById('favoritesList');

            console.log('📦 Favorites IDs:', favorites);

            if (!favorites || favorites.length === 0) {
                container.innerHTML = this.renderEmptyState('profile.favorites.empty');
                return;
            }

            // Загружаем детали домов
            const housePromises = favorites.map(id => API.getHouseById(id));
            const houses = await Promise.all(housePromises);

            const validHouses = houses.filter(Boolean);

            if (validHouses.length === 0) {
                container.innerHTML = this.renderEmptyState('profile.favorites.empty');
                return;
            }

            container.innerHTML = validHouses.map(house => `
                <div class="favorite-card">
                    <img src="${fixImagePath(house.images?.[0] || '')}" alt="${house.name}" class="favorite-card__image">
                    <div class="favorite-card__info">
                        <a href="product.html?id=${house.id}" class="booking-card__house">
                            ${house.name_i18n?.[i18n.currentLang] || house.name}
                        </a>
                        <span class="favorite-card__price">${house.price} ${i18n.t('common.currency')}</span>
                    </div>
                    <button class="btn btn--outline btn--sm" data-favorite="${house.id}" style="margin-top: 10px;">
                        ${i18n.t('common.removeFromFavorites') || 'Удалить'}
                    </button>
                </div>
            `).join('');

            // Пересоздаем обработчики для кнопок удаления
            updateFavoriteButtons();

        } catch (error) {
            console.error('❌ Error loading favorites:', error);
            const container = document.getElementById('favoritesList');
            if (container) {
                container.innerHTML = this.renderEmptyState('profile.favorites.empty');
            }
        }
    },

    checkAuth() {
        const stored = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        if (!stored) {
            window.location.href = '../pages/login.html';
            return;
        }
        this.currentUser = JSON.parse(stored);
        console.log('👤 Current user:', this.currentUser);
    },

    async loadUserData() {
        try {
            let userData = null;
            try {
                userData = await API.getUserById(this.currentUser.id);
            } catch (apiError) {
                console.warn('⚠️ Could not fetch from API, using localStorage data:', apiError);
            }

            if (userData) {
                this.currentUser = { ...this.currentUser, ...userData };
                const storage = localStorage.getItem('currentUser') ? localStorage : sessionStorage;
                storage.setItem('currentUser', JSON.stringify(this.currentUser));
            }

            this.renderUserInfo();
            await this.loadBookings();
            await this.loadFavorites();

        } catch (error) {
            console.error('❌ Error loading profile:', error);
            this.renderUserInfo();
        }
    },

    renderUserInfo() {
        const nameEl = document.getElementById('profileName');
        const roleEl = document.getElementById('profileRole');

        if (nameEl) {
            nameEl.textContent =
                `${this.currentUser.firstName || ''} ${this.currentUser.lastName || ''}`.trim() ||
                this.currentUser.name ||
                'Пользователь';
        }

        if (roleEl) {
            roleEl.textContent =
                i18n.t(`profile.role.${this.currentUser.role}`) || 'Съёмщик';
        }

        const firstNameInput = document.getElementById('settingsFirstName');
        const lastNameInput = document.getElementById('settingsLastName');
        const emailInput = document.getElementById('settingsEmail');
        const phoneInput = document.getElementById('settingsPhone');

        if (firstNameInput) firstNameInput.value = this.currentUser.firstName || '';
        if (lastNameInput) lastNameInput.value = this.currentUser.lastName || '';
        if (emailInput) emailInput.value = this.currentUser.email || '';
        if (phoneInput) phoneInput.value = this.currentUser.phone || '';
    },

    async loadBookings() {
        try {
            const bookings = await API.getUserBookings(this.currentUser.id);
            const container = document.getElementById('bookingsList');

            if (!bookings || bookings.length === 0) {
                container.innerHTML = this.renderEmptyState('profile.bookings.empty');
                return;
            }

            container.innerHTML = bookings.map(booking => `
                <div class="booking-card">
                    <div class="booking-card__header">
                        <a href="product.html?id=${booking.houseId}" class="booking-card__house">
                            ${booking.houseName || `Дом #${booking.houseId}`}
                        </a>
                        <span class="status-badge ${booking.status || 'pending'}">
                            ${i18n.t(`booking.status.${booking.status}`) || booking.status || 'Ожидает'}
                        </span>
                    </div>
                    <div class="booking-card__dates">
                        <span>📅 ${i18n.t('hero.checkin')}: ${this.formatDate(booking.checkIn)}</span>
                        <span>📅 ${i18n.t('hero.checkout')}: ${this.formatDate(booking.checkOut)}</span>
                        <span>👥 ${i18n.t('hero.guests')}: ${booking.guests || '-'}</span>
                    </div>
                    <div class="booking-card__price">
                        <span>${i18n.t('product.cost')}</span>
                        <span class="booking-card__total">${booking.totalPrice || 0} ${i18n.t('common.currency')}</span>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('❌ Error loading bookings:', error);
            const container = document.getElementById('bookingsList');
            if (container) {
                container.innerHTML = this.renderEmptyState('profile.bookings.empty');
            }
        }
    },

    renderEmptyState(i18nKey) {
        return `
            <div class="empty-state">
                <div class="empty-state__icon">📭</div>
                <p>${i18n.t(i18nKey)}</p>
            </div>
        `;
    },

    formatDate(dateStr) {
        if (!dateStr) return '-';
        try {
            return new Date(dateStr).toLocaleDateString(
                i18n.currentLang === 'ru' ? 'ru-RU' :
                    i18n.currentLang === 'be' ? 'be-BY' : 'en-US'
            );
        } catch (e) {
            return dateStr;
        }
    },

    switchTab(tabName) {
        document.querySelectorAll('.profile__tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        document.querySelectorAll('.profile__panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tabName}Panel`);
        });
    },

    bindEvents() {
        document.querySelectorAll('.profile__tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('currentUser');
                sessionStorage.removeItem('currentUser');
                window.location.href = '../index.html';
            });
        }

        const settingsForm = document.getElementById('settingsForm');
        if (settingsForm) {
            settingsForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const submitBtn = e.target.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.disabled = true;
                submitBtn.textContent = i18n.t('common.loading');

                try {
                    const updatedData = {
                        firstName: document.getElementById('settingsFirstName').value,
                        lastName: document.getElementById('settingsLastName').value,
                        email: document.getElementById('settingsEmail').value,
                        phone: document.getElementById('settingsPhone').value
                    };

                    await API.updateUser(this.currentUser.id, updatedData);

                    this.currentUser = { ...this.currentUser, ...updatedData };
                    const storage = localStorage.getItem('currentUser') ? localStorage : sessionStorage;
                    storage.setItem('currentUser', JSON.stringify(this.currentUser));

                    this.renderUserInfo();
                    alert(i18n.t('profile.settings.success'));
                } catch (error) {
                    console.error('Error updating profile:', error);
                    alert(i18n.t('common.error'));
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            });
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Profile.init();
});