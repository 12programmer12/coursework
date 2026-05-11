const Accordion = {
    init(selector = '[data-accordion]') {
        this.accordion = document.querySelector(selector);
        if (!this.accordion) return;

        this.items = this.accordion.querySelectorAll('.faq__item');
        this.bindEvents();
    },

    toggleItem(item) {
        const question = item.querySelector('.faq__question');
        const answer = item.querySelector('.faq__answer');
        const isExpanded = question.getAttribute('aria-expanded') === 'true';

        if (isExpanded) {
            this.closeItem(item);
        } else {
            this.openItem(item);
        }
    },

    openItem(item) {
        const question = item.querySelector('.faq__question');
        const answer = item.querySelector('.faq__answer');

        question.setAttribute('aria-expanded', 'true');
        answer.hidden = false;
        item.classList.add('faq__item--active');
    },

    closeItem(item) {
        const question = item.querySelector('.faq__question');
        const answer = item.querySelector('.faq__answer');

        question.setAttribute('aria-expanded', 'false');
        answer.hidden = true;
        item.classList.remove('faq__item--active');
    },

    bindEvents() {
        this.items.forEach(item => {
            const question = item.querySelector('.faq__question');

            question.addEventListener('click', () => {
                this.toggleItem(item);
            });

            question.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleItem(item);
                }
            });
        });
    }
};

export default Accordion;
