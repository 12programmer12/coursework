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

const Admin = {
    currentTab: 'moderation',

    async init() {
        await i18n.init();
        ThemeManager.init();
        loadSavedTheme();
        applyTranslations();

        this.checkAuth();
        this.bindEvents();
        await this.loadModeration();
    },

    checkAuth() {
        const stored = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        if (!stored) {
            window.location.href = '../pages/login.html';
            return;
        }
        const user = JSON.parse(stored);
        if (user.role !== 'admin') {
            alert(i18n.t('admin.accessDenied') || 'Доступ запрещён');
            window.location.href = '../index.html';
        }
    },

    bindEvents() {
        document.querySelectorAll('.admin-nav__item').forEach(item => {
            item.addEventListener('click', () => {
                const tab = item.getAttribute('data-tab');
                this.switchTab(tab);
            });
        });

        document.getElementById('bookingsFilter')?.addEventListener('change', (e) => {
            this.loadBookings(e.target.value);
        });

        document.getElementById('editObjectForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveEditedObject(e.target);
        });

        document.querySelectorAll('[data-modal-close]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.modal').forEach(m => {
                    m.classList.remove('active');
                    m.hidden = true;
                });
            });
        });

        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            sessionStorage.removeItem('currentUser');
            window.location.href = '../index.html';
        });

        document.addEventListener('click', async (e) => {
            const target = e.target;

            if (target.matches('[data-approve-house]')) {
                const houseId = parseInt(target.getAttribute('data-approve-house'));
                await this.approveHouse(houseId);
            }

            if (target.matches('[data-reject-house]')) {
                const houseId = parseInt(target.getAttribute('data-reject-house'));
                await this.rejectHouse(houseId);
            }

            if (target.matches('[data-confirm-booking]')) {
                const bookingId = parseInt(target.getAttribute('data-confirm-booking'));
                await this.confirmBooking(bookingId);
            }

            if (target.matches('[data-cancel-booking]')) {
                const bookingId = parseInt(target.getAttribute('data-cancel-booking'));
                await this.cancelBooking(bookingId);
            }

            if (target.matches('[data-edit-house]')) {
                const houseData = JSON.parse(target.getAttribute('data-edit-house'));
                this.openEditModal(houseData);
            }

            if (target.matches('[data-delete-house]')) {
                const houseId = parseInt(target.getAttribute('data-delete-house'));
                await this.deleteHouse(houseId);
            }
        });
    },

    switchTab(tab) {
        this.currentTab = tab;

        document.querySelectorAll('.admin-nav__item').forEach(item => {
            item.classList.toggle('active', item.getAttribute('data-tab') === tab);
        });

        document.querySelectorAll('.admin-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`${tab}Panel`)?.classList.add('active');

        switch (tab) {
            case 'moderation':
                this.loadModeration();
                break;
            case 'bookings':
                this.loadBookings();
                break;
            case 'content':
                this.loadContent();
                break;
            case 'users':
                this.loadUsers();
                break;
        }
    },

    async loadModeration() {
        try {
            const houses = await API.getHouses();
            const pendingHouses = houses.filter(h => h.status === 'pending' || !h.status);

            const container = document.getElementById('moderationList');
            document.getElementById('moderationCount').textContent = pendingHouses.length;

            if (pendingHouses.length === 0) {
                container.innerHTML = `<p class="empty-state">${i18n.t('admin.noPending')}</p>`;
                return;
            }

            container.innerHTML = pendingHouses.map(house => {
                const imagePath = fixImagePath(house.images?.[0]);
                return `
                <div class="moderation-card">
                    <div class="moderation-card__header">
                        <div>
                            <h3 class="moderation-card__title">${house.name_i18n?.[i18n.currentLang] || house.name}</h3>
                            <p class="moderation-card__meta">${house.location_i18n?.[i18n.currentLang] || house.location}</p>
                        </div>
                        <span class="booking-card__status pending">${i18n.t('admin.pending')}</span>
                    </div>
                    <img src="${imagePath}" alt="${house.name}" class="moderation-card__image">
                    <div class="moderation-card__actions">
                        <button class="btn btn--primary" data-approve-house="${house.id}">
                            ${i18n.t('admin.approve')}
                        </button>
                        <button class="btn btn--outline" data-reject-house="${house.id}">
                            ${i18n.t('admin.reject')}
                        </button>
                    </div>
                </div>
            `}).join('');
        } catch (error) {
            console.error('Error loading moderation:', error);
        }
    },

    async approveHouse(id) {
        try {
            await API.updateHouse(id, { status: 'approved' });
            alert(i18n.t('admin.approved') || 'Объект одобрен');
            this.loadModeration();
        } catch (error) {
            console.error('Error approving house:', error);
            alert(i18n.t('common.error'));
        }
    },

    async rejectHouse(id) {
        if (confirm(i18n.t('admin.confirmReject') || 'Отклонить объект?')) {
            try {
                await API.updateHouse(id, { status: 'rejected' });
                alert(i18n.t('admin.rejected') || 'Объект отклонён');
                this.loadModeration();
            } catch (error) {
                console.error('Error rejecting house:', error);
                alert(i18n.t('common.error'));
            }
        }
    },

    async loadBookings(filter = 'all') {
        try {
            const bookings = await API.getBookings();
            const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

            const container = document.getElementById('bookingsList');

            if (filtered.length === 0) {
                container.innerHTML = `<p class="empty-state">${i18n.t('admin.noBookings')}</p>`;
                return;
            }

            container.innerHTML = filtered.map(booking => `
                <div class="booking-card">
                    <div class="booking-card__header">
                        <div>
                            <h3 class="booking-card__title">${booking.houseName || `${i18n.t('admin.houseDefault')} #${booking.houseId}`}</h3>
                            <p class="booking-card__meta">${booking.userName || i18n.t('admin.user')}</p>
                        </div>
                        <span class="booking-card__status ${booking.status || 'pending'}">
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
                            <span class="booking-card__detail-value">${booking.totalPrice} BYN</span>
                        </div>
                    </div>
                    ${booking.status === 'pending' ? `
                    <div class="booking-card__actions">
                        <button class="btn btn--primary" data-confirm-booking="${booking.id}">
                            ${i18n.t('admin.confirm')}
                        </button>
                        <button class="btn btn--outline" data-cancel-booking="${booking.id}">
                            ${i18n.t('admin.cancel')}
                        </button>
                    </div>
                    ` : ''}
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading bookings:', error);
        }
    },

    async confirmBooking(id) {
        try {
            await API.updateBooking(id, { status: 'confirmed' });
            alert(i18n.t('admin.bookingConfirmed') || 'Бронирование подтверждено');
            this.loadBookings();
        } catch (error) {
            console.error('Error confirming booking:', error);
            alert(i18n.t('common.error'));
        }
    },

    async cancelBooking(id) {
        if (confirm(i18n.t('admin.confirmCancel') || 'Отменить бронирование?')) {
            try {
                await API.updateBooking(id, { status: 'cancelled' });
                alert(i18n.t('admin.bookingCancelled') || 'Бронирование отменено');
                this.loadBookings();
            } catch (error) {
                console.error('Error cancelling booking:', error);
                alert(i18n.t('common.error'));
            }
        }
    },

    async loadContent() {
        try {
            const houses = await API.getHouses();

            const container = document.getElementById('contentList');

            container.innerHTML = houses.map(house => {
                const imagePath = fixImagePath(house.images?.[0]);
                const houseDataEscaped = JSON.stringify(house).replace(/"/g, '&quot;');

                return `
                <div class="content-card">
                    <div class="content-card__header">
                        <div>
                            <h3 class="content-card__title">${house.name_i18n?.[i18n.currentLang] || house.name}</h3>
                            <p class="content-card__price">${house.price} BYN</p>
                        </div>
                    </div>
                    <img src="${imagePath}" alt="${house.name}" class="content-card__image">
                    <div class="content-card__actions">
                        <button class="btn btn--primary" data-edit-house='${houseDataEscaped}'>
                            ${i18n.t('admin.edit')}
                        </button>
                        <button class="btn btn--outline" data-delete-house="${house.id}">
                            ${i18n.t('admin.delete')}
                        </button>
                    </div>
                </div>
            `}).join('');
        } catch (error) {
            console.error('Error loading content:', error);
        }
    },

    openEditModal(house) {
        document.getElementById('editId').value = house.id;
        document.getElementById('editName').value = house.name_i18n?.ru || house.name;
        document.getElementById('editPrice').value = house.price;
        document.getElementById('editDescription').value = house.description_i18n?.ru || house.description;
        document.getElementById('editGuests').value = house.guests;
        document.getElementById('editBedrooms').value = house.bedrooms;

        const modal = document.querySelector('[data-modal="edit-modal"]');
        modal.classList.add('active');
        modal.hidden = false;
    },

    async saveEditedObject(form) {
        const id = document.getElementById('editId').value;
        const data = {
            name: document.getElementById('editName').value,
            price: parseInt(document.getElementById('editPrice').value),
            description: document.getElementById('editDescription').value,
            guests: parseInt(document.getElementById('editGuests').value),
            bedrooms: parseInt(document.getElementById('editBedrooms').value)
        };

        try {
            await API.updateHouse(id, data);
            alert(i18n.t('admin.saved') || 'Сохранено');
            document.querySelector('[data-modal="edit-modal"]').classList.remove('active');
            this.loadContent();
        } catch (error) {
            console.error('Error saving house:', error);
            alert(i18n.t('common.error'));
        }
    },

    async deleteHouse(id) {
        if (confirm(i18n.t('admin.confirmDelete') || 'Удалить объект?')) {
            try {
                await API.deleteHouse(id);
                alert(i18n.t('admin.deleted') || 'Удалено');
                this.loadContent();
            } catch (error) {
                console.error('Error deleting house:', error);
                alert(i18n.t('common.error'));
            }
        }
    },

    async loadUsers() {
        try {
            const users = await API.getUsers();

            const container = document.getElementById('usersList');

            container.innerHTML = users.map(user => `
                <div class="user-card">
                    <div class="user-card__header">
                        <div>
                            <div class="user-card__avatar">${(user.firstName?.[0] || '') + (user.lastName?.[0] || '')}</div>
                            <h3 class="user-card__title">${user.firstName} ${user.lastName}</h3>
                            <p class="user-card__meta">${user.email}</p>
                            <span class="user-card__role">${i18n.t(`profile.role.${user.role}`) || user.role}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading users:', error);
        }
    },

    formatDate(dateStr) {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString(i18n.currentLang === 'ru' ? 'ru-RU' : i18n.currentLang === 'be' ? 'be-BY' : 'en-US');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Admin.init();
});
