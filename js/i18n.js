import API from "./api.js";

const i18n = {
    currentLang: 'ru',

    translations: {
        ru: {
            'header.catalog': 'Каталог',
            'header.about': 'О компании',
            'header.contacts': 'Контакты',
            'header.login': 'Войти',
            'header.register': 'Регистрация',
            'header.profile': 'Профиль',
            'header.logout': 'Выйти',
            'header.search': 'Поиск по названию',
            'header.phone': '8 (843) 528-65-48',

            'hero.title': 'Аренда коттеджей и домов в Могилёве',
            'hero.subtitle': 'Найдите идеальный вариант сами или предоставьте это нам',
            'hero.checkin': 'Заезд',
            'hero.checkout': 'Выезд',
            'hero.guests': 'Количество человек',
            'hero.priceFrom': 'от',
            'hero.priceTo': 'до',
            'hero.find': 'Найти',
            'hero.openFilters': 'Открыть подборку',
            'hero.showHeader': 'Показать шапку',

            'category.pool': 'С бассейном',
            'category.family': 'Семейные и уютные',
            'category.hits': 'Хиты продаж',

            'about.title': 'О нас',
            'about.legal': 'Работаем с юридическими и физическими лицами',
            'about.consultation': 'Бесплатный подбор, честные консультации и открытость к сотрудничеству',
            'about.experience': 'Работаем с 2014 года. Консультируем 30-80 человек в сутки, заселяем от 3 до 5 компаний в день. Помогли более 21 000 клиентам',
            'about.rating': 'Средний рейтинг компании 4,5 из 5 (Avito, Google, Отзовик)',

            'catalog.title': 'Популярное в каталоге',
            'catalog.perNight': '/ сутки',
            'catalog.more': 'Подробнее',
            'catalog.showAll': 'Перейти в каталог',
            'catalog.guests': 'до',

            'services.title': 'Можем организовать для Вас',
            'services.catering': 'Кейтеринг',
            'services.show': 'Шоу программа',
            'services.chef': 'Выездной повар',
            'services.buffet': 'Фуршет',
            'services.transfer': 'Трансфер',
            'services.events': 'Мероприятия под ключ',
            'services.learnMore': 'Узнать подробнее',

            'faq.title': 'Частые вопросы',
            'faq.booking': 'Как происходит бронирование?',
            'faq.prepayment': 'Какая сумма предоплаты нужна?',
            'faq.prepaymentAnswer': 'Стандарт предоплаты 50% от суммы аренды, если сумма аренды большая, то можно уменьшить предоплату до 30%.',
            'faq.split': 'Можно ли разбить предоплату на несколько частей?',
            'faq.legal': 'Как работаете с юр. лицами?',
            'faq.viewing': 'Можно ли приехать на просмотр?',
            'faq.time': 'Какое время заезда и выезда в дом и есть ли возможность сдвинуть заезд или выезд?',
            'faq.deposit': 'Зачем нужен залог?',
            'faq.cost': 'Сколько стоят Ваши услуги?',

            'faq.bookingAnswer': 'После выбора дома вы оставляете заявку, мы связываемся с вами для подтверждения дат и деталей. Вносится предоплата 30-50% от стоимости аренды.',
            'faq.splitAnswer': 'Да, мы понимаем, что не всегда удобно вносить всю сумму сразу. Обсудите с нами удобный график платежей.',
            'faq.legalAnswer': 'Работаем по договору с предоставлением всех закрывающих документов. Возможна оплата по безналичному расчету с НДС и без НДС.',
            'faq.viewingAnswer': 'Конечно! Мы организуем просмотр любого дома в удобное для вас время. Просто свяжитесь с нами заранее.',
            'faq.timeAnswer': 'Стандартное время заезда - 15:00, выезда - 12:00. При наличии возможности мы можем пойти навстречу и изменить время.',
            'faq.depositAnswer': 'Залог гарантирует сохранность имущества. Он возвращается полностью при выезде, если нет повреждений или нарушений правил.',
            'faq.costAnswer': 'Наши услуги по подбору дома бесплатны для клиентов. Вы оплачиваете только аренду дома и дополнительные услуги по желанию.',

            'cta.title': 'Хотите сдать дом?',
            'cta.subtitle': 'Оставьте заявку и мы свяжемся с вами для уточнения деталей',
            'cta.button': 'Оставить заявку',

            'footer.catalog': 'Каталог',
            'footer.cooperation': 'Сотрудничество',
            'footer.faq': 'Частые вопросы',
            'footer.legalInfo': 'Информация для юр. лиц',
            'footer.serviceRequest': 'Заявка на выездное обслуживание',
            'footer.selectionRequest': 'Заявка на подбор',
            'footer.privacy': 'Политика конфиденциальности',
            'footer.consent': 'Согласие на обработку персональных данных',

            'common.from': 'от',
            'common.to': 'до',
            'common.submit': 'Отправить',
            'common.cancel': 'Отмена',
            'common.loading': 'Загрузка...',
            'common.error': 'Ошибка',
            'common.success': 'Успешно',
            'common.close': 'Закрыть',
            'common.perNight': '/ сутки',
            'common.guests': 'до',
            'common.more': 'Подробнее',
            'common.bedrooms': 'спален',
            'common.bathrooms': 'санузла',
            'catalog.hit': 'Хит',
            'catalog.addToFavorites': 'Добавить в избранное',
            'hero.priceRange': 'Цена за сутки',
            'footer.location': 'Могилёв',
            'category.wedding': 'Под свадьбы и корпоративы',
            'category.banya': 'С русской баней на дровах',
            'settings.language': 'Язык',
            'settings.theme': 'Тема',
            'settings.accessibility': 'Доступность',
            'settings.reset': 'Сбросить настройки',
            'theme.light': 'Светлая',
            'theme.dark': 'Тёмная',
            'accessibility.normal': 'Обычная',
            'accessibility.contrast': 'Контраст',
            'accessibility.large': 'Крупный текст',
        },

        be: {
            'header.catalog': 'Каталог',
            'header.about': 'Пра кампанію',
            'header.contacts': 'Кантакты',
            'header.login': 'Увайсці',
            'header.register': 'Рэгістрацыя',
            'header.profile': 'Профіль',
            'header.logout': 'Выйсці',
            'header.search': 'Пошук па назве',
            'header.phone': '8 (843) 528-65-48',

            'hero.title': 'Арэнда катэджаў і дамоў у Магилёву',
            'hero.subtitle': 'Знайдзіце ідэальны варыянт самі або даручыце гэта нам',
            'hero.checkin': 'Заезд',
            'hero.checkout': 'Выезд',
            'hero.guests': 'Колькасць чалавек',
            'hero.priceFrom': 'ад',
            'hero.priceTo': 'да',
            'hero.find': 'Знайсці',
            'hero.openFilters': 'Адкрыць падборку',
            'hero.showHeader': 'Паказаць шапку',

            'category.pool': 'З басейнам',
            'category.family': 'Сямейныя і ўтульныя',
            'category.hits': 'Хіты продажаў',

            'about.title': 'Пра нас',
            'about.legal': 'Працуем з юрыдычнымі і фізічнымі асобамі',
            'about.consultation': 'Бясплатны падбор, шчырыя кансультацыі і адкрытасць да супрацоўніцтва',
            'about.experience': 'Працуем з 2014 года. Кансультуем 30-80 чалавек у суткі, засяляем ад 3 да 5 кампаній у дзень. Дапамаглі больш за 21 000 кліентам',
            'about.rating': 'Сярэдні рэйтынг кампаніі 4,5 з 5 (Avito, Google, Отзовик)',

            'catalog.title': 'Папулярнае ў каталогу',
            'catalog.perNight': '/ суткі',
            'catalog.more': 'Падрабязней',
            'catalog.showAll': 'Перайсці ў каталог',
            'catalog.guests': 'да',

            'services.title': 'Можам арганізаваць для Вас',
            'services.catering': 'Кейтэрынг',
            'services.show': 'Шоу праграма',
            'services.chef': 'Выязны кухар',
            'services.buffet': 'Фуршэт',
            'services.transfer': 'Трансфер',
            'services.events': 'Мерапрыемствы пад ключ',
            'services.learnMore': 'Даведацца падрабязней',

            'faq.title': 'Частыя пытанні',
            'faq.booking': 'Як адбываецца браніраванне?',
            'faq.prepayment': 'Якая сума перадаплаты патрэбна?',
            'faq.prepaymentAnswer': 'Стандарт перадаплаты 50% ад сумы арэнды, калі сума арэнды вялікая, то можна паменшыць перадаплату да 30%.',
            'faq.split': 'Ці можна разбіць перадаплату на некалькі частак?',
            'faq.legal': 'Як працуеце з юрыдычнымі асобамі?',
            'faq.viewing': 'Ці можна прыехаць на прагляд?',
            'faq.time': 'Які час заезду і выезду ў дом і ці ёсць магчымасць зрушыць заезд або выезд?',
            'faq.deposit': 'Навошта патрэбны заклад?',
            'faq.cost': 'Колькі каштуюць Вашы паслугі?',

            'faq.bookingAnswer': 'Пасля выбару дома вы пакідаеце заяўку, мы сувязваемся з вамі для пацверджання дат і дэталяў. Уносіцца перадаплата 30-50% ад кошту арэнды.',
            'faq.splitAnswer': 'Так, мы разумеем, што не заўсёды зручна ўносіць усю суму адразу. Абмяркуйце з намі зручны графік плацяжоў.',
            'faq.legalAnswer': 'Працуем па дагаворы з прадастаўленнем усіх закрываючых дакументаў. Магчымая аплата па безнаяўным разліку з ПДВ і без ПДВ.',
            'faq.viewingAnswer': 'Вядома! Мы арганізуем прагляд любога дома ў зручны для вас час. Проста сувяжыцеся з намі загадзя.',
            'faq.timeAnswer': 'Стандартны час заезду - 15:00, выезду - 12:00. Пры наяўнасці магчымасці мы можам пайсці насустрач і змяніць час.',
            'faq.depositAnswer': 'Заклад гарантуе захаванасць маёмасці. Ён вяртаецца цалкам пры выедзе, калі няма пашкоджанняў або парушэнняў правілаў.',
            'faq.costAnswer': 'Нашы паслугі па падборы дома бясплатныя для кліентаў. Вы аплачваеце толькі арэнду дома і дадатковыя паслугі па жаданні.',


            'cta.title': 'Хочаце здаць дом?',
            'cta.subtitle': 'Пакіньце заяўку і мы сувяжамся з вамі для ўдакладнення дэталяў',
            'cta.button': 'Пакінуць заяўку',

            'footer.catalog': 'Каталог',
            'footer.cooperation': 'Супрацоўніцтва',
            'footer.faq': 'Частыя пытанні',
            'footer.legalInfo': 'Інфармацыя для юрыдычных асоб',
            'footer.serviceRequest': 'Заяўка на выязное абслугоўванне',
            'footer.selectionRequest': 'Заяўка на падбор',
            'footer.privacy': 'Палітыка канфідэнцыяльнасці',
            'footer.consent': 'Згода на апрацоўку персанальных даных',

            'common.from': 'ад',
            'common.to': 'да',
            'common.submit': 'Адправіць',
            'common.cancel': 'Адмена',
            'common.loading': 'Загрузка...',
            'common.error': 'Памылка',
            'common.success': 'Поспех',
            'common.close': 'Закрыць',
            'common.perNight': '/ суткі',
            'common.guests': 'да',
            'common.more': 'Падрабязней',
            'common.bedrooms': 'спальняў',
            'common.bathrooms': 'санвузлоў',
            'catalog.hit': 'Хіт',
            'hero.priceRange': 'Кошт за суткі',
            'footer.location': 'Магилёў',
            'category.wedding': 'Пад вяселлі і карпаратыўныя мерапрыемствы',
            'category.banya': 'З рускай баняй на дровах',
            'settings.language': 'Мова',
            'settings.theme': 'Тэма',
            'settings.accessibility': 'Даступнасць',
            'settings.reset': 'Скінуць налады',
            'theme.light': 'Светлая',
            'theme.dark': 'Цёмная',
            'accessibility.normal': 'Звычайная',
            'accessibility.contrast': 'Кантраст',
            'accessibility.large': 'Буйны тэкст',
        },

        en: {
            'header.catalog': 'Catalog',
            'header.about': 'About',
            'header.contacts': 'Contacts',
            'header.login': 'Login',
            'header.register': 'Register',
            'header.profile': 'Profile',
            'header.logout': 'Logout',
            'header.search': 'Search by name',
            'header.phone': '8 (843) 528-65-48',

            'hero.title': 'Cottage and House Rental in Mogilev',
            'hero.subtitle': 'Find the perfect option yourself or let us do it for you',
            'hero.checkin': 'Check-in',
            'hero.checkout': 'Check-out',
            'hero.guests': 'Number of guests',
            'hero.priceFrom': 'from',
            'hero.priceTo': 'to',
            'hero.find': 'Find',
            'hero.openFilters': 'Open selection',
            'hero.showHeader': 'Show header',

            'category.pool': 'With pool',
            'category.family': 'Family and cozy',
            'category.hits': 'Best sellers',

            'about.title': 'About us',
            'about.legal': 'We work with legal entities and individuals',
            'about.consultation': 'Free selection, honest consultations and openness to cooperation',
            'about.experience': 'Working since 2014. We consult 30-80 people per day, settle from 3 to 5 companies per day. Helped more than 21,000 clients',
            'about.rating': 'Average company rating 4.5 out of 5 (Avito, Google, Otzovik)',

            'catalog.title': 'Popular in catalog',
            'catalog.perNight': '/ night',
            'catalog.more': 'More details',
            'catalog.showAll': 'Go to catalog',
            'catalog.guests': 'up to',

            'services.title': 'We can organize for you',
            'services.catering': 'Catering',
            'services.show': 'Show program',
            'services.chef': 'Private chef',
            'services.buffet': 'Buffet',
            'services.transfer': 'Transfer',
            'services.events': 'Turnkey events',
            'services.learnMore': 'Learn more',

            'faq.title': 'Frequently asked questions',
            'faq.booking': 'How does booking work?',
            'faq.bookingAnswer': 'After choosing a house, you leave a request, we contact you to confirm dates and details. A prepayment of 30-50% of the rental cost is made.',
            'faq.prepayment': 'What is the required prepayment amount?',
            'faq.prepaymentAnswer': 'Standard prepayment is 50% of the rental amount, if the rental amount is large, you can reduce the prepayment to 30%.',
            'faq.split': 'Can I split the prepayment into several parts?',
            'faq.splitAnswer': 'Yes, we understand that it is not always convenient to make the entire amount at once. Discuss a convenient payment schedule with us.',
            'faq.legal': 'How do you work with legal entities?',
            'faq.legalAnswer': 'We work under a contract with the provision of all closing documents. Payment by bank transfer with VAT and without VAT is possible.',
            'faq.viewing': 'Can I come for a viewing?',
            'faq.viewingAnswer': 'Of course! We will organize a viewing of any house at a time convenient for you. Just contact us in advance.',
            'faq.time': 'What is the check-in and check-out time and is it possible to change it?',
            'faq.timeAnswer': 'Standard check-in time is 15:00, check-out is 12:00. If possible, we can accommodate and change the time.',
            'faq.deposit': 'Why is a deposit required?',
            'faq.depositAnswer': 'The deposit guarantees the safety of the property. It is fully refunded upon checkout if there is no damage or violation of rules.',
            'faq.cost': 'How much do your services cost?',
            'faq.costAnswer': 'Our house selection services are free for clients. You only pay for the house rental and additional services if desired.',

            'cta.title': 'Want to rent out your house?',
            'cta.subtitle': 'Leave a request and we will contact you to clarify details',
            'cta.button': 'Leave a request',

            'footer.catalog': 'Catalog',
            'footer.cooperation': 'Cooperation',
            'footer.faq': 'FAQ',
            'footer.legalInfo': 'Information for legal entities',
            'footer.serviceRequest': 'On-site service request',
            'footer.selectionRequest': 'Selection request',
            'footer.privacy': 'Privacy Policy',
            'footer.consent': 'Consent to personal data processing',

            'common.from': 'from',
            'common.to': 'to',
            'common.submit': 'Submit',
            'common.cancel': 'Cancel',
            'common.loading': 'Loading...',
            'common.error': 'Error',
            'common.success': 'Success',
            'common.close': 'Close',
            'common.perNight': '/ night',
            'common.guests': 'up to',
            'common.more': 'More details',
            'common.bedrooms': 'bedrooms',
            'common.bathrooms': 'bathrooms',
            'catalog.hit': 'Hit',
            'hero.priceRange': 'Price per night',
            'footer.location': 'Mogilev',
            'category.wedding': 'For weddings and corporate events',
            'category.banya': 'With wood-fired Russian banya',
            'settings.language': 'Language',
            'settings.theme': 'Theme',
            'settings.accessibility': 'Accessibility',
            'settings.reset': 'Reset settings',
            'theme.light': 'Light',
            'theme.dark': 'Dark',
            'accessibility.normal': 'Normal',
            'accessibility.contrast': 'High contrast',
            'accessibility.large': 'Large text',
        }
    },

    housesCache: [],

    async init() {
        const savedLang = localStorage.getItem('language') || 'ru';
        this.currentLang = savedLang;
        document.documentElement.lang = savedLang;

        try {
            this.housesCache = await API.getHouses();
        } catch (error) {
            console.error('Failed to load houses for i18n:', error);
            this.housesCache = [];
        }

        this.translatePage();
    },

    setLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('language', lang);
        document.documentElement.lang = lang;
        this.translatePage();
        this.translateCards();
    },

    t(key) {
        return this.translations[this.currentLang][key] || key;
    },

    translatePage() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.t(key);
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.t(key);
        });

        document.querySelectorAll('[data-i18n-aria]').forEach(element => {
            const key = element.getAttribute('data-i18n-aria');
            element.setAttribute('aria-label', this.t(key));
        });
    },

    translateCards() {
        document.querySelectorAll('[data-house-card]').forEach(card => {
            const houseId = parseInt(card.getAttribute('data-house-id'));
            const house = this.housesCache.find(h => h.id === houseId);

            if (!house) return;

            const titleEl = card.querySelector('[data-house-name]');
            if (titleEl) {
                titleEl.textContent = house.name_i18n?.[this.currentLang] || house.name;
            }

            const featuresContainer = card.querySelector('.catalog-card__features');
            if (featuresContainer && house.features_i18n) {
                const featureEls = featuresContainer.querySelectorAll('[data-house-feature]');
                const translatedFeatures = house.features_i18n[this.currentLang] || house.features;

                featureEls.forEach((featureEl, idx) => {
                    if (idx >= 2 && translatedFeatures[idx - 2]) {
                        const svgIcon = featureEl.querySelector('svg');
                        featureEl.innerHTML = '';
                        if (svgIcon) {
                            featureEl.appendChild(svgIcon.cloneNode(true));
                        }
                        featureEl.appendChild(document.createTextNode(translatedFeatures[idx - 2]));
                    }
                });
            }

            const priceEl = card.querySelector('.catalog-card__price');
            if (priceEl) {
                const formattedPrice = house.price.toLocaleString(
                    this.currentLang === 'ru' ? 'ru-RU' :
                        this.currentLang === 'be' ? 'be-BY' : 'en-US'
                );
                const fromText = this.t('common.from');
                const perNightText = this.t('common.perNight');
                priceEl.innerHTML = `${fromText} ${formattedPrice} BYN <span>${perNightText}</span>`;
            }

            const moreBtn = card.querySelector('.catalog-card__button');
            if (moreBtn) {
                moreBtn.textContent = this.t('common.more');
            }

            const hitBadge = card.querySelector('.catalog-card__badge');
            if (hitBadge) {
                hitBadge.textContent = this.t('catalog.hit');
            }

            const guestsEl = card.querySelector('.catalog-card__guests');
            if (guestsEl) {
                guestsEl.textContent = `${this.t('common.guests')} ${house.guests}`;
            }
        });
    },

    getHouseById(id) {
        return this.housesCache.find(h => h.id === parseInt(id)) || null;
    },

    async refreshHousesCache() {
        try {
            this.housesCache = await API.getHouses();
            this.translateCards();
        } catch (error) {
            console.error('Failed to refresh houses cache:', error);
        }
    }
};

export default i18n;
