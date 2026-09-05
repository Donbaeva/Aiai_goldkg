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
  share: 'Поделиться спецификацией',
  moreOptions: 'Дополнительные опции',
  actionsFor: 'Действия',
  exportPassport: 'Экспорт VIP-паспорта',
  checkCertificate: 'Проверить сертификат',
  adminLoggedIn: 'Вы вошли как администратор',
  adminLogin: 'Вход для администратора',

  catalogBadge: 'AiAi Gold',
  catalogTitle: 'Каталог ювелирных изделий и драгоценностей',
  catalogSubtitle: 'Ознакомьтесь с нашей коллекцией изделий из золота и драгоценных камней.',
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
  addToFavorites: 'Добавить в избранное',
  removeFromFavorites: 'Убрать из избранного',

  article: 'Артикул',
  specGoldPurity: 'Проба металл',
  specWeight: 'Вес изделия',
  specGrams: 'Грамм',
  specStone: 'Караты вставки',
  specSize: 'Размер',
  specCertificate: 'Сертификат',
  detailsHeading: 'Подробнее',
  detailsEmpty: 'Подробное описание пока не добавлено.',

  orderCount: 'В избранном',  orderButton: 'Заказать',
  chooseWhere: 'Куда отправить заявку?',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  instagramCopied: 'Текст сообщения скопирован — вставьте его в переписке Instagram',
  loading: 'Загрузка каталога…',

  homeAnnouncement: 'Изделия из золота 585 и 750 пробы. Индивидуальные заказы и доставка по Кыргызстану.',
  homeAnnouncementCta: 'Написать нам',
  homeHeroKicker: 'AiAi Gold',
  homeHeroTitle: 'Золотые украшения ручного отбора',
  homeHeroText: 'Каждое изделие в нашей коллекции проверено на пробу и подлинность камней. Кольца, серьги, цепи и браслеты — под заказ или в наличии, с сертификатом на руки.',
  homeHeroCta: 'Смотреть каталог',
  homeCategoriesTitle: 'Категории',
  homeFeaturedTitle: 'Популярные изделия',
  homeFeaturedCta: 'Весь каталог',
  homeValue1Title: 'Консультация в WhatsApp',
  homeValue1Text: 'Поможем подобрать изделие и ответим на вопросы по пробе, весу и цене.',
  homeValue1Cta: 'Написать в WhatsApp',
  homeValue2Title: 'Доставка по Кыргызстану',
  homeValue2Text: 'Отправляем изделия по стране, упаковка и передача — с осторожностью.',
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
  share: 'Мүнөздөмөнү бөлүшүү',
  moreOptions: 'Кошумча опциялар',
  actionsFor: 'Аракеттер',
  exportPassport: 'VIP-паспортту экспорттоо',
  checkCertificate: 'Сертификатты текшерүү',
  adminLoggedIn: 'Сиз администратор катары кирдиңиз',
  adminLogin: 'Администратор үчүн кирүү',

  catalogBadge: 'AiAi Gold',
  catalogTitle: 'Зер буюмдар жана асыл таштар каталогу',
  catalogSubtitle: 'Алтын жана асыл таштардан жасалган буюмдар жыйнагыбыз менен таанышыңыз.',
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
  addToFavorites: 'Тандалмаларга кошуу',
  removeFromFavorites: 'Тандалмалардан алып салуу',

  article: 'Артикул',
  specGoldPurity: 'Метал сынамасы',
  specWeight: 'Буюмдун салмагы',
  specGrams: 'Грамм',
  specStone: 'Кыстырманын каратасы',
  specSize: 'Өлчөм',
  specCertificate: 'Сертификат',
  detailsHeading: 'Толугураак',
  detailsEmpty: 'Толук баяндама азырынча кошулган жок.',

  orderCount: 'Тандалмаларда',
  orderButton: 'Буйрутма берүү',
  chooseWhere: 'Кайда жөнөтөбүз?',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  instagramCopied: 'Билдирүү тексти көчүрүлдү — Instagram баракчасына чаптап жөнөтүңүз',
  loading: 'Каталог жүктөлүүдө…',

  homeAnnouncement: '585 жана 750 сынамадагы алтын буюмдар. Жеке заказдар жана Кыргызстан боюнча жеткирүү.',
  homeAnnouncementCta: 'Бизге жазыңыз',
  homeHeroKicker: 'AiAi Gold',
  homeHeroTitle: 'Тандалма алтын буюмдар',
  homeHeroText: 'Жыйнагыбыздагы ар бир буюм сынамасы жана таштарынын аныктыгы боюнча текшерилген. Шакектер, сөйкөлөр, чынжырлар жана билериктер — заказ менен же дароо, сертификат менен.',
  homeHeroCta: 'Каталогду көрүү',
  homeCategoriesTitle: 'Категориялар',
  homeFeaturedTitle: 'Популярдуу буюмдар',
  homeFeaturedCta: 'Бүткүл каталог',
  homeValue1Title: 'WhatsApp аркылуу консультация',
  homeValue1Text: 'Буюм тандоого жардам беребиз жана сынама, салмак, баа боюнча суроолорго жооп беребиз.',
  homeValue1Cta: 'WhatsApp\'ка жазуу',
  homeValue2Title: 'Кыргызстан боюнча жеткирүү',
  homeValue2Text: 'Буюмдарды өлкө боюнча жөнөтөбүз, таңгактоо жана өткөрүп берүү этияттык менен.',
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
  share: 'Share specification',
  moreOptions: 'More options',
  actionsFor: 'Actions',
  exportPassport: 'Export VIP passport',
  checkCertificate: 'Verify certificate',
  adminLoggedIn: 'Signed in as admin',
  adminLogin: 'Admin sign-in',

  catalogBadge: 'AiAi Gold',
  catalogTitle: 'Jewelry & Gemstone Catalog',
  catalogSubtitle: 'Browse our collection of gold and gemstone jewelry.',
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
  addToFavorites: 'Add to favorites',
  removeFromFavorites: 'Remove from favorites',

  article: 'SKU',
  specGoldPurity: 'Metal purity',
  specWeight: 'Weight',
  specGrams: 'grams',
  specStone: 'Stone carats',
  specSize: 'Size',
  specCertificate: 'Certificate',
  detailsHeading: 'Details',
  detailsEmpty: 'No detailed description yet.',

  orderCount: 'In favorites',
  orderButton: 'Order',
  chooseWhere: 'Where should we send your request?',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  instagramCopied: 'Message copied — paste it into your Instagram DM',
  loading: 'Loading catalog…',

  homeAnnouncement: '585 and 750 gold jewelry. Custom orders and delivery across Kyrgyzstan.',
  homeAnnouncementCta: 'Message us',
  homeHeroKicker: 'AiAi Gold',
  homeHeroTitle: 'Hand-picked gold jewelry',
  homeHeroText: 'Every piece in our collection is checked for gold purity and stone authenticity. Rings, earrings, chains and bracelets — in stock or made to order, with a certificate included.',
  homeHeroCta: 'Browse the catalog',
  homeCategoriesTitle: 'Categories',
  homeFeaturedTitle: 'Featured pieces',
  homeFeaturedCta: 'View full catalog',
  homeValue1Title: 'WhatsApp consultation',
  homeValue1Text: "We'll help you choose a piece and answer questions on purity, weight and price.",
  homeValue1Cta: 'Message on WhatsApp',
  homeValue2Title: 'Delivery across Kyrgyzstan',
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

