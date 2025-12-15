import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Activity, LayoutDashboard, User, Dumbbell, Apple, Users, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
    const location = useLocation();
    const { user } = useAuth();

    const navItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/exercises', icon: Dumbbell, label: 'Exercises' },
        { path: '/nutrition', icon: Apple, label: 'Nutrition' },
        { path: '/community', icon: Users, label: 'Community' },
        { path: '/profile', icon: User, label: 'Profile' },
    ];

    return (
        <div className="min-h-screen bg-transparent text-text flex flex-col md:flex-row font-sans">
            {/* Sidebar - Desktop Only */}
            <aside className="hidden md:flex w-72 bg-white/80 backdrop-blur-xl border-r border-gray-100 flex-col shadow-sm z-20 sticky top-0 h-screen">
                <div className="p-8 flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-secondary shadow-lg shadow-primary/20">
                        <Activity className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black tracking-tight text-secondary">VitalityFit</span>
                </div>

                <nav className="flex-1 px-6 py-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-200 ${isActive
                                    ? 'bg-primary/20 text-secondary font-bold shadow-sm'
                                    : 'text-muted font-medium hover:bg-gray-50 hover:text-text'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[3px]' : ''}`} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-gray-100">
                    <Link to="/" className="flex items-center gap-3 px-4 py-3 text-muted font-medium hover:text-bad transition">
                        <LogOut className="w-5 h-5" />
                        <span>Log Out</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto relative pb-24 md:pb-0">
                {/* Header */}
                <header className="h-16 md:h-20 flex items-center justify-between px-6 md:px-10 sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b border-gray-100/50">
                    <div className="flex items-center gap-3 md:hidden">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-secondary shadow-md">
                            <Activity className="w-5 h-5" />
                        </div>
                        <h1 className="text-xl font-black tracking-tight text-secondary">VitalityFit</h1>
                    </div>
                    <h1 className="hidden md:block text-2xl font-bold text-text capitalize">
                        {location.pathname.split('/')[1] || 'Dashboard'}
                    </h1>
                    <div className="flex items-center gap-4">
                        <Link to="/profile" className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-primary to-secondary p-0.5 cursor-pointer hover:scale-105 transition overflow-hidden">
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-5 h-5 text-gray-400" />
                                )}
                            </div>
                        </Link>
                    </div>
                </header>

                <div className="p-4 md:p-10 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>

            {/* Bottom Navigation - Mobile Only */}
            <nav className="md:hidden fixed bottom-0 w-full bg-white/90 backdrop-blur-xl border-t border-gray-200 z-50 px-6 py-2 flex justify-between items-center pb-safe">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive ? 'text-secondary' : 'text-gray-400'}`}
                        >
                            <div className={`p-1.5 rounded-full transition-all ${isActive ? 'bg-primary/20' : 'bg-transparent'}`}>
                                <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                            </div>
                            <span className={`text-[10px] font-bold ${isActive ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};

export default Layout;
