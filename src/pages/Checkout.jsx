import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { OrderService } from '../services/OrderService';
import { ShoppingBag, Trash2, Plus, Minus, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import './Checkout.css';

const Checkout = () => {
    const { cart, loading: cartLoading, updateQuantity, removeFromCart, getCartTotal, getCartCount } = useCart();
    const navigate = useNavigate();

    const [customerData, setCustomerData] = useState({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        street: '',
        city: '',
        postalCode: '',
        country: 'Egypt',
        notes: ''
    });

    const [orderState, setOrderState] = useState({
        processing: false,
        success: false,
        error: null,
        orderNumber: null
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCustomerData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleQuantityChange = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        await updateQuantity(itemId, newQuantity);
    };

    const handleRemoveItem = async (itemId) => {
        if (confirm('Remove this item from cart?')) {
            await removeFromCart(itemId);
        }
    };

    const validateForm = () => {
        const required = ['customerName', 'customerEmail', 'customerPhone', 'street', 'city'];
        for (const field of required) {
            if (!customerData[field] || customerData[field].trim() === '') {
                return { valid: false, message: `Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}` };
            }
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(customerData.customerEmail)) {
            return { valid: false, message: 'Please enter a valid email address' };
        }

        // Phone validation (Egyptian format)
        const phoneRegex = /^(\+20|0)?1[0125]\d{8}$/;
        if (!phoneRegex.test(customerData.customerPhone.replace(/\s/g, ''))) {
            return { valid: false, message: 'Please enter a valid Egyptian phone number' };
        }

        return { valid: true };
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        // Reset state
        setOrderState({
            processing: false,
            success: false,
            error: null,
            orderNumber: null
        });

        // Validate cart
        if (!cart || cart.length === 0) {
            setOrderState(prev => ({ ...prev, error: 'Your cart is empty' }));
            return;
        }

        // Validate form
        const validation = validateForm();
        if (!validation.valid) {
            setOrderState(prev => ({ ...prev, error: validation.message }));
            return;
        }

        // Start processing
        setOrderState(prev => ({ ...prev, processing: true }));

        try {
            // Prepare shipping address
            const shippingAddress = {
                street: customerData.street,
                city: customerData.city,
                postalCode: customerData.postalCode || '',
                country: customerData.country
            };

            // Prepare order data
            const orderData = {
                userId: localStorage.getItem('guest_user_id'),
                customerName: customerData.customerName,
                customerEmail: customerData.customerEmail,
                customerPhone: customerData.customerPhone,
                shippingAddress,
                notes: customerData.notes
            };

            // Execute order
            const result = await OrderService.executeOrder(orderData, cart);

            if (result.success) {
                setOrderState({
                    processing: false,
                    success: true,
                    error: null,
                    orderNumber: result.order.orderNumber
                });

                // Reset form
                setCustomerData({
                    customerName: '',
                    customerEmail: '',
                    customerPhone: '',
                    street: '',
                    city: '',
                    postalCode: '',
                    country: 'Egypt',
                    notes: ''
                });

                // Scroll to success message
                window.scrollTo({ top: 0, behavior: 'smooth' });

            } else {
                throw new Error(result.error || 'Order failed');
            }

        } catch (error) {
            console.error('Order placement error:', error);
            setOrderState({
                processing: false,
                success: false,
                error: error.message || 'Failed to place order. Please try again.',
                orderNumber: null
            });
        }
    };

    const subtotal = getCartTotal();
    const shippingCost = subtotal > 500 ? 0 : 50;
    const total = subtotal + shippingCost;

    if (cartLoading) {
        return (
            <div className="checkout-page loading-state">
                <Loader className="spinner" size={48} />
                <p>Loading your cart...</p>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <div className="container">
                <h1 className="page-title">
                    <ShoppingBag size={32} />
                    Checkout
                </h1>

                {/* Success Message */}
                {orderState.success && (
                    <div className="alert alert-success">
                        <CheckCircle size={24} />
                        <div>
                            <h3>Order Placed Successfully!</h3>
                            <p>Your order number is: <strong>{orderState.orderNumber}</strong></p>
                            <p>We'll send you a confirmation email shortly.</p>
                            <button onClick={() => navigate('/')} className="btn btn-primary">
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {orderState.error && (
                    <div className="alert alert-error">
                        <AlertCircle size={24} />
                        <div>
                            <h3>Error</h3>
                            <p>{orderState.error}</p>
                        </div>
                    </div>
                )}

                {!orderState.success && (
                    <div className="checkout-grid">
                        {/* Cart Items */}
                        <div className="cart-section">
                            <h2>Your Cart ({getCartCount()} items)</h2>
                            {cart.length === 0 ? (
                                <div className="empty-cart">
                                    <ShoppingBag size={64} />
                                    <p>Your cart is empty</p>
                                    <button onClick={() => navigate('/shop')} className="btn btn-primary">
                                        Start Shopping
                                    </button>
                                </div>
                            ) : (
                                <div className="cart-items">
                                    {cart.map((item) => (
                                        <div key={item.id} className="cart-item">
                                            <img
                                                src={item.products?.image_url || '/hero-dates.png'}
                                                alt={item.products?.name_en}
                                            />
                                            <div className="item-details">
                                                <h3>{item.products?.name_en || 'Date Product'}</h3>
                                                <p className="variant-info">{item.product_variants?.weight_variant}</p>
                                                <p className="price">{item.product_variants?.price} ج.م</p>
                                            </div>
                                            <div className="quantity-controls">
                                                <button
                                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                    disabled={orderState.processing}
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span>{item.quantity}</span>
                                                <button
                                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                    disabled={orderState.processing}
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                            <div className="item-total">
                                                {(item.product_variants?.price * item.quantity).toFixed(2)} ج.م
                                            </div>
                                            <button
                                                className="remove-btn"
                                                onClick={() => handleRemoveItem(item.id)}
                                                disabled={orderState.processing}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Checkout Form */}
                        {cart.length > 0 && (
                            <div className="checkout-form-section">
                                <h2>Shipping Information</h2>
                                <form onSubmit={handlePlaceOrder} className="checkout-form">
                                    <div className="form-group">
                                        <label>Full Name *</label>
                                        <input
                                            type="text"
                                            name="customerName"
                                            value={customerData.customerName}
                                            onChange={handleInputChange}
                                            required
                                            disabled={orderState.processing}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Email *</label>
                                        <input
                                            type="email"
                                            name="customerEmail"
                                            value={customerData.customerEmail}
                                            onChange={handleInputChange}
                                            required
                                            disabled={orderState.processing}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Phone Number *</label>
                                        <input
                                            type="tel"
                                            name="customerPhone"
                                            value={customerData.customerPhone}
                                            onChange={handleInputChange}
                                            placeholder="+20 1XX XXX XXXX"
                                            required
                                            disabled={orderState.processing}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Street Address *</label>
                                        <input
                                            type="text"
                                            name="street"
                                            value={customerData.street}
                                            onChange={handleInputChange}
                                            required
                                            disabled={orderState.processing}
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>City *</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={customerData.city}
                                                onChange={handleInputChange}
                                                required
                                                disabled={orderState.processing}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Postal Code</label>
                                            <input
                                                type="text"
                                                name="postalCode"
                                                value={customerData.postalCode}
                                                onChange={handleInputChange}
                                                disabled={orderState.processing}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Country *</label>
                                        <select
                                            name="country"
                                            value={customerData.country}
                                            onChange={handleInputChange}
                                            disabled={orderState.processing}
                                        >
                                            <option value="Egypt">Egypt</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Order Notes (Optional)</label>
                                        <textarea
                                            name="notes"
                                            value={customerData.notes}
                                            onChange={handleInputChange}
                                            rows="3"
                                            disabled={orderState.processing}
                                        ></textarea>
                                    </div>

                                    <div className="order-summary">
                                        <div className="summary-row">
                                            <span>Subtotal:</span>
                                            <span>{subtotal.toFixed(2)} ج.م</span>
                                        </div>
                                        <div className="summary-row">
                                            <span>Shipping:</span>
                                            <span>{shippingCost === 0 ? 'FREE' : `${shippingCost.toFixed(2)} ج.م`}</span>
                                        </div>
                                        <div className="summary-row total">
                                            <span>Total:</span>
                                            <span>{total.toFixed(2)} ج.م</span>
                                        </div>
                                        {subtotal < 500 && (
                                            <p className="shipping-notice">
                                                Add {(500 - subtotal).toFixed(2)} ج.م more for free shipping!
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-block"
                                        disabled={orderState.processing}
                                    >
                                        {orderState.processing ? (
                                            <>
                                                <Loader className="spinner" size={20} />
                                                Processing Order...
                                            </>
                                        ) : (
                                            'Place Order'
                                        )}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Checkout;
