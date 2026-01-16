import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const toggleMenu = () => setIsOpen(!isOpen);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <nav className="navbar">
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
            <Globe size={20} />
            <span style={{ fontSize: '0.8rem', marginLeft: '4px', fontWeight: 'bold' }}>
              {i18n.language.toUpperCase()}
            </span>
          </button>
          <Link to="/admin" className="icon-btn" title={t('adminPanel')}>
            <User size={20} />
          </Link>
          <button className="icon-btn">
            <ShoppingBag size={20} />
            <span className="badge">0</span>
          </button>
          <button className="mobile-toggle" onClick={toggleMenu}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
        <Link to="/" onClick={toggleMenu}>{t('home')}</Link>
        <Link to="/shop" onClick={toggleMenu}>{t('shop')}</Link>
        <Link to="/about" onClick={toggleMenu}>{t('ourStory')}</Link>
        <Link to="/admin" onClick={toggleMenu}>{t('admin')}</Link>
      </div>
    </nav>
  );
};

export default Navbar;
