import API from './api.js';
import i18n from './i18n.js';
import Modal from './components/modal.js';

import { fixImagePath } from './main.js';
import AccessibilityManager from "./accessibility.js";
import { initHeaderBehavior } from './header-behavior.js';
import {
    QUICK_PHRASE_KEYS,
    canUserReview,
    formatReviewDate,
    markCompletedBookings,
    normalizeId,
    recalculateHouseRating,
    renderStars
} from './reviews.js';
import {
    calculateHousePrices,
    getHouseServiceLabels,
    getHouseAmenityLabels
} from './house-common.js';

const CONTACT_PHONE = '+3758435286548';
const CONTACT_TELEGRAM = 'https://t.me/domiktut';

const Product = {
    houseId: null,
    house: null,
    reviews: [],
    currentImageIndex: 0,
    selectedRating: 0,
    selectedPhrases: [],

    async init() {
        AccessibilityManager.init();
        initHeaderBehavior();

        this.getHouseIdFromURL();
        await this.loadHouseData();
        Modal.init();
        this.bindEvents();
        this.initMap();
        this.scrollToReviewsIfNeeded();
    },

    scrollToReviewsIfNeeded() {
        if (window.location.hash !== '#reviews') return;
        document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    getHouseIdFromURL() {
        const params = new URLSearchParams(window.location.search);
        const idParam = params.get('id');
        this.houseId = idParam ? idParam.trim() : null;

        if (!this.houseId) {
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

            this.reviews = await API.getReviews(this.houseId);
            const reviewCount = this.reviews.length;
            this.house.rating = reviewCount
                ? Math.round((this.reviews.reduce((sum, item) => sum + (item.rating || 0), 0) / reviewCount) * 10) / 10
                : 0;
            this.house.reviews = reviewCount;

            this.renderHouseData();
            this.renderGallery();
            this.renderAmenities();
            this.renderAdditionalServices();
            this.renderRatingSummary();
            await this.renderReviewsSection();

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

        const prices = calculateHousePrices(this.house.price);
        document.getElementById('priceWeekday').textContent = `${prices.weekday} ${currency}`;
        document.getElementById('priceFriday').textContent = `${prices.friday} ${currency}`;
        document.getElementById('priceSaturday').textContent = `${prices.saturday} ${currency}`;
        document.getElementById('priceSunday').textContent = `${prices.sunday} ${currency}`;
        document.getElementById('depositAmount').textContent = `${prices.deposit} ${currency}`;
        document.getElementById('fullWeekendPrice').textContent = `${prices.fullWeekend} ${currency}`;
    },

    renderRatingSummary() {
        const container = document.getElementById('productRatingSummary');
        if (!container) return;

        const rating = this.house.rating || 0;
        const count = this.house.reviews || 0;

        if (!count) {
            container.hidden = true;
            return;
        }

        container.hidden = false;
        container.innerHTML = `
            <span class="product__rating-stars" aria-label="${rating} ${i18n.t('reviews.outOf5')}">
                ${renderStars(rating)}
            </span>
            <span class="product__rating-value">${rating}</span>
            <span class="product__rating-count">
                ${i18n.t('reviews.count').replace('{count}', count)}
            </span>
        `;
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
        const amenities = getHouseAmenityLabels(this.house, i18n.currentLang);
        const container = document.getElementById('productAmenities');
        container.innerHTML = amenities.map(label =>
            `<div class="amenity-item">${label}</div>`
        ).join('');
    },

        renderAdditionalServices() {
            const labels = getHouseServiceLabels(this.house, i18n.currentLang);
            const container = document.getElementById('additionalServices');
            
            if (!container) return;
            
            if (labels.length === 0) {
                container.innerHTML = `<p class="product__text">${i18n.t('product.noServices') || 'Дополнительные услуги не предоставляются'}</p>`;
                return;
            }
            
            container.innerHTML = labels.map(label =>
                `<div class="service-item">${label}</div>`
            ).join('');
        },

    getCurrentUser() {
        const stored = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        return stored ? JSON.parse(stored) : null;
    },

    async renderReviewsSection() {
        await this.renderReviewForm();
        this.renderReviewsList();
    },

    async renderReviewForm() {
        const container = document.getElementById('reviewFormContainer');
        if (!container) return;

        const user = this.getCurrentUser();
        let bookings = [];

        if (user?.id) {
            bookings = await API.getUserBookings(user.id);
            bookings = await markCompletedBookings(bookings);
        }

        const access = canUserReview({
            user,
            bookings,
            reviews: this.reviews,
            houseId: this.houseId
        });

        if (!access.allowed) {
            container.hidden = true;
            container.innerHTML = '';
            return;
        }

        container.hidden = false;
        this.selectedRating = 0;
        this.selectedPhrases = [];

        container.innerHTML = `
            <h3 class="review-form__title">${i18n.t('reviews.leaveReview')}</h3>
            <div class="review-form__rating">
                <span class="review-form__label">${i18n.t('reviews.rating')}</span>
                <div class="review-stars-input" data-review-stars>
                    ${[1, 2, 3, 4, 5].map(value => `
                        <button type="button" class="review-stars-input__star" data-star-value="${value}" aria-label="${value}">
                            ☆
                        </button>
                    `).join('')}
                </div>
            </div>
            <div class="review-form__phrases">
                <span class="review-form__label">${i18n.t('reviews.quickPhrases')}</span>
                <div class="review-phrases" data-review-phrases>
                    ${QUICK_PHRASE_KEYS.map(key => `
                        <button type="button" class="review-phrase" data-phrase-key="${key}">
                            ${i18n.t(key)}
                        </button>
                    `).join('')}
                </div>
            </div>
            <div class="form-group">
                <label class="review-form__label" for="reviewText">${i18n.t('reviews.text')}</label>
                <textarea id="reviewText" class="review-form__textarea" rows="4" placeholder="${i18n.t('reviews.textPlaceholder')}"></textarea>
            </div>
            <button type="button" class="btn btn--primary" data-submit-review>
                ${i18n.t('reviews.submit')}
            </button>
        `;

        container.querySelector('[data-review-stars]')?.addEventListener('click', (e) => {
            const star = e.target.closest('[data-star-value]');
            if (!star) return;
            this.selectedRating = parseInt(star.dataset.starValue, 10);
            this.updateStarInput(container);
        });

        container.querySelector('[data-review-phrases]')?.addEventListener('click', (e) => {
            const phraseBtn = e.target.closest('[data-phrase-key]');
            if (!phraseBtn) return;

            const key = phraseBtn.dataset.phraseKey;
            const phraseText = i18n.t(key);
            const textarea = container.querySelector('#reviewText');

            if (this.selectedPhrases.includes(key)) {
                this.selectedPhrases = this.selectedPhrases.filter(item => item !== key);
                phraseBtn.classList.remove('active');
            } else {
                this.selectedPhrases.push(key);
                phraseBtn.classList.add('active');
                if (textarea && !textarea.value.includes(phraseText)) {
                    textarea.value = textarea.value
                        ? `${textarea.value.trim()} ${phraseText}`
                        : phraseText;
                }
            }
        });

        container.querySelector('[data-submit-review]')?.addEventListener('click', () => {
            this.submitReview(container);
        });
    },

    updateStarInput(container) {
        container.querySelectorAll('[data-star-value]').forEach(star => {
            const value = parseInt(star.dataset.starValue, 10);
            const active = value <= this.selectedRating;
            star.classList.toggle('active', active);
            star.textContent = active ? '★' : '☆';
        });
    },

    async submitReview(formContainer) {
        const user = this.getCurrentUser();
        if (!user?.id) {
            alert(i18n.t('reviews.authRequired'));
            window.location.href = this.getLoginPath();
            return;
        }

        const text = formContainer.querySelector('#reviewText')?.value.trim() || '';

        if (!this.selectedRating) {
            alert(i18n.t('reviews.ratingRequired'));
            return;
        }

        if (!text) {
            alert(i18n.t('reviews.textRequired'));
            return;
        }

        const submitBtn = formContainer.querySelector('[data-submit-review]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = i18n.t('common.loading');

        try {
            const phrases = this.selectedPhrases.map(key => i18n.t(key));

            await API.createReview({
                houseId: this.houseId,
                userId: user.id,
                userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.nickname || 'Гость',
                rating: this.selectedRating,
                text,
                phrases,
                createdAt: new Date().toISOString()
            });

            const updated = await recalculateHouseRating(this.houseId);
            this.house.rating = updated.rating;
            this.house.reviews = updated.count;
            this.reviews = await API.getReviews(this.houseId);

            this.renderRatingSummary();
            formContainer.hidden = true;
            formContainer.innerHTML = '';
            this.renderReviewsList();
            alert(i18n.t('reviews.success'));
        } catch (error) {
            console.error('Review submit error:', error);
            alert(i18n.t('common.error'));
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    },

    renderReviewsList() {
        const container = document.getElementById('productReviews');
        if (!container) return;

        if (!this.reviews.length) {
            container.innerHTML = `<p class="product__text">${i18n.t('product.noReviews')}</p>`;
            return;
        }

        const sortedReviews = [...this.reviews].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        container.innerHTML = sortedReviews.map(review => `
            <article class="review-item">
                <div class="review-header">
                    <div>
                        <span class="review-author">${review.userName || 'Гость'}</span>
                        <span class="review-date">${formatReviewDate(review.createdAt, i18n.currentLang)}</span>
                    </div>
                    <span class="review-rating" aria-label="${review.rating}">${renderStars(review.rating || 0)}</span>
                </div>
                ${review.phrases?.length ? `
                    <div class="review-phrases review-phrases--readonly">
                        ${review.phrases.map(phrase => `<span class="review-phrase review-phrase--readonly">${phrase}</span>`).join('')}
                    </div>
                ` : ''}
                <p class="review-text">${review.text || ''}</p>
            </article>
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

        document.querySelector('[data-contact-write]')?.setAttribute('href', CONTACT_TELEGRAM);
        document.querySelector('[data-contact-call]')?.setAttribute('href', `tel:${CONTACT_PHONE}`);

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

            Modal.close();

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

        const closeSuccessModal = () => {
            modal.classList.remove('active');
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            setTimeout(() => modal.remove(), 250);
        };

        modal.querySelector('[data-modal-close]').addEventListener('click', closeSuccessModal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeSuccessModal();
            }
        });
    },

};

document.addEventListener('DOMContentLoaded', () => {
    Product.init();
});
