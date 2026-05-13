const AccessibilityManager = {
    STORAGE_KEY: 'accessibility',

    defaultSettings: {
        colorScheme: 'default',
        fontSize: 'medium',
        imagesEnabled: true
    },

    currentSettings: {},

    initialized: false,

    init() {

        if (this.initialized) {
            return;
        }

        this.loadSettings();
        this.applySettings();
        this.bindEvents();

        this.initialized = true;

        console.log('✅ AccessibilityManager initialized');
    },

    loadSettings() {

        try {

            const saved =
                localStorage.getItem(this.STORAGE_KEY);

            if (!saved) {

                this.currentSettings = {
                    ...this.defaultSettings
                };

                console.log(
                    'ℹ️ No saved accessibility settings'
                );

                return;
            }

            const parsed = JSON.parse(saved);

            this.currentSettings = {
                ...this.defaultSettings,
                ...parsed
            };

            console.log(
                '📦 Accessibility settings loaded:',
                this.currentSettings
            );

        } catch (error) {

            console.error(
                '❌ Error loading accessibility settings:',
                error
            );

            this.currentSettings = {
                ...this.defaultSettings
            };
        }
    },

    saveSettings() {

        try {

            localStorage.setItem(
                this.STORAGE_KEY,
                JSON.stringify(this.currentSettings)
            );

            console.log(
                '💾 Accessibility settings saved:',
                this.currentSettings
            );

        } catch (error) {

            console.error(
                '❌ Error saving accessibility settings:',
                error
            );
        }
    },

    applySettings() {

        const root = document.documentElement;

        root.setAttribute(
            'data-color-scheme',
            this.currentSettings.colorScheme
        );

        root.setAttribute(
            'data-font-size',
            this.currentSettings.fontSize
        );

        if (!this.currentSettings.imagesEnabled) {

            root.setAttribute(
                'data-images',
                'hidden'
            );

        } else {

            root.removeAttribute('data-images');
        }

        this.updateButtons();
        this.updateImagePlaceholders();
    },

    setColorScheme(scheme) {

        if (!scheme) return;

        this.currentSettings.colorScheme = scheme;

        this.saveSettings();
        this.applySettings();

        console.log(
            '🎨 Color scheme changed:',
            scheme
        );
    },

    setFontSize(size) {

        if (!size) return;

        this.currentSettings.fontSize = size;

        this.saveSettings();
        this.applySettings();

        console.log(
            '🔠 Font size changed:',
            size
        );
    },

    toggleImages() {

        this.currentSettings.imagesEnabled =
            !this.currentSettings.imagesEnabled;

        this.saveSettings();
        this.applySettings();

        console.log(
            '🖼️ Images toggled:',
            this.currentSettings.imagesEnabled
        );
    },

    resetSettings() {

        this.currentSettings = {
            ...this.defaultSettings
        };

        localStorage.removeItem('accessibility');
        localStorage.removeItem('theme');
        localStorage.removeItem('language');

        const root = document.documentElement;

        root.removeAttribute('data-images');
        root.removeAttribute('data-theme');

        root.setAttribute(
            'data-color-scheme',
            'default'
        );

        root.setAttribute(
            'data-font-size',
            'medium'
        );

        document.querySelectorAll('.image-placeholder')
            .forEach(el => el.remove());

        document.querySelectorAll(
            'img:not([data-preserve="true"])'
        ).forEach(img => {
            img.style.display = '';
        });

        this.applySettings();

        console.log('♻️ All settings reset');

        location.reload();
    },

    updateButtons() {

        document.querySelectorAll(
            '[data-color-scheme]'
        ).forEach(btn => {

            const scheme =
                btn.dataset.colorScheme;

            btn.classList.toggle(
                'active',
                scheme === this.currentSettings.colorScheme
            );
        });

        document.querySelectorAll(
            '[data-font-size]'
        ).forEach(btn => {

            const size =
                btn.dataset.fontSize;

            btn.classList.toggle(
                'active',
                size === this.currentSettings.fontSize
            );
        });

        const imagesToggle =
            document.getElementById('toggleImages');

        if (imagesToggle) {

            imagesToggle.checked =
                !this.currentSettings.imagesEnabled;
        }
    },

    updateImagePlaceholders() {

        document.querySelectorAll(
            '.image-placeholder'
        ).forEach(el => {
            el.remove();
        });

        document.querySelectorAll(
            'img:not([data-preserve="true"])'
        ).forEach(img => {
            img.style.display = '';
        });

        if (this.currentSettings.imagesEnabled) {
            return;
        }

        document.querySelectorAll(
            'img:not([data-preserve="true"])'
        ).forEach(img => {

            const alt =
                img.alt ||
                img.getAttribute('aria-label') ||
                'Image';

            const placeholder =
                document.createElement('div');

            placeholder.className =
                'image-placeholder';

            placeholder.textContent = alt;

            placeholder.setAttribute(
                'aria-hidden',
                'true'
            );

            img.style.display = 'none';

            img.parentNode?.insertBefore(
                placeholder,
                img.nextSibling
            );
        });
    },

    bindEvents() {

        document.querySelectorAll(
            '[data-color-scheme]'
        ).forEach(btn => {

            btn.addEventListener(
                'click',
                (e) => {

                    const scheme =
                        e.currentTarget.dataset.colorScheme;

                    this.setColorScheme(scheme);
                }
            );
        });

        document.querySelectorAll(
            '[data-font-size]'
        ).forEach(btn => {

            btn.addEventListener(
                'click',
                (e) => {

                    const size =
                        e.currentTarget.dataset.fontSize;

                    this.setFontSize(size);
                }
            );
        });

        const imagesToggle =
            document.getElementById('toggleImages');

        if (imagesToggle) {

            imagesToggle.addEventListener(
                'click',
                () => {

                    this.toggleImages();
                }
            );
        }

        const resetBtn =
            document.querySelector(
                '[data-accessibility-reset]'
            );

        if (resetBtn) {

            resetBtn.addEventListener(
                'click',
                () => {

                    this.resetSettings();
                }
            );
        }
    }
};

export default AccessibilityManager;
