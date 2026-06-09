/**
 * Общие данные домов: удобства, доп. услуги, тарифы.
 * Переводы хранятся здесь, в db.json — только ключи (slug) удобств.
 */
export const HOUSE_COMMON_I18N = {
    amenities: {
        pool: { ru: 'Бассейн', be: 'Басейн', en: 'Pool' },
        banya: { ru: 'Баня', be: 'Баня', en: 'Sauna' },
        'table-tennis': { ru: 'Настольный теннис', be: 'Настольны тэніс', en: 'Table tennis' },
        sauna: { ru: 'Сауна', be: 'Саўна', en: 'Sauna' },
        bbq: { ru: 'Барбекю', be: 'Барбекю', en: 'BBQ' },
        billiards: { ru: 'Бильярд', be: 'Більярд', en: 'Billiards' },
        karaoke: { ru: 'Караоке', be: 'Караоке', en: 'Karaoke' },
        'russian-banya': { ru: 'Русская баня', be: 'Русская баня', en: 'Russian sauna' },
        'river-view': { ru: 'Вид на реку', be: 'Від на раку', en: 'River view' },
        fireplace: { ru: 'Камин', be: 'Камін', en: 'Fireplace' },
        terrace: { ru: 'Терраса', be: 'Тэраса', en: 'Terrace' },
        parking: { ru: 'Парковка', be: 'Паркоўка', en: 'Parking' },
        'banquet-hall': { ru: 'Банкетный зал', be: 'Банкетная зала', en: 'Banquet hall' },
        stage: { ru: 'Сцена', be: 'Сцэна', en: 'Stage' },
        security: { ru: 'Охрана', be: 'Ахова', en: 'Security' },
        'wood-banya': { ru: 'Баня на дровах', be: 'Баня на дровах', en: 'Wood-fired sauna' },
        'hot-tub': { ru: 'Чан', be: 'Чан', en: 'Hot tub' },
        fishing: { ru: 'Рыбалка', be: 'Рыбалка', en: 'Fishing' },
        forest: { ru: 'Лес', be: 'Лес', en: 'Forest' },
        quiet: { ru: 'Тишина', be: 'Цішыня', en: 'Quiet' },
        wifi: { ru: 'Wi-Fi', be: 'Wi-Fi', en: 'Wi-Fi' },
        'panoramic-windows': { ru: 'Панорамные окна', be: 'Панарамныя вокны', en: 'Panoramic windows' },
        'modern-renovation': { ru: 'Современный ремонт', be: 'Сучасны рамонт', en: 'Modern renovation' },
        kitchen: { ru: 'Кухня', be: 'Кухня', en: 'Kitchen' },
        garden: { ru: 'Сад', be: 'Сад', en: 'Garden' },
        playground: { ru: 'Детская площадка', be: 'Дзіцячая пляцоўка', en: 'Playground' },
        lake: { ru: 'Озеро', be: 'Возера', en: 'Lake' },
        gazebo: { ru: 'Беседка', be: 'Альтанка', en: 'Gazebo' },
        tv: { ru: 'ТВ', be: 'ТБ', en: 'TV' },
        heating: { ru: 'Отопление', be: 'Ацяпленне', en: 'Heating' },
        'eco-materials': { ru: 'Эко-материалы', be: 'Эка-матэрыялы', en: 'Eco materials' },
        grill: { ru: 'Гриль', be: 'Грыль', en: 'Grill' },
        'washing-machine': { ru: 'Стиральная машина', be: 'Пральная машына', en: 'Washing machine' }
    },

    additionalServices: [
    { key: 'catering', ru: 'Кейтеринг', be: 'Кейтэрынг', en: 'Catering' },
    { key: 'show', ru: 'Шоу программа', be: 'Шоу праграма', en: 'Show program' },
    { key: 'chef', ru: 'Выездной повар', be: 'Выязны кухар', en: 'Private chef' },
    { key: 'buffet', ru: 'Фуршет', be: 'Фуршэт', en: 'Buffet' },
    { key: 'transfer', ru: 'Трансфер', be: 'Трансфер', en: 'Transfer' },
    { key: 'events', ru: 'Мероприятия под ключ', be: 'Мерапрыемствы пад ключ', en: 'Turnkey events' }
    ]
};

/**
 * Тарифы от базовой цены (будни):
 * - Будни (пн–чт): базовая цена
 * - Пятница: +25%
 * - Суббота / воскресенье: +50%
 * - Залог: 20% от базовой цены за сутки
 */
export const HOUSE_PRICING = {
    depositRate: 0.2,
    multipliers: {
        friday: 1.25,
        saturday: 1.5,
        sunday: 1.5
    }
};

/**
 * Нормализует slug удобства.
 * Если slug уже есть в amenities — возвращает его.
 * Иначе возвращает исходное значение (для обратной совместимости).
 */
export function normalizeFeatureSlug(feature) {
    if (!feature) return null;
    // В db.json теперь только slug-и, маппинг не нужен
    if (HOUSE_COMMON_I18N.amenities[feature]) return feature;
    return feature;
}

/**
 * Возвращает перевод удобства по slug и языку.
 */
export function getAmenityLabel(slug, lang = 'ru') {
    const key = normalizeFeatureSlug(slug);
    return HOUSE_COMMON_I18N.amenities[key]?.[lang] || key || '';
}

/**
 * Возвращает массив переведённых удобств для дома.
 */
export function getHouseAmenityLabels(house, lang = 'ru') {
    return (house?.features || [])
        .map(feature => getAmenityLabel(feature, lang))
        .filter(Boolean);
}

/**
 * Возвращает массив переведённых доп. услуг.
 */
export function getAdditionalServiceLabels(lang = 'ru') {
    return HOUSE_COMMON_I18N.additionalServices.map(
        service => service[lang] || service.ru
    );
}

/**
 * Рассчитывает цены для дома по дням недели.
 */
export function calculateHousePrices(basePrice) {
    const price = Number(basePrice) || 0;
    const { depositRate, multipliers } = HOUSE_PRICING;

    return {
        weekday: price,
        friday: Math.round(price * multipliers.friday),
        saturday: Math.round(price * multipliers.saturday),
        sunday: Math.round(price * multipliers.sunday),
        deposit: Math.round(price * depositRate),
        fullWeekend: Math.round(price * multipliers.saturday)
    };
}