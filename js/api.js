const API = {
    baseURL: 'http://localhost:3000',

    async fetch(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;

        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    async getHouses(filters = {}) {
        let query = '/houses';
        const params = new URLSearchParams();

        if (filters.category) params.append('category', filters.category);
        if (filters.minPrice) params.append('price_gte', filters.minPrice);
        if (filters.maxPrice) params.append('price_lte', filters.maxPrice);
        if (filters.guests) params.append('guests_gte', filters.guests);
        if (filters.search) params.append('name_like', filters.search);
        if (filters.sort) params.append('_sort', filters.sort);
        if (filters.order) params.append('_order', filters.order);

        if (params.toString()) {
            query += `?${params.toString()}`;
        }

        return this.fetch(query);
    },

    async getHouseById(id) {
        return this.fetch(`/houses/${id}`);
    },

    async getCategories() {
        return this.fetch('/categories');
    },

    async getServices() {
        return this.fetch('/services');
    },

    async createBooking(bookingData) {
        return this.fetch('/bookings', {
            method: 'POST',
            body: JSON.stringify(bookingData)
        });
    },

    async getUserBookings(userId) {
        return this.fetch(`/bookings?userId=${userId}`);
    },

    async createSelectionRequest(requestData) {
        return this.fetch('/selection-requests', {
            method: 'POST',
            body: JSON.stringify(requestData)
        });
    },

    async getReviews(houseId) {
        return this.fetch(`/reviews?houseId=${houseId}`);
    },

    async createReview(reviewData) {
        return this.fetch('/reviews', {
            method: 'POST',
            body: JSON.stringify(reviewData)
        });
    },

    async getFavorites(userId) {
        return this.fetch(`/favorites?userId=${userId}`);
    },

    async addToFavorites(favoriteData) {
        return this.fetch('/favorites', {
            method: 'POST',
            body: JSON.stringify(favoriteData)
        });
    },

    async removeFromFavorites(id) {
        return this.fetch(`/favorites/${id}`, {
            method: 'DELETE'
        });
    }
};

export default API;
