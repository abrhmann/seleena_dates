import React from 'react';
import { ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { useShop } from '../context/ShopContext';
import './Home.css';

const Home = () => {
    const { t, i18n } = useTranslation();
    const { products } = useShop();

    return (
        <div className="home">
            <section className="hero" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/hero-dates.png')` }}>
                <div className="container hero-content">
                    <h1>
                        <Trans i18nKey="welcome">
                            Experience the Royal Taste of <span className="text-gold">Seleena Dates</span>
                        </Trans>
                    </h1>
                    <p>{t('subtitle')}</p>
                    <div className="hero-buttons">
                        <Link to="/shop" className="btn btn-primary">
                            {t('shopNow')} <ArrowRight size={20} style={i18n.dir() === 'rtl' ? { transform: 'rotate(180deg)' } : {}} />
                        </Link>
                        <Link to="/about" className="btn btn-outline-light">
                            {t('ourStory')}
                        </Link>
                    </div>
                </div>
            </section>

            <section className="section bg-pattern">
                <div className="container text-center mb-5">
                    <h2 className="section-title">{t('bestSellers')}</h2>
                    <p className="section-subtitle">{t('bestSellersSub')}</p>
                </div>

                <div className="container">
                    <div className="grid-cols-3 product-grid">
                        {products.slice(0, 3).map((item) => (
                            <div key={item.id} className="card product-card">
                                <div className="product-img-placeholder">
                                    <img src={item.image} alt={i18n.language === 'ar' && item.nameAr ? item.nameAr : item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div className="product-info">
                                    <div className="product-rating">
                                        <Star size={14} fill="#D4AF37" color="#D4AF37" />
                                        <span>5.0</span>
                                    </div>
                                    <h3>{i18n.language === 'ar' && item.nameAr ? item.nameAr : item.name}</h3>
                                    <p className="price">{t('currency')} {item.price}</p>
                                    <button className="btn btn-primary btn-sm width-full">{t('addToCart')}</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-5">
                        <Link to="/shop" className="btn btn-outline">{t('viewAll')}</Link>
                    </div>
                </div>
            </section>

            <section className="section features-section">
                <div className="container">
                    <div className="grid-cols-3">
                        <div className="feature-item">
                            <div className="feature-icon">🌿</div>
                            <h3>{t('organic')}</h3>
                            <p>{t('organicDesc')}</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">✨</div>
                            <h3>{t('quality')}</h3>
                            <p>{t('qualityDesc')}</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">✈️</div>
                            <h3>{t('delivery')}</h3>
                            <p>{t('deliveryDesc')}</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
