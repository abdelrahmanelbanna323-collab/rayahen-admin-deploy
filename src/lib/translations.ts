// Auto-translation mappings for Italian and Russian
// Used when nameIt/nameRu fields don't exist in Firestore

export type Lang = 'AR' | 'EN' | 'IT' | 'RU';

// ──────────────────────────────────────────
// CATEGORY TRANSLATIONS
// ──────────────────────────────────────────
export const categoryTranslationsIt: Record<string, string> = {
  'All': 'Tutto',
  'Breakfast Combos': 'Combo Colazione',
  'Breakfast': 'Colazione',
  'Bakery': 'Panetteria',
  'Coffee Drinks': 'Caffè',
  'Hot Drinks': 'Bevande Calde',
  'Milkshakes & Smoothies': 'Frullati & Smoothie',
  'Frappes & Iced Coffee': 'Frappè & Caffè Freddo',
  'Nuts & Bubbles': 'Noci & Bubble',
  'Cocktails & Soda': 'Cocktail & Soda',
  'Fresh Juices': 'Succhi Freschi',
  'Desserts': 'Dolci',
  'Soft Drinks & Addons': 'Bibite & Extra',
};

export const categoryTranslationsRu: Record<string, string> = {
  'All': 'Всё',
  'Breakfast Combos': 'Завтрак Комбо',
  'Breakfast': 'Завтрак',
  'Bakery': 'Выпечка',
  'Coffee Drinks': 'Кофейные Напитки',
  'Hot Drinks': 'Горячие Напитки',
  'Milkshakes & Smoothies': 'Молочные Коктейли',
  'Frappes & Iced Coffee': 'Фраппе и Холодный Кофе',
  'Nuts & Bubbles': 'Орехи и Пузыри',
  'Cocktails & Soda': 'Коктейли и Газировка',
  'Fresh Juices': 'Свежие Соки',
  'Desserts': 'Десерты',
  'Soft Drinks & Addons': 'Напитки и Добавки',
};

// ──────────────────────────────────────────
// MENU ITEM KEYWORD-BASED TRANSLATIONS
// ──────────────────────────────────────────

const itemKeywordTranslations: Array<{ keywords: string[]; it: string; ru: string }> = [
  // Breakfast
  { keywords: ['oriental breakfast'], it: 'Colazione Orientale', ru: 'Восточный Завтрак' },
  { keywords: ['western breakfast'], it: 'Colazione Occidentale', ru: 'Западный Завтрак' },
  { keywords: ['french breakfast'], it: 'Colazione Francese', ru: 'Французский Завтрак' },
  { keywords: ['rayahen signature breakfast', 'rayahen breakfast'], it: 'Colazione Signature Rayahen', ru: 'Фирменный Завтрак Раяхен' },
  { keywords: ['american breakfast'], it: 'Colazione Americana', ru: 'Американский Завтрак' },
  { keywords: ['plain foul'], it: 'Foul Semplice', ru: 'Простые Бобы' },
  { keywords: ['foul with olive oil'], it: "Foul con Olio d'Oliva", ru: 'Бобы с Оливковым Маслом' },
  { keywords: ['alexandrian foul'], it: 'Foul Alessandrino', ru: 'Александрийские Бобы' },
  { keywords: ['foul with butter'], it: 'Foul al Burro', ru: 'Бобы с Маслом' },
  { keywords: ['dynamite foul'], it: 'Foul Dinamite', ru: 'Бобы Динамит' },
  { keywords: ['sesame falafel'], it: 'Falafel al Sesamo', ru: 'Фалафель с Кунжутом' },
  { keywords: ['falafel'], it: 'Falafel', ru: 'Фалафель' },
  { keywords: ['omelette'], it: 'Omelette', ru: 'Омлет' },
  { keywords: ['scrambled eggs'], it: 'Uova Strapazzate', ru: 'Яичница-болтунья' },
  { keywords: ['toast'], it: 'Toast', ru: 'Тост' },
  // Coffee Drinks
  { keywords: ['espresso'], it: 'Espresso', ru: 'Эспрессо' },
  { keywords: ['americano'], it: 'Americano', ru: 'Американо' },
  { keywords: ['cappuccino'], it: 'Cappuccino', ru: 'Капучино' },
  { keywords: ['flat white'], it: 'Flat White', ru: 'Флэт Уайт' },
  { keywords: ['macchiato'], it: 'Macchiato', ru: 'Макиато' },
  { keywords: ['cortado'], it: 'Cortado', ru: 'Кортадо' },
  { keywords: ['latte'], it: 'Latte', ru: 'Латте' },
  { keywords: ['mocha'], it: 'Mocaccino', ru: 'Мокко' },
  { keywords: ['turkish coffee', 'turkish'], it: 'Caffè Turco', ru: 'Турецкий Кофе' },
  { keywords: ['cold brew'], it: 'Cold Brew', ru: 'Холодный Брю' },
  { keywords: ['spanish latte', 'spanish'], it: 'Latte Spagnolo', ru: 'Испанский Латте' },
  // Hot Drinks
  { keywords: ['hot chocolate'], it: 'Cioccolata Calda', ru: 'Горячий Шоколад' },
  { keywords: ['matcha latte'], it: 'Latte al Matcha', ru: 'Матча Латте' },
  { keywords: ['matcha'], it: 'Matcha', ru: 'Матча' },
  { keywords: ['green tea'], it: 'Tè Verde', ru: 'Зелёный Чай' },
  { keywords: ['herbal tea'], it: 'Tisana', ru: 'Травяной Чай' },
  { keywords: ['mint tea'], it: 'Tè alla Menta', ru: 'Мятный Чай' },
  { keywords: ['tea'], it: 'Tè', ru: 'Чай' },
  // Iced / Frappé
  { keywords: ['iced latte'], it: 'Latte Freddo', ru: 'Холодный Латте' },
  { keywords: ['iced mocha'], it: 'Mocha Freddo', ru: 'Холодный Мокко' },
  { keywords: ['iced coffee'], it: 'Caffè Freddo', ru: 'Холодный Кофе' },
  { keywords: ['iced matcha'], it: 'Matcha Freddo', ru: 'Холодная Матча' },
  { keywords: ['frappe', 'frappé', 'frappuccino'], it: 'Frappè', ru: 'Фраппе' },
  // Milkshakes
  { keywords: ['milkshake', 'milk shake'], it: 'Frullato', ru: 'Молочный Коктейль' },
  { keywords: ['smoothie'], it: 'Smoothie', ru: 'Смузи' },
  { keywords: ['mango'], it: 'Mango', ru: 'Манго' },
  { keywords: ['strawberry'], it: 'Fragola', ru: 'Клубника' },
  { keywords: ['banana'], it: 'Banana', ru: 'Банан' },
  { keywords: ['chocolate shake'], it: 'Frullato al Cioccolato', ru: 'Шоколадный Коктейль' },
  // Juices
  { keywords: ['orange juice', 'fresh orange'], it: "Succo d'Arancia", ru: 'Апельсиновый Сок' },
  { keywords: ['lemon juice', 'lemonade'], it: 'Limonata', ru: 'Лимонад' },
  { keywords: ['mango juice'], it: 'Succo di Mango', ru: 'Сок из Манго' },
  { keywords: ['guava'], it: 'Guava', ru: 'Гуава' },
  { keywords: ['carrot juice', 'carrot'], it: 'Succo di Carota', ru: 'Морковный Сок' },
  { keywords: ['pomegranate'], it: 'Succo di Melograno', ru: 'Гранатовый Сок' },
  { keywords: ['fresh juice'], it: 'Succo Fresco', ru: 'Свежевыжатый Сок' },
  // Bakery
  { keywords: ['croissant'], it: 'Croissant', ru: 'Круассан' },
  { keywords: ['danish'], it: 'Pasticcio Danese', ru: 'Датская Выпечка' },
  { keywords: ['muffin'], it: 'Muffin', ru: 'Маффин' },
  { keywords: ['waffle'], it: 'Waffle', ru: 'Вафля' },
  { keywords: ['pancake'], it: 'Pancake', ru: 'Блинчики' },
  { keywords: ['cinnamon roll', 'cinnabon'], it: 'Rotolo alla Cannella', ru: 'Рулет с Корицей' },
  // Desserts
  { keywords: ['cheesecake'], it: 'Cheesecake', ru: 'Чизкейк' },
  { keywords: ['tiramisu', 'tiramisù'], it: 'Tiramisù', ru: 'Тирамису' },
  { keywords: ['brownie'], it: 'Brownie', ru: 'Брауни' },
  { keywords: ['kunafa', 'konafa'], it: 'Kunafa', ru: 'Кунафа' },
  { keywords: ['ice cream'], it: 'Gelato', ru: 'Мороженое' },
  { keywords: ['cake'], it: 'Torta', ru: 'Торт' },
  // Cocktails / Soda / Nuts
  { keywords: ['mojito'], it: 'Mojito', ru: 'Мохито' },
  { keywords: ['mint lemonade'], it: 'Limonata alla Menta', ru: 'Мятный Лимонад' },
  { keywords: ['passion fruit'], it: 'Frutto della Passione', ru: 'Маракуйя' },
  { keywords: ['soda'], it: 'Soda', ru: 'Газировка' },
  { keywords: ['coca cola', 'coke'], it: 'Coca Cola', ru: 'Кока-Кола' },
  { keywords: ['pepsi'], it: 'Pepsi', ru: 'Пепси' },
  { keywords: ['water'], it: 'Acqua', ru: 'Вода' },
  { keywords: ['sprite'], it: 'Sprite', ru: 'Спрайт' },
  { keywords: ['7up'], it: '7Up', ru: '7Up' },
  { keywords: ['bubble tea', 'boba'], it: 'Bubble Tea', ru: 'Пузырьковый Чай' },
  { keywords: ['mixed nuts', 'nuts'], it: 'Noci Miste', ru: 'Орехи' },
];

/**
 * Tries to find a translation for a menu item name based on keywords.
 * Falls back to the English name if no match found.
 */
export function translateItemName(nameEn: string, lang: 'IT' | 'RU'): string {
  const lower = nameEn.toLowerCase();
  for (const entry of itemKeywordTranslations) {
    if (entry.keywords.some(kw => lower.includes(kw))) {
      return lang === 'IT' ? entry.it : entry.ru;
    }
  }
  return nameEn;
}

/**
 * Get the display name of a menu item for the given language.
 */
export function getItemName(item: any, lang: Lang): string {
  if (lang === 'AR') return item.nameAr;
  if (lang === 'EN') return item.nameEn;
  if (lang === 'IT') return item.nameIt || translateItemName(item.nameEn, lang);
  if (lang === 'RU') return item.nameRu || translateItemName(item.nameEn, lang);
  return item.nameEn;
}

/**
 * Get the display name of a category for the given language.
 */
export function getCategoryName(cat: any, lang: Lang): string {
  if (lang === 'AR') return cat.nameAr;
  if (lang === 'EN') return cat.nameEn;
  if (lang === 'IT') return cat.nameIt || categoryTranslationsIt[cat.nameEn] || cat.nameEn;
  if (lang === 'RU') return cat.nameRu || categoryTranslationsRu[cat.nameEn] || cat.nameEn;
  return cat.nameEn;
}

// ──────────────────────────────────────────
// UI STRING TRANSLATIONS
// ──────────────────────────────────────────

export interface UIStrings {
  searchPlaceholder: string;
  noResults: string;
  specialOffers: string;
  install: string;
  rateUs: string;
  billTotal: string;
  bill: string;
  billTitle: string;
  billSubtitle: string;
  addOns: string;
  quantity: string;
  itemTotal: string;
  addToBill: string;
  totalBill: string;
  clearBill: string;
  close: string;
  remove: string;
  subtotal: string;
  vatNote: string;
  noBillItems: string;
  searchResultsPrefix: string;
  branch: string;
  announcementBadge: string;
  currency: string;
}

const uiStrings: Record<Lang, UIStrings> = {
  AR: {
    searchPlaceholder: 'ابحث عن أي صنف...',
    noResults: 'لا توجد نتائج',
    specialOffers: 'العروض الخاصة',
    install: 'تثبيت',
    rateUs: 'شارك تجربتك',
    billTotal: 'إجمالي الفاتورة',
    bill: 'الفاتورة',
    billTitle: 'فاتورتك المتوقعة',
    billSubtitle: 'حساب إجمالي طلبك في رياحين',
    addOns: 'اختر الإضافات',
    quantity: 'الكمية',
    itemTotal: 'الإجمالي للفاتورة',
    addToBill: 'أضف للفاتورة 🧾',
    totalBill: 'إجمالي الفاتورة المتوقع:',
    clearBill: 'تفريغ الفاتورة 🗑️',
    close: 'موافق / إغلاق',
    remove: 'حذف',
    subtotal: 'المجموع:',
    vatNote: 'جميع الأسعار تشمل ضريبة القيمة المضافة',
    noBillItems: 'لم تقم بإضافة أي عنصر للفاتورة بعد',
    searchResultsPrefix: 'نتائج',
    branch: 'فرع',
    announcementBadge: '📣 إعلان ترحيبي',
    currency: 'ج.م',
  },
  EN: {
    searchPlaceholder: 'Search menu...',
    noResults: 'No results',
    specialOffers: 'Special Offers',
    install: 'Install',
    rateUs: 'Rate Us',
    billTotal: 'Bill Total',
    bill: 'Bill',
    billTitle: 'Your Estimated Bill',
    billSubtitle: 'Rayahen Alexandria Bill Calculation',
    addOns: 'Custom Add-ons',
    quantity: 'Quantity',
    itemTotal: 'Item Total',
    addToBill: 'Add to Bill 🧾',
    totalBill: 'Total Estimated Bill:',
    clearBill: 'Clear Bill 🗑️',
    close: 'Close',
    remove: 'Remove',
    subtotal: 'Subtotal:',
    vatNote: 'All prices include VAT',
    noBillItems: 'No items added to your bill yet',
    searchResultsPrefix: 'Results for',
    branch: 'Branch',
    announcementBadge: '📣 Welcome Announcement',
    currency: 'EGP',
  },
  IT: {
    searchPlaceholder: 'Cerca nel menu...',
    noResults: 'Nessun risultato',
    specialOffers: 'Offerte Speciali',
    install: 'Installa',
    rateUs: 'Valutaci',
    billTotal: 'Totale',
    bill: 'Conto',
    billTitle: 'Il Tuo Conto Stimato',
    billSubtitle: 'Calcolo del conto Rayahen Alessandria',
    addOns: 'Extra Personalizzati',
    quantity: 'Quantità',
    itemTotal: 'Totale Articolo',
    addToBill: 'Aggiungi al Conto 🧾',
    totalBill: 'Totale Stimato:',
    clearBill: 'Svuota Conto 🗑️',
    close: 'Chiudi',
    remove: 'Rimuovi',
    subtotal: 'Subtotale:',
    vatNote: 'Tutti i prezzi includono IVA',
    noBillItems: 'Nessun articolo aggiunto al conto',
    searchResultsPrefix: 'Risultati per',
    branch: 'Filiale',
    announcementBadge: '📣 Annuncio',
    currency: 'EGP',
  },
  RU: {
    searchPlaceholder: 'Поиск в меню...',
    noResults: 'Нет результатов',
    specialOffers: 'Специальные Предложения',
    install: 'Установить',
    rateUs: 'Оценить',
    billTotal: 'Итого',
    bill: 'Счёт',
    billTitle: 'Ваш Предварительный Счёт',
    billSubtitle: 'Расчёт счёта Rayahen Александрия',
    addOns: 'Дополнения',
    quantity: 'Количество',
    itemTotal: 'Итого по позиции',
    addToBill: 'Добавить в счёт 🧾',
    totalBill: 'Общая Сумма:',
    clearBill: 'Очистить счёт 🗑️',
    close: 'Закрыть',
    remove: 'Удалить',
    subtotal: 'Подытог:',
    vatNote: 'Все цены включают НДС',
    noBillItems: 'Пока нет позиций в счёте',
    searchResultsPrefix: 'Результаты для',
    branch: 'Филиал',
    announcementBadge: '📣 Объявление',
    currency: 'EGP',
  },
};

export function t(lang: Lang): UIStrings {
  return uiStrings[lang];
}

export const langNames: Record<Lang, string> = {
  AR: 'عربي',
  EN: 'English',
  IT: 'Italiano',
  RU: 'Русский',
};

export const isRtl = (lang: Lang) => lang === 'AR';
