import React, { useState } from 'react';
import { LayoutDashboard, Package, ShoppingCart, Users, Plus, Edit, Trash2, Save, X, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('adminAuth');
        navigate('/admin/login');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardOverview t={t} />;
            case 'products':
                return <ProductsManager t={t} i18n={i18n} />;
            case 'orders':
                return <OrdersManager t={t} />;
            default:
                return <DashboardOverview t={t} />;
        }
    };

    return (
        <div className="admin-layout" dir={i18n.dir()}>
            <aside className="admin-sidebar">
                <div className="admin-brand">
                    <h2>Seleena <span className="text-gold">Admin</span></h2>
                </div>
                <nav className="admin-nav">
                    <button
                        className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        <LayoutDashboard size={20} /> {t('dashboard')}
                    </button>
                    <button
                        className={`admin-nav-item ${activeTab === 'products' ? 'active' : ''}`}
                        onClick={() => setActiveTab('products')}
                    >
                        <Package size={20} /> {t('products')}
                    </button>
                    <button
                        className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        <ShoppingCart size={20} /> {t('orders')}
                    </button>
                    <button
                        className={`admin-nav-item ${activeTab === 'customers' ? 'active' : ''}`}
                        onClick={() => setActiveTab('customers')}
                    >
                        <Users size={20} /> {t('customers')}
                    </button>
                </nav>
            </aside>

            <main className="admin-main">
                <header className="admin-header">
                    <h2>{t(activeTab)}</h2>
                    <div className="admin-user">
                        <span>Admin User</span>
                        <div className="admin-avatar">A</div>
                        <button className="btn-logout" onClick={handleLogout} title="Logout">
                            <LogOut size={18} />
                        </button>
                    </div>
                </header>
                <div className="admin-content">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

const DashboardOverview = ({ t }) => {
    const { products, orders } = useShop();

    const totalSales = orders.reduce((acc, order) => acc + order.total, 0);

    return (
        <div className="dashboard-grid">
            <div className="stat-card">
                <h3>{t('totalSales')}</h3>
                <p className="stat-value">{t('currency')} {totalSales.toLocaleString()}</p>
                <span className="stat-trend positive">+12% {t('thisMonth')}</span>
            </div>
            <div className="stat-card">
                <h3>{t('totalOrders')}</h3>
                <p className="stat-value">{orders.length}</p>
                <span className="stat-trend positive">+5% {t('thisMonth')}</span>
            </div>
            <div className="stat-card">
                <h3>{t('products')}</h3>
                <p className="stat-value">{products.length}</p>
            </div>
        </div>
    );
};

const ProductsManager = ({ t, i18n }) => {
    const { products, addProduct, updateProduct, deleteProduct } = useShop();
    const [editingId, setEditingId] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({ name: '', nameAr: '', price: '', stock: '' });

    const handleEdit = (product) => {
        setEditingId(product.id);
        setFormData({ name: product.name, nameAr: product.nameAr || '', price: product.price, stock: product.stock });
        setIsAdding(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            deleteProduct(id);
        }
    };

    const handleSave = () => {
        if (editingId) {
            updateProduct(editingId, {
                name: formData.name,
                nameAr: formData.nameAr,
                price: Number(formData.price),
                stock: Number(formData.stock)
            });
            setEditingId(null);
        } else {
            addProduct({
                name: formData.name,
                nameAr: formData.nameAr,
                price: Number(formData.price),
                stock: Number(formData.stock)
            });
            setIsAdding(false);
        }
        setFormData({ name: '', nameAr: '', price: '', stock: '' });
    };

    const handleCancel = () => {
        setEditingId(null);
        setIsAdding(false);
        setFormData({ name: '', nameAr: '', price: '', stock: '' });
    };

    return (
        <div className="products-manager">
            <div className="action-bar">
                {!isAdding && !editingId && (
                    <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
                        <Plus size={16} /> {t('addProduct')}
                    </button>
                )}
            </div>

            {(isAdding || editingId) && (
                <div className="edit-form card">
                    <div className="form-group">
                        <label>{t('name')} (EN)</label>
                        <input
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="English Name"
                        />
                    </div>
                    <div className="form-group">
                        <label>{t('nameAr')} (AR)</label>
                        <input
                            value={formData.nameAr}
                            onChange={e => setFormData({ ...formData, nameAr: e.target.value })}
                            placeholder="Arabic Name"
                            dir="rtl"
                        />
                    </div>
                    <div className="form-group">
                        <label>{t('price')}</label>
                        <input
                            type="number"
                            value={formData.price}
                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>{t('stock')}</label>
                        <input
                            type="number"
                            value={formData.stock}
                            onChange={e => setFormData({ ...formData, stock: e.target.value })}
                        />
                    </div>
                    <div className="form-actions">
                        <button className="btn btn-primary" onClick={handleSave}><Save size={16} /> {t('save')}</button>
                        <button className="btn btn-outline" onClick={handleCancel}><X size={16} /> {t('cancel')}</button>
                    </div>
                </div>
            )}

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>{t('name')}</th>
                            <th>{t('price')}</th>
                            <th>{t('stock')}</th>
                            <th>{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(p => (
                            <tr key={p.id}>
                                <td>#{p.id}</td>
                                <td>
                                    <div>{p.name}</div>
                                    <div style={{ fontSize: '0.8em', color: '#666' }}>{p.nameAr}</div>
                                </td>
                                <td>{t('currency')} {p.price}</td>
                                <td>
                                    <span className={`status-badge ${p.stock > 30 ? 'success' : 'warning'}`}>
                                        {p.stock}
                                    </span>
                                </td>
                                <td>
                                    <div className="table-actions">
                                        <button className="icon-btn-sm warning" onClick={() => handleEdit(p)}><Edit size={16} /></button>
                                        <button className="icon-btn-sm danger" onClick={() => handleDelete(p.id)}><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const OrdersManager = ({ t }) => {
    const { orders } = useShop();

    return (
        <div className="orders-manager">
            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>{t('orderId')}</th>
                            <th>{t('customer')}</th>
                            <th>{t('date')}</th>
                            <th>{t('total')}</th>
                            <th>{t('status')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(o => (
                            <tr key={o.id}>
                                <td>#{o.id}</td>
                                <td>{o.customer}</td>
                                <td>{o.date}</td>
                                <td>{t('currency')} {o.total}</td>
                                <td>
                                    <span className={`status-badge ${o.status.toLowerCase()}`}>
                                        {o.status === 'Pending' ? t('pending') : t('delivered')}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;
