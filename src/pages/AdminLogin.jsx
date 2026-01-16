import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import './AdminLogin.css';

const AdminLogin = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();

        // Simple authentication (in production, use proper backend authentication)
        if (credentials.username === 'admin' && credentials.password === 'seleena2024') {
            localStorage.setItem('adminAuth', 'true');
            navigate('/admin/dashboard');
        } else {
            setError('Invalid username or password');
        }
    };

    return (
        <div className="admin-login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-icon">
                        <Lock size={32} />
                    </div>
                    <h1>Seleena Admin</h1>
                    <p>Sign in to access the dashboard</p>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-field">
                        <label htmlFor="username">
                            <User size={18} />
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={credentials.username}
                            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                            placeholder="Enter your username"
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="password">
                            <Lock size={18} />
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={credentials.password}
                            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="btn-login">
                        Sign In
                    </button>

                    <div className="login-hint">
                        <small>Demo: username: <code>admin</code> | password: <code>seleena2024</code></small>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
