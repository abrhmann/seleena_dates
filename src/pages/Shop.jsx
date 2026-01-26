import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { supabase } from '../supabaseClient';
import { Star, Plus, ShoppingCart, Check, Loader, AlertCircle } from 'lucide-react';
import './Shop.css';

const Shop = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { addToCart, getCartCount } = useCart();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState({});
    const [addedItems, setAddedItems] = useState({});
    const [error, setError] = useState(null);
    const [hasVariants, setHasVariants] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);

            // Try to fetch with variants first
            const { data: variantData, error: variantError } = await supabase
                .from('products')
                .select(`
                    *,
                    product_variants (
                        id,
                        weight_variant,
                        price,
                        stock_quantity
                    )
                `)
                .order('created_at', { ascending: false });

            // If variants table doesn't exist, fall back to products only
            if (variantError && variantError.message.includes('product_variants')) {
                console.warn('⚠️  product_variants table not found. Using fallback mode.');
                setHasVariants(false);

                const { data: basicData, error: basicError } = await supabase
                    .from('products')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (basicError) throw basicError;

                // Create fake variants from existing product data
                const productsWithFakeVariants = basicData.map(product => ({
                    ...product,
                    product_variants: [{
                        id: `fake-${product.id}`,
                        weight_variant: '1kg',
                        price: product.price,
                        stock_quantity: product.stock || 100
                    }]
                }));

                setProducts(productsWithFakeVariants);
            } else if (variantError) {
                throw variantError;
            } else {
                setHasVariants(true);
                setProducts(variantData || []);
            }
        } catch (err) {
            console.error('Error fetching products:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (product, variant) => {
        const key = `${product.id}-${variant.id}`;
        setAddingToCart(prev => ({ ...prev, [key]: true }));
        setError(null);

        try {
            // For fake variants (no migration run), show error message
            if (!hasVariants) {
                setError(t('cart.migractionNeeded', {
                    defaultValue: 'Please run database migration first! See setup instructions.'
                }));
                setTimeout(() => setError(null), 5000);
                setAddingToCart(prev => ({ ...prev, [key]: false }));
                return;
            }

            const result = await addToCart(product.id, variant.id, 1);

            if (result.success) {
                // Show success state
                setAddedItems(prev => ({ ...prev, [key]: true }));

                // Reset after 2 seconds
                setTimeout(() => {
                    setAddedItems(prev => ({ ...prev, [key]: false }));
                }, 2000);
            } else {
                setError(result.error || t('cart.addError'));
                setTimeout(() => setError(null), 5000);
            }
        } catch (err) {
            setError(err.message);
            setTimeout(() => setError(null), 5000);
        } finally {
            setAddingToCart(prev => ({ ...prev, [key]: false }));
        }
    };

    if (loading) {
        return (
            <div className="section" style={{ minHeight: '100vh', paddingTop: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px' }}>
                <Loader className="spinner" size={48} />
                <p>{t('loading', { defaultValue: 'Loading products...' })}</p>
            </div>
        );
    }

    return (
        <div className="section shop-page" style={{ minHeight: '100vh', paddingTop: '120px' }}>
            <div className="container">
                <div className="section-header">
                    <h1 className="section-title">{t('shop')}</h1>
                    <p>{t('shop.subtitle')}</p>
                </div>

                {/* Migration Warning */}
                {!hasVariants && (
                    <div className="alert alert-warning" style={{ marginBottom: '24px', background: 'rgba(234, 179, 8, 0.1)', border: '2px solid rgb(234, 179, 8)', color: 'rgb(161, 98, 7)' }}>
                        <AlertCircle size={20} />
                        <div>
                            <strong>Database Setup Required</strong>
                            <p>To enable the shopping cart, please run:  <code>node setup_database.js</code></p>
                            <p>Then follow the instructions to run the migration in Supabase.</p>
                        </div>
                    </div>
                )}

                {/* Cart Summary */}
                {getCartCount() > 0 && (
                    <div className="cart-summary-banner">
                        <div className="cart-summary-content">
                            <ShoppingCart size={24} />
                            <span>
                                {t('cart.itemsInCart', { count: getCartCount(), defaultValue: `${getCartCount()} items in cart` })}
                            </span>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={() => navigate('/checkout')}
                            >
                                {t('cart.viewCart')}
                            </button>
                        </div>
                    </div>
                )}

                {/* Error Alert */}
                {error && (
                    <div className="alert alert-error" style={{ marginBottom: '20px' }}>
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Products Grid */}
                <div className="product-grid">
                    {products.length === 0 ? (
                        <div className="empty-state">
                            <p>{t('shop.noProducts')}</p>
                        </div>
                    ) : (
                        products.map((product) => (
                            <div key={product.id} className="product-card-enhanced">
                                <div className="product-image-box">
                                    <img
                                        src={product.image_url || '/hero-dates.png'}
                                        alt={i18n.language === 'ar' ? product.name_ar : product.name_en}
                                    />
                                    {product.product_variants && product.product_variants.length > 1 && (
                                        <div className="variant-badge">
                                            {product.product_variants.length} {t('shop.sizes')}
                                        </div>
                                    )}
                                </div>

                                <div className="product-details">
                                    <h3>{i18n.language === 'ar' ? product.name_ar : product.name_en}</h3>

                                    <div className="product-rating">
                                        <Star size={14} fill="var(--color-gold)" color="var(--color-gold)" />
                                        <Star size={14} fill="var(--color-gold)" color="var(--color-gold)" />
                                        <Star size={14} fill="var(--color-gold)" color="var(--color-gold)" />
                                        <Star size={14} fill="var(--color-gold)" color="var(--color-gold)" />
                                        <Star size={14} fill="var(--color-gold)" color="var(--color-gold)" />
                                        <span>5.0</span>
                                    </div>

                                    {/* Variant Options */}
                                    {product.product_variants && product.product_variants.length > 0 ? (
                                        <div className="variant-options">
                                            {product.product_variants.map((variant) => {
                                                const key = `${product.id}-${variant.id}`;
                                                const isAdding = addingToCart[key];
                                                const isAdded = addedItems[key];
                                                const outOfStock = variant.stock_quantity === 0;

                                                return (
                                                    <div key={variant.id} className="variant-option">
                                                        <div className="variant-info">
                                                            <span className="variant-weight">{variant.weight_variant}</span>
                                                            <span className="variant-price">
                                                                {t('currency')} {parseFloat(variant.price).toFixed(2)}
                                                            </span>
                                                        </div>
                                                        <button
                                                            className={`variant-add-btn ${isAdded ? 'added' : ''} ${outOfStock ? 'out-of-stock' : ''}`}
                                                            onClick={() => handleAddToCart(product, variant)}
                                                            disabled={isAdding || isAdded || outOfStock}
                                                            title={outOfStock ? t('shop.outOfStock') : t('cart.addToCart')}
                                                        >
                                                            {isAdding ? (
                                                                <Loader size={16} className="spinner" />
                                                            ) : isAdded ? (
                                                                <Check size={16} />
                                                            ) : outOfStock ? (
                                                                <span className="stock-label">{t('shop.outOfStock')}</span>
                                                            ) : (
                                                                <Plus size={16} />
                                                            )}
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="no-variants">{t('shop.noVariants')}</p>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Shop;
