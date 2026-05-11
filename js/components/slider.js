class Slider {
    constructor(selector, options = {}) {
        this.container = document.querySelector(selector);
        if (!this.container) return;

        this.options = {
            slidesToShow: 1,
            autoplay: false,
            autoplaySpeed: 5000,
            infinite: true,
            ...options
        };

        this.currentIndex = 0;
        this.slides = [];
        this.autoplayInterval = null;

        this.init();
    }

    init() {
        this.slides = Array.from(this.container.querySelectorAll('.slider__slide'));
        this.totalSlides = this.slides.length;

        if (this.totalSlides === 0) return;

        this.createControls();
        this.updateSlider();

        if (this.options.autoplay) {
            this.startAutoplay();
        }

        this.bindEvents();
    }

    createControls() {
        this.prevBtn = document.createElement('button');
        this.prevBtn.className = 'slider__btn slider__btn--prev';
        this.prevBtn.setAttribute('aria-label', 'Предыдущий слайд');
        this.prevBtn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;

        this.nextBtn = document.createElement('button');
        this.nextBtn.className = 'slider__btn slider__btn--next';
        this.nextBtn.setAttribute('aria-label', 'Следующий слайд');
        this.nextBtn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;

        this.container.appendChild(this.prevBtn);
        this.container.appendChild(this.nextBtn);

        this.dotsContainer = document.createElement('div');
        this.dotsContainer.className = 'slider__dots';

        for (let i = 0; i < this.totalSlides; i++) {
            const dot = document.createElement('button');
            dot.className = 'slider__dot';
            dot.setAttribute('aria-label', `Слайд ${i + 1}`);
            dot.addEventListener('click', () => this.goToSlide(i));
            this.dotsContainer.appendChild(dot);
        }

        this.container.appendChild(this.dotsContainer);
    }

    updateSlider() {
        this.slides.forEach((slide, index) => {
            slide.classList.toggle('slider__slide--active', index === this.currentIndex);
        });

        const dots = this.dotsContainer.querySelectorAll('.slider__dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('slider__dot--active', index === this.currentIndex);
        });

        const track = this.container.querySelector('.slider__track');
        if (track) {
            track.style.transform = `translateX(-${this.currentIndex * 100}%)`;
        }
    }

    nextSlide() {
        this.currentIndex = (this.currentIndex + 1) % this.totalSlides;
        this.updateSlider();
    }

    prevSlide() {
        this.currentIndex = (this.currentIndex - 1 + this.totalSlides) % this.totalSlides;
        this.updateSlider();
    }

    goToSlide(index) {
        this.currentIndex = index;
        this.updateSlider();
        this.resetAutoplay();
    }

    startAutoplay() {
        this.autoplayInterval = setInterval(() => this.nextSlide(), this.options.autoplaySpeed);
    }

    stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }

    resetAutoplay() {
        this.stopAutoplay();
        if (this.options.autoplay) {
            this.startAutoplay();
        }
    }

    bindEvents() {
        this.prevBtn.addEventListener('click', () => {
            this.prevSlide();
            this.resetAutoplay();
        });

        this.nextBtn.addEventListener('click', () => {
            this.nextSlide();
            this.resetAutoplay();
        });

        this.container.addEventListener('mouseenter', () => this.stopAutoplay());
        this.container.addEventListener('mouseleave', () => {
            if (this.options.autoplay) {
                this.startAutoplay();
            }
        });

        let touchStartX = 0;
        let touchEndX = 0;

        this.container.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        this.container.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
        });
    }

    handleSwipe(startX, endX) {
        const diff = startX - endX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                this.nextSlide();
            } else {
                this.prevSlide();
            }
            this.resetAutoplay();
        }
    }
}

export default Slider;
