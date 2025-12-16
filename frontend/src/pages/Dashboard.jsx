import React, { useEffect, useState } from 'react';
import { TrendingUp, Calendar, Clock, Flame, Trophy, Star, Plus, Play, Zap } from 'lucide-react';
import { Area, Bar, CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { API_URL } from '../utils/api';

const StatCard = ({ icon: Icon, label, value, trend, color }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300"
    >
        <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-6 h-6" />
            </div>
            {trend && (
                <span className="text-xs font-bold text-ok bg-ok/10 px-2 py-1 rounded-full">
                    {trend}
                </span>
            )}
        </div>
        <div className="text-3xl font-black text-text mb-1">{value}</div>
        <div className="text-sm text-muted font-medium">{label}</div>
    </motion.div>
);

const Dashboard = () => {
    const { user } = useAuth();
    const [schedule, setSchedule] = useState([]);
    const [stats, setStats] = useState({ caloriesBurned: 0, activeMinutes: 0, workouts: 0, streak: 0 });
    const [activityData, setActivityData] = useState([]);
    const [nextWorkout, setNextWorkout] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            // Fetch Schedule
            fetch(`${API_URL}/api/schedule/${user.id}`)
                .then(res => res.json())
                .then(data => {
                    const parsed = data.map(s => ({
                        ...s,
                        exercises: typeof s.exercises === 'string' ? JSON.parse(s.exercises) : s.exercises
                    }));
                    setSchedule(parsed);
                    findNextWorkout(parsed);
                });

            // Fetch Stats
            fetch(`${API_URL}/api/dashboard/stats/${user.id}`)
                .then(res => res.json())
                .then(data => setStats(data))
                .catch(err => console.error("Failed to fetch stats", err));

            // Fetch Graph Data
            fetch(`${API_URL}/api/dashboard/activity/${user.id}`)
                .then(res => res.json())
                .then(data => setActivityData(data))
                .catch(err => console.error("Failed to fetch graph data", err));
        }
    }, [user]);

    const findNextWorkout = (sched) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = days[new Date().getDay()];
        // Simple logic: Find first workout for today
        const todayWorkout = sched.find(s => s.day === today);
        if (todayWorkout) {
            setNextWorkout(todayWorkout);
        }
    };

    // Calculate Level Progress
    const xp = user?.xp || 0;
    const level = Math.floor(xp / 1000) + 1;
    const progress = (xp % 1000) / 10;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-text mb-2">Hello, {user?.name?.split(' ')[0] || 'User'}! 👋</h2>
                    <p className="text-muted">Here's your daily activity summary.</p>
                </div>
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                    <Trophy className="w-5 h-5 text-warn" />
                    <span className="font-bold text-text">Level {level}</span>
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-warn transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                    <span className="text-xs font-bold text-muted">{xp} XP</span>
                </div>
            </div>

            {/* Quick Start Widget */}
            {nextWorkout ? (
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-gradient-to-r from-secondary to-primary p-8 rounded-3xl text-white shadow-xl relative overflow-hidden"
                >
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold mb-3">
                                <Clock className="w-3 h-3" /> Scheduled for {nextWorkout.time}
                            </div>
                            <h3 className="text-3xl font-black mb-2">{nextWorkout.muscleGroup} Day</h3>
                            <p className="opacity-90 font-medium">
                                {Array.isArray(nextWorkout.exercises) ? nextWorkout.exercises.join(', ') : nextWorkout.exercises}
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/exercises')}
                            className="px-8 py-4 bg-white text-secondary font-bold rounded-xl hover:scale-105 transition shadow-lg flex items-center gap-2"
                        >
                            <Play className="w-5 h-5 fill-secondary" /> Start Now
                        </button>
                    </div>
                    <Zap className="absolute -right-10 -bottom-10 w-64 h-64 text-white/10 rotate-12" />
                </motion.div>
            ) : (
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
                    <h3 className="font-bold text-xl mb-2">No Workout Scheduled Today</h3>
                    <p className="text-muted mb-4">Take a rest day or add a workout to your schedule.</p>
                    <Link to="/profile" className="text-secondary font-bold hover:underline">Go to Schedule Builder →</Link>
                </div>
            )}

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={Flame}
                    label="Calories"
                    value={stats.caloriesBurned}
                    color="text-orange-500"
                    trend="Burned today"
                />
                <StatCard
                    icon={Clock}
                    label="Minutes"
                    value={stats.activeMinutes}
                    color="text-blue-500"
                    trend="Active time"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Workouts"
                    value={stats.workouts}
                    color="text-green-500"
                    trend="Sessions"
                />
                <StatCard
                    icon={Zap}
                    label="Streak"
                    value={`${stats.streak} Days`}
                    color="text-purple-500"
                    trend="Keep going!"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-8 shadow-sm min-h-[400px]">
                    <h3 className="font-bold text-xl mb-6 text-text">Activity History</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={activityData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    cursor={{ fill: '#F9FAFB' }}
                                />
                                <Bar dataKey="calories" name="Consumed" fill="#FDBA74" radius={[4, 4, 0, 0]} barSize={20} />
                                <Area type="monotone" dataKey="workout" name="Burned" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.1} strokeWidth={3} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm min-h-[300px]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-lg text-text">Weekly Schedule</h3>
                            <Link to="/profile" className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                <Plus className="w-4 h-4 text-muted" />
                            </Link>
                        </div>

                        {schedule.length === 0 ? (
                            <div className="text-center py-10">
                                <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                <p className="text-muted font-medium mb-4">No schedule set.</p>
                                <Link to="/profile" className="text-sm font-bold text-secondary hover:underline">
                                    Create Schedule →
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {schedule.map((s, i) => (
                                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
                                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center font-bold text-secondary text-sm">
                                            {s.day.slice(0, 3)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-text">{s.muscleGroup}</div>
                                            <div className="text-xs text-muted">{s.time}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
