import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShop } from '../context/ShopContext';
import { Star, Plus } from 'lucide-react';

const Shop = () => {
    const { t, i18n } = useTranslation();
    const { products } = useShop();

    return (
        <div className="section" style={{ minHeight: '100vh', paddingTop: '120px' }}>
            <div className="container">
                <div className="section-header">
                    <h1 className="section-title">{t('shop')}</h1>
                    <p>Discover our curated selection of premium date varieties.</p>
                </div>

                <div className="product-grid">
                    {products.map((item) => (
                        <div key={item.id} className="product-card">
                            <div className="product-image-box">
                                <img src={item.image} alt={i18n.language === 'ar' && item.nameAr ? item.nameAr : item.name} />
                            </div>
                            <div className="product-details">
                                <h3>{i18n.language === 'ar' && item.nameAr ? item.nameAr : item.name}</h3>
                                <div className="product-rating">
                                    <Star size={14} fill="var(--color-gold)" color="var(--color-gold)" />
                                    <span>5.0</span>
                                </div>
                                <div className="product-meta">
                                    <p className="product-price">{t('currency')} {item.price}</p>
                                    <button className="add-to-cart-btn">
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Shop;
