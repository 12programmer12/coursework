import API from './api.js';
import i18n from './i18n.js';
import ThemeManager from './theme.js';

function fixImagePath(path) {
    if (!path) return 'assets/images/placeholder.jpg';
    if (window.location.pathname.includes('/pages/')) {
        if (!path.startsWith('../') && !path.startsWith('http://') && !path.startsWith('https://')) {
            return '../' + path;
        }
    }
    return path;
}

function loadSavedTheme() {
    const saved = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-theme-toggle') === saved);
    });
}

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = i18n.t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        el.placeholder = i18n.t(el.getAttribute('data-i18n-placeholder'));
    });
}

const Landlord = {
    currentUser: null,
    myHouses: [],

    formatDate(dateStr) {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString(
            i18n.currentLang === 'ru' ? 'ru-RU' :
                i18n.currentLang === 'be' ? 'be-BY' : 'en-US'
        );
    },

    async init() {
        await i18n.init();
        ThemeManager.init();
        loadSavedTheme();
        applyTranslations();

        this.checkAuth();
        this.bindEvents();
        await this.loadData();
    },

    checkAuth() {
        const stored = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        if (!stored) {
            window.location.href = '../pages/login.html';
            return;
        }
        this.currentUser = JSON.parse(stored);
        if (this.currentUser.role !== 'landlord') {
            alert(i18n.t('landlord.accessDenied') || 'Доступ только для арендодателей');
            window.location.href = '../index.html';
        }
    },

    bindEvents() {
        document.querySelectorAll('.landlord-nav__item').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.getAttribute('data-tab');
                this.switchTab(tab);
            });
        });

        document.querySelectorAll('[data-open-modal]').forEach(btn => {
            btn.addEventListener('click', () => {
                const modalId = btn.getAttribute('data-open-modal');
                document.querySelector(`[data-modal="${modalId}"]`).classList.add('active');
                document.querySelector(`[data-modal="${modalId}"]`).hidden = false;
            });
        });

        document.querySelectorAll('[data-modal-close]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.modal').forEach(m => {
                    m.classList.remove('active');
                    m.hidden = true;
                });
            });
        });

        document.getElementById('propertyForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProperty(e.target);
        });

        document.getElementById('landlordSettingsForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveSettings(e.target);
        });

        document.addEventListener('click', async (e) => {
            if (e.target.matches('[data-edit-property]')) {
                const id = parseInt(e.target.getAttribute('data-edit-property'));
                this.openEditModal(id);
            }
            if (e.target.matches('[data-delete-property]')) {
                const id = parseInt(e.target.getAttribute('data-delete-property'));
                await this.deleteProperty(id);
            }
        });

        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            sessionStorage.removeItem('currentUser');
            window.location.href = '../index.html'; // Редирект на главную
        });
    },

    switchTab(tab) {
        document.querySelectorAll('.landlord-nav__item').forEach(i => i.classList.toggle('active', i.getAttribute('data-tab') === tab));
        document.querySelectorAll('.landlord-panel').forEach(p => p.classList.remove('active'));
        document.getElementById(`${tab}Panel`)?.classList.add('active');
        applyTranslations();
    },

    async loadData() {
        await this.loadProperties();
        this.loadBookings();
        this.loadReviews();
        this.loadSettings();
    },

    async loadProperties() {
        try {
            const propertyLinks = await API.getProperties({ landlordId: this.currentUser.id });
            const allHouses = await API.getHouses();
            const houseIds = propertyLinks.map(link => link.houseId);
            this.myHouses = allHouses.filter(h => houseIds.includes(h.id));

            document.getElementById('propertyCount').textContent = this.myHouses.length;
            const container = document.getElementById('propertiesList');

            if (this.myHouses.length === 0) {
                container.innerHTML = `<p class="empty-state">${i18n.t('landlord.noProperties')}</p>`;
                return;
            }

            container.innerHTML = this.myHouses.map(h => {
                const img = fixImagePath(h.images?.[0]);
                const link = propertyLinks.find(l => l.houseId === h.id);
                const status = link?.status || h.status || 'pending';
                const statusClass = status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'pending';

                return `
            <div class="property-card">
                <img src="${img}" alt="${h.name}" class="property-card__image">
                <div class="property-card__body">
                    <span class="status-badge ${statusClass}">${i18n.t(`landlord.status.${status}`)}</span>
                    <h3 class="property-card__title">${h.name_i18n?.[i18n.currentLang] || h.name}</h3>
                    <p class="property-card__meta">${h.location_i18n?.[i18n.currentLang] || h.location}</p>
                    <div class="property-card__price">${h.price} ${i18n.t('common.currency')}</div>
                    <div class="property-card__actions">
                        <button class="btn btn--outline" data-edit-property="${h.id}">${i18n.t('landlord.edit')}</button>
                        <button class="btn btn--outline" data-delete-property="${h.id}">${i18n.t('landlord.delete')}</button>
                    </div>
                </div>
            </div>`;
            }).join('');
        } catch (err) {
            console.error('Load properties error:', err);
        }
    },

    async loadBookings() {
        try {
            const container = document.getElementById('landlordBookingsList');
            const allBookings = await API.getBookings();
            const myHouseIds = this.myHouses.map(h => h.id);
            const myBookings = allBookings.filter(booking =>
                myHouseIds.includes(booking.houseId)
            );

            if (myBookings.length === 0) {
                container.innerHTML = `<p class="empty-state">${i18n.t('landlord.noBookings')}</p>`;
                return;
            }

            myBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            container.innerHTML = myBookings.map(booking => {
                const house = this.myHouses.find(h => h.id === booking.houseId);
                const statusClass = booking.status === 'confirmed' ? 'confirmed' :
                    booking.status === 'cancelled' ? 'cancelled' : 'pending';

                return `
            <div class="booking-card">
                <div class="booking-card__header">
                    <div>
                        <h3 class="booking-card__title">${house?.name_i18n?.[i18n.currentLang] || house?.name || 'Дом #' + booking.houseId}</h3>
                        <p class="booking-card__meta">
                            ${booking.userName || booking.userFirstName || 'Гость'} 
                            ${booking.userPhone ? `• ${booking.userPhone}` : ''}
                        </p>
                    </div>
                    <span class="status-badge ${statusClass}">
                        ${i18n.t(`booking.status.${booking.status}`) || booking.status}
                    </span>
                </div>
                <div class="booking-card__info">
                    <div class="booking-card__detail">
                        <span class="booking-card__detail-label">${i18n.t('hero.checkin')}:</span>
                        <span class="booking-card__detail-value">${this.formatDate(booking.checkIn)}</span>
                    </div>
                    <div class="booking-card__detail">
                        <span class="booking-card__detail-label">${i18n.t('hero.checkout')}:</span>
                        <span class="booking-card__detail-value">${this.formatDate(booking.checkOut)}</span>
                    </div>
                    <div class="booking-card__detail">
                        <span class="booking-card__detail-label">${i18n.t('hero.guests')}:</span>
                        <span class="booking-card__detail-value">${booking.guests}</span>
                    </div>
                    <div class="booking-card__detail">
                        <span class="booking-card__detail-label">${i18n.t('product.cost')}:</span>
                        <span class="booking-card__detail-value">${booking.totalPrice || '-'} BYN</span>
                    </div>
                </div>
                ${booking.comment ? `
                <div class="booking-card__comment" style="margin-top: var(--spacing-md); padding-top: var(--spacing-md); border-top: 1px solid var(--border-color);">
                    <span style="font-size: var(--font-size-sm); color: var(--text-secondary);">
                        <strong>${i18n.t('landlord.comment')}:</strong> ${booking.comment}
                    </span>
                </div>
                ` : ''}
                <div class="booking-card__actions" style="margin-top: var(--spacing-md);">
                    ${booking.status === 'pending' ? `
                    <button class="btn btn--primary btn--sm" onclick="Landlord.confirmBooking(${booking.id})">
                        ${i18n.t('admin.confirm')}
                    </button>
                    <button class="btn btn--outline btn--sm" onclick="Landlord.cancelBooking(${booking.id})">
                        ${i18n.t('admin.cancel')}
                    </button>
                    ` : `
                    <span style="font-size: var(--font-size-sm); color: var(--text-secondary);">
                        ${i18n.t('landlord.bookingHandled')}
                    </span>
                    `}
                </div>
            </div>`;
            }).join('');

        } catch (err) {
            console.error('Load bookings error:', err);
            const container = document.getElementById('landlordBookingsList');
            container.innerHTML = `<p class="empty-state">${i18n.t('common.error')}</p>`;
        }
    },

    loadReviews() {
        const container = document.getElementById('reviewsList');
        container.innerHTML = `<p class="empty-state">${i18n.t('landlord.noReviews')}</p>`;
    },

    loadSettings() {
        document.getElementById('landlordFirstName').value = this.currentUser.firstName || '';
        document.getElementById('landlordLastName').value = this.currentUser.lastName || '';
        document.getElementById('landlordEmail').value = this.currentUser.email || '';
        document.getElementById('landlordPhone').value = this.currentUser.phone || '';
    },

    openEditModal(id) {
        const house = this.myHouses.find(h => h.id === id);
        if (!house) return;

        document.getElementById('propId').value = house.id;
        document.getElementById('propName').value = house.name_i18n?.ru || house.name;
        document.getElementById('propPrice').value = house.price;
        document.getElementById('propDescription').value = house.description_i18n?.ru || house.description;
        document.getElementById('propGuests').value = house.guests;
        document.getElementById('propBedrooms').value = house.bedrooms;
        document.getElementById('propBathrooms').value = house.bathrooms;
        document.getElementById('propArea').value = house.area;
        document.getElementById('propImages').value = (house.images || []).join(', ');

        const modal = document.querySelector('[data-modal="addPropertyModal"]');
        modal.querySelector('.modal__title').textContent = i18n.t('landlord.editProperty');
        modal.classList.add('active');
        modal.hidden = false;
    },

    async saveProperty(form) {
        const id = document.getElementById('propId').value;
        const imagesStr = document.getElementById('propImages').value;
        const images = imagesStr ? imagesStr.split(',').map(s => s.trim()).filter(Boolean) : [];

        const houseData = {
            name: document.getElementById('propName').value,
            price: parseInt(document.getElementById('propPrice').value),
            description: document.getElementById('propDescription').value,
            guests: parseInt(document.getElementById('propGuests').value) || 2,
            bedrooms: parseInt(document.getElementById('propBedrooms').value) || 1,
            bathrooms: parseInt(document.getElementById('propBathrooms').value) || 1,
            area: parseInt(document.getElementById('propArea').value) || 0,
            images,
            name_i18n: {
                ru: document.getElementById('propName').value,
                be: document.getElementById('propName').value,
                en: document.getElementById('propName').value
            },
            description_i18n: {
                ru: document.getElementById('propDescription').value,
                be: document.getElementById('propDescription').value,
                en: document.getElementById('propDescription').value
            },
            location_i18n: {
                ru: 'Могилёвская область',
                be: 'Магілёўская вобласць',
                en: 'Mogilev Region'
            },
            location: 'Могилёвская область',
            features: [],
            features_i18n: { ru: [], be: [], en: [] },
            category: 'family',
            rating: 0,
            reviews: 0,
            createdAt: new Date().toISOString()
        };

        try {
            let houseId = id;

            if (houseId) {
                await API.updateHouse(houseId, houseData);
            } else {
                const newHouse = await API.fetch('/houses', {
                    method: 'POST',
                    body: JSON.stringify(houseData)
                });
                houseId = newHouse.id;

                await API.createPropertyLink({
                    landlordId: this.currentUser.id,
                    houseId: houseId,
                    status: 'pending',
                    createdAt: new Date().toISOString()
                });
            }

            document.querySelector('[data-modal="addPropertyModal"]').classList.remove('active');
            document.querySelector('[data-modal="addPropertyModal"]').hidden = true;
            form.reset();
            document.getElementById('propId').value = '';

            await this.loadProperties();
            alert(i18n.t('landlord.propertySaved'));

        } catch (err) {
            console.error('Save property error:', err);
            alert(i18n.t('common.error'));
        }
    },

    async deleteProperty(id) {
        if (confirm(i18n.t('landlord.confirmDelete'))) {
            try {
                const propertyLinks = await API.getProperties({
                    landlordId: this.currentUser.id,
                    houseId: id
                });
                const link = propertyLinks[0];

                if (link) {
                    await API.deletePropertyLink(link.id);
                }

                const allLinks = await API.getProperties({ houseId: id });
                if (allLinks.length === 0) {
                    await API.deleteHouse(id);
                }

                await this.loadProperties();
                alert(i18n.t('landlord.propertyDeleted'));

            } catch (err) {
                console.error('Delete property error:', err);
                alert(i18n.t('common.error'));
            }
        }
    },

    async saveSettings(form) {
        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = i18n.t('common.loading');

        try {
            const data = {
                firstName: document.getElementById('landlordFirstName').value,
                lastName: document.getElementById('landlordLastName').value,
                email: document.getElementById('landlordEmail').value,
                phone: document.getElementById('landlordPhone').value
            };
            await API.updateUser(this.currentUser.id, data);
            this.currentUser = { ...this.currentUser, ...data };
            const storage = localStorage.getItem('currentUser') ? localStorage : sessionStorage;
            storage.setItem('currentUser', JSON.stringify(this.currentUser));
            alert(i18n.t('profile.settings.success'));
        } catch (err) {
            console.error('Settings save error:', err);
            alert(i18n.t('common.error'));
        } finally {
            btn.disabled = false;
            btn.textContent = i18n.t('profile.settings.save');
        }
    }
};

document.addEventListener('languageChanged', () => {
    applyTranslations();
    Landlord.loadProperties();
});

document.addEventListener('DOMContentLoaded', () => {
    Landlord.init();
});
