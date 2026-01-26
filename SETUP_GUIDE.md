# 🚀 Quick Setup Guide - Cart & Order System

## ✅ Step 1: Deployed to Vercel

Your website is now live at:
- **Production URL**: https://seleena-dates.vercel.app
- **Features Deployed**: Full cart and order system with Checkout page

---

## 📋 Step 2: Database Migration

### Option A: Manual Migration (Recommended)

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `seleena-dates`

2. **Open SQL Editor**
   - Click: `SQL Editor` → `New Query`

3. **Run the Migration**
   - Copy the entire contents of: `supabase/migrations/20260126_cart_and_orders.sql`
   - Paste into the SQL editor
   - Click: `Run`

4. **Verify Tables Created**
   Run this query to verify:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('product_variants', 'cart_items', 'orders_v2', 'order_items', 'order_error_logs');
   ```
   Should return 5 rows.

### Option B: Using Node Script

```bash
node run_cart_migration.js
```
(This will test the connection and provide instructions)

---

## 🏷️ Step 3: Add Product Variants

This adds 500g, 1kg, and 5kg options to all your existing products.

### Prerequisites

1. **Create `.env` file** (if not exists):
   ```bash
   # In project root
   touch .env
   ```

2. **Add Supabase credentials to `.env`**:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

   **Where to find these:**
   - Go to: Supabase Dashboard → Settings → API
   - Copy `Project URL` → SUPABASE_URL
   - Copy `service_role` key (under "Project API keys") → SUPABASE_SERVICE_ROLE_KEY
   - ⚠️ **IMPORTANT**: Use `service_role` key, NOT `anon` key

3. **Run the script**:
   ```bash
   node add_product_variants.js
   ```

### What This Does

For each product (e.g., "Premium Majdool Box" at 120 EGP):
- **500g variant**: 60 EGP (half price, half stock)
- **1kg variant**: 120 EGP (original price and stock)
- **5kg variant**: 540 EGP (10% bulk discount, double stock)

### Example Output
```
✅ Found 3 products

📝 Creating variants for: Premium Majdool Box
  ✓ 500g: 60.00 EGP (22 in stock)
  ✓ 1kg:  120.00 EGP (45 in stock)
  ✓ 5kg:  540.00 EGP (90 in stock)

✅ Successfully created 9 product variants!
```

---

## 🧪 Step 4: Test the System

### Test Cart Flow

1. **Visit Shop Page**
   ```
   https://seleena-dates.vercel.app/shop
   ```

2. **Add Items to Cart**
   - Select a product
   - Choose a variant (500g, 1kg, or 5kg)
   - Click "Add to Cart"

3. **Go to Checkout**
   ```
   https://seleena-dates.vercel.app/checkout
   ```

4. **Fill Shipping Form**
   - Name: Test User
   - Email: test@example.com
   - Phone: +20 101 234 5678
   - Address: 123 Test St, Cairo, Egypt

5. **Place Order**
   - Click "Place Order"
   - Should see success message with order number

### Verify in Database

**Check Order Created:**
```sql
SELECT * FROM orders_v2 ORDER BY created_at DESC LIMIT 5;
```

**Check Order Items:**
```sql
SELECT oi.*, p.name_en, pv.weight_variant
FROM order_items oi
JOIN products p ON oi.product_id = p.id
JOIN product_variants pv ON oi.variant_id = pv.id
ORDER BY oi.created_at DESC;
```

**Check Stock Deducted:**
```sql
SELECT p.name_en, pv.weight_variant, pv.stock_quantity
FROM product_variants pv
JOIN products p ON pv.product_id = p.id
ORDER BY p.name_en, pv.weight_variant;
```

**Check for Errors:**
```sql
SELECT * FROM order_error_logs ORDER BY created_at DESC LIMIT 10;
```

---

## 🛠️ Step 5: Admin Order Management (Optional)

Would you like me to create an admin interface to view and manage orders? This would include:

- View all orders with filters (status, date range)
- View order details (customer info, items, totals)
- Update order status (pending → confirmed → shipped → delivered)
- Track inventory changes
- Export orders to CSV

Let me know if you'd like this feature!

---

## 🔍 Monitoring & Debugging

### View Recent Errors
```sql
SELECT 
  error_code,
  error_message,
  context,
  created_at
FROM order_error_logs
ORDER BY created_at DESC
LIMIT 20;
```

### Check Cart Activity
```sql
SELECT 
  ci.user_id,
  p.name_en,
  pv.weight_variant,
  ci.quantity,
  ci.created_at
FROM cart_items ci
JOIN products p ON ci.product_id = p.id
JOIN product_variants pv ON ci.variant_id = pv.id
ORDER BY ci.created_at DESC;
```

### Order Statistics
```sql
SELECT 
  order_status,
  COUNT(*) as count,
  SUM(total_amount) as total_revenue
FROM orders_v2
GROUP BY order_status;
```

---

## 📚 Documentation

For detailed technical documentation, see:
- **System Documentation**: `CART_ORDER_SYSTEM.md`
- **Database Schema**: `supabase/migrations/20260126_cart_and_orders.sql`
- **Cart Context**: `src/context/CartContext.jsx`
- **Order Service**: `src/services/OrderService.js`
- **Checkout Page**: `src/pages/Checkout.jsx`

---

## 🆘 Troubleshooting

### "product_variants table does not exist"
→ Run the database migration (Step 2)

### "SUPABASE_URL is not defined"
→ Create `.env` file with correct credentials (Step 3)

### "ERR_INSUFFICIENT_STOCK"
→ Add product variants first (Step 3), or check stock levels

### Cart not persisting
→ Check browser localStorage for `guest_user_id`
→ Verify cart_items table exists and has data

### Order not creating
→ Check `order_error_logs` table for detailed error messages
→ Verify all required fields are filled in checkout form

---

## 🎉 Success Checklist

- [ ] Website deployed to Vercel
- [ ] Database migration applied
- [ ] Product variants added (500g, 1kg, 5kg)
- [ ] Can add items to cart
- [ ] Can view cart at /checkout
- [ ] Can place an order successfully
- [ ] Order appears in orders_v2 table
- [ ] Stock deducted from product_variants
- [ ] Cart cleared after order

---

**Need Help?** Check the error logs in Supabase or review the detailed documentation in `CART_ORDER_SYSTEM.md`.
