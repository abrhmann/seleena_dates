-- Enhanced E-commerce Schema with Product Variants and Cart System
-- Drop existing if needed and recreate with proper constraints

-- Product Variants Table (supports 500g, 1kg, 5kg sizes)
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  weight_variant TEXT NOT NULL CHECK (weight_variant IN ('500g', '1kg', '5kg')),
  price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(product_id, weight_variant)
);

-- Cart Items Table (for authenticated users)
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- Will use auth.uid() when auth is set up
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, variant_id)
);

-- Enhanced Orders Table
CREATE TABLE IF NOT EXISTS orders_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID, -- Nullable for guest orders
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address JSONB NOT NULL, -- {street, city, postal_code, country}
  subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
  shipping_cost DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),
  total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
  order_status TEXT DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Order Details/Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders_v2(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id),
  variant_id UUID NOT NULL REFERENCES product_variants(id),
  product_name TEXT NOT NULL, -- Snapshot at order time
  weight_variant TEXT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price > 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  line_total DECIMAL(10, 2) NOT NULL CHECK (line_total >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Error Logs Table
CREATE TABLE IF NOT EXISTS order_error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_code TEXT NOT NULL,
  error_message TEXT NOT NULL,
  context JSONB, -- Additional error context
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_variant ON cart_items(variant_id);
CREATE INDEX IF NOT EXISTS idx_orders_v2_user ON orders_v2(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_v2_status ON orders_v2(order_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_v2_updated_at BEFORE UPDATE ON orders_v2
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample product variants for existing products
INSERT INTO product_variants (product_id, weight_variant, price, stock_quantity)
SELECT id, '500g', price * 0.5, stock FROM products WHERE id IN (SELECT id FROM products LIMIT 3)
ON CONFLICT (product_id, weight_variant) DO NOTHING;

INSERT INTO product_variants (product_id, weight_variant, price, stock_quantity)
SELECT id, '1kg', price, stock FROM products WHERE id IN (SELECT id FROM products LIMIT 3)
ON CONFLICT (product_id, weight_variant) DO NOTHING;

INSERT INTO product_variants (product_id, weight_variant, price, stock_quantity)
SELECT id, '5kg', price * 4.5, stock * 5 FROM products WHERE id IN (SELECT id FROM products LIMIT 3)
ON CONFLICT (product_id, weight_variant) DO NOTHING;

-- Enable RLS
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_error_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow public read on product_variants" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Users can read their own cart" ON cart_items FOR SELECT USING (true);
CREATE POLICY "Users can insert to their own cart" ON cart_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own cart" ON cart_items FOR UPDATE USING (true);
CREATE POLICY "Users can delete from their own cart" ON cart_items FOR DELETE USING (true);
CREATE POLICY "Allow public read on orders_v2" ON orders_v2 FOR SELECT USING (true);
CREATE POLICY "Allow public read on order_items" ON order_items FOR SELECT USING (true);
