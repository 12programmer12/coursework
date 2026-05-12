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
        const params = new URLSearchParams();

        if (filters.name_like) params.append('name_like', filters.name_like);
        if (filters.price_gte) params.append('price_gte', filters.price_gte);
        if (filters.price_lte) params.append('price_lte', filters.price_lte);
        if (filters.guests_gte) params.append('guests_gte', filters.guests_gte);
        if (filters.bedrooms_gte) params.append('bedrooms_gte', filters.bedrooms_gte);
        if (filters._sort) params.append('_sort', filters._sort);
        if (filters._order) params.append('_order', filters._order);

        const queryString = params.toString();
        const url = `${this.baseURL}/houses${queryString ? '?' + queryString : ''}`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
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
