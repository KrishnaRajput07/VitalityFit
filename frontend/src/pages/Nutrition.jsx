import React, { useState } from 'react';
import { Search, Plus, Apple, Flame, AlertCircle, Utensils } from 'lucide-react';
import { API_URL } from '../utils/api';

const Nutrition = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [dailyLog, setDailyLog] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1); // Default 1 serving/100g

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError('');
        setResults([]);

        try {
            const res = await fetch(`${API_URL}/api/nutrition/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query }),
            });
            const data = await res.json();
            if (data.length === 0) {
                setError('No food found. Try a different term.');
            } else {
                setResults(data);
            }
        } catch (err) {
            setError('Failed to fetch data.');
        }
        setLoading(false);
    };

    const addToLog = (food) => {
        const factor = quantity; // Assuming base is 1 serving or 100g
        const loggedItem = {
            ...food,
            id: Date.now(),
            calories: Math.round(food.calories * factor),
            protein: Math.round(food.protein * factor),
            carbs: Math.round(food.carbs * factor),
            fat: Math.round(food.fat * factor),
            quantity: factor
        };
        setDailyLog([...dailyLog, loggedItem]);
    };

    const totalCalories = dailyLog.reduce((acc, item) => acc + item.calories, 0);
    const totalProtein = dailyLog.reduce((acc, item) => acc + item.protein, 0);
    const totalCarbs = dailyLog.reduce((acc, item) => acc + item.carbs, 0);
    const totalFat = dailyLog.reduce((acc, item) => acc + item.fat, 0);

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Search Section */}
                <div className="flex-1">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Utensils className="text-secondary" /> Food Search
                        </h2>
                        <form onSubmit={handleSearch} className="relative mb-6">
                            <input
                                type="text"
                                placeholder="Search for food (e.g., 'Dal', 'Paneer', 'Apple')..."
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary outline-none text-lg transition"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
                            <button
                                type="submit"
                                disabled={loading}
                                className="absolute right-2 top-2 bottom-2 px-6 bg-secondary text-white font-bold rounded-lg hover:bg-secondary/90 transition disabled:opacity-50"
                            >
                                {loading ? 'Searching...' : 'Search'}
                            </button>
                        </form>

                        <div className="flex items-center gap-4 mb-6 bg-gray-50 p-4 rounded-xl">
                            <span className="font-bold text-muted text-sm">Quantity Multiplier:</span>
                            <input
                                type="number"
                                min="0.1"
                                step="0.1"
                                value={quantity}
                                onChange={(e) => setQuantity(parseFloat(e.target.value))}
                                className="w-20 px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary outline-none font-bold"
                            />
                            <span className="text-xs text-muted">(1 = 100g or 1 Serving)</span>
                        </div>

                        {error && (
                            <div className="mt-4 p-4 bg-orange-50 text-orange-600 rounded-xl flex items-center gap-2 font-medium">
                                <AlertCircle className="w-5 h-5" /> {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            {results.map((food, i) => (
                                <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition border border-transparent hover:border-gray-100 group">
                                    <div className="flex items-center gap-4">
                                        {food.image ? (
                                            <img src={food.image} alt={food.name} className="w-16 h-16 rounded-lg object-cover bg-white shadow-sm" />
                                        ) : (
                                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">🍲</div>
                                        )}
                                        <div>
                                            <div className="font-bold text-text text-lg">{food.name}</div>
                                            <div className="text-sm text-muted">
                                                {Math.round(food.calories * quantity)} kcal • P: {Math.round(food.protein * quantity)}g • C: {Math.round(food.carbs * quantity)}g • F: {Math.round(food.fat * quantity)}g
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => addToLog(food)}
                                        className="p-3 bg-primary/10 text-secondary rounded-xl hover:bg-secondary hover:text-white transition"
                                    >
                                        <Plus className="w-6 h-6" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Daily Log */}
                <div className="w-full md:w-96">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                        <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                            <Flame className="text-orange-500" /> Daily Summary
                        </h3>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-orange-50 p-4 rounded-xl text-center">
                                <div className="text-3xl font-black text-orange-600">{Math.round(totalCalories)}</div>
                                <div className="text-xs font-bold text-orange-400 uppercase">Calories</div>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-xl text-center">
                                <div className="text-3xl font-black text-blue-600">{Math.round(totalProtein)}g</div>
                                <div className="text-xs font-bold text-blue-400 uppercase">Protein</div>
                            </div>
                            <div className="bg-green-50 p-4 rounded-xl text-center">
                                <div className="text-3xl font-black text-green-600">{Math.round(totalCarbs)}g</div>
                                <div className="text-xs font-bold text-green-400 uppercase">Carbs</div>
                            </div>
                            <div className="bg-yellow-50 p-4 rounded-xl text-center">
                                <div className="text-3xl font-black text-yellow-600">{Math.round(totalFat)}g</div>
                                <div className="text-xs font-bold text-yellow-400 uppercase">Fats</div>
                            </div>
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                            {dailyLog.length === 0 ? (
                                <div className="text-center text-muted py-8 italic">No food logged today</div>
                            ) : (
                                dailyLog.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center text-sm p-2 border-b border-gray-50 last:border-0">
                                        <div>
                                            <div className="font-medium truncate max-w-[150px]">{item.name}</div>
                                            <div className="text-xs text-muted">x{item.quantity}</div>
                                        </div>
                                        <span className="font-bold text-muted">{item.calories}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Nutrition;
