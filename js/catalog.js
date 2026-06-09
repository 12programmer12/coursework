import API from './api.js';
import i18n from './i18n.js';
import { showNotification, createHouseCard, updateFavoriteButtons, initFavorites } from './main.js';
import AccessibilityManager from './accessibility.js';
import { enrichHousesWithReviews, sortHouses, syncAllHouseReviewStats } from './reviews.js';
import { initHeaderBehavior } from './header-behavior.js';

const Catalog = {
    _initialized: false,
    allHouses: [],
    filteredHouses: [],
    currentPage: 1,
    itemsPerPage: 9,
    filters: {
        search: '',
        priceFrom: null,
        priceTo: null,
        maxGuests: null,
        categories: [],
        minBedrooms: null
    },
    sort: 'rating-desc',

    async init() {
        if (this._initialized) return;
        this._initialized = true;

        AccessibilityManager.init();
        initHeaderBehavior();

        await i18n.init();
        await initFavorites();

        await this.loadHouses();
        this.bindEvents();
        await this.render();
    },

    async loadHouses() {
        try {
            const houses = await API.getHouses();
            await syncAllHouseReviewStats().catch(() => null);
            this.allHouses = await enrichHousesWithReviews(houses);
            this.filteredHouses = sortHouses(this.allHouses, this.sort);
        } catch (error) {
            console.error('Error loading houses:', error);
            this.allHouses = [];
            this.filteredHouses = [];
        }
    },

    async applyFilters() {
        const params = {};

        if (this.filters.search) {
            params.q = this.filters.search;
        }

        if (this.filters.priceFrom !== null) params.price_gte = this.filters.priceFrom;
        if (this.filters.priceTo !== null) params.price_lte = this.filters.priceTo;
        if (this.filters.maxGuests !== null) params.guests_gte = this.filters.maxGuests;
        if (this.filters.minBedrooms !== null) params.bedrooms_gte = this.filters.minBedrooms;

        try {
            let houses = await API.getHouses(params);
            houses = await enrichHousesWithReviews(houses);

            if (this.filters.search) {
                const searchLower = this.filters.search.toLowerCase();
                houses = houses.filter(house => {
                    const name = (house.name_i18n?.ru || house.name || '').toLowerCase();
                    const location = (house.location_i18n?.ru || house.location || '').toLowerCase();
                    const desc = (house.description_i18n?.ru || house.description || '').toLowerCase();
                    const features = (house.features || []).join(' ').toLowerCase();

                    return name.includes(searchLower) ||
                        location.includes(searchLower) ||
                        desc.includes(searchLower) ||
                        features.includes(searchLower);
                });
            }

            if (this.filters.categories.length > 0) {
                houses = houses.filter(house =>
                    this.filters.categories.includes(house.category)
                );
            }

            this.filteredHouses = sortHouses(houses, this.sort);
            this.currentPage = 1;
            this.render();
            this.updateActiveFilters();
        } catch (error) {
            console.error('Error applying filters:', error);
            showNotification('Ошибка при фильтрации', 'error');
        }
    },

    async render() {
        const grid = document.getElementById('catalogGrid');
        const emptyState = document.getElementById('emptyState');
        const pagination = document.getElementById('catalogPagination');
        const resultsCount = document.getElementById('resultsCount');

        resultsCount.textContent = this.filteredHouses.length;

        if (this.filteredHouses.length === 0) {
            grid.innerHTML = '';
            emptyState.hidden = false;
            pagination.hidden = true;
            return;
        }

        emptyState.hidden = true;

        const totalPages = Math.ceil(this.filteredHouses.length / this.itemsPerPage);
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageHouses = this.filteredHouses.slice(start, end);

        grid.innerHTML = '';
        pageHouses.forEach(house => {
            const card = createHouseCard(house);
            grid.appendChild(card);
        });

        if (totalPages > 1) {
            pagination.hidden = false;
            this.renderPagination(totalPages);
        } else {
            pagination.hidden = true;
        }

        setTimeout(() => {
            i18n.translateCardsWithHouses(pageHouses);
        }, 50);

        await updateFavoriteButtons();
    },

    renderPagination(totalPages) {
        const pagesContainer = document.getElementById('paginationPages');
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');

        prevBtn.disabled = this.currentPage === 1;
        nextBtn.disabled = this.currentPage === totalPages;

        pagesContainer.innerHTML = '';

        const maxVisible = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);

        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            const btn = document.createElement('button');
            btn.className = `pagination__page ${i === this.currentPage ? 'active' : ''}`;
            btn.textContent = i;
            btn.setAttribute('aria-label', `Страница ${i}`);
            btn.addEventListener('click', () => {
                this.currentPage = i;
                this.render();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            pagesContainer.appendChild(btn);
        }
    },

    updateActiveFilters() {
        const container = document.getElementById('activeFilters');
        const resetAll = document.getElementById('resetAllFilters');
        const filterCount = document.getElementById('activeFiltersCount');

        const tags = [];
        let activeCount = 0;

        if (this.filters.priceFrom !== null || this.filters.priceTo !== null) {
            const from = this.filters.priceFrom || '0';
            const to = this.filters.priceTo || '∞';
            tags.push({ label: `${from} - ${to} BYN`, type: 'price' });
            activeCount++;
        }

        if (this.filters.maxGuests) {
            tags.push({ label: `до ${this.filters.maxGuests} гостей`, type: 'guests' });
            activeCount++;
        }

        if (this.filters.categories.length > 0) {
            this.filters.categories.forEach(cat => {
                const label = document.querySelector(`[data-category-filter][value="${cat}"]`)?.nextElementSibling?.textContent || cat;
                tags.push({ label, type: 'category', value: cat });
            });
            activeCount++;
        }

        if (this.filters.minBedrooms) {
            tags.push({ label: `${this.filters.minBedrooms}+ спален`, type: 'bedrooms' });
            activeCount++;
        }

        if (tags.length === 0) {
            container.hidden = true;
            resetAll.hidden = true;
            filterCount.hidden = true;
            return;
        }

        container.hidden = false;
        resetAll.hidden = false;
        filterCount.hidden = false;
        filterCount.textContent = activeCount;

        container.innerHTML = tags.map(tag => `
            <span class="active-filter-tag">
                ${tag.label}
                <svg class="active-filter-tag__remove" width="16" height="16" viewBox="0 0 16 16" fill="none" data-remove-filter="${tag.type}" data-filter-value="${tag.value || ''}">
                    <path d="M4 4l8 8M12 4L4 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
            </span>
        `).join('');

        container.querySelectorAll('[data-remove-filter]').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.getAttribute('data-remove-filter');
                this.removeFilter(type, btn.getAttribute('data-filter-value'));
            });
        });
    },

    removeFilter(type, value) {
        switch (type) {
            case 'price':
                this.filters.priceFrom = null;
                this.filters.priceTo = null;
                document.getElementById('priceFrom').value = '';
                document.getElementById('priceTo').value = '';
                break;
            case 'guests':
                this.filters.maxGuests = null;
                document.querySelectorAll('.filter-dropdown__guest-btn[data-guests]').forEach(b => b.classList.remove('active'));
                break;
            case 'category':
                this.filters.categories = this.filters.categories.filter(c => c !== value);
                const cb = document.querySelector(`[data-category-filter][value="${value}"]`);
                if (cb) cb.checked = false;
                break;
            case 'bedrooms':
                this.filters.minBedrooms = null;
                document.querySelectorAll('.filter-dropdown__guest-btn[data-bedrooms]').forEach(b => b.classList.remove('active'));
                break;
        }
        this.applyFilters();
    },

    resetAll() {
        this.filters = {
            search: '',
            priceFrom: null,
            priceTo: null,
            maxGuests: null,
            categories: [],
            minBedrooms: null
        };

        document.getElementById('catalogSearch').value = '';
        document.getElementById('priceFrom').value = '';
        document.getElementById('priceTo').value = '';
        document.querySelectorAll('.filter-dropdown__guest-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('[data-category-filter]').forEach(cb => cb.checked = false);

        this.applyFilters();
    },

    bindEvents() {
        const searchInput = document.getElementById('catalogSearch');
        let searchDebounce;
        searchInput?.addEventListener('input', (e) => {
            clearTimeout(searchDebounce);
            searchDebounce = setTimeout(() => {
                this.filters.search = e.target.value.trim();
                this.applyFilters();
            }, 300);
        });

        document.getElementById('sortSelect')?.addEventListener('change', (e) => {
            this.sort = e.target.value;
            this.applyFilters();
        });

        document.querySelector('[data-close-filters]')?.addEventListener('click', () => {
            this.closeMobileFilters();
        });

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('catalog-filters-overlay')) {
                this.closeMobileFilters();
            }
        });

        document.querySelectorAll('.filter-dropdown__toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                const dropdown = toggle.closest('.filter-dropdown');
                const content = dropdown.querySelector('.filter-dropdown__content');
                const isOpen = !content.hidden;

                document.querySelectorAll('.filter-dropdown__content').forEach(c => {
                    c.hidden = true;
                });
                document.querySelectorAll('.filter-dropdown__toggle').forEach(t => {
                    t.setAttribute('aria-expanded', 'false');
                });

                if (!isOpen) {
                    content.hidden = false;
                    toggle.setAttribute('aria-expanded', 'true');
                }
            });
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.filter-dropdown')) {
                document.querySelectorAll('.filter-dropdown__content').forEach(c => c.hidden = true);
                document.querySelectorAll('.filter-dropdown__toggle').forEach(t => t.setAttribute('aria-expanded', 'false'));
            }
        });

        document.getElementById('priceFrom')?.addEventListener('change', (e) => {
            this.filters.priceFrom = e.target.value ? parseInt(e.target.value) : null;
        });
        document.getElementById('priceTo')?.addEventListener('change', (e) => {
            this.filters.priceTo = e.target.value ? parseInt(e.target.value) : null;
        });

        const priceFromRange = document.getElementById('priceRangeFrom');
        const priceToRange = document.getElementById('priceRangeTo');

        priceFromRange?.addEventListener('input', () => {
            if (parseInt(priceFromRange.value) > parseInt(priceToRange.value)) {
                priceFromRange.value = priceToRange.value;
            }
            document.getElementById('priceFrom').value = priceFromRange.value;
            this.filters.priceFrom = parseInt(priceFromRange.value) || null;
        });

        priceToRange?.addEventListener('input', () => {
            if (parseInt(priceToRange.value) < parseInt(priceFromRange.value)) {
                priceToRange.value = priceFromRange.value;
            }
            document.getElementById('priceTo').value = priceToRange.value;
            this.filters.priceTo = parseInt(priceToRange.value) || null;
        });

        document.querySelectorAll('[data-guests]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('[data-guests]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filters.maxGuests = parseInt(btn.getAttribute('data-guests'));
            });
        });

        document.querySelectorAll('[data-bedrooms]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('[data-bedrooms]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filters.minBedrooms = parseInt(btn.getAttribute('data-bedrooms'));
            });
        });

        document.querySelectorAll('[data-category-filter]').forEach(cb => {
            cb.addEventListener('change', () => {
                if (cb.checked) {
                    if (!this.filters.categories.includes(cb.value)) {
                        this.filters.categories.push(cb.value);
                    }
                } else {
                    this.filters.categories = this.filters.categories.filter(c => c !== cb.value);
                }
            });
        });

        document.querySelectorAll('[data-selection]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.filters.categories = [btn.getAttribute('data-selection')];
                document.querySelectorAll('[data-category-filter]').forEach(cb => {
                    cb.checked = cb.value === btn.getAttribute('data-selection');
                });
                this.applyFilters();
            });
        });

        document.querySelectorAll('.filter-dropdown__apply').forEach(btn => {
            btn.addEventListener('click', () => {
                this.applyFilters();
                const dropdown = btn.closest('.filter-dropdown');
                dropdown.querySelector('.filter-dropdown__content').hidden = true;
                dropdown.querySelector('.filter-dropdown__toggle').setAttribute('aria-expanded', 'false');
            });
        });

        document.querySelectorAll('.filter-dropdown__reset').forEach(btn => {
            btn.addEventListener('click', () => {
                const dropdown = btn.closest('.filter-dropdown');
                const type = dropdown.getAttribute('data-filter');

                switch (type) {
                    case 'price':
                        this.filters.priceFrom = null;
                        this.filters.priceTo = null;
                        document.getElementById('priceFrom').value = '';
                        document.getElementById('priceTo').value = '';
                        break;
                    case 'guests':
                        this.filters.maxGuests = null;
                        dropdown.querySelectorAll('.filter-dropdown__guest-btn').forEach(b => b.classList.remove('active'));
                        break;
                    case 'category':
                        this.filters.categories = [];
                        dropdown.querySelectorAll('[data-category-filter]').forEach(cb => cb.checked = false);
                        break;
                    case 'bedrooms':
                        this.filters.minBedrooms = null;
                        dropdown.querySelectorAll('.filter-dropdown__guest-btn').forEach(b => b.classList.remove('active'));
                        break;
                }
            });
        });

        document.getElementById('resetAllFilters')?.addEventListener('click', () => this.resetAll());
        document.getElementById('resetFiltersBtn')?.addEventListener('click', () => this.resetAll());

        document.getElementById('prevPage')?.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.render();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
        document.getElementById('nextPage')?.addEventListener('click', () => {
            const totalPages = Math.ceil(this.filteredHouses.length / this.itemsPerPage);
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.render();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });

        document.querySelector('[data-mobile-filter-toggle]')?.addEventListener('click', () => {
            const filters = document.getElementById('catalogFilters');
            if (filters) {
                filters.classList.toggle('mobile-active');

                if (filters.classList.contains('mobile-active')) {
                    let overlay = document.querySelector('.catalog-filters-overlay');
                    if (!overlay) {
                        overlay = document.createElement('div');
                        overlay.className = 'catalog-filters-overlay';
                        document.body.appendChild(overlay);
                    }
                    overlay.offsetHeight;
                    overlay.classList.add('active');
                } else {
                    const overlay = document.querySelector('.catalog-filters-overlay');
                    if (overlay) {
                        overlay.classList.remove('active');
                        setTimeout(() => overlay.remove(), 300);
                    }
                }
            }
        });
    },

    closeMobileFilters() {
        const filters = document.getElementById('catalogFilters');
        const overlay = document.querySelector('.catalog-filters-overlay');

        if (filters) {
            filters.classList.remove('mobile-active');
        }

        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
        }

        document.querySelector('[data-mobile-filter-toggle]')?.setAttribute('aria-expanded', 'false');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Catalog.init();
});