/**
 * Add Product Variants Script
 * 
 * This script adds 500g, 1kg, and 5kg variants to all existing products
 * with appropriate pricing and stock quantities.
 * 
 * IMPORTANT: Update your .env file with Supabase credentials before running!
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ ERROR: Missing Supabase credentials in .env file!');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function addProductVariants() {
    try {
        console.log('🚀 Adding product variants...\n');

        // 1. Fetch all existing products
        console.log('📦 Fetching existing products...');
        const { data: products, error: productsError } = await supabase
            .from('products')
            .select('*');

        if (productsError) throw productsError;

        if (!products || products.length === 0) {
            console.log('⚠️  No products found. Please add products first.');
            return;
        }

        console.log(`✅ Found ${products.length} products\n`);

        // 2. Create variants for each product
        const variants = [];

        for (const product of products) {
            console.log(`📝 Creating variants for: ${product.name_en}`);

            // Variant pricing strategy:
            // 500g = base_price * 0.5
            // 1kg = base_price (original)
            // 5kg = base_price * 4.5 (10% bulk discount)

            const basePrice = parseFloat(product.price);
            const baseStock = parseInt(product.stock);

            // 500g variant
            variants.push({
                product_id: product.id,
                weight_variant: '500g',
                price: (basePrice * 0.5).toFixed(2),
                stock_quantity: Math.floor(baseStock * 0.5) // Half stock for smaller size
            });

            // 1kg variant (base)
            variants.push({
                product_id: product.id,
                weight_variant: '1kg',
                price: basePrice.toFixed(2),
                stock_quantity: baseStock
            });

            // 5kg variant (bulk)
            variants.push({
                product_id: product.id,
                weight_variant: '5kg',
                price: (basePrice * 4.5).toFixed(2), // 10% discount vs buying 5x 1kg
                stock_quantity: Math.floor(baseStock * 2) // More stock for bulk
            });

            console.log(`  ✓ 500g: ${(basePrice * 0.5).toFixed(2)} EGP (${Math.floor(baseStock * 0.5)} in stock)`);
            console.log(`  ✓ 1kg:  ${basePrice.toFixed(2)} EGP (${baseStock} in stock)`);
            console.log(`  ✓ 5kg:  ${(basePrice * 4.5).toFixed(2)} EGP (${Math.floor(baseStock * 2)} in stock)\n`);
        }

        // 3. Insert all variants
        console.log('💾 Inserting variants into database...');
        const { data: insertedVariants, error: variantsError } = await supabase
            .from('product_variants')
            .upsert(variants, {
                onConflict: 'product_id,weight_variant',
                ignoreDuplicates: false
            })
            .select();

        if (variantsError) {
            // If error is due to table not existing, provide helpful message
            if (variantsError.message.includes('relation "product_variants" does not exist')) {
                console.error('\n❌ ERROR: product_variants table does not exist!');
                console.log('\nPlease run the migration first:');
                console.log('1. Go to Supabase Dashboard → SQL Editor');
                console.log('2. Run: supabase/migrations/20260126_cart_and_orders.sql\n');
                process.exit(1);
            }
            throw variantsError;
        }

        console.log(`✅ Successfully created ${insertedVariants?.length || variants.length} product variants!\n`);

        // 4. Verify the results
        console.log('🔍 Verifying variants...');
        const { data: allVariants, error: verifyError } = await supabase
            .from('product_variants')
            .select(`
        *,
        products:product_id (
          name_en,
          name_ar
        )
      `);

        if (verifyError) throw verifyError;

        console.log('\n📊 Summary of all variants:');
        console.log('─'.repeat(80));

        const groupedVariants = {};
        allVariants.forEach(v => {
            const productName = v.products.name_en;
            if (!groupedVariants[productName]) {
                groupedVariants[productName] = [];
            }
            groupedVariants[productName].push(v);
        });

        for (const [productName, productVariants] of Object.entries(groupedVariants)) {
            console.log(`\n${productName}:`);
            productVariants.forEach(v => {
                console.log(`  ${v.weight_variant.padEnd(6)} - ${parseFloat(v.price).toFixed(2).padStart(8)} EGP - Stock: ${v.stock_quantity}`);
            });
        }

        console.log('\n' + '─'.repeat(80));
        console.log('\n✅ Product variants setup complete!');
        console.log('\n📚 Next Steps:');
        console.log('1. Visit /shop to see products');
        console.log('2. Add items to cart with different variants');
        console.log('3. Go to /checkout to test the order flow');
        console.log('4. Check orders in admin dashboard\n');

    } catch (error) {
        console.error('❌ Error adding variants:', error.message);
        console.error(error);
        process.exit(1);
    }
}

addProductVariants();
