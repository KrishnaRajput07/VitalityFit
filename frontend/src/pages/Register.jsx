import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, ArrowRight, User, Ruler, Weight } from 'lucide-react';

const Register = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '', email: '', password: '',
        age: '', gender: 'Male', height: '', weight: ''
    });
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (step === 1) {
            setStep(2);
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
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

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl border border-gray-100">
                <div className="flex items-center gap-2 mb-8 justify-center">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-secondary">
                        <Activity className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black text-secondary">VitalityFit</span>
                </div>

                <h2 className="text-2xl font-bold text-center mb-2">Create Account</h2>
                <p className="text-muted text-center mb-8">Step {step} of 2: {step === 1 ? 'Basic Info' : 'Body Stats'}</p>

                {error && (
                    <div className="bg-bad/10 text-bad p-3 rounded-lg mb-4 text-sm font-bold text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {step === 1 ? (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-muted mb-1">Full Name</label>
                                <input name="name" type="text" required value={formData.name} onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-muted mb-1">Email</label>
                                <input name="email" type="email" required value={formData.email} onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-muted mb-1">Password</label>
                                <input name="password" type="password" required value={formData.password} onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 outline-none" />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-muted mb-1">Age</label>
                                    <input name="age" type="number" required value={formData.age} onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-muted mb-1">Gender</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary outline-none">
                                        <option>Male</option>
                                        <option>Female</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-muted mb-1">Height (cm)</label>
                                    <div className="relative">
                                        <input name="height" type="number" required value={formData.height} onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary outline-none" />
                                        <Ruler className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-muted mb-1">Weight (kg)</label>
                                    <div className="relative">
                                        <input name="weight" type="number" required value={formData.weight} onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary outline-none" />
                                        <Weight className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <button
                        type="submit"
                        className="w-full py-3 bg-secondary text-white font-bold rounded-xl hover:bg-secondary/90 transition shadow-lg shadow-secondary/20 flex items-center justify-center gap-2"
                    >
                        {step === 1 ? 'Next Step' : 'Complete Registration'} <ArrowRight className="w-5 h-5" />
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-muted">
                    Already have an account?{' '}
                    <Link to="/login" className="text-secondary font-bold hover:underline">
                        Log In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
