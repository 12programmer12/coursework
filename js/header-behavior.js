export function initHeaderBehavior() {
    const header = document.querySelector('[data-header]');
    if (!header || header.dataset.headerBehaviorInit) return;

    header.dataset.headerBehaviorInit = 'true';
    let lastScrollY = window.scrollY;

    const isAccessibilityActive = () =>
        document.documentElement.getAttribute('data-accessibility') === 'active';

    if (isAccessibilityActive()) {
        header.classList.remove('header--hidden');
    }

    window.addEventListener('scroll', () => {
        if (isAccessibilityActive()) {
            header.classList.remove('header--hidden');
            return;
        }

        const currentScrollY = window.scrollY;

        header.classList.toggle('scrolled', currentScrollY > 50);

        if (currentScrollY > lastScrollY && currentScrollY > 120) {
            header.classList.add('header--hidden');
        } else {
            header.classList.remove('header--hidden');
        }

        lastScrollY = Math.max(currentScrollY, 0);
    }, { passive: true });
}
