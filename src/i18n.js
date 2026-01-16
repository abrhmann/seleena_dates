import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            "welcome": "Experience the Royal Taste of <1>Seleena Dates</1>",
            "subtitle": "Hand-picked Majdool dates from the heart of Arabia. Premium quality, unmatched freshness.",
            "shopNow": "Shop Now",
            "ourStory": "Our Story",
            "bestSellers": "Our Best Sellers",
            "bestSellersSub": "Discover our most loved premium selections",
            "addToCart": "Add to Cart",
            "viewAll": "View All Products",
            "organic": "100% Organic",
            "organicDesc": "Grown naturally without harmful chemicals, ensuring pure taste.",
            "quality": "Premium Quality",
            "qualityDesc": "Hand-selected for size, texture, and sweetness.",
            "delivery": "Fast Delivery",
            "deliveryDesc": "Fresh from our farms to your doorstep worldwide.",
            "home": "Home",
            "shop": "Shop",
            "admin": "Admin",
            "contact": "Contact",
            "footerDesc": "Premium Majdool dates sourced from the finest palms. Experience the taste of luxury and tradition.",
            "quickLinks": "Quick Links",
            "contactUs": "Contact Us",
            "followUs": "Follow Us",
            "rights": "All rights reserved.",
            "currency": "SAR",
            "adminPanel": "Admin Panel",
            "totalSales": "Total Sales",
            "totalOrders": "Total Orders",
            "products": "Products",
            "thisMonth": "this month",
            "addProduct": "Add Product",
            "edit": "Edit",
            "delete": "Delete",
            "save": "Save",
            "cancel": "Cancel",
            "name": "Name",
            "nameAr": "Arabic Name",
            "price": "Price",
            "stock": "Stock",
            "actions": "Actions",
            "status": "Status",
            "pending": "Pending",
            "delivered": "Delivered",
            "customer": "Customer",
            "date": "Date",
            "total": "Total",
            "orderId": "Order ID",
            "dashboard": "Dashboard",
            "orders": "Orders",
            "customers": "Customers"
        }
    },
    ar: {
        translation: {
            "welcome": "جرب المذاق الملكي لتمور <1>سيلينا</1>",
            "subtitle": "تمور مجدول مختارة بعناية من قلب الجزيرة العربية. جودة عالية وطزاجة لا تضاهى.",
            "shopNow": "تسوق الآن",
            "ourStory": "قصتنا",
            "bestSellers": "الأكثر مبيعاً",
            "bestSellersSub": "اكتشف تشكيلتنا الفاخرة المحبوبة",
            "addToCart": "أضف للسلة",
            "viewAll": "عرض كل المنتجات",
            "organic": "100% عضوي",
            "organicDesc": "تزرع بشكل طبيعي بدون مواد كيميائية ضارة، لضمان طعم نقي.",
            "quality": "جودة فاخرة",
            "qualityDesc": "مختارة يدوياً للحجم والقوام والحلاوة.",
            "delivery": "توصيل سريع",
            "deliveryDesc": "طازجة من مزارعنا إلى باب منزلك حول العالم.",
            "home": "الرئيسية",
            "shop": "المتجر",
            "admin": "الإدارة",
            "contact": "اتصل بنا",
            "footerDesc": "تمور مجدول فاخرة من أجود النخيل. جرب طعم الفخامة والتقاليد.",
            "quickLinks": "روابط سريعة",
            "contactUs": "اتصل بنا",
            "followUs": "تابعنا",
            "rights": "جميع الحقوق محفوظة.",
            "currency": "ر.س",
            "adminPanel": "لوحة التحكم",
            "totalSales": "إجمالي المبيعات",
            "totalOrders": "إجمالي الطلبات",
            "products": "المنتجات",
            "thisMonth": "هذا الشهر",
            "addProduct": "إضافة منتج",
            "edit": "تعديل",
            "delete": "حذف",
            "save": "حفظ",
            "cancel": "إلغاء",
            "name": "الاسم",
            "nameAr": "الاسم بالعربي",
            "price": "السعر",
            "stock": "المخزون",
            "actions": "إجراءات",
            "status": "الحالة",
            "pending": "قيد الانتظار",
            "delivered": "تم التوصيل",
            "customer": "العميل",
            "date": "التاريخ",
            "total": "الإجمالي",
            "orderId": "رقم الطلب",
            "dashboard": "الرئيسية",
            "orders": "الطلبات",
            "customers": "العملاء"
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "en", // default language
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
