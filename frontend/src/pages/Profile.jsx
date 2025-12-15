import React, { useState, useEffect } from 'react';
import { User, Activity, Calendar, Trash2, PieChart, Edit2, X, Save, Camera } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    AreaChart, Area,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../utils/api';

const Profile = () => {
    const { user, updateUser } = useAuth(); // Added updateUser
    const [schedule, setSchedule] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '', age: '', height: '', weight: '', avatar: ''
    });

    const [newSchedule, setNewSchedule] = useState({
        day: 'Monday',
        muscleGroup: 'Legs',
        exercises: [],
        time: '08:00',
        notes: '' // Added notes
    });

    const muscleGroups = {
        'Legs': ['Barbell Squat', 'Romanian Deadlift', 'Leg Press', 'Lunges', 'Calf Raises', 'Leg Extensions', 'Hamstring Curls'],
        'Chest': ['Bench Press', 'Incline Dumbbell Press', 'Pushups', 'Chest Flys', 'Dips', 'Cable Crossovers'],
        'Back': ['Pullups', 'Barbell Row', 'Lat Pulldowns', 'Deadlift', 'Face Pulls', 'T-Bar Row'],
        'Shoulders': ['Overhead Press', 'Lateral Raises', 'Front Raises', 'Reverse Flys', 'Shrugs', 'Arnold Press'],
        'Arms': ['Barbell Curl', 'Hammer Curl', 'Tricep Pushdown', 'Skullcrushers', 'Preacher Curl', 'Dips'],
        'Abs': ['Plank', 'Crunches', 'Leg Raises', 'Russian Twists', 'Ab Wheel Rollout', 'Bicycle Crunches'],
        'Cardio': ['Running', 'Cycling', 'Jump Rope', 'Rowing', 'HIIT', 'Burpees'],
        'Yoga': ['Sun Salutation', 'Warrior I & II', 'Downward Dog', 'Child\'s Pose', 'Tree Pose', 'Cobra']
    };

    useEffect(() => {
        if (user) {
            fetchSchedule();
            setEditForm({
                name: user.name,
                age: user.age,
                height: user.height,
                weight: user.weight,
                avatar: user.avatar || ''
            });
        }
    }, [user]);

    const fetchSchedule = async () => {
        const res = await fetch(`${API_URL}/api/schedule/${user.id}`);
        const data = await res.json();
        const parsed = data.map(s => ({
            ...s,
            exercises: typeof s.exercises === 'string' ? JSON.parse(s.exercises) : s.exercises
        }));
        setSchedule(parsed);
    };

    const toggleExercise = (ex) => {
        const current = newSchedule.exercises;
        if (current.includes(ex)) {
            setNewSchedule({ ...newSchedule, exercises: current.filter(e => e !== ex) });
        } else {
            setNewSchedule({ ...newSchedule, exercises: [...current, ex] });
        }
    };

    const addSchedule = async () => {
        if (newSchedule.exercises.length === 0) return;
        await fetch(`${API_URL}/api/schedule`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, ...newSchedule }),
        });
        fetchSchedule();
        setNewSchedule({
            day: 'Monday',
            muscleGroup: 'Legs',
            exercises: [],
            time: '08:00',
            notes: ''
        });
    };

    const deleteSchedule = async (id) => {
        await fetch(`${API_URL}/api/schedule/${id}`, { method: 'DELETE' });
        fetchSchedule();
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch(`${API_URL}/api/user/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm),
            });
            if (!res.ok) throw new Error('Failed to update');
            const updatedUser = await res.json();

            // Update context without page reload
            updateUser(updatedUser);
            setIsEditing(false);
            setIsSaving(false);
        } catch (err) {
            console.error(err);
            alert("Failed to save profile. Please try again.");
            setIsSaving(false);
        }
    };

    // Mock Data (Zeroed out for new users logic logic handled in render)
    // Actually, let's keep the mock data but conditionally render the charts.
    const exerciseMinutesData = [
        { name: 'Mon', mins: 45 }, { name: 'Tue', mins: 60 }, { name: 'Wed', mins: 30 },
        { name: 'Thu', mins: 50 }, { name: 'Fri', mins: 45 }, { name: 'Sat', mins: 90 }, { name: 'Sun', mins: 0 },
    ];
    const nutritionHistoryData = [
        { name: 'Mon', cal: 2200, pro: 150 }, { name: 'Tue', cal: 2100, pro: 140 }, { name: 'Wed', cal: 2400, pro: 160 },
        { name: 'Thu', cal: 2000, pro: 130 }, { name: 'Fri', cal: 2300, pro: 155 }, { name: 'Sat', cal: 2600, pro: 120 }, { name: 'Sun', cal: 2100, pro: 145 },
    ];

    const isNewUser = !user?.level || user.level <= 1;

    return (
        <div className="max-w-6xl mx-auto space-y-8 relative">
            {/* Edit Modal */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold">Edit Profile</h3>
                            <button onClick={() => setIsEditing(false)}><X className="w-6 h-6 text-muted hover:text-text" /></button>
                        </div>
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-muted mb-1">Full Name</label>
                                <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-muted mb-1">Profile Picture</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            if (file.size > 50 * 1024 * 1024) {
                                                alert("File is too big! Please select an image under 50MB.");
                                                return;
                                            }
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setEditForm({ ...editForm, avatar: reader.result });
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    className="w-full p-2 bg-gray-50 rounded-xl"
                                />
                                {editForm.avatar && (
                                    <div className="mt-2 w-20 h-20 rounded-full overflow-hidden border border-gray-200">
                                        <img src={editForm.avatar} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-muted mb-1">Age</label>
                                    <input type="number" value={editForm.age} onChange={e => setEditForm({ ...editForm, age: e.target.value })} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-muted mb-1">Height</label>
                                    <input type="number" value={editForm.height} onChange={e => setEditForm({ ...editForm, height: e.target.value })} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-muted mb-1">Weight</label>
                                    <input type="number" value={editForm.weight} onChange={e => setEditForm({ ...editForm, weight: e.target.value })} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary" />
                                </div>
                            </div>
                            <button disabled={isSaving} type="submit" className="w-full py-3 bg-secondary text-white font-bold rounded-xl hover:bg-secondary/90 transition flex items-center justify-center gap-2 disabled:opacity-50">
                                {isSaving ? 'Saving...' : <><Save className="w-5 h-5" /> Save Changes</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-white border border-gray-100 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary p-1 relative group">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                        {user?.avatar ? (
                            <img
                                src={user.avatar}
                                alt="Profile"
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.nextSibling.style.display = 'block'; }}
                            />
                        ) : (
                            <User className="w-16 h-16 text-gray-300" />
                        )}
                        {/* Fallback icon if image hidden (simplified approach, better to use state but quick fix for now) */}
                        {user?.avatar && <User className="w-16 h-16 text-gray-300 hidden" />}
                    </div>
                    <button onClick={() => setIsEditing(true)} className="absolute bottom-0 right-0 p-2 bg-secondary text-white rounded-full shadow-lg hover:scale-110 transition">
                        <Camera className="w-4 h-4" />
                    </button>
                </div>
                <div className="text-center md:text-left flex-1">
                    <h2 className="text-4xl font-black text-text mb-2">{user?.name || 'Guest'}</h2>
                    <p className="text-muted font-medium mb-4">{user?.email}</p>
                    <button onClick={() => setIsEditing(true)} className="px-6 py-2 bg-gray-100 text-text font-bold rounded-lg hover:bg-gray-200 transition flex items-center gap-2 mx-auto md:mx-0">
                        <Edit2 className="w-4 h-4" /> Edit Profile
                    </button>
                </div>
                <div className="flex gap-8 text-center">
                    <div><div className="text-3xl font-black">{user?.age || '--'}</div><div className="text-xs font-bold text-muted uppercase">Age</div></div>
                    <div><div className="text-3xl font-black">{user?.height}</div><div className="text-xs font-bold text-muted uppercase">Height</div></div>
                    <div><div className="text-3xl font-black">{user?.weight}</div><div className="text-xs font-bold text-muted uppercase">Weight</div></div>
                    <div>
                        <div className="text-3xl font-black">
                            {user?.height && user?.weight ? (user.weight / ((user.height / 100) ** 2)).toFixed(1) : '--'}
                        </div>
                        <div className="text-xs font-bold text-muted uppercase">BMI</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Advanced Schedule Builder */}
                <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <Calendar className="w-6 h-6 text-secondary" />
                        <h3 className="font-bold text-xl">Weekly Schedule Builder</h3>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-xl mb-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-muted mb-1">Day</label>
                                <select
                                    className="w-full px-4 py-2 rounded-lg border-none focus:ring-2 focus:ring-primary"
                                    value={newSchedule.day}
                                    onChange={(e) => setNewSchedule({ ...newSchedule, day: e.target.value })}
                                >
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => <option key={d}>{d}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-muted mb-1">Time</label>
                                <input
                                    type="time"
                                    className="w-full px-4 py-2 rounded-lg border-none focus:ring-2 focus:ring-primary"
                                    value={newSchedule.time}
                                    onChange={(e) => setNewSchedule({ ...newSchedule, time: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-muted mb-1">Muscle Group</label>
                            <select
                                className="w-full px-4 py-2 rounded-lg border-none focus:ring-2 focus:ring-primary mb-2"
                                value={newSchedule.muscleGroup}
                                onChange={(e) => setNewSchedule({ ...newSchedule, muscleGroup: e.target.value, exercises: [] })}
                            >
                                {Object.keys(muscleGroups).map(g => <option key={g}>{g}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-muted mb-2">Select Exercises</label>
                            <div className="flex flex-wrap gap-2">
                                {muscleGroups[newSchedule.muscleGroup].map(ex => (
                                    <button
                                        key={ex}
                                        onClick={() => toggleExercise(ex)}
                                        className={`px-3 py-1 rounded-full text-sm font-bold transition ${newSchedule.exercises.includes(ex) ? 'bg-secondary text-white' : 'bg-white text-muted border border-gray-200'}`}
                                    >
                                        {ex}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-muted mb-1">Notes (Optional)</label>
                            <textarea
                                className="w-full px-4 py-2 rounded-lg border-none focus:ring-2 focus:ring-primary bg-white h-20 resize-none"
                                placeholder="E.g., Focus on form, 3 sets of 12..."
                                value={newSchedule.notes}
                                onChange={(e) => setNewSchedule({ ...newSchedule, notes: e.target.value })}
                            />
                        </div>

                        <button onClick={addSchedule} className="w-full py-3 bg-secondary text-white font-bold rounded-xl hover:bg-secondary/90 transition shadow-lg shadow-secondary/20">
                            Add to Schedule
                        </button>
                    </div>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                        {schedule.map((s) => (
                            <div key={s.id} className="p-4 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-secondary">{s.day}</span>
                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded text-muted">{s.time}</span>
                                    </div>
                                    <button onClick={() => deleteSchedule(s.id)} className="text-gray-400 hover:text-bad"><Trash2 className="w-4 h-4" /></button>
                                </div>
                                <div className="font-bold text-text mb-1">{s.muscleGroup}</div>
                                <div className="flex flex-wrap gap-1 mb-2">
                                    {Array.isArray(s.exercises) && s.exercises.map(ex => (
                                        <span key={ex} className="text-xs bg-primary/10 text-primary-dark px-2 py-1 rounded">{ex}</span>
                                    ))}
                                </div>
                                {s.notes && (
                                    <div className="text-xs text-muted italic border-t border-gray-50 pt-2">
                                        "{s.notes}"
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Analytics */}
                <div className="space-y-8">
                    <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm h-[300px]">
                        <div className="flex items-center gap-3 mb-6">
                            <Activity className="w-6 h-6 text-secondary" />
                            <h3 className="font-bold text-xl">Exercise Minutes</h3>
                        </div>
                        {isNewUser ? (
                            <div className="h-full flex flex-col items-center justify-center text-center -mt-8">
                                <p className="text-lg font-bold text-muted mb-2">"Consistency is key."</p>
                                <p className="text-sm text-gray-400">Log activity to see your stats!</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="80%">
                                <BarChart data={exerciseMinutesData}>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: '#f3f4f6' }} />
                                    <Bar dataKey="mins" fill="#bef264" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm h-[300px]">
                        <div className="flex items-center gap-3 mb-6">
                            <PieChart className="w-6 h-6 text-orange-500" />
                            <h3 className="font-bold text-xl">Nutrition History</h3>
                        </div>
                        {isNewUser ? (
                            <div className="h-full flex flex-col items-center justify-center text-center -mt-8">
                                <p className="text-lg font-bold text-muted mb-2">"You are what you eat."</p>
                                <p className="text-sm text-gray-400">Track your meals to unlock insights!</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="80%">
                                <AreaChart data={nutritionHistoryData}>
                                    <defs>
                                        <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="cal" stroke="#f97316" fillOpacity={1} fill="url(#colorCal)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>
            {/* New Stats Row: BMI & Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* BMI Card */}
                <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center text-center">
                    <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                        <Activity className="w-6 h-6 text-blue-500" /> BMI Analysis
                    </h3>
                    <div className="relative w-40 h-40 flex items-center justify-center mb-4">
                        {/* Simple Circle Gauge Mockup */}
                        <div className="absolute inset-0 rounded-full border-[12px] border-gray-100"></div>
                        <div
                            className={`absolute inset-0 rounded-full border-[12px] border-transparent border-t-current transform -rotate-45 ${!user?.height || !user?.weight ? 'text-gray-300' :
                                (user.weight / ((user.height / 100) ** 2)) < 18.5 ? 'text-blue-400' :
                                    (user.weight / ((user.height / 100) ** 2)) < 25 ? 'text-green-500' :
                                        (user.weight / ((user.height / 100) ** 2)) < 30 ? 'text-orange-500' : 'text-red-500'
                                }`}
                            style={{
                                transition: 'all 1s ease',
                                transform: `rotate(${!user?.height || !user?.weight ? -135 :
                                    Math.min(45, -135 + ((user.weight / ((user.height / 100) ** 2)) / 40) * 270)
                                    }deg)`
                            }}
                        ></div>
                        <div className="flex flex-col">
                            <span className="text-4xl font-black text-text">
                                {user?.height && user?.weight ? (user.weight / ((user.height / 100) ** 2)).toFixed(1) : '--'}
                            </span>
                            <span className="text-xs font-bold text-muted uppercase">BMI</span>
                        </div>
                    </div>
                    <div className={`px-4 py-1 rounded-full text-sm font-bold ${!user?.height || !user?.weight ? 'bg-gray-100 text-gray-500' :
                        (user.weight / ((user.height / 100) ** 2)) < 18.5 ? 'bg-blue-100 text-blue-600' :
                            (user.weight / ((user.height / 100) ** 2)) < 25 ? 'bg-green-100 text-green-600' :
                                (user.weight / ((user.height / 100) ** 2)) < 30 ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'
                        }`}>
                        {!user?.height || !user?.weight ? 'Unknown' :
                            (user.weight / ((user.height / 100) ** 2)) < 18.5 ? 'Underweight' :
                                (user.weight / ((user.height / 100) ** 2)) < 25 ? 'Healthy Weight' :
                                    (user.weight / ((user.height / 100) ** 2)) < 30 ? 'Overweight' : 'Obese'}
                    </div>
                </div>

                {/* Radar Chart */}
                <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm h-[350px] flex flex-col">
                    <h3 className="font-bold text-xl mb-2 text-center">Your Fitness Profile</h3>
                    <div className="flex-1 w-full min-h-0 flex items-center justify-center">
                        {!isNewUser ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                                    { subject: 'Strength', A: 80, fullMark: 100 },
                                    { subject: 'Cardio', A: 65, fullMark: 100 },
                                    { subject: 'Flexibility', A: 50, fullMark: 100 },
                                    { subject: 'Endurance', A: 70, fullMark: 100 },
                                    { subject: 'Balance', A: 60, fullMark: 100 },
                                    { subject: 'Power', A: 75, fullMark: 100 },
                                ]}>
                                    <PolarGrid stroke="#e5e7eb" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 'bold' }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar name="User" dataKey="A" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.3} />
                                    <Tooltip />
                                </RadarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center p-6">
                                <p className="text-xl font-medium italic text-muted">"The only bad workout is the one that didn't happen."</p>
                                <p className="text-sm font-bold text-secondary mt-4">Start your journey to unlock your fitness profile!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
