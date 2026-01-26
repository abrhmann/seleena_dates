/**
 * Database Migration Runner for Cart & Order System
 * 
 * This script applies the cart_and_orders migration to your Supabase database.
 * 
 * IMPORTANT: Update your .env file with your Supabase credentials before running!
 * 
 * Required environment variables:
 * - SUPABASE_URL=https://your-project.supabase.co
 * - SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ ERROR: Missing Supabase credentials!');
    console.log('\nPlease add the following to your .env file:');
    console.log('SUPABASE_URL=https://your-project.supabase.co');
    console.log('SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
    console.log('\nYou can find these in your Supabase project settings:');
    console.log('Dashboard → Project Settings → API');
    process.exit(1);
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runMigration() {
    try {
        console.log('🚀 Starting database migration...\n');

        // Read the migration file
        const migrationPath = join(__dirname, 'supabase', 'migrations', '20260126_cart_and_orders.sql');
        console.log(`📄 Reading migration file: ${migrationPath}`);
        const migrationSQL = readFileSync(migrationPath, 'utf8');

        // Note: Supabase client doesn't support multi-statement SQL execution directly
        // We need to run this via the Supabase SQL Editor or split into individual statements
        console.log('\n⚠️  MANUAL MIGRATION REQUIRED\n');
        console.log('Due to Supabase client limitations, please follow these steps:\n');
        console.log('1. Go to your Supabase Dashboard');
        console.log('2. Navigate to: SQL Editor → New Query');
        console.log('3. Copy and paste the contents of this file:');
        console.log('   supabase/migrations/20260126_cart_and_orders.sql');
        console.log('4. Click "Run" to execute the migration\n');

        // However, we can verify the connection works
        console.log('✅ Testing database connection...');
        const { data, error } = await supabase.from('products').select('count').limit(1);

        if (error) {
            throw new Error(`Database connection failed: ${error.message}`);
        }

        console.log('✅ Database connection successful!\n');

        // Try to check if tables already exist
        console.log('🔍 Checking existing tables...');
        const { data: tables, error: tablesError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .in('table_name', ['product_variants', 'cart_items', 'orders_v2', 'order_items', 'order_error_logs']);

        if (!tablesError && tables) {
            console.log(`Found ${tables.length} cart/order system tables:`);
            tables.forEach(t => console.log(`  ✓ ${t.table_name}`));

            if (tables.length === 5) {
                console.log('\n✅ All tables appear to be created already!');
                console.log('Migration might already be applied.\n');
            } else {
                console.log(`\n⚠️  Only ${tables.length}/5 tables found. Please run the migration manually.\n`);
            }
        }

        console.log('📚 Next Steps:');
        console.log('1. Ensure migration is applied (see instructions above)');
        console.log('2. Run: node add_product_variants.js (to add variants to existing products)');
        console.log('3. Test the cart system at: /checkout');
        console.log('4. Monitor errors in: order_error_logs table\n');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

runMigration();
