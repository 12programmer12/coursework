import ThemeManager from './theme.js';
import i18n from './i18n.js';

function getPagePath(pageName) {
    const currentPath = window.location.pathname;
    if (currentPath.includes('/pages/')) {
        return `${pageName}.html`;
    }
    return `pages/${pageName}.html`;
}

function initProfileButton() {
    const userBtn = document.querySelector('[data-user-menu]');
    if (!userBtn) return;

    userBtn.addEventListener('click', () => {
        const storedUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        const currentUser = storedUser ? JSON.parse(storedUser) : null;

        if (!currentUser) {
            window.location.href = getPagePath('login');
        } else {
            const roleRoutes = {
                'renter': getPagePath('profile'),
                'landlord': getPagePath('landlord-profile'),
                'admin': getPagePath('admin')
            };
            window.location.href = roleRoutes[currentUser.role] || getPagePath('profile');
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    await i18n.init();
    ThemeManager.init();

    initProfileButton();

    initCarousel();

    applyTranslations();

    document.addEventListener('languageChanged', () => {
        applyTranslations();
    });
});

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = i18n.t(key);
    });
}

function initCarousel() {
    const carousel = document.querySelector('[data-carousel]');
    if (!carousel) return;

    const track = carousel.querySelector('.gallery-carousel__track');
    const slides = carousel.querySelectorAll('.gallery-carousel__slide');
    const prevBtn = carousel.querySelector('.gallery-carousel__btn--prev');
    const nextBtn = carousel.querySelector('.gallery-carousel__btn--next');
    const dotsContainer = carousel.querySelector('.gallery-carousel__dots');

    let currentIndex = 0;
    const totalSlides = slides.length;

    slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = `gallery-carousel__dot ${index === 0 ? 'active' : ''}`;
        dot.setAttribute('aria-label', `Slide ${index + 1}`);
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('.gallery-carousel__dot');

    function updateCarousel() {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    function goToSlide(index) {
        currentIndex = index;
        updateCarousel();
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateCarousel();
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        updateCarousel();
    }

    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);

    let autoplayInterval = setInterval(nextSlide, 5000);

    carousel.addEventListener('mouseenter', () => {
        clearInterval(autoplayInterval);
    });

    carousel.addEventListener('mouseleave', () => {
        autoplayInterval = setInterval(nextSlide, 5000);
    });

    let touchStartX = 0;
    let touchEndX = 0;

    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    carousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        if (touchEndX < touchStartX - 50) {
            nextSlide();
        }
        if (touchEndX > touchStartX + 50) {
            prevSlide();
        }
    }
}
