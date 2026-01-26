import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-container">
        <Link to="/" className="logo">
          Seleena <span className="text-gold">Dates</span>
        </Link>

        <div className="desktop-menu">
          <Link to="/" className={`nav-link ${isActive('/')}`}>{t('home')}</Link>
          <Link to="/shop" className={`nav-link ${isActive('/shop')}`}>{t('shop')}</Link>
          <Link to="/about" className={`nav-link ${isActive('/about')}`}>{t('ourStory')}</Link>
        </div>

        <div className="nav-actions">
          <button onClick={toggleLanguage} className="icon-btn" title="Change Language">
            <Globe size={18} />
            <span style={{ fontSize: '0.75rem', marginLeft: '4px', fontWeight: 'bold' }}>
              {i18n.language.toUpperCase()}
            </span>
          </button>
          <Link to="/admin/dashboard" className="icon-btn" title={t('adminPanel')}>
            <User size={20} />
          </Link>
          <button className="icon-btn">
            <ShoppingBag size={20} />
            <span className="badge">0</span>
          </button>
          <button className="mobile-toggle" onClick={toggleMenu}>
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
        <button className="mobile-close" onClick={toggleMenu}><X size={32} /></button>
        <Link to="/" onClick={toggleMenu}>{t('home')}</Link>
        <Link to="/shop" onClick={toggleMenu}>{t('shop')}</Link>
        <Link to="/about" onClick={toggleMenu}>{t('ourStory')}</Link>
        <Link to="/admin/dashboard" onClick={toggleMenu}>{t('admin')}</Link>
      </div>
    </nav>
  );
};

export default Navbar;
