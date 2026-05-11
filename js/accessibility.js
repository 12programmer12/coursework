const AccessibilityManager = {
    currentSettings: {
        mode: 'normal',
        fontSize: 'normal',
        imagesEnabled: true
    },

    init() {
        this.loadSettings();
        this.applySettings();
        this.bindEvents();
    },

    loadSettings() {
        const saved = localStorage.getItem('accessibility');
        if (saved) {
            this.currentSettings = JSON.parse(saved);
        }
    },

    saveSettings() {
        localStorage.setItem('accessibility', JSON.stringify(this.currentSettings));
    },

    applySettings() {
        document.documentElement.setAttribute('data-accessibility', this.currentSettings.mode);

        document.documentElement.setAttribute('data-font-size', this.currentSettings.fontSize);

        if (!this.currentSettings.imagesEnabled) {
            document.documentElement.setAttribute('data-accessibility', 'no-images');
        }

        this.updateButtons();
    },

    setMode(mode) {
        this.currentSettings.mode = mode;
        this.saveSettings();
        this.applySettings();
    },

    setFontSize(size) {
        this.currentSettings.fontSize = size;
        this.saveSettings();
        this.applySettings();
    },

    toggleImages() {
        this.currentSettings.imagesEnabled = !this.currentSettings.imagesEnabled;
        this.saveSettings();
        this.applySettings();
    },

    resetSettings() {
        this.currentSettings = {
            mode: 'normal',
            fontSize: 'normal',
            imagesEnabled: true
        };
        localStorage.removeItem('accessibility');
        this.applySettings();
    },

    updateButtons() {
        document.querySelectorAll('[data-accessibility-toggle]').forEach(btn => {
            const mode = btn.getAttribute('data-accessibility-toggle');
            if (mode === this.currentSettings.mode) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        document.querySelectorAll('[data-font-size-toggle]').forEach(btn => {
            const size = btn.getAttribute('data-font-size-toggle');
            if (size === this.currentSettings.fontSize) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    },

    bindEvents() {
        document.querySelectorAll('[data-accessibility-toggle]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.getAttribute('data-accessibility-toggle');
                this.setMode(mode);
            });
        });

        document.querySelectorAll('[data-font-size-toggle]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const size = e.target.getAttribute('data-font-size-toggle');
                this.setFontSize(size);
            });
        });

        document.querySelector('[data-accessibility-reset]')?.addEventListener('click', () => {
            this.resetSettings();
        });
    }
};

export default AccessibilityManager;
