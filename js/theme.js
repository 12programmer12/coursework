const ThemeManager = {
    currentTheme: 'light',

    init() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
        this.bindEvents();
    },

    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.updateThemeButtons();
    },

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    },

    bindEvents() {
        document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const theme = e.target.getAttribute('data-theme-toggle');
                this.setTheme(theme);
            });
        });
    },

    updateThemeButtons() {
        document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
            const btnTheme = btn.getAttribute('data-theme-toggle');
            if (btnTheme === this.currentTheme) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
};

export default ThemeManager;
