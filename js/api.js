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

            if (response.status === 204) {
                return null;
            }

            const text = await response.text();
            if (!text) {
                return null;
            }

            return JSON.parse(text);
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
        try {
            const url = `${this.baseURL}/houses/${id}`;

            const response = await fetch(url);

            if (!response.ok) {
                if (response.status === 404) {
                    console.warn('⚠️ House not found (404)');
                    return null;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('❌ Error in getHouseById:', error);
            throw error;
        }
    },

    async getCategories() {
        return this.fetch('/categories');
    },

    async getServices() {
        return this.fetch('/services');
    },

    async createBooking(bookingData) {
        const payload = {
            ...bookingData,
            userId: String(bookingData.userId),
            houseId: String(bookingData.houseId)
        };
        return this.fetch('/bookings', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    },

    async getUserBookings(userId) {
        try {
            const all = await this.fetch('/bookings');
            const normalizedUserId = String(userId);
            return all.filter(item =>
                item.userId != null && String(item.userId) === normalizedUserId
            );
        } catch (error) {
            console.error('API getUserBookings error:', error);
            return [];
        }
    },

    async createSelectionRequest(requestData) {
        return this.fetch('/selection-requests', {
            method: 'POST',
            body: JSON.stringify(requestData)
        });
    },

    async getSelectionRequests() {
        try {
            return await this.fetch('/selection-requests');
        } catch (error) {
            console.error('API getSelectionRequests error:', error);
            return [];
        }
    },

    async updateSelectionRequest(id, requestData) {
        return this.fetch(`/selection-requests/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(requestData)
        });
    },

    async getReviews(houseId) {
        try {
            const allReviews = await this.getAllReviews();
            return allReviews.filter(review => String(review.houseId) === String(houseId));
        } catch (error) {
            console.error('API getReviews error:', error);
            return [];
        }
    },

    async getAllReviews() {
        try {
            return await this.fetch('/reviews');
        } catch (error) {
            console.error('API getAllReviews error:', error);
            return [];
        }
    },

    async createReview(reviewData) {
        return this.fetch('/reviews', {
            method: 'POST',
            body: JSON.stringify(reviewData)
        });
    },

    async getFavorites(userId) {
        try {
            const all = await this.fetch('/favorites');
            const normalizedUserId = String(userId);
            return all.filter(item =>
                item.userId != null &&
                String(item.userId) === normalizedUserId &&
                item.houseId != null &&
                item.houseId !== ''
            );
        } catch (error) {
            console.error('API getFavorites error:', error);
            return [];
        }
    },

    async addToFavorites(favoriteData) {
        const userId = favoriteData.userId;
        const houseId = favoriteData.houseId;

        if (userId == null || userId === '') {
            throw new Error('userId is required');
        }
        if (houseId == null || houseId === '') {
            throw new Error('houseId is required');
        }

        const payload = {
            ...favoriteData,
            userId: String(userId),
            houseId: String(houseId)
        };
        return this.fetch('/favorites', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    },

    async removeFromFavorites(id) {
        if (id == null || id === '') {
            throw new Error('Favorite id is required');
        }
        return this.fetch(`/favorites/${encodeURIComponent(id)}`, {
            method: 'DELETE'
        });
    },

    async getUsers() {
        return this.fetch('/users');
    },

    async getUserById(id) {
        return this.fetch(`/users/${id}`);
    },

    async createUser(userData) {
        return this.fetch('/users', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    async updateUser(id, userData) {
        return this.fetch(`/users/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(userData)
        });
    },

    async getUserByEmail(email) {
        return this.fetch(`/users?email=${encodeURIComponent(email)}`);
    },

    async createProperty(propertyData) {
        return this.fetch('/properties', {
            method: 'POST',
            body: JSON.stringify(propertyData)
        });
    },

    async updateProperty(id, propertyData) {
        return this.fetch(`/properties/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(propertyData)
        });
    },

    async getBookings() {
        try {
            const response = await fetch(`${this.baseURL}/bookings`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('API getBookings error:', error);
            return [];
        }
    },

    async updateBooking(id, bookingData) {
        try {
            const response = await fetch(`${this.baseURL}/bookings/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingData)
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('API updateBooking error:', error);
            throw error;
        }
    },

    async deleteBooking(id) {
        try {
            const response = await fetch(`${this.baseURL}/bookings/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return true;
        } catch (error) {
            console.error('API deleteBooking error:', error);
            throw error;
        }
    },

    async updateHouse(id, houseData) {
        try {
            const response = await fetch(`${this.baseURL}/houses/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(houseData)
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('API updateHouse error:', error);
            throw error;
        }
    },

    async deleteHouse(id) {
        try {
            const response = await fetch(`${this.baseURL}/houses/${id}`, {
                method: 'DELETE'
            });

            if (response.status === 404) {
                return true;
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return true;
        } catch (error) {
            console.error('API deleteHouse error:', error);
            throw error;
        }
    },

    async getProperties(filters = {}) {
        const params = new URLSearchParams();
        if (filters.landlordId) params.append('landlordId', filters.landlordId);
        if (filters.houseId) params.append('houseId', filters.houseId);
        if (filters.status) params.append('status', filters.status);

        const query = params.toString();
        return this.fetch(`/properties${query ? '?' + query : ''}`);
    },

    async createPropertyLink(propertyData) {
        return this.fetch('/properties', {
            method: 'POST',
            body: JSON.stringify(propertyData)
        });
    },

    async deletePropertyLink(id) {
        return this.fetch(`/properties/${id}`, {
            method: 'DELETE'
        });
    },

    async updatePropertyLink(id, propertyData) {
        return this.fetch(`/properties/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(propertyData)
        });
    }
};

export default API;
