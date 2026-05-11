
const BurgerMenu = {
    isOpen: false,

    init() {
        this.burger = document.querySelector('[data-burger]');
        this.mobileMenu = document.querySelector('[data-mobile-menu]');

        if (this.burger && this.mobileMenu) {
            this.bindEvents();
        }
    },

    toggle() {
        this.isOpen = !this.isOpen;

        if (this.isOpen) {
            this.open();
        } else {
            this.close();
        }
    },

    open() {
        this.isOpen = true;
        this.burger.setAttribute('aria-expanded', 'true');
        this.mobileMenu.hidden = false;
        document.body.style.overflow = 'hidden';
    },

    close() {
        this.isOpen = false;
        this.burger.setAttribute('aria-expanded', 'false');
        this.mobileMenu.hidden = true;
        document.body.style.overflow = '';
    },

    bindEvents() {
        this.burger.addEventListener('click', () => this.toggle());

        this.mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => this.close());
        });

        document.addEventListener('click', (e) => {
            if (this.isOpen &&
                !this.burger.contains(e.target) &&
                !this.mobileMenu.contains(e.target)) {
                this.close();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }
};

export default BurgerMenu;
