import API from './api.js';
import i18n from './i18n.js';

import { fixImagePath } from './main.js';
import AccessibilityManager from "./accessibility.js";

const Product = {
    houseId: null,
    house: null,
    currentImageIndex: 0,

    async init() {
        this.getHouseIdFromURL();
        await this.loadHouseData();
        AccessibilityManager.init();
        this.bindEvents();
        this.initMap();
    },

    getHouseIdFromURL() {
        const params = new URLSearchParams(window.location.search);
        const idParam = params.get('id');
        this.houseId = idParam ? parseInt(idParam) : null;

        if (!this.houseId || isNaN(this.houseId)) {
            console.warn('⚠️ Invalid houseId, redirecting to catalog');
            window.location.href = this.getCatalogPath();
        }
    },

    getCatalogPath() {
        return window.location.pathname.includes('/pages/')
            ? 'catalog.html'
            : 'pages/catalog.html';
    },

    async loadHouseData() {
        try {
            this.house = await API.getHouseById(this.houseId);

            if (!this.house) {
                console.warn('⚠️ House not found, redirecting to catalog');
                window.location.href = this.getCatalogPath();
                return;
            }

            this.renderHouseData();
            this.renderGallery();
            this.renderAmenities();
            this.renderAdditionalServices();
            this.renderReviews();

        } catch (error) {
            console.error('❌ Error loading house:', error);
            document.getElementById('productName').textContent = 'Ошибка загрузки';
            document.getElementById('productDescription').textContent =
                'Не удалось загрузить данные о доме. Убедитесь, что JSON Server запущен.';
        }
    },

    renderHouseData() {
        const currentLang = i18n.currentLang;
        const currency = i18n.t('common.currency');

        document.getElementById('productName').textContent =
            this.house.name_i18n?.[currentLang] || this.house.name;
        document.getElementById('breadcrumbsName').textContent =
            this.house.name_i18n?.[currentLang] || this.house.name;

        document.getElementById('locationText').textContent =
            this.house.location_i18n?.[currentLang] || this.house.location;

        document.getElementById('productDescription').textContent =
            this.house.description_i18n?.[currentLang] || this.house.description;

        document.getElementById('featureGuests').textContent =
            `${i18n.t('product.upTo')} ${this.house.guests} ${i18n.t('product.people')}`;
        document.getElementById('featureBedrooms').textContent =
            `${this.house.bedrooms} ${i18n.t('product.bedrooms')}`;
        document.getElementById('featureBathrooms').textContent =
            `${this.house.bathrooms} ${i18n.t('product.bathrooms')}`;
        document.getElementById('featureArea').textContent =
            `${this.house.area} ${i18n.t('product.squareMeters')}`;

        document.getElementById('priceWeekday').textContent =
            `${this.house.price} ${currency}`;
        document.getElementById('priceFriday').textContent =
            `${Math.round(this.house.price * 1.25)} ${currency}`;
        document.getElementById('priceSaturday').textContent =
            `${Math.round(this.house.price * 1.5)} ${currency}`;
        document.getElementById('priceSunday').textContent =
            `${Math.round(this.house.price * 1.5)} ${currency}`;
        document.getElementById('depositAmount').textContent =
            `${Math.round(this.house.price * 0.2)} ${currency}`;
        document.getElementById('fullWeekendPrice').textContent =
            `${Math.round(this.house.price * 1.5)} ${currency}`;
    },

    renderGallery() {
        const images = this.house.images || [];
        if (images.length === 0) {
            console.warn('⚠️ No images for house');
            return;
        }

        const mainImage = document.getElementById('mainImage');
        const firstImage = fixImagePath(images[0]);
        mainImage.src = firstImage;
        mainImage.alt = this.house.name;

        const thumbsContainer = document.getElementById('galleryThumbs');
        thumbsContainer.innerHTML = images.map((img, index) => {
            const correctedPath = fixImagePath(img);
            return `
            <div class="gallery__thumb ${index === 0 ? 'active' : ''}" data-index="${index}">
                <img src="${correctedPath}" alt="${this.house.name}">
            </div>
        `}).join('');
    },

    renderAmenities() {
        const features = this.house.features || [];
        const featuresI18n = this.house.features_i18n || {};
        const currentLang = i18n.currentLang;

        const container = document.getElementById('productAmenities');
        container.innerHTML = features.map((feature, index) => {
            const translatedFeature = featuresI18n[currentLang]?.[index] || feature;
            return `<div class="amenity-item">${translatedFeature}</div>`;
        }).join('');
    },

    renderAdditionalServices() {
        const services = [
            i18n.t('services.catering'),
            i18n.t('services.show'),
            i18n.t('services.chef')
        ];

        const container = document.getElementById('additionalServices');
        container.innerHTML = services.map(service =>
            `<div class="service-item">${service}</div>`
        ).join('');
    },

    renderReviews() {
        const reviews = Array.isArray(this.house.reviews) ? this.house.reviews : [];
        const container = document.getElementById('productReviews');
        if (reviews.length === 0) {
            container.innerHTML = `<p class="product__text">${i18n.t('product.noReviews')}</p>`;
            return;
        }

        container.innerHTML = reviews.map(review => `
            <div class="review-item">
                <div class="review-header">
                    <span class="review-author">${review.userName || review.author || 'Аноним'}</span>
                    <span class="review-rating">${'★'.repeat(review.rating || 5)}${'☆'.repeat(5 - (review.rating || 5))}</span>
                </div>
                <p class="review-text">${review.text || review.comment || ''}</p>
            </div>
        `).join('');
    },

    initMap() {
        const mapContainer = document.getElementById('productMap');
        const coords = this.house.coordinates || [53.9007, 27.5590];

        if (window.ymaps) {
            const map = new window.ymaps.Map(mapContainer, {
                center: coords,
                zoom: 15,
                controls: ['zoomControl']
            });

            const placemark = new window.ymaps.Placemark(coords, {
                hintContent: this.house.name,
                balloonContent: this.house.name_i18n?.[i18n.currentLang] || this.house.name
            });

            map.geoObjects.add(placemark);
        } else {
            mapContainer.innerHTML = `
                <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15000!2d27.559!3d53.9007!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTPCsDU0JzAyLjUiTiAyN8KwMzMnMzIuNCJF!5e0!3m2!1sru!2sby!4v1234567890"
                    width="100%" 
                    height="100%" 
                    style="border:0;" 
                    allowfullscreen="" 
                    loading="lazy">
                </iframe>
            `;
        }
    },

    bindEvents() {

        this.setupModalHandlers();
        const leftArrow = document.querySelector('.gallery__arrow--left');
        const rightArrow = document.querySelector('.gallery__arrow--right');
        const images = this.house.images || [];

        leftArrow?.addEventListener('click', () => {
            this.currentImageIndex = (this.currentImageIndex - 1 + images.length) % images.length;
            this.updateGallery();
        });

        rightArrow?.addEventListener('click', () => {
            this.currentImageIndex = (this.currentImageIndex + 1) % images.length;
            this.updateGallery();
        });

        document.getElementById('galleryThumbs')?.addEventListener('click', (e) => {
            const thumb = e.target.closest('.gallery__thumb');
            if (thumb) {
                this.currentImageIndex = parseInt(thumb.dataset.index);
                this.updateGallery();
            }
        });

        document.getElementById('bookingForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleBooking(e.target);
        });

        const phoneInput = document.getElementById('bookingPhone');
        phoneInput?.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
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
                e.target.value = formatted;
            }
        });
    },

    updateGallery() {
        const images = this.house.images || [];
        const mainImage = document.getElementById('mainImage');
        const thumbs = document.querySelectorAll('.gallery__thumb');

        const correctedPath = fixImagePath(images[this.currentImageIndex]);
        mainImage.src = correctedPath;

        thumbs.forEach((thumb, index) => {
            thumb.classList.toggle('active', index === this.currentImageIndex);
        });
    },

    validateBookingForm(data) {
        const errors = [];
        const today = new Date().toISOString().split('T')[0];

        if (!data.name || data.name.trim().length < 2) {
            errors.push({ field: 'bookingName', message: i18n.t('validation.required') });
        }

        if (!data.phone || data.phone.length < 12) {
            errors.push({ field: 'bookingPhone', message: i18n.t('validation.invalidPhone') });
        }

        if (!data.checkIn) {
            errors.push({ field: 'bookingCheckin', message: i18n.t('validation.required') });
        } else if (data.checkIn < today) {
            errors.push({ field: 'bookingCheckin', message: i18n.t('validation.invalidDate') });
        }

        if (!data.checkOut) {
            errors.push({ field: 'bookingCheckout', message: i18n.t('validation.required') });
        } else if (data.checkOut <= data.checkIn) {
            errors.push({ field: 'bookingCheckout', message: i18n.t('validation.checkoutAfterCheckin') });
        }

        if (!data.guests || data.guests < 1) {
            errors.push({ field: 'bookingGuests', message: i18n.t('validation.required') });
        }

        return errors;
    },

    getLoginPath() {
        return window.location.pathname.includes('/pages/')
            ? 'login.html'
            : 'pages/login.html';
    },

    calculateTotalPrice(checkIn, checkOut, basePrice) {
        if (!checkIn || !checkOut) return basePrice;

        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

        if (nights <= 0) return basePrice;

        let total = 0;
        let current = new Date(start);

        while (current < end) {
            const day = current.getDay();
            const isWeekend = day === 5 || day === 6 || day === 0;
            total += isWeekend ? basePrice * 1.5 : basePrice;
            current.setDate(current.getDate() + 1);
        }

        return Math.round(total);
    },

    async handleBooking(form) {
        const submitBtn = form.querySelector('#bookingSubmit');
        const originalText = submitBtn.textContent;

        console.log('🚀 Starting booking process...');
        submitBtn.disabled = true;
        submitBtn.textContent = i18n.t('common.loading');

        form.querySelectorAll('.form-error').forEach(el => el.textContent = '');
        form.querySelectorAll('.form-group').forEach(el => el.classList.remove('form-group--error'));

        try {
            const storedUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
            const currentUser = storedUser ? JSON.parse(storedUser) : null;

            if (!currentUser || !currentUser.id) {
                alert(i18n.t('booking.authRequired') || 'Для бронирования необходимо войти в аккаунт');
                window.location.href = this.getLoginPath();
                return;
            }

            console.log('👤 Booking for user:', currentUser.id);

            const formData = new FormData(form);
            const data = {
                userId: currentUser.id,
                userFirstName: currentUser.firstName,
                userLastName: currentUser.lastName,
                userPhone: currentUser.phone,
                userEmail: currentUser.email,

                houseId: this.houseId,
                houseName: this.house.name_i18n?.[i18n.currentLang] || this.house.name,
                name: formData.get('name'),
                phone: formData.get('phone').replace(/\D/g, ''),
                checkIn: formData.get('checkIn'),
                checkOut: formData.get('checkOut'),
                guests: parseInt(formData.get('guests')) || 2,
                comment: formData.get('comment') || '',
                status: 'pending',
                createdAt: new Date().toISOString(),
                totalPrice: this.calculateTotalPrice(formData.get('checkIn'), formData.get('checkOut'), this.house.price)
            };

            console.log('📦 Booking data:', data);

            const errors = this.validateBookingForm(data);
            if (errors.length > 0) {
                console.error('❌ Validation errors:', errors);
                errors.forEach(error => {
                    const errorEl = form.querySelector(`[data-error="${error.field}"]`);
                    if (errorEl) {
                        errorEl.textContent = error.message;
                        const formGroup = errorEl.closest('.form-group');
                        if (formGroup) formGroup.classList.add('form-group--error');
                    }
                });
                throw new Error('Validation failed');
            }

            console.log('✅ Validation passed, sending to API...');
            await API.createBooking(data);
            console.log('✅ Booking created successfully');

            const modal = document.querySelector('[data-modal="booking-modal"]');
            modal.classList.remove('active');
            setTimeout(() => {
                modal.hidden = true;
            }, 250);

            this.showSuccessMessage(data.name);
            form.reset();

        } catch (error) {
            console.error('❌ Booking error:', error);
            if (error.message !== 'Validation failed') {
                alert(i18n.t('common.error') + ': ' + error.message);
            }
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    },

    showSuccessMessage(userName) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
        <div class="modal__content modal__content--success">
            <div class="modal__header">
                <h3 class="modal__title">${i18n.t('booking.successTitle')}</h3>
                <button class="modal__close" data-modal-close>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
            </div>
            <div class="modal__body">
                <div class="success-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                </div>
                <p>${i18n.t('booking.successText').replace('{name}', userName)}</p>
                <div class="modal__footer modal__footer--center">
                    <button class="btn btn--primary" data-modal-close>${i18n.t('common.close')}</button>
                </div>
            </div>
        </div>
    `;

        document.body.appendChild(modal);

        modal.querySelector('[data-modal-close]').addEventListener('click', () => {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 250);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                setTimeout(() => modal.remove(), 250);
            }
        });
    },

    setupModalHandlers() {
        document.querySelectorAll('[data-modal-open]').forEach(btn => {
            btn.addEventListener('click', () => {
                const modalId = btn.getAttribute('data-modal-open');
                this.openModal(modalId);
            });
        });

        document.querySelectorAll('[data-modal-close]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModal();
            });
        });

        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    },

    openModal(modalId) {
        const modal = document.querySelector(`[data-modal="${modalId}"]`);
        if (!modal) return;

        modal.classList.add('active');
        modal.hidden = false;
        document.body.classList.add('modal-open');

        setTimeout(() => {
            const firstInput = modal.querySelector('input, textarea, button:not([data-modal-close])');
            if (firstInput) firstInput.focus();
        }, 300);
    },

    closeModal() {
        const activeModal = document.querySelector('.modal.active');
        if (!activeModal) return;

        activeModal.classList.remove('active');
        setTimeout(() => {
            activeModal.hidden = true;
        }, 250);
        document.body.classList.remove('modal-open');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Product.init();
});
