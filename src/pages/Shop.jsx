import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShop } from '../context/ShopContext';

const Shop = () => {
    const { t, i18n } = useTranslation();
    const { products } = useShop();

    return (
        <div className="section">
            <div className="container">
                <h1 className="section-title">{t('shop')}</h1>
                <div className="grid-cols-3">
                    {products.map((item) => (
                        <div key={item.id} className="card product-card">
                            <div className="product-img-placeholder">
                                <img src={item.image} alt={i18n.language === 'ar' && item.nameAr ? item.nameAr : item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div className="product-info">
                                <h3>{i18n.language === 'ar' && item.nameAr ? item.nameAr : item.name}</h3>
                                <p className="price">{t('currency')} {item.price}</p>
                                <button className="btn btn-primary width-full">{t('addToCart')}</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Shop;
