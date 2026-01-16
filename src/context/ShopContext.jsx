import React, { createContext, useState, useContext } from 'react';

const ShopContext = createContext();

export const useShop = () => useContext(ShopContext);

export const ShopProvider = ({ children }) => {
    const [products, setProducts] = useState([
        { id: 1, name: 'Premium Majdool Box', nameAr: 'صندوق مجدول فاخر', price: 120, stock: 45, image: '/hero-dates.png' },
        { id: 2, name: 'Ajwa Dates Gift Set', nameAr: 'طقم هدايا تمر عجوة', price: 200, stock: 20, image: '/hero-dates.png' },
        { id: 3, name: 'Sukkari VIP Packet', nameAr: 'باكيت سكري VIP', price: 85, stock: 100, image: '/hero-dates.png' },
    ]);

    const [orders, setOrders] = useState([
        { id: 101, customer: 'Ahmed Ali', date: '2023-10-24', total: 340, status: 'Pending' },
        { id: 102, customer: 'Sarah Khan', date: '2023-10-23', total: 120, status: 'Delivered' },
    ]);

    const addProduct = (product) => {
        const newProduct = { ...product, id: Date.now(), image: '/hero-dates.png' };
        setProducts([...products, newProduct]);
    };

    const updateProduct = (id, updatedProduct) => {
        setProducts(products.map(p => p.id === id ? { ...p, ...updatedProduct } : p));
    };

    const deleteProduct = (id) => {
        setProducts(products.filter(p => p.id !== id));
    };

    const updateOrderStatus = (id, status) => {
        setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
    };

    return (
        <ShopContext.Provider value={{
            products,
            orders,
            addProduct,
            updateProduct,
            deleteProduct,
            updateOrderStatus
        }}>
            {children}
        </ShopContext.Provider>
    );
};
