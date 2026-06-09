import API from './api.js';

export const QUICK_PHRASE_KEYS = [
    'reviews.phrase.cozy',
    'reviews.phrase.clean',
    'reviews.phrase.fastContact',
    'reviews.phrase.greatHost',
    'reviews.phrase.beautiful',
    'reviews.phrase.asDescribed',
    'reviews.phrase.quiet',
    'reviews.phrase.convenient'
];

export function normalizeId(id) {
    return id == null ? '' : String(id);
}

export function isBookingCompleted(booking) {
    if (!booking) return false;

    const today = new Date().toISOString().split('T')[0];

    if (booking.status === 'completed') return true;
    if (booking.status === 'confirmed' && booking.checkOut && booking.checkOut <= today) {
        return true;
    }

    return false;
}

export async function markCompletedBookings(bookings) {
    const today = new Date().toISOString().split('T')[0];
    const updates = [];

    for (const booking of bookings) {
        if (booking.status === 'confirmed' && booking.checkOut && booking.checkOut < today) {
            updates.push(
                API.updateBooking(booking.id, { status: 'completed' }).catch(() => null)
            );
            booking.status = 'completed';
        }
    }

    if (updates.length) {
        await Promise.all(updates);
    }

    return bookings;
}

export function renderStars(rating, max = 5) {
    const value = Math.max(0, Math.min(max, Math.round(rating)));
    return '★'.repeat(value) + '☆'.repeat(max - value);
}

export function formatReviewDate(dateStr, lang = 'ru') {
    if (!dateStr) return '';
    const locale = lang === 'be' ? 'be-BY' : lang === 'en' ? 'en-US' : 'ru-RU';
    return new Date(dateStr).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

export function buildReviewStatsMap(allReviews = []) {
    const statsMap = {};

    allReviews.forEach(review => {
        const houseId = normalizeId(review.houseId);
        if (!statsMap[houseId]) {
            statsMap[houseId] = { count: 0, sum: 0 };
        }
        statsMap[houseId].count += 1;
        statsMap[houseId].sum += review.rating || 0;
    });

    return statsMap;
}

export function getHouseReviewStats(houseId, statsMap = {}) {
    const stats = statsMap[normalizeId(houseId)] || { count: 0, sum: 0 };
    const count = stats.count;
    const rating = count
        ? Math.round((stats.sum / count) * 10) / 10
        : 0;

    return { rating, count };
}

export function enrichHousesWithReviewStats(houses, statsMap) {
    return houses.map(house => {
        const { rating, count } = getHouseReviewStats(house.id, statsMap);
        return {
            ...house,
            rating,
            reviews: count
        };
    });
}

export async function enrichHousesWithReviews(houses) {
    const allReviews = await API.getAllReviews();
    const statsMap = buildReviewStatsMap(allReviews);
    return enrichHousesWithReviewStats(houses, statsMap);
}

export async function syncAllHouseReviewStats() {
    const [allReviews, houses] = await Promise.all([
        API.getAllReviews(),
        API.getHouses()
    ]);

    const statsMap = buildReviewStatsMap(allReviews);

    await Promise.all(houses.map(house => {
        const { rating, count } = getHouseReviewStats(house.id, statsMap);

        if (house.reviews === count && house.rating === rating) {
            return null;
        }

        return API.updateHouse(house.id, { rating, reviews: count }).catch(() => null);
    }));
}

export function sortHouses(houses, sortKey) {
    const [field, order] = sortKey.split('-');
    const sorted = [...houses];

    sorted.sort((a, b) => {
        if (field === 'name') {
            const nameA = a.name_i18n?.ru || a.name || '';
            const nameB = b.name_i18n?.ru || b.name || '';
            return order === 'asc'
                ? nameA.localeCompare(nameB, 'ru')
                : nameB.localeCompare(nameA, 'ru');
        }

        const valueA = Number(a[field]) || 0;
        const valueB = Number(b[field]) || 0;

        return order === 'asc' ? valueA - valueB : valueB - valueA;
    });

    return sorted;
}

export async function recalculateHouseRating(houseId) {
    const reviews = await API.getReviews(houseId);
    const count = reviews.length;
    const rating = count
        ? Math.round((reviews.reduce((sum, item) => sum + (item.rating || 0), 0) / count) * 10) / 10
        : 0;

    await API.updateHouse(houseId, { rating, reviews: count });
    return { rating, count, reviews };
}

export function userHasReviewed(reviews, userId) {
    return reviews.some(review => normalizeId(review.userId) === normalizeId(userId));
}

export function canUserReview({ user, bookings, reviews, houseId }) {
    if (!user?.id) {
        return { allowed: false, reason: 'auth' };
    }

    const eligibleBooking = bookings.find(booking =>
        normalizeId(booking.houseId) === normalizeId(houseId) && isBookingCompleted(booking)
    );

    if (!eligibleBooking) {
        return { allowed: false, reason: 'booking' };
    }

    if (userHasReviewed(reviews, user.id)) {
        return { allowed: false, reason: 'exists' };
    }

    return { allowed: true, booking: eligibleBooking };
}
