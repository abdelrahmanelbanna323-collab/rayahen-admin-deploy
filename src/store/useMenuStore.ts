"use client";
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MenuItem, ActivityLog } from '@/types';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

export interface PromotionItem {
  id: string;
  titleEn: string;
  titleAr: string;
  titleIt?: string;
  titleRu?: string;
  subtitleEn: string;
  subtitleAr: string;
  subtitleIt?: string;
  subtitleRu?: string;
  badgeEn: string;
  badgeAr: string;
  badgeIt?: string;
  badgeRu?: string;
  ctaEn: string;
  ctaAr: string;
  ctaIt?: string;
  ctaRu?: string;
  gradient: string;
  imageUrl?: string;
  icon?: string;
  isActive: boolean;
  branchOverrides?: {
    [branchId: string]: {
      isActive?: boolean;
      titleAr?: string;
      titleEn?: string;
      titleIt?: string;
      titleRu?: string;
      subtitleAr?: string;
      subtitleEn?: string;
      subtitleIt?: string;
      subtitleRu?: string;
      badgeAr?: string;
      badgeEn?: string;
      badgeIt?: string;
      badgeRu?: string;
      ctaAr?: string;
      ctaEn?: string;
      ctaIt?: string;
      ctaRu?: string;
      imageUrl?: string;
      icon?: string;
    };
  };
}

export interface CategoryItem {
  id: string;
  nameEn: string;
  nameAr: string;
  nameIt?: string;
  nameRu?: string;
  imageUrl?: string;
  icon?: string;
  isActive?: boolean;
  branchOverrides?: {
    [branchId: string]: {
      isActive?: boolean;
      nameAr?: string;
      nameEn?: string;
      nameIt?: string;
      nameRu?: string;
      imageUrl?: string;
      icon?: string;
    };
  };
}

export interface AnnouncementPost {
  id: string;
  titleAr: string;
  titleEn: string;
  titleIt?: string;
  titleRu?: string;
  contentAr: string;
  contentEn: string;
  contentIt?: string;
  contentRu?: string;
  imageUrl?: string;
  videoUrl?: string;
  mediaType?: 'image' | 'video';
  badgeAr: string;
  badgeEn: string;
  badgeIt?: string;
  badgeRu?: string;
  isActive: boolean;
  branchOverrides?: {
    [branchId: string]: {
      isActive?: boolean;
      titleAr?: string;
      titleEn?: string;
      titleIt?: string;
      titleRu?: string;
      contentAr?: string;
      contentEn?: string;
      contentIt?: string;
      contentRu?: string;
      imageUrl?: string;
      badgeAr?: string;
      badgeEn?: string;
      badgeIt?: string;
      badgeRu?: string;
    };
  };
}

export interface AdminUser {
  id: string;
  username: string;
  passwordHash: string;
  role: 'SUPER_ADMIN' | 'MANAGER';
}

const initialCategories: CategoryItem[] = [
  { id: 'All', nameEn: 'All', nameAr: 'الكل' },
  { id: 'Breakfast Combos', nameEn: 'Breakfast Combos', nameAr: 'عروض الفطار' },
  { id: 'Breakfast', nameEn: 'Breakfast', nameAr: 'الفطار' },
  { id: 'Bakery', nameEn: 'Bakery', nameAr: 'المخبوزات' },
  { id: 'Coffee Drinks', nameEn: 'Coffee Drinks', nameAr: 'مشروبات القهوة' },
  { id: 'Hot Drinks', nameEn: 'Hot Drinks', nameAr: 'مشروبات ساخنة' },
  { id: 'Milkshakes & Smoothies', nameEn: 'Milkshakes & Smoothies', nameAr: 'ميلك شيك وسموزي' },
  { id: 'Frappes & Iced Coffee', nameEn: 'Frappés & Iced Coffee', nameAr: 'فرابيه وآيس كوفي' },
  { id: 'Nuts & Bubbles', nameEn: 'Nuts & Bubbles', nameAr: 'ناتس وبابلز' },
  { id: 'Cocktails & Soda', nameEn: 'Cocktails & Soda', nameAr: 'كوكتيل فريش وصودا' },
  { id: 'Fresh Juices', nameEn: 'Fresh Juices', nameAr: 'عصائر فريش' },
  { id: 'Desserts', nameEn: 'Desserts', nameAr: 'الحلو' },
  { id: 'Soft Drinks & Addons', nameEn: 'Soft Drinks & Add-ons', nameAr: 'سوفت درينك والإضافات' },
];

const initialMenuItems: MenuItem[] = [
  // عروض الفطار
  { id: 'cb1', nameAr: 'الفطار الشرقي', nameEn: 'Oriental Breakfast Combo', descriptionAr: 'فول وفلافل وبطاطس مقطعة وعيش بلدي سخن + شاي أو ليمون', descriptionEn: 'Foul, falafel, sliced potatoes, fresh warm baladi bread + tea or lemon', price: 99, categoryAr: 'عروض الفطار', categoryEn: 'Breakfast Combos', badgeAr: 'عرض مميز', badgeEn: 'Special Offer' },
  { id: 'cb2', nameAr: 'الفطار الغربي', nameEn: 'Western Breakfast Combo', descriptionAr: 'سموك تركي وبيض وشيدر أحمر وبطاطس كريسب + شاي أو ليمون منعش', descriptionEn: 'Smoked turkey, eggs, red cheddar, crispy potatoes + tea or lemon', price: 99, categoryAr: 'عروض الفطار', categoryEn: 'Breakfast Combos', badgeAr: 'عرض مميز', badgeEn: 'Special Offer' },
  { id: 'cb3', nameAr: 'الفطار الفرنش', nameEn: 'French Breakfast Combo', descriptionAr: 'كرواسون سادة + كابتشينو أو لاتيه أو شاي', descriptionEn: 'Plain croissant + cappuccino, latte or tea', price: 99, categoryAr: 'عروض الفطار', categoryEn: 'Breakfast Combos', badgeAr: 'عرض مميز', badgeEn: 'Special Offer' },

  // الفطار
  { id: 'bf1', nameAr: 'فطار رياحين', nameEn: 'Rayahen Signature Breakfast', descriptionAr: 'بيض، فول، فلافل، جبنة بالطماطم، بوم فريت، باذنجان خل وثوم', descriptionEn: 'Eggs, foul, falafel, cheese with tomatoes, pommes frites, eggplant with garlic & vinegar', price: 165, categoryAr: 'الفطار', categoryEn: 'Breakfast', badgeAr: 'الأكثر طلباً', badgeEn: 'Best Seller' },
  { id: 'bf2', nameAr: 'فطار أمريكان', nameEn: 'American Breakfast', descriptionAr: 'تركي، شيدر أحمر، فيتا، هوت دوج، توست', descriptionEn: 'Turkey, red cheddar, feta, hot dog, toast', price: 190, categoryAr: 'الفطار', categoryEn: 'Breakfast' },
  { id: 'bf3', nameAr: 'فول ساده', nameEn: 'Plain Foul', descriptionAr: 'طبق فول سادة', descriptionEn: 'Plain oriental fava beans', price: 40, categoryAr: 'الفطار', categoryEn: 'Breakfast' },
  { id: 'bf4', nameAr: 'فول زيت زيتون', nameEn: 'Foul with Olive Oil', descriptionAr: 'فول مع زيت الزيتون الصافي', descriptionEn: 'Foul topped with virgin olive oil', price: 55, categoryAr: 'الفطار', categoryEn: 'Breakfast' },
  { id: 'bf5', nameAr: 'فول إسكندراني', nameEn: 'Alexandrian Foul', descriptionAr: 'فول بالطريقة الإسكندرانية', descriptionEn: 'Special Alexandrian style foul', price: 50, categoryAr: 'الفطار', categoryEn: 'Breakfast' },
  { id: 'bf6', nameAr: 'فول زبدة', nameEn: 'Foul with Butter', descriptionAr: 'فول بالزبدة البلدية', descriptionEn: 'Rich butter foul', price: 55, categoryAr: 'الفطار', categoryEn: 'Breakfast' },
  { id: 'bf7', nameAr: 'فول ديناميت', nameEn: 'Dynamite Foul', descriptionAr: 'فول + بيض + بتنجان', descriptionEn: 'Foul + eggs + eggplant combo', price: 55, categoryAr: 'الفطار', categoryEn: 'Breakfast' },
  { id: 'bf8', nameAr: 'فلافل بالسمسم', nameEn: 'Sesame Falafel', descriptionAr: 'الطبق ٣ قطع فلافل بالسمسم', descriptionEn: '3 pcs sesame coated falafel', price: 50, categoryAr: 'الفطار', categoryEn: 'Breakfast' },
  { id: 'bf9', nameAr: 'فلافل كيرى', nameEn: 'Kiri Stuffed Falafel', descriptionAr: 'الطبق ٣ قطع فلافل محشوة جبنة كيري', descriptionEn: '3 pcs falafel stuffed with Kiri cheese', price: 70, categoryAr: 'الفطار', categoryEn: 'Breakfast' },
  { id: 'bf10', nameAr: 'فلافل جبنه تركى', nameEn: 'Roumy Cheese Falafel', descriptionAr: 'الطبق ٣ قطع فلافل محشوة جبنة تركي', descriptionEn: '3 pcs falafel stuffed with Roumy cheese', price: 70, categoryAr: 'الفطار', categoryEn: 'Breakfast' },
  { id: 'bf11', nameAr: 'فلافل موتزاريلا', nameEn: 'Mozzarella Falafel', descriptionAr: 'الطبق ٣ قطع فلافل محشوة موتزاريلا', descriptionEn: '3 pcs falafel stuffed with mozzarella', price: 70, categoryAr: 'الفطار', categoryEn: 'Breakfast' },
  { id: 'bf12', nameAr: 'فلافل بسطرمه', nameEn: 'Pastrami Falafel', descriptionAr: 'الطبق ٣ قطع فلافل محشوة بسطرمة', descriptionEn: '3 pcs falafel stuffed with pastrami', price: 85, categoryAr: 'الفطار', categoryEn: 'Breakfast' },
  { id: 'bf13', nameAr: 'أومليت سادة', nameEn: 'Plain Omelette', descriptionAr: 'طبق أومليت كلاسيك', descriptionEn: 'Classic plain egg omelette', price: 60, categoryAr: 'الفطار', categoryEn: 'Breakfast' },
  { id: 'bf14', nameAr: 'إسبانش أومليت', nameEn: 'Spanish Omelette', descriptionAr: 'أومليت مع ميكس خضار', descriptionEn: 'Omelette with mixed veggies', price: 80, categoryAr: 'الفطار', categoryEn: 'Breakfast' },
  { id: 'bf15', nameAr: 'أومليت بسطرمة', nameEn: 'Pastrami Omelette', descriptionAr: 'أومليت، ميكس تشيز، بسطرمة', descriptionEn: 'Omelette with mixed cheese & pastrami', price: 105, categoryAr: 'الفطار', categoryEn: 'Breakfast' },
  { id: 'bf16', nameAr: 'أومليت سجق', nameEn: 'Sausage Omelette', descriptionAr: 'أومليت، ميكس تشيز، سجق', descriptionEn: 'Omelette with mixed cheese & oriental sausage', price: 100, categoryAr: 'الفطار', categoryEn: 'Breakfast' },
  { id: 'bf17', nameAr: 'أومليت ميكس تشيز', nameEn: 'Mix Cheese Omelette', descriptionAr: 'شيدر ميكس وموتزاريلا', descriptionEn: 'Cheddar mix & mozzarella omelette', price: 100, categoryAr: 'الفطار', categoryEn: 'Breakfast' },
  { id: 'bf18', nameAr: 'اومليت سوبريم', nameEn: 'Supreme Omelette', descriptionAr: 'بيض + سلامى + سدق + سوسيس', descriptionEn: 'Eggs + salami + sausage + hot dog', price: 100, categoryAr: 'الفطار', categoryEn: 'Breakfast' },
  { id: 'bf19', nameAr: 'بيض مدحرج', nameEn: 'Fried Boiled Eggs', descriptionAr: 'بيض مسلوق ومقلي بالزبدة', descriptionEn: 'Butter-fried boiled eggs', price: 60, categoryAr: 'الفطار', categoryEn: 'Breakfast' },
  { id: 'bf20', nameAr: 'بوم فريت', nameEn: 'Pommes Frites', descriptionAr: 'بطاطس مقلية ذهبية', descriptionEn: 'Crispy French fries', price: 50, categoryAr: 'الفطار', categoryEn: 'Breakfast' },
  { id: 'bf21', nameAr: 'جبنة بالطماطم', nameEn: 'Feta Cheese with Tomatoes', descriptionAr: 'جبنة فيتا بالزيت والطماطم', descriptionEn: 'Feta cheese with tomatoes & olive oil', price: 45, categoryAr: 'الفطار', categoryEn: 'Breakfast' },
  { id: 'bf22', nameAr: 'طبق عجه', nameEn: 'Eggah Plate', descriptionAr: 'عجة مصرية بالبيض والخضار', descriptionEn: 'Egyptian style baked eggah', price: 60, categoryAr: 'الفطار', categoryEn: 'Breakfast' },
  { id: 'bf23', nameAr: 'شكشوكة', nameEn: 'Shakshuka', descriptionAr: 'بيض مطبوخ بالصلصة والفلفل', descriptionEn: 'Eggs poached in tomato sauce', price: 60, categoryAr: 'الفطار', categoryEn: 'Breakfast' },
  { id: 'bf24', nameAr: 'مسقعه', nameEn: 'Moussaka', descriptionAr: 'مسقعة باذنجان بالصلصة', descriptionEn: 'Egyptian eggplant moussaka', price: 50, categoryAr: 'الفطار', categoryEn: 'Breakfast' },
  { id: 'bf25', nameAr: 'فطير مشلتت', nameEn: 'Fiteer Meshaltet', descriptionAr: '3 قطع فطير، طحينة، عسل أسود، عسل أبيض، مربى', descriptionEn: '3 pcs fiteer with tahini, black honey, white honey & jam', price: 105, categoryAr: 'الفطار', categoryEn: 'Breakfast' },
  { id: 'bf26', nameAr: 'توست ميكس تشيز', nameEn: 'Mix Cheese Toast', descriptionAr: 'توست، ميكس تشيز، بوم فريت', descriptionEn: 'Mix cheese toast with fries', price: 110, categoryAr: 'الفطار', categoryEn: 'Breakfast' },
  { id: 'bf27', nameAr: 'توست سموك تركي', nameEn: 'Smoked Turkey Toast', descriptionAr: 'توست، ميكس شيدر، سموك تركي، بوم فريت', descriptionEn: 'Smoked turkey, cheddar toast & fries', price: 125, categoryAr: 'الفطار', categoryEn: 'Breakfast' },
  { id: 'bf28', nameAr: 'توست سجق', nameEn: 'Sausage Toast', descriptionAr: 'توست مع السجق الشرقي والجبنة', descriptionEn: 'Oriental sausage toast with cheese', price: 110, categoryAr: 'الفطار', categoryEn: 'Breakfast' },
  { id: 'bf29', nameAr: 'توست سلامى', nameEn: 'Salami Toast', descriptionAr: 'جبنه كيرى + صوص شيدر + سلامى', descriptionEn: 'Kiri cheese, cheddar sauce & salami toast', price: 110, categoryAr: 'الفطار', categoryEn: 'Breakfast' },
  { id: 'bf30', nameAr: 'توست سوبريم', nameEn: 'Supreme Toast', descriptionAr: 'صوص شيدر + سلامى + سوسيس + سجق', descriptionEn: 'Cheddar sauce, salami, hot dog & sausage toast', price: 120, categoryAr: 'الفطار', categoryEn: 'Breakfast' },
  { id: 'bf31', nameAr: 'كرواسون سادة (بدون بوم فريت)', nameEn: 'Plain Croissant (No Fries)', descriptionAr: 'يقدم بدون بوم فريت', descriptionEn: 'Served without pommes frites', price: 70, categoryAr: 'الفطار', categoryEn: 'Breakfast' },
  { id: 'bf32', nameAr: 'كرواسون سادة (مع بوم فريت)', nameEn: 'Plain Croissant (With Fries)', descriptionAr: 'كرواسون مع بوم فريت', descriptionEn: 'Croissant served with pommes frites', price: 90, categoryAr: 'الفطار', categoryEn: 'Breakfast' },
  { id: 'bf33', nameAr: 'كرواسون ميكس تشيز (بدون بوم فريت)', nameEn: 'Mix Cheese Croissant (No Fries)', descriptionAr: 'يقدم بدون بوم فريت', descriptionEn: 'Served without pommes frites', price: 80, categoryAr: 'الفطار', categoryEn: 'Breakfast' },
  { id: 'bf34', nameAr: 'كرواسون ميكس تشيز (مع بوم فريت)', nameEn: 'Mix Cheese Croissant (With Fries)', descriptionAr: 'كرواسون، ميكس تشيز، بوم فريت', descriptionEn: 'Croissant with mix cheese & pommes frites', price: 100, categoryAr: 'الفطار', categoryEn: 'Breakfast' },
  { id: 'bf35', nameAr: 'كرواسون سموك تركي (بدون بوم فريت)', nameEn: 'Smoked Turkey Croissant (No Fries)', descriptionAr: 'يقدم بدون بوم فريت', descriptionEn: 'Served without pommes frites', price: 100, categoryAr: 'الفطار', categoryEn: 'Breakfast' },
  { id: 'bf36', nameAr: 'كرواسون سموك تركي (مع بوم فريت)', nameEn: 'Smoked Turkey Croissant (With Fries)', descriptionAr: 'كرواسون، سموك تركي، ميكس شيدر، بوم فريت', descriptionEn: 'Croissant with smoked turkey, cheddar & fries', price: 125, categoryAr: 'الفطار', categoryEn: 'Breakfast' },
  { id: 'bf37', nameAr: 'كلوب ساندوتش', nameEn: 'Club Sandwich', descriptionAr: 'سلامى , سموك ترك , اومليت , بومفريت', descriptionEn: 'Salami, smoked turkey, omelette & fries', price: 185, categoryAr: 'الفطار', categoryEn: 'Breakfast' },
  { id: 'bf38', nameAr: 'ساندوتش سموك تركي', nameEn: 'Smoked Turkey Sandwich', descriptionAr: 'سموك تركي، حلوم، كيري، شيدر، بوم فريت', descriptionEn: 'Smoked turkey, halloumi, Kiri, cheddar & fries', price: 125, categoryAr: 'الفطار', categoryEn: 'Breakfast' },
  { id: 'bf39', nameAr: 'ساندوتش سلامي', nameEn: 'Salami Sandwich', descriptionAr: 'سلامي، شيدر، حلوم، كيري، بوم فريت', descriptionEn: 'Salami, cheddar, halloumi, Kiri & fries', price: 125, categoryAr: 'الفطار', categoryEn: 'Breakfast' },
  { id: 'bf40', nameAr: 'ساندوتش ميكس تشيز', nameEn: 'Mix Cheese Sandwich', descriptionAr: 'شيدر، حلوم، كيري، بوم فريت', descriptionEn: 'Cheddar, halloumi, Kiri & fries', price: 110, categoryAr: 'الفطار', categoryEn: 'Breakfast' },
  { id: 'bf41', nameAr: 'ساندوتش الحبه الكاملة جبنه', nameEn: 'Whole Grain Cheese Sandwich', descriptionAr: 'جبنه شيدر احمر + جبنه تركى + جبنه كيرى', descriptionEn: 'Red cheddar + Roumy cheese + Kiri cheese', price: 100, categoryAr: 'الفطار', categoryEn: 'Breakfast' },
  { id: 'bf42', nameAr: 'ساندوتش الحبه الكاملة سوبريم', nameEn: 'Whole Grain Supreme Sandwich', descriptionAr: 'سلامى + سموك تركى + جبنه كيرى', descriptionEn: 'Salami + smoked turkey + Kiri cheese', price: 100, categoryAr: 'الفطار', categoryEn: 'Breakfast' },
  { id: 'bf43', nameAr: 'ساندوتش الحبة الكامله مشكل لحوم', nameEn: 'Whole Grain Mixed Meat Sandwich', descriptionAr: 'بسطرمه + سجق + جبنه تركى', descriptionEn: 'Pastrami + sausage + Roumy cheese', price: 110, categoryAr: 'الفطار', categoryEn: 'Breakfast' },

  // المخبوزات (Bakery)
  { id: 'bk1', nameAr: 'كرواسون سادة', nameEn: 'Plain Croissant', descriptionAr: 'كرواسون زبدة فرنسي سادة', descriptionEn: 'Fresh plain butter croissant', price: 70, categoryAr: 'المخبوزات', categoryEn: 'Bakery' },
  { id: 'bk2', nameAr: 'كرواسون ميكس تشيز', nameEn: 'Mix Cheese Croissant', descriptionAr: 'كرواسون محشو ميكس أجبان غني', descriptionEn: 'Croissant stuffed with mix cheese', price: 70, categoryAr: 'المخبوزات', categoryEn: 'Bakery' },
  { id: 'bk3', nameAr: 'كرواسون سموك تركى', nameEn: 'Smoked Turkey Croissant', descriptionAr: 'كرواسون بالتركي المدخن', descriptionEn: 'Croissant filled with smoked turkey', price: 100, categoryAr: 'المخبوزات', categoryEn: 'Bakery' },
  { id: 'bk4', nameAr: 'كرواسون شيكولاته', nameEn: 'Chocolate Croissant', descriptionAr: 'كرواسون محشو شوكولاتة غنية', descriptionEn: 'Croissant with chocolate filling', price: 100, categoryAr: 'المخبوزات', categoryEn: 'Bakery' },
  { id: 'bk5', nameAr: 'كرواسون نوتيلا', nameEn: 'Nutella Croissant', descriptionAr: 'كرواسون محشو بالنوتيلا', descriptionEn: 'Croissant filled with Nutella', price: 110, categoryAr: 'المخبوزات', categoryEn: 'Bakery' },
  { id: 'bk6', nameAr: 'كرواسون لوتس', nameEn: 'Lotus Croissant', descriptionAr: 'كرواسون بزبدة اللوتس', descriptionEn: 'Croissant filled with Lotus Biscoff', price: 110, categoryAr: 'المخبوزات', categoryEn: 'Bakery' },
  { id: 'bk7', nameAr: 'كرواسون بيستاشيو', nameEn: 'Pistachio Croissant', descriptionAr: 'كرواسون بكريمة الفستق', descriptionEn: 'Croissant with pistachio cream', price: 120, categoryAr: 'المخبوزات', categoryEn: 'Bakery' },
  { id: 'bk8', nameAr: 'كرواسون كيندر', nameEn: 'Kinder Croissant', descriptionAr: 'كرواسون بشوكولاتة كيندر', descriptionEn: 'Croissant stuffed with Kinder', price: 120, categoryAr: 'المخبوزات', categoryEn: 'Bakery' },
  { id: 'bk9', nameAr: 'كرواسون لوز', nameEn: 'Almond Croissant', descriptionAr: 'كرواسون بكريمة اللوز والمكسرات', descriptionEn: 'Croissant with almond cream', price: 130, categoryAr: 'المخبوزات', categoryEn: 'Bakery' },
  { id: 'bk10', nameAr: 'كرواسون كراميل', nameEn: 'Caramel Croissant', descriptionAr: 'كرواسون بصوص الكراميل', descriptionEn: 'Croissant with caramel sauce', price: 100, categoryAr: 'المخبوزات', categoryEn: 'Bakery' },
  { id: 'bk11', nameAr: 'كرواسون بسطرمة و جبنه', nameEn: 'Pastrami & Cheese Croissant', descriptionAr: 'كرواسون بالبسطرمة والجبنة', descriptionEn: 'Croissant with pastrami & cheese', price: 120, categoryAr: 'المخبوزات', categoryEn: 'Bakery' },
  { id: 'bk12', nameAr: 'كرواسون بيبروتى و موتزاريلا', nameEn: 'Pepperoni & Mozzarella Croissant', descriptionAr: 'كرواسون بالبيبروني والموتزاريلا', descriptionEn: 'Croissant with pepperoni & mozzarella', price: 110, categoryAr: 'المخبوزات', categoryEn: 'Bakery' },
  { id: 'bk13', nameAr: 'سيجار كرواسون باسترى كريم', nameEn: 'Cigar Croissant Pastry Cream', descriptionAr: 'سيجار كرواسون بكريمة الباستري', descriptionEn: 'Cigar croissant with pastry cream', price: 85, categoryAr: 'المخبوزات', categoryEn: 'Bakery' },
  { id: 'bk14', nameAr: 'سيجار كرواسون بلوبيرى', nameEn: 'Cigar Croissant Blueberry', descriptionAr: 'سيجار كرواسون بحشوة البلوبيري', descriptionEn: 'Cigar croissant with blueberry filling', price: 110, categoryAr: 'المخبوزات', categoryEn: 'Bakery' },
  { id: 'bk15', nameAr: 'سيجار كرواسون نوتيلا', nameEn: 'Cigar Croissant Nutella', descriptionAr: 'سيجار كرواسون بالنوتيلا', descriptionEn: 'Cigar croissant with Nutella', price: 100, categoryAr: 'المخبوزات', categoryEn: 'Bakery' },
  { id: 'bk16', nameAr: 'كرواسون سوبريم رول نوتيلا', nameEn: 'Supreme Roll Nutella', descriptionAr: 'رول كرواسون بالنوتيلا', descriptionEn: 'Supreme croissant roll with Nutella', price: 90, categoryAr: 'المخبوزات', categoryEn: 'Bakery' },
  { id: 'bk17', nameAr: 'كرواسون سوبريم رول لوتس', nameEn: 'Supreme Roll Lotus', descriptionAr: 'رول كرواسون باللوتس', descriptionEn: 'Supreme croissant roll with Lotus', price: 90, categoryAr: 'المخبوزات', categoryEn: 'Bakery' },
  { id: 'bk18', nameAr: 'كرواسون سوبريم رول كيدر', nameEn: 'Supreme Roll Kinder', descriptionAr: 'رول كرواسون بالكيندر', descriptionEn: 'Supreme croissant roll with Kinder', price: 110, categoryAr: 'المخبوزات', categoryEn: 'Bakery' },
  { id: 'bk19', nameAr: 'كرواسون سوبريم رول بيستاشيو', nameEn: 'Supreme Roll Pistachio', descriptionAr: 'رول كرواسون بالبيستاشيو', descriptionEn: 'Supreme croissant roll with Pistachio', price: 110, categoryAr: 'المخبوزات', categoryEn: 'Bakery' },
  { id: 'bk20', nameAr: 'فانيلا فلان كريم بورليه', nameEn: 'Vanilla Flan Crème Brûlée', descriptionAr: 'فلان فانيليا كريم بروليه فرنسي', descriptionEn: 'French vanilla flan crème brûlée', price: 100, categoryAr: 'المخبوزات', categoryEn: 'Bakery' },
  { id: 'bk21', nameAr: 'دانش كاسترد', nameEn: 'Danish Custard', descriptionAr: 'دانش بحشوة الكاسترد غني', descriptionEn: 'Danish pastry with rich custard', price: 85, categoryAr: 'المخبوزات', categoryEn: 'Bakery' },
  { id: 'bk22', nameAr: 'دانش جبنه', nameEn: 'Danish Cheese', descriptionAr: 'دانش بالجبنة الناعمة', descriptionEn: 'Danish pastry with cream cheese', price: 85, categoryAr: 'المخبوزات', categoryEn: 'Bakery' },
  { id: 'bk23', nameAr: 'دانش تفاح و قرفه', nameEn: 'Danish Apple & Cinnamon', descriptionAr: 'دانش بالتفاح والقرفة', descriptionEn: 'Danish pastry with apple & cinnamon', price: 90, categoryAr: 'المخبوزات', categoryEn: 'Bakery' },
  { id: 'bk24', nameAr: 'دانش فراوله', nameEn: 'Danish Strawberry', descriptionAr: 'دانش بالفراولة الفريش', descriptionEn: 'Danish pastry with strawberry', price: 90, categoryAr: 'المخبوزات', categoryEn: 'Bakery' },
  { id: 'bk25', nameAr: 'دانش توت مشكل', nameEn: 'Danish Mixed Berries', descriptionAr: 'دانش بالتوت المشكل', descriptionEn: 'Danish pastry with mixed berries', price: 95, categoryAr: 'المخبوزات', categoryEn: 'Bakery' },
  { id: 'bk26', nameAr: 'دانش مشمش', nameEn: 'Danish Apricot', descriptionAr: 'دانش بحشوة المشمش', descriptionEn: 'Danish pastry with apricot', price: 90, categoryAr: 'المخبوزات', categoryEn: 'Bakery' },
  { id: 'bk27', nameAr: 'دانش بيستاشيو و كاسترد', nameEn: 'Danish Pistachio & Custard', descriptionAr: 'دانش بالبيستاشيو والكاسترد', descriptionEn: 'Danish pastry with pistachio & custard', price: 120, categoryAr: 'المخبوزات', categoryEn: 'Bakery' },
  { id: 'bk28', nameAr: 'بان سويس شوكولاته باسترى كريم', nameEn: 'Pain Suisse Chocolate Pastry Cream', descriptionAr: 'بان سويس شوكولاتة وباستري كريم', descriptionEn: 'Pain suisse with chocolate & pastry cream', price: 85, categoryAr: 'المخبوزات', categoryEn: 'Bakery' },
  { id: 'bk29', nameAr: 'بان سويس بيستاشيو', nameEn: 'Pain Suisse Pistachio', descriptionAr: 'بان سويس بالبيستاشيو', descriptionEn: 'Pain suisse with pistachio', price: 120, categoryAr: 'المخبوزات', categoryEn: 'Bakery' },
  { id: 'bk30', nameAr: 'بان سويس لوتس', nameEn: 'Pain Suisse Lotus', descriptionAr: 'بان سويس باللوتس', descriptionEn: 'Pain suisse with Lotus', price: 90, categoryAr: 'المخبوزات', categoryEn: 'Bakery' },
  { id: 'bk31', nameAr: 'بان سويس فانيليا', nameEn: 'Pain Suisse Vanilla', descriptionAr: 'بان سويس بالفانيليا', descriptionEn: 'Pain suisse with vanilla', price: 85, categoryAr: 'المخبوزات', categoryEn: 'Bakery' },
  { id: 'bk32', nameAr: 'بان سويس كونت', nameEn: 'Pain Suisse Count', descriptionAr: 'بان سويس كونت فرنسي', descriptionEn: 'French pain suisse count', price: 95, categoryAr: 'المخبوزات', categoryEn: 'Bakery' },
  { id: 'bk33', nameAr: 'بان سويس تركى جبنه', nameEn: 'Pain Suisse Turkey & Cheese', descriptionAr: 'بان سويس بالتركي والجبنة', descriptionEn: 'Pain suisse with turkey & cheese', price: 90, categoryAr: 'المخبوزات', categoryEn: 'Bakery' },
  { id: 'bk34', nameAr: 'بان سويس بيبرونى', nameEn: 'Pain Suisse Pepperoni', descriptionAr: 'بان سويس بالبيبروني', descriptionEn: 'Pain suisse with pepperoni', price: 110, categoryAr: 'المخبوزات', categoryEn: 'Bakery' },
  { id: 'bk35', nameAr: 'بان سويس بسطرمه و جبنه', nameEn: 'Pain Suisse Pastrami & Cheese', descriptionAr: 'بان سويس بالبسطرمة والجبنة', descriptionEn: 'Pain suisse with pastrami & cheese', price: 120, categoryAr: 'المخبوزات', categoryEn: 'Bakery' },
  { id: 'bk36', nameAr: 'منقوشه زعتر', nameEn: 'Thyme Manakish', descriptionAr: 'منقوشة بالزعتر وزيت الزيتون', descriptionEn: 'Thyme & olive oil manakish', price: 80, categoryAr: 'المخبوزات', categoryEn: 'Bakery' },
  { id: 'bk37', nameAr: 'منقوشه جبنه', nameEn: 'Cheese Manakish', descriptionAr: 'منقوشة بالجبنة الشامي', descriptionEn: 'Cheese manakish', price: 85, categoryAr: 'المخبوزات', categoryEn: 'Bakery' },
  { id: 'bk38', nameAr: 'منقوشه ميكس تشيز', nameEn: 'Mix Cheese Manakish', descriptionAr: 'منقوشة بميكس الأجبان', descriptionEn: 'Mix cheese manakish', price: 90, categoryAr: 'المخبوزات', categoryEn: 'Bakery' },
  { id: 'bk39', nameAr: 'منقوشه بسطرمه و جبنه', nameEn: 'Pastrami & Cheese Manakish', descriptionAr: 'منقوشة بالبسطرمة والجبنة', descriptionEn: 'Pastrami & cheese manakish', price: 120, categoryAr: 'المخبوزات', categoryEn: 'Bakery' },
  { id: 'bk40', nameAr: 'منقوشه بيرونى و جبنه', nameEn: 'Pepperoni & Cheese Manakish', descriptionAr: 'منقوشة بالبيبروني والجبنة', descriptionEn: 'Pepperoni & cheese manakish', price: 120, categoryAr: 'المخبوزات', categoryEn: 'Bakery' },
  { id: 'bk41', nameAr: 'رول سوسيس', nameEn: 'Sausage Roll', descriptionAr: 'رول السوسيس المخبوز', descriptionEn: 'Baked sausage roll', price: 100, categoryAr: 'المخبوزات', categoryEn: 'Bakery' },
  { id: 'bk42', nameAr: 'سينابون كلاسيك', nameEn: 'Classic Cinnabon', descriptionAr: 'رول القرفة الكلاسيكي', descriptionEn: 'Classic cinnamon roll', price: 100, categoryAr: 'المخبوزات', categoryEn: 'Bakery' },
  { id: 'bk43', nameAr: 'سينابون كراميل', nameEn: 'Caramel Cinnabon', descriptionAr: 'سينابون مغطى بصوص الكراميل', descriptionEn: 'Cinnamon roll with caramel sauce', price: 110, categoryAr: 'المخبوزات', categoryEn: 'Bakery' },
  { id: 'bk44', nameAr: 'سينابون نوتيلا', nameEn: 'Nutella Cinnabon', descriptionAr: 'سينابون مغطى بالنوتيلا', descriptionEn: 'Cinnamon roll topped with Nutella', price: 110, categoryAr: 'المخبوزات', categoryEn: 'Bakery' },

  // مشروبات القهوة (Coffee Drinks)
  { id: 'cd1', nameAr: 'إسبريسو سنجل', nameEn: 'Single Espresso', descriptionAr: 'شوت إسبريسو غني طازج', descriptionEn: 'Single shot of fresh specialty espresso', price: 70, categoryAr: 'مشروبات القهوة', categoryEn: 'Coffee Drinks' },
  { id: 'cd2', nameAr: 'إسبريسو دابل', nameEn: 'Double Espresso', descriptionAr: 'دابل شوت إسبريسو غني', descriptionEn: 'Double shot of specialty espresso', price: 85, categoryAr: 'مشروبات القهوة', categoryEn: 'Coffee Drinks' },
  { id: 'cd3', nameAr: 'ماكياتو سنجل', nameEn: 'Single Macchiato', descriptionAr: 'إسبريسو سنجل مع نقطة فوم حليب', descriptionEn: 'Single espresso with milk foam spot', price: 80, categoryAr: 'مشروبات القهوة', categoryEn: 'Coffee Drinks' },
  { id: 'cd4', nameAr: 'ماكياتو دابل', nameEn: 'Double Macchiato', descriptionAr: 'إسبريسو دابل مع نقطة فوم حليب', descriptionEn: 'Double espresso with milk foam spot', price: 90, categoryAr: 'مشروبات القهوة', categoryEn: 'Coffee Drinks' },
  { id: 'cd5', nameAr: 'إسبريسو كون بانا', nameEn: 'Espresso Con Panna', descriptionAr: 'إسبريسو مع الكريمة المخفوقة', descriptionEn: 'Espresso topped with whipped cream', price: 90, categoryAr: 'مشروبات القهوة', categoryEn: 'Coffee Drinks' },
  { id: 'cd6', nameAr: 'إسبريسو أفوكادو', nameEn: 'Affogato Espresso', descriptionAr: 'إسبريسو مع آيس كريم فانيليا', descriptionEn: 'Espresso poured over vanilla ice cream', price: 90, categoryAr: 'مشروبات القهوة', categoryEn: 'Coffee Drinks' },
  { id: 'cd7', nameAr: 'كابتشينو', nameEn: 'Cappuccino', descriptionAr: 'إسبريسو مع فوم الحليب الكثيف', descriptionEn: 'Espresso with thick steamed milk foam', price: 95, categoryAr: 'مشروبات القهوة', categoryEn: 'Coffee Drinks' },
  { id: 'cd8', nameAr: 'فلات وايت', nameEn: 'Flat White', descriptionAr: 'دابل إسبريسو مع مايكروفوم الحليب', descriptionEn: 'Double shot espresso with microfoam milk', price: 105, categoryAr: 'مشروبات القهوة', categoryEn: 'Coffee Drinks' },
  { id: 'cd9', nameAr: 'كورتو', nameEn: 'Cortado', descriptionAr: 'إسبريسو متوازن بنسبة مساوية من الحليب', descriptionEn: 'Equal parts espresso and warm milk', price: 105, categoryAr: 'مشروبات القهوة', categoryEn: 'Coffee Drinks' },
  { id: 'cd10', nameAr: 'رياحين لاتيه', nameEn: 'Rayahen Signature Latte', descriptionAr: 'لاتيه مع فليفر آيريش كريم وفانيليا', descriptionEn: 'Latte infused with Irish cream & vanilla', price: 110, categoryAr: 'مشروبات القهوة', categoryEn: 'Coffee Drinks', badgeAr: 'توقيع رياحين', badgeEn: 'Signature' },
  { id: 'cd11', nameAr: 'سينابون أبل لاتيه', nameEn: 'Cinnabon Apple Latte', descriptionAr: 'لاتيه مع فليفر قرفة وتفاح', descriptionEn: 'Latte infused with cinnamon & apple', price: 110, categoryAr: 'مشروبات القهوة', categoryEn: 'Coffee Drinks' },
  { id: 'cd12', nameAr: 'ماتشا لاتيه', nameEn: 'Matcha Latte', descriptionAr: 'ماتشا يابانية فاخرة مع الحليب', descriptionEn: 'Premium Japanese matcha with milk', price: 105, categoryAr: 'مشروبات القهوة', categoryEn: 'Coffee Drinks' },
  { id: 'cd13', nameAr: 'موكا', nameEn: 'Caffè Mocha', descriptionAr: 'إسبريسو مع شوكولاتة وحليب', descriptionEn: 'Espresso blended with cocoa & milk', price: 105, categoryAr: 'مشروبات القهوة', categoryEn: 'Coffee Drinks' },
  { id: 'cd14', nameAr: 'وايت موكا كريم', nameEn: 'White Mocha Cream', descriptionAr: 'إسبريسو بشوكولاتة بيضاء وكريمة', descriptionEn: 'Espresso with white chocolate & cream', price: 125, categoryAr: 'مشروبات القهوة', categoryEn: 'Coffee Drinks' },
  { id: 'cd15', nameAr: 'أمريكان كوفي', nameEn: 'Americano Coffee', descriptionAr: 'إسبريسو مع ماء ساخن', descriptionEn: 'Espresso diluted with hot water', price: 120, categoryAr: 'مشروبات القهوة', categoryEn: 'Coffee Drinks' },
  { id: 'cd16', nameAr: 'نسكافيه', nameEn: 'Nescafe', descriptionAr: 'نسكافيه كلاسيك بالحليب', descriptionEn: 'Classic Nescafe with milk', price: 90, categoryAr: 'مشروبات القهوة', categoryEn: 'Coffee Drinks' },
  { id: 'cd17', nameAr: 'قهوة تركي سنجل', nameEn: 'Single Turkish Coffee', descriptionAr: 'قهوة تركية محمصة طازجاً', descriptionEn: 'Freshly roasted Turkish coffee', price: 50, categoryAr: 'مشروبات القهوة', categoryEn: 'Coffee Drinks' },
  { id: 'cd18', nameAr: 'قهوة تركي دابل', nameEn: 'Double Turkish Coffee', descriptionAr: 'دابل قهوة تركية', descriptionEn: 'Double shot Turkish coffee', price: 80, categoryAr: 'مشروبات القهوة', categoryEn: 'Coffee Drinks' },
  { id: 'cd19', nameAr: 'قهوة فرنساوي', nameEn: 'French Coffee', descriptionAr: 'قهوة تركية بالحليب', descriptionEn: 'Turkish coffee prepared with milk', price: 85, categoryAr: 'مشروبات القهوة', categoryEn: 'Coffee Drinks' },
  { id: 'cd20', nameAr: 'قهوة بندق', nameEn: 'Hazelnut Coffee', descriptionAr: 'قهوة بنكهة البندق الغنية', descriptionEn: 'Turkish coffee with hazelnut flavor', price: 90, categoryAr: 'مشروبات القهوة', categoryEn: 'Coffee Drinks' },
  { id: 'cd21', nameAr: 'قهوة نوتيلا', nameEn: 'Nutella Coffee', descriptionAr: 'قهوة بالنوتيلا', descriptionEn: 'Coffee blended with Nutella', price: 95, categoryAr: 'مشروبات القهوة', categoryEn: 'Coffee Drinks' },
  { id: 'cd22', nameAr: 'لاتيه', nameEn: 'Caffè Latte', descriptionAr: 'إسبريسو مع الحليب المبخر', descriptionEn: 'Espresso with steamed milk', price: 100, categoryAr: 'مشروبات القهوة', categoryEn: 'Coffee Drinks' },

  // مشروبات ساخنة (Hot Drinks)
  { id: 'hd1', nameAr: 'شاي', nameEn: 'Classic Red Tea', descriptionAr: 'شاي أحمر كلاسيك', descriptionEn: 'Classic red tea', price: 50, categoryAr: 'مشروبات ساخنة', categoryEn: 'Hot Drinks' },
  { id: 'hd2', nameAr: 'شاي أخضر', nameEn: 'Green Tea', descriptionAr: 'شاي أخضر طبيعي', descriptionEn: 'Natural green tea', price: 65, categoryAr: 'مشروبات ساخنة', categoryEn: 'Hot Drinks' },
  { id: 'hd3', nameAr: 'شاي فليفر', nameEn: 'Flavored Tea', descriptionAr: 'شاي بنكهات الفواكه من اختيارك', descriptionEn: 'Tea with fruit flavors of choice', price: 70, categoryAr: 'مشروبات ساخنة', categoryEn: 'Hot Drinks' },
  { id: 'hd4', nameAr: 'شاي كرك', nameEn: 'Karak Tea', descriptionAr: 'شاي كرك بالبهارات واللبن', descriptionEn: 'Spiced Karak tea with milk', price: 80, categoryAr: 'مشروبات ساخنة', categoryEn: 'Hot Drinks' },
  { id: 'hd5', nameAr: 'شاي حليب', nameEn: 'Tea with Milk', descriptionAr: 'شاي أحمر بالحليب', descriptionEn: 'Red tea with fresh milk', price: 70, categoryAr: 'مشروبات ساخنة', categoryEn: 'Hot Drinks' },
  { id: 'hd6', nameAr: 'شاي زردة', nameEn: 'Zarda Tea', descriptionAr: 'شاي زردة ثقيل بالطريقة التقليدية', descriptionEn: 'Traditional strong Zarda tea', price: 70, categoryAr: 'مشروبات ساخنة', categoryEn: 'Hot Drinks' },
  { id: 'hd7', nameAr: 'كلاسيك هوت شوكليت', nameEn: 'Classic Hot Chocolate', descriptionAr: 'شوكولاتة ساخنة بالحليب', descriptionEn: 'Rich hot chocolate with milk', price: 105, categoryAr: 'مشروبات ساخنة', categoryEn: 'Hot Drinks' },
  { id: 'hd8', nameAr: 'هوت شوكليت مارشميلو', nameEn: 'Hot Chocolate Marshmallow', descriptionAr: 'هوت شوكليت مع قطع المارشملو', descriptionEn: 'Hot chocolate topped with marshmallows', price: 125, categoryAr: 'مشروبات ساخنة', categoryEn: 'Hot Drinks' },
  { id: 'hd9', nameAr: 'وايت هوت شوكليت', nameEn: 'White Hot Chocolate', descriptionAr: 'شوكولاتة بيضاء ساخنة', descriptionEn: 'Creamy white hot chocolate', price: 105, categoryAr: 'مشروبات ساخنة', categoryEn: 'Hot Drinks' },
  { id: 'hd10', nameAr: 'هوت سيدر', nameEn: 'Hot Apple Cider', descriptionAr: 'عصير تفاح ساخن مع القرفة', descriptionEn: 'Hot apple juice infused with cinnamon', price: 90, categoryAr: 'مشروبات ساخنة', categoryEn: 'Hot Drinks' },
  { id: 'hd11', nameAr: 'سحلب', nameEn: 'Traditional Sahlab', descriptionAr: 'سحلب ساخن بالمكسرات والقرفة', descriptionEn: 'Warm sahlab topped with nuts & cinnamon', price: 110, categoryAr: 'مشروبات ساخنة', categoryEn: 'Hot Drinks' },
  { id: 'hd12', nameAr: 'كوكتيل أعشاب', nameEn: 'Herbal Cocktail', descriptionAr: 'يانسون، نعناع، ليمون، عسل، قرفة', descriptionEn: 'Anise, mint, lemon, honey & cinnamon', price: 90, categoryAr: 'مشروبات ساخنة', categoryEn: 'Hot Drinks' },
  { id: 'hd13', nameAr: 'أعشاب رياحين', nameEn: 'Rayahen Immunity Herbs', descriptionAr: 'برتقال فريش، زنجبيل فريش، قرفة، عسل', descriptionEn: 'Fresh orange, fresh ginger, cinnamon & honey', price: 105, categoryAr: 'مشروبات ساخنة', categoryEn: 'Hot Drinks', badgeAr: 'مناعة', badgeEn: 'Immunity' },
  { id: 'hd14', nameAr: 'أعشاب (باكيت من اختيارك)', nameEn: 'Herbal Tea Bag Choice', descriptionAr: 'باكيت من اختيارك', descriptionEn: 'Herbal tea bag of your choice', price: 70, categoryAr: 'مشروبات ساخنة', categoryEn: 'Hot Drinks' },
  { id: 'hd15', nameAr: 'هوت شوكليت أوريو', nameEn: 'Hot Chocolate Oreo', descriptionAr: 'هوت شوكليت مع قطع أوريو', descriptionEn: 'Hot chocolate blended with crushed Oreo', price: 125, categoryAr: 'مشروبات ساخنة', categoryEn: 'Hot Drinks' },

  // ميلك شيك وسموزي (Milkshakes & Smoothies)
  { id: 'ms1', nameAr: 'ميلك شيك فانيليا', nameEn: 'Vanilla Milkshake', descriptionAr: 'ميلك شيك فانيليا كريمي', descriptionEn: 'Creamy vanilla milkshake', price: 105, categoryAr: 'ميلك شيك وسموزي', categoryEn: 'Milkshakes & Smoothies' },
  { id: 'ms2', nameAr: 'ميلك شيك شوكليت', nameEn: 'Chocolate Milkshake', descriptionAr: 'ميلك شيك شوكولاتة', descriptionEn: 'Decadent chocolate milkshake', price: 105, categoryAr: 'ميلك شيك وسموزي', categoryEn: 'Milkshakes & Smoothies' },
  { id: 'ms3', nameAr: 'ميلك شيك مانجو', nameEn: 'Mango Milkshake', descriptionAr: 'ميلك شيك مانجو طبيعي', descriptionEn: 'Fresh mango milkshake', price: 105, categoryAr: 'ميلك شيك وسموزي', categoryEn: 'Milkshakes & Smoothies' },
  { id: 'ms4', nameAr: 'ميلك شيك فراولة', nameEn: 'Strawberry Milkshake', descriptionAr: 'ميلك شيك فراولة', descriptionEn: 'Fresh strawberry milkshake', price: 105, categoryAr: 'ميلك شيك وسموزي', categoryEn: 'Milkshakes & Smoothies' },
  { id: 'ms5', nameAr: 'ميلك شيك أوريو', nameEn: 'Oreo Milkshake', descriptionAr: 'ميلك شيك أوريو بقطع الأوريو', descriptionEn: 'Oreo milkshake with crushed biscuits', price: 125, categoryAr: 'ميلك شيك وسموزي', categoryEn: 'Milkshakes & Smoothies' },
  { id: 'ms6', nameAr: 'ميلك شيك زبادي توت', nameEn: 'Yogurt Berry Milkshake', descriptionAr: 'ميلك شيك زبادي مع التوت', descriptionEn: 'Yogurt milkshake with mixed berries', price: 110, categoryAr: 'ميلك شيك وسموزي', categoryEn: 'Milkshakes & Smoothies' },
  { id: 'ms7', nameAr: 'ميلك شيك لوتس', nameEn: 'Lotus Milkshake', descriptionAr: 'ميلك شيك بزبدة اللوتس', descriptionEn: 'Milkshake with Lotus Biscoff spread', price: 110, categoryAr: 'ميلك شيك وسموزي', categoryEn: 'Milkshakes & Smoothies' },
  { id: 'ms8', nameAr: 'ميلك شيك نوتيلا', nameEn: 'Nutella Milkshake', descriptionAr: 'ميلك شيك بالنوتيلا', descriptionEn: 'Rich Nutella milkshake', price: 110, categoryAr: 'ميلك شيك وسموزي', categoryEn: 'Milkshakes & Smoothies' },
  { id: 'ms9', nameAr: 'ميلك شيك كراميل', nameEn: 'Caramel Milkshake', descriptionAr: 'ميلك شيك بصوص الكراميل', descriptionEn: 'Creamy caramel milkshake', price: 110, categoryAr: 'ميلك شيك وسموزي', categoryEn: 'Milkshakes & Smoothies' },
  { id: 'ms10', nameAr: 'ميلك شيك بلوبيري', nameEn: 'Blueberry Milkshake', descriptionAr: 'ميلك شيك بالبلوبيري', descriptionEn: 'Blueberry milkshake', price: 110, categoryAr: 'ميلك شيك وسموزي', categoryEn: 'Milkshakes & Smoothies' },
  { id: 'ms11', nameAr: 'ميلك شيك مستكة', nameEn: 'Mastic Milkshake', descriptionAr: 'ميلك شيك بنكهة المستكة اليونانية', descriptionEn: 'Traditional Greek mastic flavored milkshake', price: 125, categoryAr: 'ميلك شيك وسموزي', categoryEn: 'Milkshakes & Smoothies' },
  { id: 'ms12', nameAr: 'ميلك شيك ماتشا', nameEn: 'Matcha Milkshake', descriptionAr: 'ميلك شيك الماتشا الفاخرة', descriptionEn: 'Premium Japanese matcha milkshake', price: 125, categoryAr: 'ميلك شيك وسموزي', categoryEn: 'Milkshakes & Smoothies' },
  { id: 'ms13', nameAr: 'سموزي مانجو', nameEn: 'Mango Smoothie', descriptionAr: 'سموزي مانجو فريش مثلج', descriptionEn: 'Refreshing icy mango smoothie', price: 110, categoryAr: 'ميلك شيك وسموزي', categoryEn: 'Milkshakes & Smoothies' },
  { id: 'ms14', nameAr: 'سموزي فراولة', nameEn: 'Strawberry Smoothie', descriptionAr: 'سموزي فراولة فريش مثلج', descriptionEn: 'Icy strawberry smoothie', price: 110, categoryAr: 'ميلك شيك وسموزي', categoryEn: 'Milkshakes & Smoothies' },
  { id: 'ms15', nameAr: 'سموزي بلوبيري', nameEn: 'Blueberry Smoothie', descriptionAr: 'سموزي بلوبيري', descriptionEn: 'Blueberry icy smoothie', price: 110, categoryAr: 'ميلك شيك وسموزي', categoryEn: 'Milkshakes & Smoothies' },
  { id: 'ms16', nameAr: 'سموزي بطيخ', nameEn: 'Watermelon Smoothie', descriptionAr: 'سموزي بطيخ طبيعي', descriptionEn: 'Fresh watermelon smoothie', price: 110, categoryAr: 'ميلك شيك وسموزي', categoryEn: 'Milkshakes & Smoothies' },
  { id: 'ms17', nameAr: 'سموزي كولا', nameEn: 'Cola Smoothie', descriptionAr: 'سموزي الكولا المنعش', descriptionEn: 'Refreshing icy cola smoothie', price: 110, categoryAr: 'ميلك شيك وسموزي', categoryEn: 'Milkshakes & Smoothies' },
  { id: 'ms18', nameAr: 'سموزي باشون فروت', nameEn: 'Passion Fruit Smoothie', descriptionAr: 'سموزي باشون فروت استوائي', descriptionEn: 'Tropical passion fruit smoothie', price: 110, categoryAr: 'ميلك شيك وسموزي', categoryEn: 'Milkshakes & Smoothies' },
  { id: 'ms19', nameAr: 'سموزي ليمون', nameEn: 'Lemon Smoothie', descriptionAr: 'سموزي ليمون فريش', descriptionEn: 'Fresh icy lemon smoothie', price: 95, categoryAr: 'ميلك شيك وسموزي', categoryEn: 'Milkshakes & Smoothies' },
  { id: 'ms20', nameAr: 'سموزي ليمون نعناع', nameEn: 'Mint Lemonade Smoothie', descriptionAr: 'سموزي ليمون بالنعناع', descriptionEn: 'Mint lemonade icy smoothie', price: 100, categoryAr: 'ميلك شيك وسموزي', categoryEn: 'Milkshakes & Smoothies' },
  { id: 'ms21', nameAr: 'سموزي جرين أبل', nameEn: 'Green Apple Smoothie', descriptionAr: 'سموزي التفاح الأخضر', descriptionEn: 'Green apple smoothie', price: 100, categoryAr: 'ميلك شيك وسموزي', categoryEn: 'Milkshakes & Smoothies' },
  { id: 'ms22', nameAr: 'سموزي كيوي أبل منت', nameEn: 'Kiwi Apple Mint Smoothie', descriptionAr: 'سموزي كيوي وتفاح ونعناع', descriptionEn: 'Kiwi, green apple & fresh mint smoothie', price: 130, categoryAr: 'ميلك شيك وسموزي', categoryEn: 'Milkshakes & Smoothies' },
  { id: 'ms23', nameAr: 'سموزي راس بيري', nameEn: 'Raspberry Smoothie', descriptionAr: 'سموزي التوت الأحمر', descriptionEn: 'Red raspberry smoothie', price: 110, categoryAr: 'ميلك شيك وسموزي', categoryEn: 'Milkshakes & Smoothies' },

  // فرابيه وآيس كوفي (Frappes & Iced Coffee)
  { id: 'fc1', nameAr: 'فرابيه ماتشا', nameEn: 'Matcha Frappé', descriptionAr: 'ماتشا مثلجة مفقوقة مع الكريمة', descriptionEn: 'Blended icy matcha frappe with cream', price: 125, categoryAr: 'فرابيه وآيس كوفي', categoryEn: 'Frappes & Iced Coffee' },
  { id: 'fc2', nameAr: 'فرابيه أوريو', nameEn: 'Oreo Frappé', descriptionAr: 'فرابيه مثلج بقطع الأوريو والكريمة', descriptionEn: 'Blended Oreo frappe with whipped cream', price: 125, categoryAr: 'فرابيه وآيس كوفي', categoryEn: 'Frappes & Iced Coffee' },
  { id: 'fc3', nameAr: 'فرابيه كلاسيك', nameEn: 'Classic Coffee Frappé', descriptionAr: 'فرابيه قهوة مثلج كلاسيك', descriptionEn: 'Classic blended icy coffee frappe', price: 110, categoryAr: 'فرابيه وآيس كوفي', categoryEn: 'Frappes & Iced Coffee' },
  { id: 'fc4', nameAr: 'فرابيه شوكليت', nameEn: 'Chocolate Frappé', descriptionAr: 'فرابيه شوكولاتة مثلج', descriptionEn: 'Blended chocolate frappe', price: 110, categoryAr: 'فرابيه وآيس كوفي', categoryEn: 'Frappes & Iced Coffee' },
  { id: 'fc5', nameAr: 'فرابيه كراميل', nameEn: 'Caramel Frappé', descriptionAr: 'فرابيه كراميل مثلج', descriptionEn: 'Blended caramel frappe', price: 110, categoryAr: 'فرابيه وآيس كوفي', categoryEn: 'Frappes & Iced Coffee' },
  { id: 'fc6', nameAr: 'فرابيه سولتيد كراميل', nameEn: 'Salted Caramel Frappé', descriptionAr: 'فرابيه كراميل مملح', descriptionEn: 'Blended salted caramel frappe', price: 120, categoryAr: 'فرابيه وآيس كوفي', categoryEn: 'Frappes & Iced Coffee' },
  { id: 'fc7', nameAr: 'آيس لاتيه', nameEn: 'Iced Caffè Latte', descriptionAr: 'إسبريسو بارد مع الحليب والثلج', descriptionEn: 'Chilled espresso with cold milk & ice', price: 105, categoryAr: 'فرابيه وآيس كوفي', categoryEn: 'Frappes & Iced Coffee' },
  { id: 'fc8', nameAr: 'آيس كابتشينو', nameEn: 'Iced Cappuccino', descriptionAr: 'كابتشينو بارد مع فوم الحليب', descriptionEn: 'Chilled cappuccino with cold foam', price: 105, categoryAr: 'فرابيه وآيس كوفي', categoryEn: 'Frappes & Iced Coffee' },
  { id: 'fc9', nameAr: 'آيس موكا', nameEn: 'Iced Caffè Mocha', descriptionAr: 'موكا باردة بالشوكولاتة والثلج', descriptionEn: 'Chilled espresso with chocolate & milk', price: 110, categoryAr: 'فرابيه وآيس كوفي', categoryEn: 'Frappes & Iced Coffee' },
  { id: 'fc10', nameAr: 'آيس سبانش لاتيه', nameEn: 'Iced Spanish Latte', descriptionAr: 'سبانش لاتيه بارد مع الحليب المحلى', descriptionEn: 'Chilled espresso with sweetened milk', price: 125, categoryAr: 'فرابيه وآيس كوفي', categoryEn: 'Frappes & Iced Coffee', badgeAr: 'الأكثر مبيعاً', badgeEn: 'Best Seller' },
  { id: 'fc11', nameAr: 'آيس ماتشا لاتيه', nameEn: 'Iced Matcha Latte', descriptionAr: 'ماتشا باردة مع الحليب والثلج', descriptionEn: 'Chilled Japanese matcha with cold milk', price: 125, categoryAr: 'فرابيه وآيس كوفي', categoryEn: 'Frappes & Iced Coffee' },
  { id: 'fc12', nameAr: 'آيس كراميل ماكياتو', nameEn: 'Iced Caramel Macchiato', descriptionAr: 'إسبريسو بارد مع فليفر الكراميل', descriptionEn: 'Chilled espresso with vanilla & caramel drizzle', price: 125, categoryAr: 'فرابيه وآيس كوفي', categoryEn: 'Frappes & Iced Coffee' },
  { id: 'fc13', nameAr: 'آيس أمريكانو', nameEn: 'Iced Americano', descriptionAr: 'إسبريسو بارد مع ماء مثلج', descriptionEn: 'Chilled espresso over cold water & ice', price: 100, categoryAr: 'فرابيه وآيس كوفي', categoryEn: 'Frappes & Iced Coffee' },
  { id: 'fc14', nameAr: 'آيس ماتشا', nameEn: 'Iced Pure Matcha', descriptionAr: 'ماتشا مثلجة خافية بدون حليب', descriptionEn: 'Chilled pure matcha over ice', price: 110, categoryAr: 'فرابيه وآيس كوفي', categoryEn: 'Frappes & Iced Coffee' },

  // ناتس وبابلز (Nuts & Bubbles)
  { id: 'nb1', nameAr: 'بستاشيو لاتيه', nameEn: 'Pistachio Latte', descriptionAr: 'لاتيه مع صوص بستاشيو وكريمة وفستق مجروش', descriptionEn: 'Latte with pistachio sauce, cream & crushed pistachios', price: 135, categoryAr: 'ناتس وبابلز', categoryEn: 'Nuts & Bubbles', badgeAr: 'فاخر', badgeEn: 'Luxury' },
  { id: 'nb2', nameAr: 'موكا ناتس', nameEn: 'Mocha Nuts', descriptionAr: 'موكا مع فليفر بندق وكريمة وبندق مجروش', descriptionEn: 'Mocha with hazelnut syrup, cream & crushed hazelnuts', price: 125, categoryAr: 'ناتس وبابلز', categoryEn: 'Nuts & Bubbles' },
  { id: 'nb3', nameAr: 'هوت شوكليت بندق', nameEn: 'Hazelnut Hot Chocolate', descriptionAr: 'هوت شوكليت مع البندق والمكسرات', descriptionEn: 'Hot chocolate infused with hazelnut & nuts', price: 125, categoryAr: 'ناتس وبابلز', categoryEn: 'Nuts & Bubbles' },
  { id: 'nb4', nameAr: 'هوت شوكليت أوريو ناتس', nameEn: 'Oreo Nuts Hot Chocolate', descriptionAr: 'هوت شوكليت مع أوريو ومكسرات', descriptionEn: 'Hot chocolate with Oreo & crushed nuts', price: 125, categoryAr: 'ناتس وبابلز', categoryEn: 'Nuts & Bubbles' },
  { id: 'nb5', nameAr: 'هوت شوكليت تيراميسو', nameEn: 'Tiramisu Hot Chocolate', descriptionAr: 'هوت شوكليت بنكهة التيراميسو والقهوة', descriptionEn: 'Hot chocolate infused with tiramisu flavor', price: 140, categoryAr: 'ناتس وبابلز', categoryEn: 'Nuts & Bubbles' },
  { id: 'nb6', nameAr: 'بستاشيو (طبق أفوكادو وفستق)', nameEn: 'Pistachio Avocado Bowl', descriptionAr: 'أفوكادو، موز، آيس فستق إيطالي، مكسرات، عسل', descriptionEn: 'Avocado, banana, Italian pistachio ice cream, nuts & honey', price: 150, categoryAr: 'ناتس وبابلز', categoryEn: 'Nuts & Bubbles', badgeAr: 'سوبر غني', badgeEn: 'Super Rich' },
  { id: 'nb7', nameAr: 'تاهيتي', nameEn: 'Tahiti Bowl', descriptionAr: 'أفوكادو، مانجو، مكسرات، عسل', descriptionEn: 'Avocado, mango, nuts & honey', price: 150, categoryAr: 'ناتس وبابلز', categoryEn: 'Nuts & Bubbles' },
  { id: 'nb8', nameAr: 'أفوناتس', nameEn: 'Avonuts Bowl', descriptionAr: 'أفوكادو، كيوي، مكسرات، عسل', descriptionEn: 'Avocado, kiwi, nuts & honey', price: 150, categoryAr: 'ناتس وبابلز', categoryEn: 'Nuts & Bubbles' },
  { id: 'nb9', nameAr: 'ميلك شيك فستق', nameEn: 'Pistachio Milkshake', descriptionAr: 'ميلك شيك بالفستق الإيطالي والمكسرات', descriptionEn: 'Milkshake with Italian pistachio & nuts', price: 140, categoryAr: 'ناتس وبابلز', categoryEn: 'Nuts & Bubbles' },
  { id: 'nb10', nameAr: 'ميلك شيك مكسرات', nameEn: 'Mixed Nuts Milkshake', descriptionAr: 'ميلك شيك بميكس المكسرات المحمصة والعسل', descriptionEn: 'Milkshake loaded with mixed roasted nuts & honey', price: 140, categoryAr: 'ناتس وبابلز', categoryEn: 'Nuts & Bubbles' },
  { id: 'nb11', nameAr: 'مانجو بابلز', nameEn: 'Mango Bubbles', descriptionAr: 'مانجو فريش مع كرات البابلز المنعشة', descriptionEn: 'Fresh mango with popping boba bubbles', price: 110, categoryAr: 'ناتس وبابلز', categoryEn: 'Nuts & Bubbles' },
  { id: 'nb12', nameAr: 'كولد بابلز', nameEn: 'Cold Bubbles Soda', descriptionAr: 'صودا باردة مع كرات البابلز', descriptionEn: 'Chilled soda with boba bubbles', price: 110, categoryAr: 'ناتس وبابلز', categoryEn: 'Nuts & Bubbles' },
  { id: 'nb13', nameAr: 'يوجارت بيري بابلز', nameEn: 'Yogurt Berry Bubbles', descriptionAr: 'زبادي بالتوت مع كرات البابلز', descriptionEn: 'Berry yogurt drink with popping boba', price: 125, categoryAr: 'ناتس وبابلز', categoryEn: 'Nuts & Bubbles' },
  { id: 'nb14', nameAr: 'تروبيكال بابلز', nameEn: 'Tropical Bubbles', descriptionAr: 'عصير استوائي مع كرات البابلز', descriptionEn: 'Tropical juice with popping boba bubbles', price: 125, categoryAr: 'ناتس وبابلز', categoryEn: 'Nuts & Bubbles' },
  { id: 'nb15', nameAr: 'ماتشا بابلز', nameEn: 'Matcha Bubbles', descriptionAr: 'ماتشا مثلجة مع كرات البابلز', descriptionEn: 'Iced matcha with boba bubbles', price: 130, categoryAr: 'ناتس وبابلز', categoryEn: 'Nuts & Bubbles' },
  { id: 'nb16', nameAr: 'آيس تي بابلز', nameEn: 'Iced Tea Bubbles', descriptionAr: 'آيس تي مثلج مع كرات البابلز', descriptionEn: 'Iced tea with popping boba bubbles', price: 105, categoryAr: 'ناتس وبابلز', categoryEn: 'Nuts & Bubbles' },
  { id: 'nb17', nameAr: 'موهيتو بابل', nameEn: 'Mojito Bubbles', descriptionAr: 'موهيتو منعش مع كرات البابلز', descriptionEn: 'Refreshing mojito with popping boba', price: 125, categoryAr: 'ناتس وبابلز', categoryEn: 'Nuts & Bubbles' },
  { id: 'nb18', nameAr: 'ريدبل بابلز', nameEn: 'Red Bull Bubbles', descriptionAr: 'ريدبول مثلج مع كرات البابلز', descriptionEn: 'Red Bull energy drink with popping boba', price: 150, categoryAr: 'ناتس وبابلز', categoryEn: 'Nuts & Bubbles' },

  // كوكتيل فريش وصودا (Cocktails & Soda)
  { id: 'cs1', nameAr: 'فلوريدا', nameEn: 'Florida Cocktail', descriptionAr: 'مانجو، فراولة، موز', descriptionEn: 'Fresh mango, strawberry & banana', price: 110, categoryAr: 'كوكتيل فريش وصودا', categoryEn: 'Cocktails & Soda' },
  { id: 'cs2', nameAr: 'صن شاين', nameEn: 'Sunshine Mojito', descriptionAr: 'سفن، نعناع، شرائح ليمون، نعناع فريش', descriptionEn: '7Up, mint, lemon slices & fresh mint leaves', price: 105, categoryAr: 'كوكتيل فريش وصودا', categoryEn: 'Cocktails & Soda' },
  { id: 'cs3', nameAr: 'مانجو كيوي', nameEn: 'Mango Kiwi Cocktail', descriptionAr: 'عصير مانجو فريش مع قطع الكيوي', descriptionEn: 'Fresh mango juice with kiwi slices', price: 125, categoryAr: 'كوكتيل فريش وصودا', categoryEn: 'Cocktails & Soda' },
  { id: 'cs4', nameAr: 'زبادي عسل', nameEn: 'Yogurt with Honey', descriptionAr: 'مشروب الزبادي الطبيعي بالعسل', descriptionEn: 'Fresh yogurt drink with natural honey', price: 100, categoryAr: 'كوكتيل فريش وصودا', categoryEn: 'Cocktails & Soda' },
  { id: 'cs5', nameAr: 'زبادي فواكه', nameEn: 'Fruit Yogurt Drink', descriptionAr: 'زبادي مع عصائر فواكه فريش', descriptionEn: 'Fresh yogurt with natural fruit juices', price: 125, categoryAr: 'كوكتيل فريش وصودا', categoryEn: 'Cocktails & Soda' },
  { id: 'cs6', nameAr: 'ريد بول إنرجي', nameEn: 'Red Bull Energy Shot', descriptionAr: 'ريد بول، إسبريسو، آيريش كريم', descriptionEn: 'Red Bull energy drink, espresso shot & Irish cream', price: 150, categoryAr: 'كوكتيل فريش وصودا', categoryEn: 'Cocktails & Soda', badgeAr: 'طاقة مضاعفة', badgeEn: 'Double Energy' },

  // عصائر فريش (Fresh Juices)
  { id: 'fj1', nameAr: 'برتقال', nameEn: 'Fresh Orange Juice', descriptionAr: 'عصير برتقال طبيعي فريش 100%', descriptionEn: '100% fresh squeezed orange juice', price: 85, categoryAr: 'عصائر فريش', categoryEn: 'Fresh Juices' },
  { id: 'fj2', nameAr: 'مانجو', nameEn: 'Fresh Mango Juice', descriptionAr: 'عصير مانجو فريش طبيعي', descriptionEn: 'Fresh natural mango juice', price: 100, categoryAr: 'عصائر فريش', categoryEn: 'Fresh Juices' },
  { id: 'fj3', nameAr: 'فراولة', nameEn: 'Fresh Strawberry Juice', descriptionAr: 'عصير فراولة طبيعي', descriptionEn: 'Fresh strawberry juice', price: 90, categoryAr: 'عصائر فريش', categoryEn: 'Fresh Juices' },
  { id: 'fj4', nameAr: 'جوافة', nameEn: 'Fresh Guava Juice', descriptionAr: 'عصير جوافة فريش', descriptionEn: 'Fresh guava juice', price: 90, categoryAr: 'عصائر فريش', categoryEn: 'Fresh Juices' },
  { id: 'fj5', nameAr: 'رمان', nameEn: 'Fresh Pomegranate Juice', descriptionAr: 'عصير رمان فريش', descriptionEn: 'Fresh pomegranate juice', price: 90, categoryAr: 'عصائر فريش', categoryEn: 'Fresh Juices' },
  { id: 'fj6', nameAr: 'ليمون', nameEn: 'Fresh Lemon Juice', descriptionAr: 'عصير ليمون طبيعي', descriptionEn: 'Fresh lemon juice', price: 70, categoryAr: 'عصائر فريش', categoryEn: 'Fresh Juices' },
  { id: 'fj7', nameAr: 'بطيخ', nameEn: 'Fresh Watermelon Juice', descriptionAr: 'عصير بطيخ فريش', descriptionEn: 'Fresh watermelon juice', price: 90, categoryAr: 'عصائر فريش', categoryEn: 'Fresh Juices' },
  { id: 'fj8', nameAr: 'كيوي', nameEn: 'Fresh Kiwi Juice', descriptionAr: 'عصير كيوي فريش طبيعي', descriptionEn: 'Fresh kiwi juice', price: 165, categoryAr: 'عصائر فريش', categoryEn: 'Fresh Juices' },
  { id: 'fj9', nameAr: 'ليمون نعناع', nameEn: 'Fresh Lemon Mint Juice', descriptionAr: 'عصير ليمون بالنعناع الفريش', descriptionEn: 'Fresh lemon mint juice', price: 80, categoryAr: 'عصائر فريش', categoryEn: 'Fresh Juices' },
  { id: 'fj10', nameAr: 'بطيخ نعناع', nameEn: 'Watermelon Mint Juice', descriptionAr: 'عصير بطيخ بالنعناع الفريش', descriptionEn: 'Fresh watermelon juice with mint', price: 105, categoryAr: 'عصائر فريش', categoryEn: 'Fresh Juices' },
  { id: 'fj11', nameAr: 'برتقال نعناع', nameEn: 'Orange Mint Juice', descriptionAr: 'عصير برتقال بالنعناع الفريش', descriptionEn: 'Fresh orange juice with mint', price: 95, categoryAr: 'عصائر فريش', categoryEn: 'Fresh Juices' },
  { id: 'fj12', nameAr: 'زبادي', nameEn: 'Fresh Yogurt Drink', descriptionAr: 'مشروب زبادي طبيعي', descriptionEn: 'Fresh natural yogurt drink', price: 105, categoryAr: 'عصائر فريش', categoryEn: 'Fresh Juices' },
  { id: 'fj13', nameAr: 'أفوكادو', nameEn: 'Fresh Avocado Juice', descriptionAr: 'عصير أفوكادو فريش بالعسل والمكسرات', descriptionEn: 'Fresh avocado blended with honey & nuts', price: 165, categoryAr: 'عصائر فريش', categoryEn: 'Fresh Juices' },

  // الحلو (Desserts)
  { id: 'ds1', nameAr: 'مولتن', nameEn: 'Molten Cake', descriptionAr: 'مولتن كيك الشوكولاتة الدافئة', descriptionEn: 'Warm chocolate molten lava cake', price: 110, categoryAr: 'الحلو', categoryEn: 'Desserts' },
  { id: 'ds2', nameAr: 'براونيز', nameEn: 'Chocolate Brownie', descriptionAr: 'براونيز الشوكولاتة الغنية', descriptionEn: 'Fudgy chocolate brownie', price: 105, categoryAr: 'الحلو', categoryEn: 'Desserts' },
  { id: 'ds3', nameAr: 'تشيز كيك', nameEn: 'Cheesecake', descriptionAr: 'تشيز كيك كلاسيك', descriptionEn: 'Classic cheesecake', price: 105, categoryAr: 'الحلو', categoryEn: 'Desserts' },
  { id: 'ds4', nameAr: 'كيك فستق', nameEn: 'Pistachio Cake', descriptionAr: 'كيك الفستق الإيطالي', descriptionEn: 'Pistachio cake slice', price: 125, categoryAr: 'الحلو', categoryEn: 'Desserts' },
  { id: 'ds5', nameAr: 'ريد فلفيت', nameEn: 'Red Velvet Cake', descriptionAr: 'كيك ريد فلفيت الكلاسيكي', descriptionEn: 'Red velvet cake slice', price: 110, categoryAr: 'الحلو', categoryEn: 'Desserts' },
  { id: 'ds6', nameAr: 'فادج', nameEn: 'Chocolate Fudge Cake', descriptionAr: 'كيك شوكولاتة فادج غني', descriptionEn: 'Rich chocolate fudge cake', price: 110, categoryAr: 'الحلو', categoryEn: 'Desserts' },
  { id: 'ds7', nameAr: 'كيك رياحين', nameEn: 'Rayahen Signature Cake', descriptionAr: 'كيكة رياحين المتميزة الخاصة', descriptionEn: 'Rayahen special house cake', price: 100, categoryAr: 'الحلو', categoryEn: 'Desserts', badgeAr: 'خاص برياحين', badgeEn: 'Special' },
  { id: 'ds8', nameAr: 'كوب جاك', nameEn: 'Jack Cup Dessert', descriptionAr: 'حلوى كوب جاك الغنية', descriptionEn: 'Jack cup dessert blend', price: 110, categoryAr: 'الحلو', categoryEn: 'Desserts' },
  { id: 'ds9', nameAr: 'فروت سلاد', nameEn: 'Fresh Fruit Salad', descriptionAr: 'سلطة فواكه موسمية طازجة', descriptionEn: 'Fresh seasonal fruit salad', price: 100, categoryAr: 'الحلو', categoryEn: 'Desserts' },
  { id: 'ds10', nameAr: 'وافل وتش', nameEn: 'Waffle-Witch', descriptionAr: 'وافل وتش محشو ومغطى بالشوكولاتة', descriptionEn: 'Waffle-witch loaded with chocolate', price: 125, categoryAr: 'الحلو', categoryEn: 'Desserts' },
  { id: 'ds11', nameAr: 'وافل', nameEn: 'Classic Belgian Waffle', descriptionAr: 'وافل بلجيكي دافئ مع الصوصات', descriptionEn: 'Warm Belgian waffle with toppings', price: 125, categoryAr: 'الحلو', categoryEn: 'Desserts' },
  { id: 'ds12', nameAr: 'كوكيز', nameEn: 'Fresh Cookies', descriptionAr: 'كوكيز الشوكولاتة الطازج', descriptionEn: 'Freshly baked chocolate chip cookie', price: 70, categoryAr: 'الحلو', categoryEn: 'Desserts' },
  { id: 'ds13', nameAr: 'براونيز مكسرات', nameEn: 'Nuts Brownie', descriptionAr: 'براونيز بالشوكولاتة والمكسرات', descriptionEn: 'Chocolate brownie topped with nuts', price: 110, categoryAr: 'الحلو', categoryEn: 'Desserts' },
  { id: 'ds14', nameAr: 'براونيز أوريو', nameEn: 'Oreo Brownie', descriptionAr: 'براونيز بقطع الأوريو', descriptionEn: 'Chocolate brownie with Oreo', price: 100, categoryAr: 'الحلو', categoryEn: 'Desserts' },
  { id: 'ds15', nameAr: 'كوكيز باي نوتيلا', nameEn: 'Nutella Cookie Pie', descriptionAr: 'كوكيز بايي محشو بالنوتيلا', descriptionEn: 'Cookie pie stuffed with Nutella', price: 95, categoryAr: 'الحلو', categoryEn: 'Desserts' },
  { id: 'ds16', nameAr: 'بطاطا', nameEn: 'Baked Sweet Potato', descriptionAr: 'بطاطا حلوة مشوية ومزينة', descriptionEn: 'Baked sweet potato with toppings', price: 85, categoryAr: 'الحلو', categoryEn: 'Desserts' },
  { id: 'ds17', nameAr: 'كيك سيكولاته', nameEn: 'Chocolate Layer Cake', descriptionAr: 'كيك شوكولاتة هشة', descriptionEn: 'Fluffy chocolate cake', price: 100, categoryAr: 'الحلو', categoryEn: 'Desserts' },
  { id: 'ds18', nameAr: 'كيك جزر', nameEn: 'Carrot Cake', descriptionAr: 'كيك الجزر بالجوز والقرفة', descriptionEn: 'Carrot cake with walnuts & cinnamon', price: 110, categoryAr: 'الحلو', categoryEn: 'Desserts' },
  { id: 'ds19', nameAr: 'تريس ليتشيز', nameEn: 'Tres Leches Cake', descriptionAr: 'كيك الحليب الإسباني', descriptionEn: 'Traditional three milks cake', price: 95, categoryAr: 'الحلو', categoryEn: 'Desserts' },
  { id: 'ds20', nameAr: 'تيراميسو', nameEn: 'Italian Tiramisu', descriptionAr: 'تيراميسو إيطالي بالإسبريسو', descriptionEn: 'Italian espresso tiramisu', price: 110, categoryAr: 'الحلو', categoryEn: 'Desserts' },
  { id: 'ds21', nameAr: 'تارت شيكولاته', nameEn: 'Chocolate Tart', descriptionAr: 'تارت الشوكولاتة الغنية', descriptionEn: 'Rich chocolate tart', price: 95, categoryAr: 'الحلو', categoryEn: 'Desserts' },
  { id: 'ds22', nameAr: 'ميلفيه', nameEn: 'Mille-Feuille', descriptionAr: 'ميلفيه فرنسي بالكاسترد', descriptionEn: 'French mille-feuille with custard', price: 95, categoryAr: 'الحلو', categoryEn: 'Desserts' },
  { id: 'ds23', nameAr: 'ام على', nameEn: 'Om Ali', descriptionAr: 'أم علي ساخنة بالمكسرات والحليب', descriptionEn: 'Warm Om Ali with nuts & milk', price: 100, categoryAr: 'الحلو', categoryEn: 'Desserts' },

  // سوفت درينك والإضافات (Soft Drinks & Add-ons)
  { id: 'sd1', nameAr: 'مياه صغيرة', nameEn: 'Small Mineral Water', descriptionAr: 'زجاجة مياه معدنية صغيرة', descriptionEn: 'Small mineral water bottle', price: 15, categoryAr: 'سوفت درينك والإضافات', categoryEn: 'Soft Drinks & Addons' },
  { id: 'sd2', nameAr: 'مياه لارج', nameEn: 'Large Mineral Water', descriptionAr: 'زجاجة مياه معدنية كبيرة', descriptionEn: 'Large mineral water bottle', price: 30, categoryAr: 'سوفت درينك والإضافات', categoryEn: 'Soft Drinks & Addons' },
  { id: 'sd3', nameAr: 'كانز', nameEn: 'Canned Soft Drink', descriptionAr: 'كانز مشروب غازي', descriptionEn: 'Canned soft drink', price: 60, categoryAr: 'سوفت درينك والإضافات', categoryEn: 'Soft Drinks & Addons' },
  { id: 'sd4', nameAr: 'شويبس جولد', nameEn: 'Schweppes Gold', descriptionAr: 'شويبس جولد غازية', descriptionEn: 'Schweppes Gold soda', price: 70, categoryAr: 'سوفت درينك والإضافات', categoryEn: 'Soft Drinks & Addons' },
  { id: 'sd5', nameAr: 'بريل', nameEn: 'Birell Malt Drink', descriptionAr: 'مشروب شعير بريل', descriptionEn: 'Birell non-alcoholic malt drink', price: 70, categoryAr: 'سوفت درينك والإضافات', categoryEn: 'Soft Drinks & Addons' },
  { id: 'sd6', nameAr: 'ريدبول', nameEn: 'Red Bull Energy Drink', descriptionAr: 'مشروب الطاقة ريدبول', descriptionEn: 'Red Bull energy drink', price: 125, categoryAr: 'سوفت درينك والإضافات', categoryEn: 'Soft Drinks & Addons' },
  { id: 'sd7', nameAr: 'إضافة فليفر', nameEn: 'Extra Syrup Flavor', descriptionAr: 'إضافة فليفر (فانيليا / كراميل / بندق / قرفة)', descriptionEn: 'Extra syrup flavor', price: 40, categoryAr: 'سوفت درينك والإضافات', categoryEn: 'Soft Drinks & Addons' },
  { id: 'sd8', nameAr: 'إضافة حليب', nameEn: 'Extra Milk', descriptionAr: 'إضافة حليب طازج', descriptionEn: 'Extra fresh milk shot', price: 40, categoryAr: 'سوفت درينك والإضافات', categoryEn: 'Soft Drinks & Addons' },
  { id: 'sd9', nameAr: 'إضافة بابلز', nameEn: 'Extra Popping Boba Bubbles', descriptionAr: 'إضافة كرات البابلز المنعشة', descriptionEn: 'Extra popping boba bubbles', price: 60, categoryAr: 'سوفت درينك والإضافات', categoryEn: 'Soft Drinks & Addons' },
  { id: 'sd10', nameAr: 'إضافة كريمة', nameEn: 'Extra Whipped Cream', descriptionAr: 'إضافة كريمة مخفوقة غنية', descriptionEn: 'Extra rich whipped cream', price: 50, categoryAr: 'سوفت درينك والإضافات', categoryEn: 'Soft Drinks & Addons' },
  { id: 'sd11', nameAr: 'إضافة عسل', nameEn: 'Extra Natural Honey', descriptionAr: 'إضافة عسل طبيعي', descriptionEn: 'Extra natural honey', price: 35, categoryAr: 'سوفت درينك والإضافات', categoryEn: 'Soft Drinks & Addons' },
  { id: 'sd12', nameAr: 'إضافة إسبريسو', nameEn: 'Extra Shot Espresso', descriptionAr: 'شوت إسبريسو إضافي', descriptionEn: 'Extra shot of specialty espresso', price: 50, categoryAr: 'سوفت درينك والإضافات', categoryEn: 'Soft Drinks & Addons' },
  { id: 'sd13', nameAr: 'إضافة مكسرات', nameEn: 'Extra Roasted Nuts', descriptionAr: 'إضافة مكسرات محمصة مجروشة', descriptionEn: 'Extra roasted crushed nuts', price: 70, categoryAr: 'سوفت درينك والإضافات', categoryEn: 'Soft Drinks & Addons' },
];

const initialPromotions: PromotionItem[] = [
  {
    id: '1',
    titleEn: 'Oriental Breakfast Deal',
    titleAr: 'عرض الفطار الشرقي',
    subtitleEn: 'Foul + Falafel + Sliced Potatoes + Baladi Bread + Tea or Lemon for 99 EGP',
    subtitleAr: 'فول وفلافل وبطاطس وعيش بلدي سخن + شاي أو ليمون بـ 99 جنيه فقط',
    badgeEn: 'SPECIAL DEAL 99 EGP',
    badgeAr: 'عرض 99 جنيه',
    ctaEn: 'View Deal',
    ctaAr: 'استعرض العرض',
    gradient: 'from-brand-gold via-amber-600 to-brand-gold-light text-white',
    isActive: true,
  },
  {
    id: '2',
    titleEn: 'French Breakfast Deal',
    titleAr: 'عرض الفطار الفرنش',
    subtitleEn: 'Plain Croissant + Cappuccino or Latte or Tea for 99 EGP',
    subtitleAr: 'كرواسون سادة + كابتشينو أو لاتيه أو شاي بـ 99 جنيه',
    badgeEn: 'FRENCH COMBO',
    badgeAr: 'كومبو فرنسي',
    ctaEn: 'Explore Combo',
    ctaAr: 'اكتشف الكومبو',
    gradient: 'from-mediterranean-blue to-blue-950 text-white',
    isActive: true,
  },
];

const initialAnnouncements: AnnouncementPost[] = [
  {
    id: '1',
    titleAr: 'أهلاً بكم في رياحين الإسكندرية ☕✨',
    titleEn: 'Welcome to Rayahen Alexandria ☕✨',
    contentAr: 'استمتعوا بأجود أنواع القهوة المختصة والمحمصة طازجاً يومياً، مع تشكيلة الفطار الشرقي والمخبوزات الفرنسية الفاخرة!',
    contentEn: 'Enjoy our freshly roasted specialty coffee alongside our delicious oriental breakfast and premium French bakery!',
    badgeAr: 'رسالة ترحيبية',
    badgeEn: 'Welcome Message',
    isActive: true,
  },
];

const initialAdminUsers: AdminUser[] = [
  {
    id: '1',
    username: 'admin',
    passwordHash: '123456',
    role: 'SUPER_ADMIN',
  },
];

interface MenuStoreState {
  categories: CategoryItem[];
  menuItems: MenuItem[];
  promotions: PromotionItem[];
  announcements: AnnouncementPost[];
  adminUsers: AdminUser[];
  ratingUrl: string;
  vatSettings: Record<string, boolean>; // branchId → showVat
  currentSessionUser: string | null;
  adminBranch: string;
  activityLogs: ActivityLog[];
  isFirebaseSynced: boolean;
  lastItemsUpdatedAt: number;
  unsubListeners: (() => void) | null;
  lastSyncStatus: 'idle' | 'syncing' | 'success' | 'error';
  lastSyncError: string;

  // Firebase Auto Sync Helper
  syncToFirebase: () => Promise<void>;
  initFirebaseListener: () => (() => void) | void;

  // System Settings Actions
  setRatingUrl: (url: string) => void;
  setVatSetting: (branchId: string, enabled: boolean) => void;

  // Auth Actions
  loginAdmin: (username: string, passwordHash: string) => boolean;
  logoutAdmin: () => void;
  addAdminUser: (user: AdminUser) => void;
  updateAdminUser: (id: string, updated: Partial<AdminUser>) => void;
  deleteAdminUser: (id: string) => void;

  setAdminBranch: (branch: string) => void;
  logActivity: (action: string, details: string) => void;

  // Menu Item Actions
  addMenuItem: (item: MenuItem) => void;
  updateMenuItem: (id: string, updated: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  reorderMenuItems: (newOrder: MenuItem[]) => void;

  // Promotion Actions
  addPromotion: (promo: PromotionItem) => void;
  updatePromotion: (id: string, updated: Partial<PromotionItem>) => void;
  togglePromotion: (id: string) => void;
  deletePromotion: (id: string) => void;
  reorderPromotions: (newOrder: PromotionItem[]) => void;

  // Category Actions
  addCategory: (cat: CategoryItem) => void;
  updateCategory: (id: string, updated: Partial<CategoryItem>) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (newOrder: CategoryItem[]) => void;

  // Announcement Actions
  addAnnouncement: (post: AnnouncementPost) => void;
  updateAnnouncement: (id: string, updated: Partial<AnnouncementPost>) => void;
  toggleAnnouncement: (id: string) => void;
  deleteAnnouncement: (id: string) => void;
  reorderAnnouncements: (newOrder: AnnouncementPost[]) => void;

  // Branch Copy Action
  copyBranchSettings: (sourceBranchId: string, targetBranchIds: string[]) => Promise<void>;

  // System Reset Actions
  clearAllData: () => void;
  
}

// âœ… Deep sanitizer: removes ALL undefined values from any object/array
// Firestore rejects ANY field with undefined value (even nested) and fails silently
const sanitize = <T>(obj: T): T => {
  if (Array.isArray(obj)) {
    return obj.map(sanitize) as unknown as T;
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, sanitize(v)])
    ) as T;
  }
  if (typeof obj === 'string') {
    // Prevent any base64/blob strings from ever entering Firestore
    if (obj.startsWith('data:') || obj.startsWith('blob:')) {
      console.warn('⚠️ Prevented base64/blob string from being sent to Firestore:', obj.substring(0, 30));
      return '' as unknown as T;
    }
  }
  return obj;
};

// Helper to push state to Supabase safely â€” returns success/error
let syncTimeout: NodeJS.Timeout | null = null;
const executeSyncToFirestore = async (
  state: MenuStoreState,
  setStatus?: (s: 'success' | 'error', msg?: string) => void
) => {
  try {
    const updatedAt = new Date().toISOString();
    const categoriesPayload = sanitize({ data: state.categories, updatedAt });
    const menuItemsPayload = sanitize({ data: state.menuItems, updatedAt });
    const promotionsPayload = sanitize({ data: state.promotions, updatedAt });
    const announcementsPayload = sanitize({ data: state.announcements, updatedAt });
    const settingsPayload = sanitize({
      adminUsers: state.adminUsers,
      ratingUrl: state.ratingUrl || '',
      vatSettings: state.vatSettings || {},
      updatedAt
    });

    const stateData = {
      categories: categoriesPayload,
      menuItems: menuItemsPayload,
      promotions: promotionsPayload,
      announcements: announcementsPayload,
      settings: settingsPayload,
    };

    await setDoc(doc(db, 'menu_state', 'global'), stateData);
    console.log('🔥 Synced to Firestore successfully at', updatedAt);
    setStatus?.('success');
  } catch (err: any) {
    const msg = err?.message || String(err);
    console.error('❌ Firestore sync error:', msg);
    setStatus?.('error', msg);
  }
};

const syncStateToFirestore = (
  state: MenuStoreState,
  setStatus?: (s: 'success' | 'error', msg?: string) => void,
  immediate: boolean = false
): Promise<void> => {
  if (typeof window === 'undefined') return Promise.resolve();

  if (syncTimeout) {
    clearTimeout(syncTimeout);
    syncTimeout = null;
  }

  if (immediate) {
    return executeSyncToFirestore(state, setStatus);
  }

  return new Promise<void>((resolve) => {
    syncTimeout = setTimeout(async () => {
      await executeSyncToFirestore(state, setStatus);
      resolve();
    }, 100);
  });
};

export const useMenuStore = create<MenuStoreState>()(
  persist(
    (set, get) => ({
      categories: initialCategories,
      menuItems: initialMenuItems,
      promotions: initialPromotions,
      announcements: initialAnnouncements,
      adminUsers: initialAdminUsers,
      ratingUrl: 'https://rayahen-rating.vercel.app/',
      vatSettings: {},
      currentSessionUser: null,
      adminBranch: 'all',
      activityLogs: [],
      isFirebaseSynced: false,
      lastItemsUpdatedAt: 0,
      unsubListeners: null,
      lastSyncStatus: 'idle' as const,
      lastSyncError: '',

      // Sync Trigger â€” with visible status
      syncToFirebase: async () => {
        set({ lastSyncStatus: 'syncing', lastSyncError: '' });
        await syncStateToFirestore(get(), (status, msg) => {
          set({ lastSyncStatus: status, lastSyncError: msg || '' });
        });
      },

      // Realtime Listener (Firebase Firestore)
      initFirebaseListener: () => {
        if (typeof window === 'undefined') return;

        // Prevent multiple listeners
        if (get().unsubListeners) return get().unsubListeners!;

        try {
          const docRef = doc(db, 'menu_state', 'global');

          const applyData = (data: any) => {
            if (!data) return;
            if (data.categories?.data) set({ categories: data.categories.data, isFirebaseSynced: true });
            if (data.promotions?.data) set({ promotions: data.promotions.data });
            if (data.announcements?.data) set({ announcements: data.announcements.data });
            if (data.settings) {
              set({
                adminUsers: data.settings.adminUsers || get().adminUsers,
                ratingUrl: data.settings.ratingUrl || get().ratingUrl,
                vatSettings: data.settings.vatSettings || get().vatSettings || {},
              });
            }
            const serverTimestamp = data.settings?.updatedAt ? new Date(data.settings.updatedAt).getTime() : 0;
            const localTimestamp = get().lastItemsUpdatedAt || 0;
            if (get().menuItems.length === 0 || serverTimestamp > localTimestamp) {
              if (data.menuItems?.data) {
                const items = data.menuItems.data as MenuItem[];
                items.sort((a: any, b: any) => (a.orderIndex ?? 99999) - (b.orderIndex ?? 99999));
                set({ menuItems: items, lastItemsUpdatedAt: serverTimestamp });
              }
            }
          };

          const unsub = onSnapshot(docRef, (snap) => {
            if (snap.exists()) applyData(snap.data());
          }, (e) => {
            console.log('Firestore listener error, local mode active.', e);
          });

          const cleanup = () => {
            unsub();
            set({ unsubListeners: null });
          };

          set({ unsubListeners: cleanup });
          return cleanup;
        } catch (e) {
          console.log('Firestore listener status: Local mode active.', e);
        }
      },
      // System Settings Actions
      setRatingUrl: (url) => {
        set({ ratingUrl: url });
        syncStateToFirestore(get());
      },
      setVatSetting: (branchId, enabled) => {
        set((state) => ({ vatSettings: { ...state.vatSettings, [branchId]: enabled } }));
        syncStateToFirestore(get(), undefined, true);
      },

      // Auth Handlers
      loginAdmin: (username, password) => {
        const found = get().adminUsers.find(
          (u) => u.username.toLowerCase() === username.toLowerCase() && u.passwordHash === password
        );
        if (found) {
          set({ currentSessionUser: found.username });
        syncStateToFirestore(get());
          get().logActivity('تسجيل الدخول', 'تم تسجيل الدخول للوحة التحكم بنجاح');
          return true;
        }
        return false;
      },
      logoutAdmin: () => set({ currentSessionUser: null }),
      setAdminBranch: (branch) => set({ adminBranch: branch }),
      logActivity: (action, details) => {
        set((state) => {
          const newLog: ActivityLog = {
            id: Date.now().toString(),
            username: state.currentSessionUser || 'Admin',
            action: action as any,
            details: details,
            timestamp: Date.now(),
          };
          const newLogs = [newLog, ...(state.activityLogs || [])].slice(0, 100);
          return { activityLogs: newLogs };
        });
        // Only update settings doc (not a full 4-doc sync) to save writes
        syncStateToFirestore(get()).catch(e => console.error('logActivity sync error:', e));
      },

      addAdminUser: (user) => {
        set((state) => ({ adminUsers: [...state.adminUsers, user] }));
      },
      updateAdminUser: (id, updated) => {
        set((state) => ({
          adminUsers: state.adminUsers.map((u) =>
            u.id === id ? { ...u, ...updated } : u
          ),
        }));
      },
      deleteAdminUser: (id) => {
        set((state) => ({
          adminUsers: state.adminUsers.filter((u) => u.id !== id),
        }));
      },


      // Menu Item Handlers
      addMenuItem: async (item) => {
        set((state) => {
          const firstIdx = state.menuItems.findIndex(
            (i) => i.categoryAr === item.categoryAr || i.categoryEn === item.categoryEn
          );
          if (firstIdx !== -1) {
            const newItems = [...state.menuItems];
            newItems.splice(firstIdx, 0, item);
            return { menuItems: newItems };
          }
          return { menuItems: [...state.menuItems, item] };
        });
        get().logActivity('إضافة صنف', `تمت إضافة الصنف: ${item.nameAr}`);
        
        try { await syncStateToFirestore(get()); } catch(e) { console.error(e); }
      },
      updateMenuItem: async (id, updated) => {
        const itemName = get().menuItems.find(i => i.id === id)?.nameAr || id;
        set((state) => ({
          menuItems: state.menuItems.map((item) =>
            item.id === id ? { ...item, ...updated } : item
          ),
        }));
        syncStateToFirestore(get());
        if (updated.branchOverrides) {
           get().logActivity('تعديل حالة فرع', `تم تعديل إعدادات الصنف (${itemName}) لفرع محدد`);
        } else if (updated.isActive !== undefined) {
           get().logActivity('تعديل حالة', `تم ${updated.isActive ? 'تنشيط' : 'إخفاء'} الصنف: ${itemName}`);
        } else {
           get().logActivity('تعديل صنف', `تم تعديل بيانات الصنف: ${itemName}`);
        }
        
        try { await syncStateToFirestore(get()); } catch(e) { console.error(e); }
      },
      deleteMenuItem: async (id) => {
        const itemName = get().menuItems.find(i => i.id === id)?.nameAr || id;
        set((state) => ({
          menuItems: state.menuItems.filter((item) => item.id !== id),
        }));
        syncStateToFirestore(get());
        get().logActivity('حذف صنف', `تم حذف الصنف: ${itemName}`);
        
        try { await syncStateToFirestore(get()); } catch(e) { console.error(e); }
      },
      reorderMenuItems: async (newOrder) => {
        // Fix the orderIndex of each item before saving to state
        const fixedOrder = newOrder.map((item, idx) => ({ ...item, orderIndex: idx }));
        set({ menuItems: fixedOrder });
        syncStateToFirestore(get());
        try { await syncStateToFirestore(get()); } catch(e) { console.error(e); }
      },

      // Promotion Handlers
      addPromotion: (promo) => {
        set((state) => ({ promotions: [promo, ...state.promotions] }));
      },
      updatePromotion: (id, updated) => {
        set((state) => ({
          promotions: state.promotions.map((p) =>
            p.id === id ? { ...p, ...updated } : p
          ),
        }));
      },
      togglePromotion: (id) => {
        set((state) => ({
          promotions: state.promotions.map((p) =>
            p.id === id ? { ...p, isActive: !p.isActive } : p
          ),
        }));
      },
      deletePromotion: (id) => {
        set((state) => ({
          promotions: state.promotions.filter((p) => p.id !== id),
        }));
      },
      reorderPromotions: (newOrder) => {
        set({ promotions: newOrder });
      },

      // Category Handlers
      addCategory: (cat) => {
        set((state) => ({ categories: [...state.categories, cat] }));
      },
      updateCategory: (id, updated) => {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...updated } : c
          ),
        }));
      },
      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
          menuItems: state.menuItems.filter((item) => item.categoryEn !== id),
        }));
      },
      reorderCategories: (newOrder) => {
        set({ categories: newOrder });
      },

      // Announcement Handlers
      addAnnouncement: (post) => {
        set((state) => ({ announcements: [post, ...state.announcements] }));
        syncStateToFirestore(get(), undefined, true);
      },
      updateAnnouncement: (id, updated) => {
        set((state) => ({
          announcements: state.announcements.map((a) =>
            a.id === id ? { ...a, ...updated } : a
          ),
        }));
        syncStateToFirestore(get(), undefined, true);
      },
      toggleAnnouncement: (id) => {
        set((state) => ({
          announcements: state.announcements.map((a) =>
            a.id === id ? { ...a, isActive: !a.isActive } : a
          ),
        }));
        syncStateToFirestore(get(), undefined, true);
      },
      deleteAnnouncement: (id) => {
        set((state) => ({
          announcements: state.announcements.filter((a) => a.id !== id),
        }));
        syncStateToFirestore(get(), undefined, true);
      },
      reorderAnnouncements: (newOrder) => {
        set({ announcements: newOrder });
        syncStateToFirestore(get(), undefined, true);
      },

      // System Reset Handlers
      clearAllData: () => {
        set({
          menuItems: [],
          promotions: [],
          announcements: [],
          categories: [{ id: 'All', nameEn: 'All', nameAr: 'الكل' }],
        });
        syncStateToFirestore(get());
      },
      

      // Branch Settings Copy Handler
      // Copies branchOverrides from sourceBranchId to each targetBranchId
      // for menuItems, promotions, announcements, and categories.
      // Base data (names, prices, images) is NEVER touched.
      copyBranchSettings: async (sourceBranchId, targetBranchIds) => {
        if (!targetBranchIds.length) return;
        const state = get();

        const copyOverrides = <T extends { branchOverrides?: { [k: string]: unknown } }>(
          items: T[]
        ): T[] =>
          items.map((item) => {
            const sourceOverride = item.branchOverrides?.[sourceBranchId];
            if (sourceOverride === undefined) return item;
            const newOverrides = { ...(item.branchOverrides || {}) };
            for (const targetId of targetBranchIds) {
              newOverrides[targetId] = { ...sourceOverride as object };
            }
            return { ...item, branchOverrides: newOverrides };
          });

        set({
          menuItems:     copyOverrides(state.menuItems)     as typeof state.menuItems,
          promotions:    copyOverrides(state.promotions)    as typeof state.promotions,
          announcements: copyOverrides(state.announcements) as typeof state.announcements,
          categories:    copyOverrides(state.categories)    as typeof state.categories,
        });
        syncStateToFirestore(get());

        const targetNames = targetBranchIds.join(', ');
        get().logActivity(
          'نسخ إعدادات فرع',
          `تم نسخ إعدادات فرع (${sourceBranchId}) إلى: ${targetNames}`
        );
        await syncStateToFirestore(get());
      },
    }),
    {
      name: 'rayahen-menu-storage',
      version: 2,
      partialize: (state) => ({
        categories: state.categories,
        menuItems: state.menuItems,
        promotions: state.promotions,
        announcements: state.announcements,
        adminUsers: state.adminUsers,
        ratingUrl: state.ratingUrl,
      }),
    }
  )
);
if (typeof window !== 'undefined') {
  // Only re-sync when actual DATA changes, not status/flag fields.
  // This prevents the infinite loop: sync success -> state change -> sync again -> ...
  let autoSyncTimeout: any;
  let prevFingerprint = '';
  const getFingerprint = (state: any): string => {
    // Helper: produce a lightweight hash of branchOverrides across all items
    const overridesHash = (items: any[]) =>
      items?.map((item: any) => JSON.stringify(item.branchOverrides || {})).join('|') || '';

    return JSON.stringify({
      mi: state.menuItems?.length,
      miOv: overridesHash(state.menuItems),
      cat: state.categories?.length,
      catOv: overridesHash(state.categories),
      pro: state.promotions?.length,
      proOv: overridesHash(state.promotions),
      ann: state.announcements?.length,
      annOv: overridesHash(state.announcements),
      au: state.adminUsers?.length,
      ru: state.ratingUrl,
      vat: state.vatSettings,
    });
  };
  useMenuStore.subscribe((state) => {
    const fp = getFingerprint(state);
    if (fp === prevFingerprint) return; // nothing meaningful changed
    prevFingerprint = fp;
    clearTimeout(autoSyncTimeout);
    autoSyncTimeout = setTimeout(() => {
      syncStateToFirestore(useMenuStore.getState()).catch((e: any) => console.error('auto-sync error:', e));
    }, 800);
  });
}
