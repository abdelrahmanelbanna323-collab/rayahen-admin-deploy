const fs = require('fs');
let code = fs.readFileSync('src/store/useMenuStore.ts', 'utf8');

const startStr = `{ id: 'sd6', nameAr: 'ريدبول', nameEn: 'Red Bull Energy Drink', descriptionAr: 'مشروب الطاقة ريدبول', descriptionEn: 'Red Bull energy drink', price: 125, categoryAr: 'سوفت درينك والإضافات', categoryEn: 'Soft Drinks & Addons' },`;
const endStr = `inUser[] = [`;

const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  const before = code.substring(0, startIndex + startStr.length);
  const after = code.substring(endIndex + endStr.length);
  
  const replacement = `
  { id: 'sd7', nameAr: 'إضافة فليفر', nameEn: 'Flavor Add-on', descriptionAr: 'إضافة نكهة للمشروبات', descriptionEn: 'Beverage flavor add-on', price: 25, categoryAr: 'سوفت درينك والإضافات', categoryEn: 'Soft Drinks & Addons' },
  { id: 'sd8', nameAr: 'إضافة صوص', nameEn: 'Sauce Add-on', descriptionAr: 'إضافة صوص إكسترا', descriptionEn: 'Extra sauce add-on', price: 25, categoryAr: 'سوفت درينك والإضافات', categoryEn: 'Soft Drinks & Addons' },
  { id: 'sd9', nameAr: 'إضافة عسل', nameEn: 'Honey Add-on', descriptionAr: 'إضافة عسل نحل', descriptionEn: 'Pure honey add-on', price: 25, categoryAr: 'سوفت درينك والإضافات', categoryEn: 'Soft Drinks & Addons' },
  { id: 'sd10', nameAr: 'إضافة إسبريسو', nameEn: 'Espresso Shot', descriptionAr: 'شوت إسبريسو إضافي', descriptionEn: 'Extra espresso shot', price: 25, categoryAr: 'سوفت درينك والإضافات', categoryEn: 'Soft Drinks & Addons' },
  { id: 'sd11', nameAr: 'إضافة حليب', nameEn: 'Milk Add-on', descriptionAr: 'إضافة حليب إكسترا', descriptionEn: 'Extra milk add-on', price: 25, categoryAr: 'سوفت درينك والإضافات', categoryEn: 'Soft Drinks & Addons' },
];

const initialPromotions: PromotionItem[] = [
  {
    id: 'promo-1',
    titleAr: 'خصم 15% على مشروبات القهوة',
    titleEn: '15% Off Coffee Drinks',
    subtitleAr: 'استمتع بخصم خاص لفترة محدودة على جميع مشروبات القهوة الساخنة والباردة.',
    subtitleEn: 'Enjoy a limited time discount on all hot and cold coffee drinks.',
    badgeAr: 'عرض محدود',
    badgeEn: 'Limited Offer',
    ctaAr: 'اطلب الآن',
    ctaEn: 'Order Now',
    gradient: 'from-orange-500 to-amber-500',
    icon: 'Coffee',
    isActive: true,
  },
  {
    id: 'promo-2',
    titleAr: 'وجبة الإفطار العائلية',
    titleEn: 'Family Breakfast Combo',
    subtitleAr: 'اطلب أي 3 وجبات فطار واحصل على المشروبات مجاناً.',
    subtitleEn: 'Order any 3 breakfast combos and get the drinks for free.',
    badgeAr: 'عرض عائلي',
    badgeEn: 'Family Offer',
    ctaAr: 'تصفح العروض',
    ctaEn: 'View Offers',
    gradient: 'from-green-500 to-emerald-500',
    icon: 'UtensilsCrossed',
    isActive: true,
  }
];

const initialAnnouncements: AnnouncementPost[] = [
  {
    id: 'ann-1',
    titleAr: 'قريباً: افتتاح فرعنا الجديد في التجمع',
    titleEn: 'Coming Soon: New Branch in 5th Settlement',
    contentAr: 'نحن سعداء بالإعلان عن افتتاح فرعنا الجديد قريباً جداً. تابعونا لمعرفة موعد الافتتاح!',
    contentEn: 'We are excited to announce our new branch opening very soon. Stay tuned!',
    badgeAr: 'أخبار',
    badgeEn: 'News',
    isActive: true,
  }
];

const initialAdminUsers: Adm`;

  fs.writeFileSync('src/store/useMenuStore.ts', before + '\n' + replacement + after);
  console.log('Fixed successfully!');
} else {
  console.log('Could not find start or end index:', startIndex, endIndex);
}
