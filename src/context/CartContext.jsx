import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

// Generate a guest user ID and store in localStorage
const getGuestUserId = () => {
    let guestId = localStorage.getItem('guest_user_id');
    if (!guestId) {
        guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('guest_user_id', guestId);
    }
    return guestId;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const userId = getGuestUserId(); // For now, using guest IDs

    // Load cart from database or localStorage
    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        setLoading(true);
        try {
            // Try to load from Supabase first
            const { data, error: fetchError } = await supabase
                .from('cart_items')
                .select(`
          id,
          quantity,
          created_at,
          products:product_id (
            id,
            name_en,
            name_ar,
            image_url
          ),
          product_variants:variant_id (
            id,
            weight_variant,
            price,
            stock_quantity
          )
        `)
                .eq('user_id', userId);

            if (fetchError) {
                console.warn('Could not load cart from database:', fetchError.message);
                // Fallback to localStorage
                const localCart = localStorage.getItem('cart');
                if (localCart) {
                    setCart(JSON.parse(localCart));
                }
            } else {
                setCart(data || []);
            }
        } catch (err) {
            console.error('Error loading cart:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Add item to cart
    const addToCart = async (productId, variantId, quantity = 1) => {
        try {
            setError(null);

            // First, validate the variant exists and has stock
            const { data: variant, error: variantError } = await supabase
                .from('product_variants')
                .select('id, price, stock_quantity, weight_variant')
                .eq('id', variantId)
                .single();

            if (variantError || !variant) {
                throw new Error('ERR_VARIANT_NOT_FOUND: Product variant not found');
            }

            if (variant.stock_quantity < quantity) {
                throw new Error(`ERR_INSUFFICIENT_STOCK: Only ${variant.stock_quantity} items available`);
            }

            // Check if item already exists in cart
            const { data: existing, error: existingError } = await supabase
                .from('cart_items')
                .select('*')
                .eq('user_id', userId)
                .eq('variant_id', variantId)
                .maybeSingle();

            if (existingError && existingError.code !== 'PGRST116') {
                throw existingError;
            }

            if (existing) {
                // Update quantity
                const newQuantity = existing.quantity + quantity;

                if (newQuantity > variant.stock_quantity) {
                    throw new Error(`ERR_INSUFFICIENT_STOCK: Cannot add more than ${variant.stock_quantity} items`);
                }

                const { error: updateError } = await supabase
                    .from('cart_items')
                    .update({ quantity: newQuantity })
                    .eq('id', existing.id);

                if (updateError) throw updateError;
            } else {
                // Insert new cart item
                const { error: insertError } = await supabase
                    .from('cart_items')
                    .insert([{
                        user_id: userId,
                        product_id: productId,
                        variant_id: variantId,
                        quantity
                    }]);

                if (insertError) throw insertError;
            }

            // Reload cart
            await loadCart();
            return { success: true };
        } catch (err) {
            console.error('Error adding to cart:', err);

            // Log error to database
            await logError('ERR_ADD_TO_CART', err.message, { productId, variantId, quantity });

            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    // Update cart item quantity
    const updateQuantity = async (cartItemId, newQuantity) => {
        if (newQuantity < 1) {
            return removeFromCart(cartItemId);
        }

        try {
            const { error } = await supabase
                .from('cart_items')
                .update({ quantity: newQuantity })
                .eq('id', cartItemId)
                .eq('user_id', userId);

            if (error) throw error;

            await loadCart();
            return { success: true };
        } catch (err) {
            console.error('Error updating quantity:', err);
            await logError('ERR_UPDATE_CART', err.message, { cartItemId, newQuantity });
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    // Remove item from cart
    const removeFromCart = async (cartItemId) => {
        try {
            const { error } = await supabase
                .from('cart_items')
                .delete()
                .eq('id', cartItemId)
                .eq('user_id', userId);

            if (error) throw error;

            await loadCart();
            return { success: true };
        } catch (err) {
            console.error('Error removing from cart:', err);
            await logError('ERR_REMOVE_FROM_CART', err.message, { cartItemId });
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    // Clear entire cart
    const clearCart = async () => {
        try {
            const { error } = await supabase
                .from('cart_items')
                .delete()
                .eq('user_id', userId);

            if (error) throw error;

            setCart([]);
            localStorage.removeItem('cart');
            return { success: true };
        } catch (err) {
            console.error('Error clearing cart:', err);
            await logError('ERR_CLEAR_CART', err.message, {});
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    // Calculate cart totals
    const getCartTotal = () => {
        return cart.reduce((total, item) => {
            const price = item.product_variants?.price || 0;
            const quantity = item.quantity || 0;
            return total + (price * quantity);
        }, 0);
    };

    const getCartCount = () => {
        return cart.reduce((count, item) => count + (item.quantity || 0), 0);
    };

    // Log error to database
    const logError = async (errorCode, errorMessage, context) => {
        try {
            await supabase
                .from('order_error_logs')
                .insert([{
                    error_code: errorCode,
                    error_message: errorMessage,
                    context,
                    user_id: userId
                }]);
        } catch (err) {
            console.error('Failed to log error:', err);
        }
    };

    return (
        <CartContext.Provider value={{
            cart,
            loading,
            error,
            addToCart,
            updateQuantity,
            removeFromCart,
            clearCart,
            getCartTotal,
            getCartCount,
            refreshCart: loadCart
        }}>
            {children}
        </CartContext.Provider>
    );
};
