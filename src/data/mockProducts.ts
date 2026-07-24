import { JewelryProduct } from '../types';

export const INITIAL_PRODUCTS: JewelryProduct[] = [
  {
    id: 'prod-1',
    sku: 'AU-782-ERD',
    name: 'Celestial Emerald Ring',
    category: 'Кольца',
    price: 12450.00,
    status: 'В НАЛИЧИИ',
    goldPurity: '18K Желтое золото',
    weightGrams: 8.42,
    stoneCarats: '2.50 CTW',
    clarity: 'VVS1 / Цвет D',
    ringSize: '16.5 (Изменяемый)',
    certification: 'GIA #221588',
    certificationUrl: 'https://www.gia.edu',
    lastAudit: '24 окт 2023',
    internalNotes: 'Зарезервировано для шоурума VIP-коллекции в Париже в следующем месяце. Убедитесь в отполированности металла перед транспортировкой. Высокий интерес зафиксирован на выставке в Дубае.',
    isFavorite: true,
    createdAt: '2023-09-15T10:00:00Z',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAOwdqtT1yFkzvTp9gM1uhXrTV-Ig9qW5tKkeIDDIM6qthaeyGtVINaocyuI42FiRMzUiOvdnczy7ZnJB7z-pkLAU2bs8zpWzNl6q5H4YJPIpfPgks5HPFhh0xOtUh6uaUzIjLeK-5tR1pwsxsNcoTaJ47FcQhz1e6u4zu3Ar4RQwPlqtOgMx_r-eZubcx3B-GWYuI25FgFKfOxr8dJProWx4kIwK_WtnRwY8DpuBpX0LfIuppz2Ubqehux0swEUhvKYGilQh2foxo',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC_K0rUmILcEgj1lU15b0FWq-Xgj0iJ3Eh-Mc0_Z4jnXvGXISArGqoKxdoA9S8TxhDA5AO2fRD-PDg0zXDtJNCBzSfxfJa3f66Co8jNk1mV0A6GV-2v9kVLqJH1ZmuVBBzYBAdpuVMPOam5Op9zRyPwDJvU22xt_nRBFz-WloRQrnlFkFfwvpcS5ACes-iGQYhfDENH7sJ2OKGMEWMH7lxgcn6oxUpfkTVFIzE5JM4pwTujxy58yECC3VEkOJgtvbdR5o-QCSsCiRo',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuABmQ0f9FKc7jDoW3U8Ke3PPJver3lDcIxse-h7lqv7PBMlhvgxwlMRFKtBNjX2x-UEi-ldkvRy7SbDcs2iP6ClWzdQIsOAI0c0kp3qQbTAn-4EEb1u4cR1g5TBoAF-DnbMub7M5iU00Wl9fEmtUGTWQbVb77PIcP71mc5P6X29pXLIoLGinU1FgcuZtYma8Lv27bSJ5G9CpwiYiQcCov41Olul4nyHcrkNz03kz-_FaIoRJIivUryXaG1wBwD86MatW9WpNMZyOSI'
    ],
    auditHistory: [
      {
        id: 'aud-1',
        date: '24 окт 2023',
        inspector: 'М. Лоран (Главный аудитор хранилища)',
        location: 'Главный сейф - Ячейка 04',
        status: 'В НАЛИЧИИ',
        note: 'Вес подтвержден: 8.42 г. Проверка крапанов прошла успешно.'
      },
      {
        id: 'aud-2',
        date: '12 июл 2023',
        inspector: 'Э. Вэнс (Геммолог)',
        location: 'Салон Женева',
        status: 'В НАЛИЧИИ',
        note: 'Сертификат GIA повторно проверен перед фотосессией.'
      }
    ]
  },
  {
    id: 'prod-2',
    sku: 'AU-911-SLT',
    name: 'Подвеска Solitaire Cushion',
    category: 'Колье и Цепи',
    price: 18900.00,
    status: 'ЗАБРОНИРОВАНО',
    goldPurity: '18K Белое золото',
    weightGrams: 11.20,
    stoneCarats: '3.10 CTW',
    clarity: 'FL / Цвет E',
    ringSize: 'Цепь 45 см',
    certification: 'GIA #884920',
    certificationUrl: 'https://www.gia.edu',
    lastAudit: '15 ноя 2023',
    internalNotes: 'Зарезервировано для осмотра в сейфе VIP-клиента. Запланирована передача в хаб Цюриха.',
    isFavorite: false,
    createdAt: '2023-10-01T14:30:00Z',
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80'
    ],
    auditHistory: [
      {
        id: 'aud-3',
        date: '15 ноя 2023',
        inspector: 'Х. Вебер',
        location: 'Сейф Цюрих',
        status: 'ЗАБРОНИРОВАНО',
        note: 'Клиентский пломбировочный замок установлен. Пломба не повреждена.'
      }
    ]
  },
  {
    id: 'prod-3',
    sku: 'AU-405-RBR',
    name: 'Жесткий браслет Royal Sapphire',
    category: 'Жесткие браслеты',
    price: 24800.00,
    status: 'В НАЛИЧИИ',
    goldPurity: '22K Желтое золото',
    weightGrams: 22.15,
    stoneCarats: '4.80 CTW',
    clarity: 'Royal Blue / VVS2',
    ringSize: 'Средний (68 мм)',
    certification: 'SSEF #74910',
    certificationUrl: 'https://www.ssef.ch',
    lastAudit: '02 дек 2023',
    internalNotes: 'Цейлонский сапфир, происхождение подтверждено лабораторией SSEF. Идеальная полировка.',
    isFavorite: true,
    createdAt: '2023-11-10T09:15:00Z',
    images: [
      'https://images.unsplash.com/photo-1611591475155-4284fa289351?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=80'
    ],
    auditHistory: [
      {
        id: 'aud-4',
        date: '02 дек 2023',
        inspector: 'А. Аль-Мактум',
        location: 'Шоурум Дубай',
        status: 'В НАЛИЧИИ',
        note: 'Плановое инвентаризационное сканирование пройдено.'
      }
    ]
  },
  {
    id: 'prod-4',
    sku: 'AU-302-MRQ',
    name: 'Серьги Marquise Diamond Drop',
    category: 'Серьги',
    price: 9850.00,
    status: 'ПРОДАНО',
    goldPurity: '18K Розовое золото',
    weightGrams: 6.75,
    stoneCarats: '1.95 CTW',
    clarity: 'VS1 / Цвет F',
    ringSize: 'Английский замок',
    certification: 'IGI #552199',
    certificationUrl: 'https://www.igi.org',
    lastAudit: '18 янв 2024',
    internalNotes: 'Передано клиенту в Токио. Инвойс #TK-8830 оплачен полностью.',
    isFavorite: false,
    createdAt: '2023-11-20T11:45:00Z',
    images: [
      'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=1200&q=80'
    ],
    auditHistory: [
      {
        id: 'aud-5',
        date: '18 янв 2024',
        inspector: 'К. Танака',
        location: 'Бутик Токио',
        status: 'ПРОДАНО',
        note: 'Вручено VIP-клиенту.'
      }
    ]
  }
];
