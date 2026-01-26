import React from 'react';
import { ArrowRight, Star, Plus, Leaf, Sun, Map } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { useShop } from '../context/ShopContext';
import './Home.css';

const Home = () => {
    const { t, i18n } = useTranslation();
    const { products } = useShop();

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero" style={{ backgroundImage: `url('/hero-dates.png')` }}>
                <div className="container hero-content animate-fade-in">
                    <span className="hero-tagline">{t('organic')}</span>
                    <h1>
                        <Trans i18nKey="welcome">
                            The Golden Fruit of <span className="text-gold">Bahria</span>
                        </Trans>
                    </h1>
                    <p>{t('subtitle')}</p>
                    <div className="hero-buttons">
                        <Link to="/shop" className="btn btn-primary">
                            {t('shopNow')} <ArrowRight size={20} style={i18n.dir() === 'rtl' ? { transform: 'rotate(180deg)' } : {}} />
                        </Link>
                        <Link to="/about" className="btn btn-outline-white">
                            {t('ourStory')}
                        </Link>
                    </div>
                </div>
            </section>

            {/* Variety Horizontal Selector */}
            <section className="variety-section">
                <div className="container">
                    <div className="variety-grid">
                        {[
                            { name: 'Sewi', img: 'https://images.unsplash.com/photo-1598380846615-802271fd8188?auto=format&fit=crop&q=80&w=200' },
                            { name: 'Majdool', img: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&q=80&w=200' },
                            { name: 'Barhi', img: 'https://images.unsplash.com/photo-1630138543714-bc1ec64205d2?auto=format&fit=crop&q=80&w=200' },
                            { name: 'Anbara', img: 'https://images.unsplash.com/photo-1550130806-388a0344b260?auto=format&fit=crop&q=80&w=200' }
                        ].map((v, i) => (
                            <div key={i} className="variety-card">
                                <div className="variety-img-wrapper">
                                    <img src={v.img} alt={v.name} />
                                </div>
                                <h4>{v.name}</h4>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Best Sellers / Collection */}
            <section className="section bg-pattern">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">{t('bestSellers')}</h2>
                        <p>{t('bestSellersSub')}</p>
                    </div>

                    <div className="product-grid">
                        {products.slice(0, 4).map((item) => (
                            <div key={item.id} className="product-card">
                                <div className="product-image-box">
                                    <span className="product-badge">BESTSELLER</span>
                                    <img src={item.image} alt={i18n.language === 'ar' && item.nameAr ? item.nameAr : item.name} />
                                </div>
                                <div className="product-details">
                                    <h3>{i18n.language === 'ar' && item.nameAr ? item.nameAr : item.name}</h3>
                                    <div className="product-rating">
                                        <Star size={14} fill="var(--color-gold)" color="var(--color-gold)" />
                                        <span>4.9 (128 reviews)</span>
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

                    <div className="text-center mt-5">
                        <Link to="/shop" className="btn btn-outline">{t('viewAll')}</Link>
                    </div>
                </div>
            </section>

            {/* Heritage / Pharaonic Section */}
            <section className="heritage-container">
                <div className="container">
                    <div className="heritage-grid">
                        <div className="heritage-text">
                            <h2>Hand-Picked <br /><span className="text-gold">Bahria Traditions</span></h2>
                            <div className="feature-list">
                                <div className="feature-item">
                                    <div className="icon-box"><Map size={24} /></div>
                                    <div className="feature-info">
                                        <h4>Ancient Volcanic Soil</h4>
                                        <p>Grown in the mineral-rich alkaline soil of the oasis, naturally pesticide-free.</p>
                                    </div>
                                </div>
                                <div className="feature-item">
                                    <div className="icon-box"><Sun size={24} /></div>
                                    <div className="feature-info">
                                        <h4>Solar Cured</h4>
                                        <p>Dried under the intense Egyptian sun to lock in natural sugars and fiber.</p>
                                    </div>
                                </div>
                                <div className="feature-item">
                                    <div className="icon-box"><Leaf size={24} /></div>
                                    <div className="feature-info">
                                        <h4>100% Organic</h4>
                                        <p>Traditional farming methods passed down through generations since pharaonic times.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="heritage-image">
                            <img
                                src="https://images.unsplash.com/photo-1547127796-06bb04e4b315?auto=format&fit=crop&q=80&w=800"
                                alt="Ancient Egyptian Art"
                                className="heritage-image-main"
                            />
                            <div className="heritage-float-card">
                                <p>"Golden Mummies were present of these, a story of the sea in the desert wind..."</p>
                                <Link to="/about" className="discover-link">
                                    Discover Our Bahria Roots <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Newsletter / CTA */}
            <section className="section text-center" style={{ background: 'var(--color-sand)', margin: '4rem 2rem', borderRadius: '40px' }}>
                <div className="container">
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Savour the Heritage</h2>
                    <p style={{ marginBottom: '2rem', color: 'var(--color-text-light)' }}>Join our newsletter for exclusive offers and stories from the oasis.</p>
                    <div className="flex-center" style={{ gap: '1rem', maxWidth: '500px', margin: '0 auto' }}>
                        <input type="email" placeholder="Your Email" style={{ padding: '1rem 1.5rem', borderRadius: '99px', border: '1px solid #ddd', flex: 1 }} />
                        <button className="btn btn-gold">Subscribe</button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
