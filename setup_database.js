/**
 * Quick Database Setup Script
 * This will create all necessary tables for the cart system
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Missing Supabase credentials in .env file!');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function setupDatabase() {
    console.log('🚀 Setting up cart database tables...\n');

    try {
        // Test connection
        console.log('✓ Testing connection...');
        const { data: testData, error: testError } = await supabase
            .from('products')
            .select('count')
            .limit(1);

        if (testError) {
            console.error('❌ Cannot connect to database:', testError.message);
            process.exit(1);
        }
        console.log('✓ Connected successfully!\n');

        console.log('📋 Follow these steps to complete setup:\n');
        console.log('1. Go to: https://pjsyaeztmnslniklmsvy.supabase.co/project/pjsyaeztmnslniklmsvy/sql/new');
        console.log('2. Copy the ENTIRE content of: supabase/migrations/20260126_cart_and_orders.sql');
        console.log('3. Paste it into the SQL Editor');
        console.log('4. Click "Run" (or press Ctrl+Enter)\n');
        console.log('5. Come back here and run: node add_product_variants.js\n');

        console.log('⚠️  IMPORTANT: You must run the migration manually in Supabase Dashboard');
        console.log('   The SQL file creates these tables:');
        console.log('   • product_variants (for 500g, 1kg, 5kg options)');
        console.log('   • cart_items (for shopping cart)');
        console.log('   • orders_v2 (for orders)');
        console.log('   • order_items (for order details)');
        console.log('   • order_error_logs (for debugging)\n');

        console.log('💡 After migration, your Cart will work perfectly!\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

setupDatabase();
