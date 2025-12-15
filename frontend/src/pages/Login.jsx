import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, ArrowRight, Chrome } from 'lucide-react';
import { API_URL } from '../utils/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();

            if (res.ok) {
                login(data.user, data.token);
                navigate('/dashboard');
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to connect to server');
        }
    };

    const handleGoogleLogin = async () => {
        // Simulated Google Login Flow
        try {
            const res = await fetch(`${API_URL}/api/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'google_user@gmail.com',
                    name: 'Google User',
                    googleId: '123456789',
                    photo: 'https://via.placeholder.com/150'
                }),
            });
            const data = await res.json();
            if (res.ok) {
                login(data.user, data.token);
                navigate('/dashboard');
            }
        } catch (err) {
            setError('Google Auth Failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl border border-gray-100">
                <div className="flex items-center gap-2 mb-8 justify-center">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-secondary">
                        <Activity className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black text-secondary">VitalityFit</span>
                </div>

                <h2 className="text-2xl font-bold text-center mb-2">Welcome Back</h2>
                <p className="text-muted text-center mb-8">Enter your credentials to access your account.</p>

                {error && (
                    <div className="bg-bad/10 text-bad p-3 rounded-lg mb-4 text-sm font-bold text-center">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleGoogleLogin}
                    className="w-full py-3 bg-white border border-gray-200 text-text font-bold rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2 mb-6"
                >
                    <Chrome className="w-5 h-5 text-blue-500" /> Continue with Google
                </button>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-muted">Or continue with email</span></div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-muted mb-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-muted mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-secondary text-white font-bold rounded-xl hover:bg-secondary/90 transition shadow-lg shadow-secondary/20 flex items-center justify-center gap-2"
                    >
                        Log In <ArrowRight className="w-5 h-5" />
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-muted">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-secondary font-bold hover:underline">
                        Sign Up
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
