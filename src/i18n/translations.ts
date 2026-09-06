export type Lang = 'ru' | 'ky' | 'en';

export const LANGUAGES: { code: Lang; label: string }[] = [
  { code: 'ru', label: 'РУ' },
  { code: 'ky', label: 'КЫ' },
  { code: 'en', label: 'EN' },
];

type Dict = Record<string, string>;

const ru: Dict = {
  catalogTab: 'Каталог',
  detailsTab: 'Характеристики',
  backToCatalog: 'Вернуться в каталог',
  contactUs: 'Контакты',
  phoneLabel: 'Звонок',
  cart: 'Корзина',
  cartEmpty: 'Корзина пуста. Добавьте изделия сердечком на карточке.',
  cartClear: 'Очистить',
  cartCancel: 'Отмена',
  brandTagline: 'Ювелирный магазин',
  adminLoggedIn: 'Вы вошли как администратор',
  adminLogin: 'Вход для администратора',

  catalogBadge: 'AiAi Gold',
  catalogTitle: 'Каталог ювелирных изделий',
  catalogSubtitle: 'Коллекция изделий из золота и драгоценных камней.',
  addProduct: 'Добавить украшение',
  searchPlaceholder: 'Поиск по артикулу, названию, пробе золота, сертификату...',
  statusPrefix: 'Статус',
  all: 'Все',
  sortPriceDesc: 'Сначала дорогие',
  sortPriceAsc: 'Сначала недорогие',
  sortWeight: 'По весу',
  sortName: 'По названию (А-Я)',
  categoriesManage: 'Категории',
  noResultsTitle: 'Ничего не найдено',
  noResultsSubtitle: 'Попробуйте изменить поисковый запрос или сбросить фильтры категорий.',
  resetFilters: 'Сбросить фильтры',
  cardMetal: 'Металл',
  cardInsert: 'Вставка',
  cardMore: 'Подробнее',
  addToFavorites: 'В корзину',
  removeFromFavorites: 'Убрать из корзины',

  article: 'Артикул',
  specGoldPurity: 'Проба металл',
  specWeight: 'Вес изделия',
  specGrams: 'Грамм',
  specStone: 'Караты вставки',
  specSize: 'Размер',
  specCertificate: 'Сертификат',
  detailsHeading: 'Подробнее',
  detailsEmpty: 'Подробное описание пока не добавлено.',

  orderCount: 'В корзине',
  orderButton: 'Заказать',
  chooseWhere: 'Куда отправить заявку?',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  instagramCopied: 'Текст сообщения скопирован — вставьте его в переписке Instagram',
  loading: 'Загрузка…',

  homeAnnouncement: 'Золото 585 и 750 пробы · Доставка по Кыргызстану',
  homeAnnouncementCta: 'Написать нам',
  homeHeroKicker: 'AiAi Gold',
  homeHeroTitle: 'Создано для тебя',
  homeHeroText: 'Каждое изделие проверено на пробу и подлинность. Кольца, серьги, цепи и браслеты — в наличии и под заказ.',
  homeHeroCta: 'Смотреть коллекцию',
  homeCategoriesTitle: 'Категории',
  homeFeaturedTitle: 'Избранные изделия',
  homeFeaturedCta: 'Весь каталог',
  homeValue1Title: 'Консультация',
  homeValue1Text: 'Поможем подобрать изделие и ответим на вопросы по пробе, весу и цене.',
  homeValue1Cta: 'Написать в WhatsApp',
  homeValue2Title: 'Доставка',
  homeValue2Text: 'Отправляем изделия по Кыргызстану — аккуратная упаковка и передача.',
  homeValue2Cta: 'Уточнить условия',
  homeValue3Title: 'Сертификат и проба',
  homeValue3Text: 'На каждое изделие — подтверждение пробы металла, на камни — сертификат.',
  homeValue3Cta: 'Смотреть каталог',
  homeFooterAbout: 'AiAi Gold — ювелирные изделия из золота в Кыргызстане. Кольца, серьги, цепи, браслеты — в наличии и под заказ.',
  homeFooterContacts: 'Контакты',
  homeFooterCatalog: 'Каталог',
  homeFooterLegal: 'AiAi Gold. Все изделия проходят проверку пробы перед продажей.',
};

const ky: Dict = {
  catalogTab: 'Каталог',
  detailsTab: 'Мүнөздөмөлөр',
  backToCatalog: 'Каталогго кайтуу',
  contactUs: 'Байланыш',
  phoneLabel: 'Чалуу',
  cart: 'Себет',
  cartEmpty: 'Себет бош. Буюмду жүрөкчө менен кошуңуз.',
  cartClear: 'Тазалоо',
  cartCancel: 'Жокко чыгаруу',
  brandTagline: 'Зер дүкөнү',
  adminLoggedIn: 'Сиз администратор катары кирдиңиз',
  adminLogin: 'Администратор үчүн кирүү',

  catalogBadge: 'AiAi Gold',
  catalogTitle: 'Зер буюмдар каталогу',
  catalogSubtitle: 'Алтын жана асыл таштардан жасалган буюмдар жыйнагы.',
  addProduct: 'Буюм кошуу',
  searchPlaceholder: 'Артикул, аталышы, алтын сынамасы, сертификат боюнча издөө...',
  statusPrefix: 'Статус',
  all: 'Баары',
  sortPriceDesc: 'Кымбаттан баштап',
  sortPriceAsc: 'Арзандан баштап',
  sortWeight: 'Салмагы боюнча',
  sortName: 'Аталышы боюнча (А-Я)',
  categoriesManage: 'Категориялар',
  noResultsTitle: 'Эч нерсе табылган жок',
  noResultsSubtitle: 'Издөө сурамын өзгөртүп же категория чыпкаларын тазалап көрүңүз.',
  resetFilters: 'Чыпкаларды тазалоо',
  cardMetal: 'Метал',
  cardInsert: 'Кыстырма',
  cardMore: 'Толугураак',
  addToFavorites: 'Себетке кошуу',
  removeFromFavorites: 'Себеттен алып салуу',

  article: 'Артикул',
  specGoldPurity: 'Метал сынамасы',
  specWeight: 'Буюмдун салмагы',
  specGrams: 'Грамм',
  specStone: 'Кыстырманын каратасы',
  specSize: 'Өлчөм',
  specCertificate: 'Сертификат',
  detailsHeading: 'Толугураак',
  detailsEmpty: 'Толук баяндама азырынча кошулган жок.',

  orderCount: 'Себетте',
  orderButton: 'Буйрутма берүү',
  chooseWhere: 'Кайда жөнөтөбүз?',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  instagramCopied: 'Билдирүү тексти көчүрүлдү — Instagram баракчасына чаптап жөнөтүңүз',
  loading: 'Жүктөлүүдө…',

  homeAnnouncement: '585 жана 750 сынама · Кыргызстан боюнча жеткирүү',
  homeAnnouncementCta: 'Бизге жазыңыз',
  homeHeroKicker: 'AiAi Gold',
  homeHeroTitle: 'Сен үчүн жаралган',
  homeHeroText: 'Ар бир буюм сынамасы жана таштары боюнча текшерилген. Шакектер, сөйкөлөр, чынжырлар — дароо жана заказ менен.',
  homeHeroCta: 'Жыйнакты көрүү',
  homeCategoriesTitle: 'Категориялар',
  homeFeaturedTitle: 'Тандалма буюмдар',
  homeFeaturedCta: 'Бүткүл каталог',
  homeValue1Title: 'Консультация',
  homeValue1Text: 'Буюм тандоого жардам беребиз жана сынама, салмак, баа боюнча жооп беребиз.',
  homeValue1Cta: 'WhatsApp\'ка жазуу',
  homeValue2Title: 'Жеткирүү',
  homeValue2Text: 'Буюмдарды өлкө боюнча жөнөтөбүз — этият таңгак жана өткөрүп берүү.',
  homeValue2Cta: 'Тактап көрүү',
  homeValue3Title: 'Сертификат жана сынама',
  homeValue3Text: 'Ар бир буюмга металл сынамасынын тастыгы, таштарга — сертификат.',
  homeValue3Cta: 'Каталогду көрүү',
  homeFooterAbout: 'AiAi Gold — Кыргызстандагы алтын зер буюмдары. Шакектер, сөйкөлөр, чынжырлар, билериктер — дароо жана заказ менен.',
  homeFooterContacts: 'Байланыш',
  homeFooterCatalog: 'Каталог',
  homeFooterLegal: 'AiAi Gold. Бардык буюмдар сатууга чейин сынамадан текшерилет.',
};

const en: Dict = {
  catalogTab: 'Catalog',
  detailsTab: 'Details',
  backToCatalog: 'Back to catalog',
  contactUs: 'Contact us',
  phoneLabel: 'Call',
  cart: 'Bag',
  cartEmpty: 'Your bag is empty. Tap the heart on a piece to add it.',
  cartClear: 'Clear',
  cartCancel: 'Cancel',
  brandTagline: 'Jewelry store',
  adminLoggedIn: 'Signed in as admin',
  adminLogin: 'Admin sign-in',

  catalogBadge: 'AiAi Gold',
  catalogTitle: 'Jewelry Catalog',
  catalogSubtitle: 'A collection of gold and gemstone jewelry.',
  addProduct: 'Add item',
  searchPlaceholder: 'Search by SKU, name, gold purity, certificate...',
  statusPrefix: 'Status',
  all: 'All',
  sortPriceDesc: 'Price: high to low',
  sortPriceAsc: 'Price: low to high',
  sortWeight: 'By weight',
  sortName: 'By name (A-Z)',
  categoriesManage: 'Categories',
  noResultsTitle: 'Nothing found',
  noResultsSubtitle: 'Try a different search or reset the category filters.',
  resetFilters: 'Reset filters',
  cardMetal: 'Metal',
  cardInsert: 'Stone',
  cardMore: 'Details',
  addToFavorites: 'Add to bag',
  removeFromFavorites: 'Remove from bag',

  article: 'SKU',
  specGoldPurity: 'Metal purity',
  specWeight: 'Weight',
  specGrams: 'grams',
  specStone: 'Stone carats',
  specSize: 'Size',
  specCertificate: 'Certificate',
  detailsHeading: 'Details',
  detailsEmpty: 'No detailed description yet.',

  orderCount: 'In bag',
  orderButton: 'Order',
  chooseWhere: 'Where should we send your request?',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  instagramCopied: 'Message copied — paste it into your Instagram DM',
  loading: 'Loading…',

  homeAnnouncement: '585 & 750 gold · Delivery across Kyrgyzstan',
  homeAnnouncementCta: 'Message us',
  homeHeroKicker: 'AiAi Gold',
  homeHeroTitle: 'Made for you',
  homeHeroText: 'Every piece is checked for purity and authenticity. Rings, earrings, chains and bracelets — in stock or made to order.',
  homeHeroCta: 'Explore the collection',
  homeCategoriesTitle: 'Categories',
  homeFeaturedTitle: 'Featured pieces',
  homeFeaturedCta: 'View full catalog',
  homeValue1Title: 'Consultation',
  homeValue1Text: "We'll help you choose a piece and answer questions on purity, weight and price.",
  homeValue1Cta: 'Message on WhatsApp',
  homeValue2Title: 'Delivery',
  homeValue2Text: 'We ship nationwide — packaging and handover handled with care.',
  homeValue2Cta: 'Ask about delivery',
  homeValue3Title: 'Certificate & purity',
  homeValue3Text: 'Every piece comes with proof of metal purity, and a certificate for stones.',
  homeValue3Cta: 'Browse the catalog',
  homeFooterAbout: 'AiAi Gold — gold jewelry in Kyrgyzstan. Rings, earrings, chains, bracelets — in stock and made to order.',
  homeFooterContacts: 'Contacts',
  homeFooterCatalog: 'Catalog',
  homeFooterLegal: 'AiAi Gold. Every piece is purity-checked before sale.',
};

const DICTS: Record<Lang, Dict> = { ru, ky, en };

export function t(lang: Lang, key: string): string {
  return DICTS[lang]?.[key] ?? DICTS.ru[key] ?? key;
}

/** Localized labels for the stored (Russian) status values. */
const STATUS_LABELS: Record<Lang, Record<string, string>> = {
  ru: {
    'ПОД ЗАКАЗ': 'ПОД ЗАКАЗ',
    'В НАЛИЧИИ': 'В НАЛИЧИИ',
    'ПРОДАНО': 'ПРОДАНО',
    'РЕЗЕРВИРОВАНО': 'РЕЗЕРВИРОВАНО',
    'В ПУТИ': 'В ПУТИ',
  },
  ky: {
    'ПОД ЗАКАЗ': 'ЗАКАЗ МЕНЕН',
    'В НАЛИЧИИ': 'БАР',
    'ПРОДАНО': 'САТЫЛДЫ',
    'РЕЗЕРВИРОВАНО': 'БРОНДОЛДУ',
    'В ПУТИ': 'ЖОЛДО',
  },
  en: {
    'ПОД ЗАКАЗ': 'MADE TO ORDER',
    'В НАЛИЧИИ': 'IN STOCK',
    'ПРОДАНО': 'SOLD',
    'РЕЗЕРВИРОВАНО': 'RESERVED',
    'В ПУТИ': 'IN TRANSIT',
  },
};

export function statusLabel(lang: Lang, status: string): string {
  return STATUS_LABELS[lang]?.[status] ?? status;
}

/** Builds the pre-filled order message for WhatsApp / Instagram,
 * in whichever language the site is currently displayed in. */
export function buildOrderMessage(lang: Lang, skus: string[]): string {
  const list = skus.join(', ');
  if (lang === 'ky') {
    return skus.length === 1
      ? `Саламатсызбы! Мага бул буюм кызык болду (артикул: ${list}). Ушул буюм боюнча багыт берип, буйрутма таза алсаңыз болобу?`
      : `Саламатсызбы! Мага бул буюмдар кызык болду (артикулдар: ${list}). Ушулар боюнча багыт берип, буйрутма таза алсаңыз болобу?`;
  }
  if (lang === 'en') {
    return skus.length === 1
      ? `Hello! I'm interested in this item (SKU: ${list}). Could you tell me more about it and help me place an order?`
      : `Hello! I'm interested in these items (SKUs: ${list}). Could you tell me more about them and help me place an order?`;
  }
  return skus.length === 1
    ? `Здравствуйте! Меня заинтересовало изделие (артикул: ${list}). Могли бы вы сориентировать меня по нему и оформить заказ?`
    : `Здравствуйте! Меня заинтересовали изделия (артикулы: ${list}). Могли бы вы сориентировать меня по ним и оформить заказ?`;
}


