# E-commerce Cart & Order System Documentation

## 🎯 Overview
This document describes the comprehensive cart and order execution system implemented for the Seleena Dates e-commerce platform with **100% data integrity** between frontend and database.

---

## 📊 Database Schema

### Tables Created

#### 1. `product_variants`
Manages different weight options for products (500g, 1kg, 5kg).

```sql
Columns:
- id (UUID, Primary Key)
- product_id (BIGINT, FK to products)
- weight_variant (TEXT: '500g', '1kg', '5kg')
- price (DECIMAL: unit price for this variant)
- stock_quantity (INTEGER: available stock)
- created_at (TIMESTAMP)
```

**Constraints:**
- `CHECK` constraint ensures only valid weights
- `UNIQUE` constraint on (product_id, weight_variant)
- Stock quantity must be >= 0

#### 2. `cart_items`
Stores cart data for users (persists across sessions).

```sql
Columns:
- id (UUID, Primary Key)
- user_id (UUID: guest or authenticated user)
- product_id (BIGINT, FK to products)
- variant_id (UUID, FK to product_variants)
- quantity (INTEGER: items in cart)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

**Constraints:**
- Quantity must be > 0
- `UNIQUE` constraint on (user_id, variant_id) prevents duplicates

#### 3. `orders_v2`
Enhanced orders table with complete customer and shipping information.

```sql
Columns:
- id (UUID, Primary Key)
- order_number (TEXT, Unique: e.g., 'ORD-20260126-4532')
- user_id (UUID, Nullable for guest orders)
- customer_name (TEXT)
- customer_email (TEXT)
- customer_phone (TEXT)
- shipping_address (JSONB: {street, city, postal_code, country})
- subtotal (DECIMAL)
- shipping_cost (DECIMAL)
- total_amount (DECIMAL)
- order_status (TEXT: pending, confirmed, processing, shipped, delivered, cancelled)
- payment_status (TEXT: pending, paid, failed, refunded)
- notes (TEXT, Optional)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 4. `order_items`
Line items for each order (snapshot of product data at order time).

```sql
Columns:
- id (UUID, Primary Key)
- order_id (UUID, FK to orders_v2)
- product_id (BIGINT, FK to products)
- variant_id (UUID, FK to product_variants)
- product_name (TEXT: snapshot)
- weight_variant (TEXT: snapshot)
- unit_price (DECIMAL: price at order time)
- quantity (INTEGER)
- line_total (DECIMAL: unit_price × quantity)
- created_at (TIMESTAMP)
```

#### 5. `order_error_logs`
Comprehensive error logging for debugging and monitoring.

```sql
Columns:
- id (UUID, Primary Key)
- error_code (TEXT: e.g., 'ERR_INSUFFICIENT_STOCK')
- error_message (TEXT)
- context (JSONB: additional error data)
- user_id (UUID, Nullable)
- created_at (TIMESTAMP)
```

---

## 🔐 Transaction Integrity & Order Execution Flow

### Order Execution Steps (OrderService.js)

```javascript
1. INPUT VALIDATION
   ├─ Validate order data (customer info, shipping address)
   ├─ Validate cart items exist
   └─ Check all required fields are provided

2. INVENTORY CHECK & LOCK (Simulated)
   ├─ For each cart item:
   │  ├─ Fetch variant with current stock
   │  ├─ Verify stock >= quantity
   │  └─ Log error if insufficient
   └─ Abort if any item fails

3. CALCULATE TOTALS
   ├─ Subtotal = Σ(price × quantity)
   ├─ Shipping = Free if subtotal > 500 EGP, else 50 EGP
   └─ Total = Subtotal + Shipping

4. CREATE ORDER RECORD
   ├─ Generate unique order number (ORD-YYYYMMDD-XXXX)
   ├─ Insert into orders_v2 table
   └─ Store order ID for next steps

5. CREATE ORDER ITEMS & DEDUCT STOCK (Atomic Operations)
   ├─ For each cart item:
   │  ├─ Insert into order_items (snapshot of product data)
   │  ├─ Fetch current stock again
   │  ├─ Check stock >= quantity (prevent race conditions)
   │  ├─ Calculate new_stock = current_stock - quantity
   │  ├─ Update product_variants.stock_quantity
   │  └─ Rollback entire order if any step fails
   └─ Commit if all items succeed

6. CLEAR USER CART
   ├─ Delete all items from cart_items for user_id
   └─ localStorage cleanup

7. SUCCESS / ROLLBACK
   ├─ If success: Return order details
   └─ If error: Delete order (cascade deletes order_items)
```

### Error Codes

| Code | Description |
|------|-------------|
| `ERR_INVALID_INPUT` | Missing or invalid order data |
| `ERR_MISSING_FIELD` | Required field not provided |
| `ERR_VARIANT_NOT_FOUND` | Product variant doesn't exist |
| `ERR_INSUFFICIENT_STOCK` | Not enough stock available |
| `ERR_ORDER_CREATE` | Failed to create order record |
| `ERR_ORDER_ITEM_CREATE` | Failed to create order item |
| `ERR_STOCK_FETCH` | Failed to fetch current stock |
| `ERR_STOCK_UPDATE` | Failed to update stock quantity |
| `ERR_NEGATIVE_STOCK` | Would result in negative stock |
| `ERR_ADD_TO_CART` | Failed to add item to cart |
| `ERR_UPDATE_CART` | Failed to update cart quantity |
| `ERR_REMOVE_FROM_CART` | Failed to remove cart item |
| `ERR_CLEAR_CART` | Failed to clear cart |

---

## 🛒 Cart Management (CartContext.jsx)

### Features

1. **Guest User Support**
   - Generates unique guest ID: `guest_{timestamp}_{random}`
   - Stores in localStorage for session persistence

2. **Add to Cart**
   ```javascript
   addToCart(productId, variantId, quantity)
   - Validates variant exists
   - Checks stock availability
   - Updates quantity if item exists
   - Inserts new item if not exists
   - Logs errors to database
   ```

3. **Update Quantity**
   ```javascript
   updateQuantity(cartItemId, newQuantity)
   - Validates quantity > 0
   - Updates database
   - Refreshes cart UI
   ```

4. **Remove from Cart**
   ```javascript
   removeFromCart(cartItemId)
   - Deletes item from database
   - Refreshes cart UI
   ```

5. **Cart Totals**
   - `getCartTotal()`: Returns total price
   - `getCartCount()`: Returns total item count

---

## 🎨 Frontend Components

### 1. Checkout Page (`/checkout`)

**Features:**
- Real-time cart display with quantity controls
- Remove items with confirmation
- Shipping information form with validation
- Egyptian phone number validation (+20 1XX XXX XXXX)
- Email format validation
- Dynamic shipping cost calculation
- Order summary with subtotal, shipping, and total
- Success/Error alerts with animations
- Loading states during order processing

**Validation:**
- All required fields must be filled
- Email must be valid format
- Phone must match Egyptian format
- Prevents submission while processing

**User Experience:**
- Sticky checkout form on desktop
- Responsive layout for mobile
- Inline quantity adjustment
- One-click item removal
- Free shipping indicator
- Real-time total updates

---

## 🔄 API Flow Examples

### Example 1: Add to Cart

```
User clicks "Add to Cart" (Product: Majdool, Variant: 1kg)
  ↓
CartContext.addToCart(3, 'uuid-123', 1)
  ↓
1. Query product_variants WHERE id = 'uuid-123'
2. Check stock_quantity >= 1
3. Query cart_items WHERE user_id = guest_xxx AND variant_id = 'uuid-123'
4. If exists: UPDATE quantity = quantity + 1
   If not: INSERT cart_items (user_id, product_id, variant_id, quantity)
  ↓
Success: Cart UI updates with new item
Error: Alert shown to user + error logged
```

### Example 2: Place Order

```
User clicks "Place Order"
  ↓
Checkout.handlePlaceOrder()
  ↓
1. Validate customer data (name, email, phone, address)
2. Prepare orderData object
3. Call OrderService.executeOrder(orderData, cart)
  ↓
OrderService:
  ├─ Step 1: Validate inputs
  ├─ Step 2: Check all cart items have stock
  ├─ Step 3: Calculate totals
  ├─ Step 4: INSERT into orders_v2 → order_id
  ├─ Step 5: For each cart item:
  │    ├─ INSERT into order_items
  │    ├─ UPDATE product_variants SET stock -= quantity
  ├─ Step 6: DELETE from cart_items
  └─ Step 7: Return success or rollback
  ↓
Success: Show order number, clear form
Error: Show error message, keep cart intact
```

---

## 🚀 Setup Instructions

### 1. Run Database Migration

```bash
# Connect to your Supabase project
cd seleena-dates
npx supabase db push

# Or manually run the SQL file in Supabase dashboard:
# supabase/migrations/20260126_cart_and_orders.sql
```

### 2. Test the System

1. Navigate to `/shop`
2. Add items to cart (different variants)
3. Navigate to `/checkout`
4. Fill in shipping information
5. Click "Place Order"
6. Verify order created in database

### 3. Monitor Errors

Query error logs:
```sql
SELECT * FROM order_error_logs 
ORDER BY created_at DESC 
LIMIT 50;
```

---

## 📈 Performance Optimizations

1. **Indexes**
   - `idx_cart_items_user` on cart_items(user_id)
   - `idx_cart_items_variant` on cart_items(variant_id)
   - `idx_orders_v2_user` on orders_v2(user_id)
   - `idx_order_items_order` on order_items(order_id)

2. **Triggers**
   - `update_updated_at_column()` auto-updates timestamps

3. **RLS Policies**
   - Public read on product_variants
   - User-scoped cart access
   - Public read on orders (for admin dashboard)

---

## 🔒 Security Features

1. **SQL Injection Prevention**
   - All queries use Supabase client (parameterized)
   - No raw SQL in frontend

2. **Data Validation**
   - Check constraints on database level
   - Frontend validation before submission
   - Backend validation in OrderService

3. **Stock Protection**
   - Stock checks before order creation
   - Re-validated during deduction
   - Rollback on failure prevents overselling

---

## 🧪 Testing Checklist

- [ ] Add item to cart → verify in database
- [ ] Update quantity → verify stock not exceeded
- [ ] Remove item → verify deleted from database
- [ ] Place order with 1 item → verify stock deducted
- [ ] Place order with multiple items → verify all stocks updated
- [ ] Try ordering more than stock → verify error shown
- [ ] Test guest user cart persistence → reload page, cart intact
- [ ] Test shipping cost calculation → free over 500 EGP
- [ ] Test form validation → all fields required
- [ ] Test order rollback → trigger error mid-order, verify nothing saved

---

## 📞 Support

For issues or questions:
- Check `order_error_logs` table
- Review console logs for detailed errors
- Verify database constraints are met

---

**Last Updated:** January 26, 2026
**System Version:** 1.0.0
**Database Migration:** 20260126_cart_and_orders.sql
