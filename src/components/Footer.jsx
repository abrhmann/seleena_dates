import React from 'react';
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Footer.css';

const Footer = () => {
    const { t } = useTranslation();

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-col">
                        <h3 className="footer-logo">Seleena <span className="text-gold">Dates</span></h3>
                        <p>{t('footerDesc')}</p>
                    </div>

                    <div className="footer-col">
                        <h4>{t('quickLinks')}</h4>
                        <ul>
                            <li><a href="/">{t('home')}</a></li>
                            <li><a href="/shop">{t('shop')}</a></li>
                            <li><a href="/about">{t('ourStory')}</a></li>
                            <li><a href="/contact">{t('contact')}</a></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>{t('contactUs')}</h4>
                        <ul className="contact-list">
                            <li><MapPin size={16} /> 123 Date Palm Ave, Riyadh</li>
                            <li><Phone size={16} /> +966 50 000 0000</li>
                            <li><Mail size={16} /> hello@seleenadates.com</li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>{t('followUs')}</h4>
                        <div className="social-icons">
                            <a href="#"><Instagram size={20} /></a>
                            <a href="#"><Facebook size={20} /></a>
                            <a href="#"><Twitter size={20} /></a>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Seleena Dates. {t('rights')}</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
