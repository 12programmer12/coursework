const AccessibilityManager = {
    STORAGE_KEY: 'accessibility',

    defaultSettings: {
        enabled: false,
        colorScheme: 'black-yellow',
        fontSize: 'normal',
        imagesEnabled: true
    },

    fontSizeMigration: {
        small: 'normal',
        medium: 'normal',
        large: 'increased'
    },

    currentSettings: {},
    initialized: false,
    headerObserver: null,
    headerResizeRaf: null,
    lastHeaderOffset: null,

    init() {
        if (this.initialized) return;

        this.loadSettings();
        this.applySettings();
        this.bindEvents();
        this.observeHeaderHeight();

        this.initialized = true;
        console.log('✅ AccessibilityManager initialized');
    },

    loadSettings() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);

            if (!saved) {
                this.currentSettings = { ...this.defaultSettings };
                return;
            }

            const parsed = JSON.parse(saved);
            this.currentSettings = { ...this.defaultSettings, ...parsed };

            if (this.fontSizeMigration[this.currentSettings.fontSize]) {
                this.currentSettings.fontSize = this.fontSizeMigration[this.currentSettings.fontSize];
            }

            if (parsed.enabled === undefined) {
                this.currentSettings.enabled = Boolean(
                    (parsed.colorScheme && parsed.colorScheme !== 'black-yellow') ||
                    (parsed.fontSize && !['medium', 'normal'].includes(parsed.fontSize)) ||
                    parsed.imagesEnabled === false
                );
            }

        } catch (error) {
            console.error('❌ Error loading accessibility settings:', error);
            this.currentSettings = { ...this.defaultSettings };
        }
    },

    saveSettings() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentSettings));
        } catch (error) {
            console.error('❌ Error saving accessibility settings:', error);
        }
    },

    clearAccessibilityAttributes() {
        const root = document.documentElement;

        root.removeAttribute('data-accessibility');
        root.removeAttribute('data-color-scheme');
        root.removeAttribute('data-font-size');
        root.removeAttribute('data-images');
        root.style.removeProperty('--header-offset');
        this.lastHeaderOffset = null;
    },

    applySettings() {
        const root = document.documentElement;

        if (!this.currentSettings.enabled) {
            this.clearAccessibilityAttributes();
            this.updateImagePlaceholders();
            this.updateButtons();
            this.updateAccessibilityPanel();
            this.lastHeaderOffset = null;
            this.syncHeaderHeight();
            return;
        }

        root.setAttribute('data-accessibility', 'active');
        root.setAttribute('data-color-scheme', this.currentSettings.colorScheme);
        root.setAttribute('data-font-size', this.currentSettings.fontSize);

        if (!this.currentSettings.imagesEnabled) {
            root.setAttribute('data-images', 'hidden');
        } else {
            root.removeAttribute('data-images');
        }

        this.updateButtons();
        this.updateImagePlaceholders();
        this.updateAccessibilityPanel();
        this.lastHeaderOffset = null;
        this.syncHeaderHeight();
        this.keepHeaderVisible();
    },

    keepHeaderVisible() {
        if (!this.currentSettings.enabled) return;

        document.querySelectorAll('.header').forEach(header => {
            header.classList.remove('header--hidden');
        });
    },

    syncHeaderHeight() {
        if (this.headerResizeRaf) return;

        this.headerResizeRaf = requestAnimationFrame(() => {
            this.headerResizeRaf = null;

            const header = document.querySelector('.header');
            if (!header) return;

            const root = document.documentElement;

            if (!this.currentSettings.enabled) {
                root.style.removeProperty('--header-offset');
                this.lastHeaderOffset = null;
                return;
            }

            const height = header.offsetHeight;
            if (height === this.lastHeaderOffset) return;

            this.lastHeaderOffset = height;
            root.style.setProperty('--header-offset', `${height}px`);
        });
    },

    observeHeaderHeight() {
        const header = document.querySelector('.header');
        if (!header || typeof ResizeObserver === 'undefined') {
            this.syncHeaderHeight();
            window.addEventListener('resize', () => this.syncHeaderHeight());
            return;
        }

        this.headerObserver = new ResizeObserver(() => {
            if (!this.currentSettings.enabled) return;
            this.syncHeaderHeight();
        });
        this.headerObserver.observe(header);
        this.syncHeaderHeight();
    },

    setColorScheme(scheme) {
        if (!scheme) return;
        if (!this.currentSettings.enabled) {
            this.currentSettings.enabled = true;
            this.currentSettings.imagesEnabled = true;
        }
        this.currentSettings.colorScheme = scheme;
        this.saveSettings();
        this.applySettings();
    },

    setFontSize(size) {
        if (!size) return;
        if (!this.currentSettings.enabled) {
            this.currentSettings.enabled = true;
        }
        this.currentSettings.fontSize = size;
        this.saveSettings();
        this.applySettings();
    },

    toggleImages() {
        if (!this.currentSettings.enabled) return;
        const imagesToggle = document.getElementById('toggleImages');
        this.currentSettings.imagesEnabled = !(imagesToggle?.checked);
        this.saveSettings();
        this.applySettings();
    },

    toggleAccessibility() {
        this.currentSettings.enabled = !this.currentSettings.enabled;
        this.saveSettings();
        this.applySettings();
    },

    resetAccessibilitySettings() {
        const wasEnabled = this.currentSettings.enabled;

        this.currentSettings = {
            ...this.defaultSettings,
            enabled: wasEnabled
        };

        this.saveSettings();
        this.applySettings();
    },

    updateAccessibilityPanel() {
        document.querySelectorAll('[data-accessibility-panel]').forEach(panel => {
            panel.hidden = !this.currentSettings.enabled;
        });

        document.querySelectorAll('[data-accessibility-toggle]').forEach(btn => {
            const label = btn.querySelector('[data-accessibility-toggle-label]');
            const labelKey = this.currentSettings.enabled
                ? 'settings.accessibilityOff'
                : 'settings.accessibilityOn';

            if (label) {
                label.setAttribute('data-i18n', labelKey);
                label.textContent = typeof i18n !== 'undefined'
                    ? i18n.t(labelKey)
                    : (this.currentSettings.enabled ? 'Выключить' : 'Включить');
            }

            btn.classList.toggle('settings__accessibility-toggle--active', this.currentSettings.enabled);
            btn.setAttribute('aria-pressed', String(this.currentSettings.enabled));
        });
    },

    updateButtons() {
        const isEnabled = this.currentSettings.enabled;

        document.querySelectorAll('button[data-color-scheme]').forEach(btn => {
            const scheme = btn.dataset.colorScheme;
            btn.classList.toggle('active', isEnabled && scheme === this.currentSettings.colorScheme);
        });

        document.querySelectorAll('button[data-font-size]').forEach(btn => {
            const size = btn.dataset.fontSize;
            btn.classList.toggle('active', isEnabled && size === this.currentSettings.fontSize);
        });

        const imagesToggle = document.getElementById('toggleImages');
        if (imagesToggle) {
            imagesToggle.checked = !this.currentSettings.imagesEnabled;
            imagesToggle.disabled = !isEnabled;

            const imagesLabel = imagesToggle.closest('.settings__toggle')
                ?.querySelector('.settings__toggle-label');
            if (imagesLabel) {
                imagesLabel.setAttribute('data-i18n', 'settings.hideImages');
                if (typeof i18n !== 'undefined') {
                    imagesLabel.textContent = i18n.t('settings.hideImages');
                }
            }
        }

        const resetBtn = document.querySelector('[data-accessibility-reset]');
        if (resetBtn) {
            resetBtn.disabled = !isEnabled;
        }
    },

    updateImagePlaceholders() {
        document.querySelectorAll('.image-placeholder').forEach(el => el.remove());
        document.querySelectorAll('img:not([data-preserve="true"])').forEach(img => {
            img.style.display = '';
        });
    },

    bindEvents() {
        document.querySelectorAll('button[data-color-scheme]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const scheme = e.currentTarget.dataset.colorScheme;
                this.setColorScheme(scheme);
            });
        });

        document.querySelectorAll('button[data-font-size]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const size = e.currentTarget.dataset.fontSize;
                this.setFontSize(size);
            });
        });

        const imagesToggle = document.getElementById('toggleImages');
        if (imagesToggle) {
            imagesToggle.addEventListener('change', () => {
                this.toggleImages();
            });
        }

        document.querySelectorAll('[data-accessibility-toggle]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.toggleAccessibility();
            });
        });

        document.querySelectorAll('[data-accessibility-reset]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.resetAccessibilitySettings();
            });
        });
    }
};

export default AccessibilityManager;
