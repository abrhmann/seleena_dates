import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const ShopContext = createContext();

export const useShop = () => useContext(ShopContext);

export const ShopProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: productsData, error: productsError } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (productsError) throw productsError;
            setProducts(productsData.map(p => ({
                id: p.id,
                name: p.name_en,
                nameAr: p.name_ar,
                price: p.price,
                stock: p.stock,
                image: p.image_url
            })));

            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (ordersError) throw ordersError;
            setOrders(ordersData.map(o => ({
                id: o.id,
                customer: o.customer_name,
                date: o.created_at.split('T')[0],
                total: o.total_amount,
                status: o.status
            })));
        } catch (error) {
            console.error('Error fetching data:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const addProduct = async (product) => {
        try {
            const { data, error } = await supabase
                .from('products')
                .insert([{
                    name_en: product.name,
                    name_ar: product.nameAr,
                    price: product.price,
                    stock: product.stock,
                    image_url: '/hero-dates.png'
                }])
                .select();

            if (error) throw error;
            fetchData();
        } catch (error) {
            console.error('Error adding product:', error.message);
        }
    };

    const updateProduct = async (id, updatedProduct) => {
        try {
            const { error } = await supabase
                .from('products')
                .update({
                    name_en: updatedProduct.name,
                    name_ar: updatedProduct.nameAr,
                    price: updatedProduct.price,
                    stock: updatedProduct.stock
                })
                .eq('id', id);

            if (error) throw error;
            fetchData();
        } catch (error) {
            console.error('Error updating product:', error.message);
        }
    };

    const deleteProduct = async (id) => {
        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchData();
        } catch (error) {
            console.error('Error deleting product:', error.message);
        }
    };

    const updateOrderStatus = async (id, status) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status })
                .eq('id', id);

            if (error) throw error;
            fetchData();
        } catch (error) {
            console.error('Error updating order status:', error.message);
        }
    };

    return (
        <ShopContext.Provider value={{
            products,
            orders,
            loading,
            addProduct,
            updateProduct,
            deleteProduct,
            updateOrderStatus,
            fetchData
        }}>
            {children}
        </ShopContext.Provider>
    );
};
