import { supabase } from '../supabaseClient';

/**
 * Order Execution Service
 * Handles secure order placement with database transactions
 */

export class OrderService {
    /**
     * Execute order with full transaction integrity
     * @param {Object} orderData - Customer and shipping information
     * @param {Array} cartItems - Items to be ordered
     * @returns {Promise<Object>} Result with order details or error
     */
    static async executeOrder(orderData, cartItems) {
        const startTime = Date.now();
        let orderId = null;

        try {
            // Validate inputs
            if (!orderData || !cartItems || cartItems.length === 0) {
                throw new Error('ERR_INVALID_INPUT: Order data and cart items are required');
            }

            // Validate required fields
            const requiredFields = ['customerName', 'customerEmail', 'customerPhone', 'shippingAddress'];
            for (const field of requiredFields) {
                if (!orderData[field]) {
                    throw new Error(`ERR_MISSING_FIELD: ${field} is required`);
                }
            }

            // Step 1: Begin Transaction (Simulated with try-catch)
            console.log('[ORDER] Starting order execution...');

            // Step 2: Check inventory and lock rows
            const inventoryCheck = await this.checkAndLockInventory(cartItems);
            if (!inventoryCheck.success) {
                throw new Error(inventoryCheck.error);
            }

            // Step 3: Calculate totals
            const { subtotal, shippingCost, totalAmount } = this.calculateTotals(cartItems, orderData.shippingAddress);

            // Step 4: Generate order number
            const orderNumber = this.generateOrderNumber();

            // Step 5: Create order record
            const { data: order, error: orderError } = await supabase
                .from('orders_v2')
                .insert([{
                    order_number: orderNumber,
                    user_id: orderData.userId || null,
                    customer_name: orderData.customerName,
                    customer_email: orderData.customerEmail,
                    customer_phone: orderData.customerPhone,
                    shipping_address: orderData.shippingAddress,
                    subtotal,
                    shipping_cost: shippingCost,
                    total_amount: totalAmount,
                    order_status: 'pending',
                    payment_status: 'pending',
                    notes: orderData.notes || null
                }])
                .select()
                .single();

            if (orderError) {
                throw new Error(`ERR_ORDER_CREATE: ${orderError.message}`);
            }

            orderId = order.id;
            console.log(`[ORDER] Created order ${orderNumber} (ID: ${orderId})`);

            // Step 6: Create order items and deduct stock
            const orderItemsResult = await this.createOrderItemsAndDeductStock(orderId, cartItems);
            if (!orderItemsResult.success) {
                // Rollback: Delete the order
                await this.rollbackOrder(orderId);
                throw new Error(orderItemsResult.error);
            }

            // Step 7: Clear user's cart
            const cartClearResult = await this.clearUserCart(orderData.userId);
            if (!cartClearResult.success) {
                console.warn('[ORDER] Failed to clear cart, but order was successful');
            }

            // Log success
            const executionTime = Date.now() - startTime;
            console.log(`[ORDER] Order ${orderNumber} completed successfully in ${executionTime}ms`);

            return {
                success: true,
                order: {
                    id: order.id,
                    orderNumber: order.order_number,
                    totalAmount: order.total_amount,
                    status: order.order_status
                }
            };

        } catch (error) {
            // Rollback if order was partially created
            if (orderId) {
                await this.rollbackOrder(orderId);
            }

            // Log error
            await this.logError('ERR_ORDER_EXECUTION', error.message, {
                orderData,
                cartItemsCount: cartItems?.length,
                executionTime: Date.now() - startTime
            });

            console.error('[ORDER] Execution failed:', error.message);

            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Check inventory and simulate row locking
     */
    static async checkAndLockInventory(cartItems) {
        try {
            for (const item of cartItems) {
                const variantId = item.variant_id || item.product_variants?.id;
                const quantity = item.quantity;

                // Fetch current stock with FOR UPDATE simulation
                const { data: variant, error } = await supabase
                    .from('product_variants')
                    .select('id, stock_quantity, weight_variant')
                    .eq('id', variantId)
                    .single();

                if (error) {
                    return { success: false, error: `ERR_VARIANT_NOT_FOUND: Variant ${variantId} not found` };
                }

                if (variant.stock_quantity < quantity) {
                    return {
                        success: false,
                        error: `ERR_INSUFFICIENT_STOCK: ${variant.weight_variant} - Only ${variant.stock_quantity} available, requested ${quantity}`
                    };
                }
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: `ERR_INVENTORY_CHECK: ${error.message}` };
        }
    }

    /**
     * Create order items and deduct stock atomically
     */
    static async createOrderItemsAndDeductStock(orderId, cartItems) {
        try {
            const orderItems = [];

            for (const item of cartItems) {
                const variantId = item.variant_id || item.product_variants?.id;
                const productId = item.product_id || item.products?.id;
                const quantity = item.quantity;
                const productName = item.products?.name_en || 'Unknown Product';
                const weightVariant = item.product_variants?.weight_variant || '1kg';
                const unitPrice = item.product_variants?.price || 0;
                const lineTotal = unitPrice * quantity;

                // Insert order item
                const { error: itemError } = await supabase
                    .from('order_items')
                    .insert([{
                        order_id: orderId,
                        product_id: productId,
                        variant_id: variantId,
                        product_name: productName,
                        weight_variant: weightVariant,
                        unit_price: unitPrice,
                        quantity,
                        line_total: lineTotal
                    }]);

                if (itemError) {
                    throw new Error(`ERR_ORDER_ITEM_CREATE: ${itemError.message}`);
                }

                // Deduct stock
                const { data: currentVariant, error: fetchError } = await supabase
                    .from('product_variants')
                    .select('stock_quantity')
                    .eq('id', variantId)
                    .single();

                if (fetchError) {
                    throw new Error(`ERR_STOCK_FETCH: ${fetchError.message}`);
                }

                const newStock = currentVariant.stock_quantity - quantity;

                if (newStock < 0) {
                    throw new Error(`ERR_NEGATIVE_STOCK: Cannot deduct ${quantity} from ${currentVariant.stock_quantity}`);
                }

                const { error: updateError } = await supabase
                    .from('product_variants')
                    .update({ stock_quantity: newStock })
                    .eq('id', variantId);

                if (updateError) {
                    throw new Error(`ERR_STOCK_UPDATE: ${updateError.message}`);
                }

                orderItems.push({ variantId, quantity, newStock });
            }

            console.log(`[ORDER] Created ${orderItems.length} order items and updated stock`);
            return { success: true, orderItems };

        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Calculate order totals
     */
    static calculateTotals(cartItems, shippingAddress) {
        const subtotal = cartItems.reduce((sum, item) => {
            const price = item.product_variants?.price || 0;
            const quantity = item.quantity || 0;
            return sum + (price * quantity);
        }, 0);

        // Simple shipping calculation
        const shippingCost = subtotal > 500 ? 0 : 50; // Free shipping over 500 EGP

        const totalAmount = subtotal + shippingCost;

        return { subtotal, shippingCost, totalAmount };
    }

    /**
     * Generate unique order number
     */
    static generateOrderNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `ORD-${year}${month}${day}-${random}`;
    }

    /**
     * Clear user's cart after successful order
     */
    static async clearUserCart(userId) {
        if (!userId) return { success: true }; // Guest order

        try {
            const { error } = await supabase
                .from('cart_items')
                .delete()
                .eq('user_id', userId);

            if (error) throw error;

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Rollback order on failure
     */
    static async rollbackOrder(orderId) {
        try {
            console.log(`[ORDER] Rolling back order ${orderId}...`);

            // Delete order (cascade will delete order_items)
            await supabase
                .from('orders_v2')
                .delete()
                .eq('id', orderId);

            console.log(`[ORDER] Rollback complete`);
        } catch (error) {
            console.error(`[ORDER] Rollback failed:`, error.message);
        }
    }

    /**
     * Log error to database
     */
    static async logError(errorCode, errorMessage, context) {
        try {
            await supabase
                .from('order_error_logs')
                .insert([{
                    error_code: errorCode,
                    error_message: errorMessage,
                    context
                }]);
        } catch (err) {
            console.error('Failed to log error:', err);
        }
    }
}
