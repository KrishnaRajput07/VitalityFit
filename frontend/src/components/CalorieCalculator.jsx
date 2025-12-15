import React, { useState, useEffect, useRef } from 'react';
import { exerciseDatabase, calculateCalories, getCategories, filterByCategory } from '../utils/exerciseDatabase';
import { useAuth } from '../context/AuthContext';
import { Calculator, Plus, Check, Play, Pause, RotateCcw, Timer, Sparkles } from 'lucide-react';
import { API_URL } from '../utils/api';

const CalorieCalculator = () => {
    const { user } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [reps, setReps] = useState('');
    const [sets, setSets] = useState('');
    const [weightLifted, setWeightLifted] = useState('');
    const [bodyWeight, setBodyWeight] = useState(user?.weight || '');
    const [calculatedCalories, setCalculatedCalories] = useState(null);
    const [isLogged, setIsLogged] = useState(false);
    const [isLogging, setIsLogging] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    // Stopwatch state
    const [isRunning, setIsRunning] = useState(false);
    const [time, setTime] = useState(0);
    const intervalRef = useRef(null);

    const categories = getCategories();
    const filteredExercises = filterByCategory(selectedCategory);
    const needsWeightLifted = selectedExercise?.category?.includes('Strength');

    // Stopwatch logic
    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setTime(prevTime => prevTime + 10);
            }, 10);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning]);

    const formatTime = (milliseconds) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const ms = Math.floor((milliseconds % 1000) / 10);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    };

    const handleStartPause = () => {
        setIsRunning(!isRunning);
    };

    const handleReset = () => {
        setIsRunning(false);
        setTime(0);
    };

    const handleCalculate = () => {
        if (!selectedExercise || !bodyWeight) {
            alert('Please select an exercise and enter your body weight');
            return;
        }

        let totalRepsOrMinutes;

        if (selectedExercise.unit === 'reps') {
            if (!reps || !sets) {
                alert('Please enter reps and sets');
                return;
            }
            totalRepsOrMinutes = parseFloat(reps) * parseFloat(sets);
        } else {
            if (time > 0) {
                totalRepsOrMinutes = time / 60000;
            } else {
                alert('Please use the stopwatch to track your time');
                return;
            }
        }

        const calories = calculateCalories(selectedExercise, totalRepsOrMinutes, parseFloat(bodyWeight));
        setCalculatedCalories(calories);
        setIsLogged(false);

        // Trigger confetti animation
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 1000);
    };

    const handleLogActivity = async () => {
        if (!calculatedCalories || !user) {
            alert('Please calculate calories first and be logged in');
            return;
        }

        setIsLogging(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            let totalRepsOrMinutes;

            if (selectedExercise.unit === 'reps') {
                totalRepsOrMinutes = parseFloat(reps) * parseFloat(sets);
            } else {
                totalRepsOrMinutes = time / 60000;
            }

            const response = await fetch(`${API_URL}/api/activity-log`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    date: today,
                    exerciseName: selectedExercise.name,
                    category: selectedExercise.category,
                    repsOrMinutes: totalRepsOrMinutes,
                    unit: selectedExercise.unit,
                    caloriesBurned: calculatedCalories,
                    weightKg: parseFloat(bodyWeight)
                })
            });

            if (response.ok) {
                setIsLogged(true);
                setTimeout(() => setIsLogged(false), 3000);
            } else {
                alert('Failed to log activity');
            }
        } catch (error) {
            console.error('Log activity error:', error);
            alert('Failed to log activity');
        } finally {
            setIsLogging(false);
        }
    };

    return (
        <div className="mt-8 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
            {/* Header with animation */}
            <div className="flex items-center gap-3 mb-6 group">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <Calculator className="w-5 h-5 text-secondary transition-transform duration-300 group-hover:scale-110" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-secondary">Calorie Calculator & Timer</h3>
                    <p className="text-sm text-muted">Calculate calories burned and track hold exercises</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Calculator */}
                <div className="space-y-4">
                    <h4 className="font-bold text-text mb-4 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                        Exercise Calculator
                    </h4>

                    {/* Category Filter */}
                    <div className="transform transition-all duration-200 hover:scale-[1.01]">
                        <label className="block text-sm font-bold text-text mb-2">Category</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => {
                                setSelectedCategory(e.target.value);
                                setSelectedExercise(null);
                                setCalculatedCalories(null);
                            }}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Exercise Selection */}
                    <div className="transform transition-all duration-200 hover:scale-[1.01]">
                        <label className="block text-sm font-bold text-text mb-2">Exercise</label>
                        <select
                            value={selectedExercise?.id || ''}
                            onChange={(e) => {
                                const exercise = filteredExercises.find(ex => ex.id === parseInt(e.target.value));
                                setSelectedExercise(exercise);
                                setCalculatedCalories(null);
                            }}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                        >
                            <option value="">Select an exercise...</option>
                            {filteredExercises.map(exercise => (
                                <option key={exercise.id} value={exercise.id}>
                                    {exercise.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Reps & Sets OR Time-based */}
                    {selectedExercise?.unit === 'reps' ? (
                        <div className="space-y-4 animate-fadeIn">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="transform transition-all duration-200 hover:scale-[1.02]">
                                    <label className="block text-sm font-bold text-text mb-2">Reps</label>
                                    <input
                                        type="number"
                                        value={reps}
                                        onChange={(e) => {
                                            setReps(e.target.value);
                                            setCalculatedCalories(null);
                                        }}
                                        placeholder="e.g., 12"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                                    />
                                </div>
                                <div className="transform transition-all duration-200 hover:scale-[1.02]">
                                    <label className="block text-sm font-bold text-text mb-2">Sets</label>
                                    <input
                                        type="number"
                                        value={sets}
                                        onChange={(e) => {
                                            setSets(e.target.value);
                                            setCalculatedCalories(null);
                                        }}
                                        placeholder="e.g., 3"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                                    />
                                </div>
                            </div>

                            {/* Weight Lifted */}
                            {needsWeightLifted && (
                                <div className="transform transition-all duration-200 hover:scale-[1.01] animate-slideDown">
                                    <label className="block text-sm font-bold text-text mb-2">
                                        💪 Weight Lifted (kg)
                                    </label>
                                    <input
                                        type="number"
                                        value={weightLifted}
                                        onChange={(e) => {
                                            setWeightLifted(e.target.value);
                                            setCalculatedCalories(null);
                                        }}
                                        placeholder="e.g., 50"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                                    />
                                    <p className="text-xs text-muted mt-1">
                                        How much weight did you lift? (barbell, dumbbells, etc.)
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : selectedExercise ? (
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 animate-fadeIn">
                            <p className="text-sm text-blue-700 font-medium">
                                ⏱️ Use the stopwatch on the right to track your time for this exercise
                            </p>
                        </div>
                    ) : null}

                    {/* Body Weight Input */}
                    <div className="transform transition-all duration-200 hover:scale-[1.01]">
                        <label className="block text-sm font-bold text-text mb-2">Your Body Weight (kg)</label>
                        <input
                            type="number"
                            value={bodyWeight}
                            onChange={(e) => {
                                setBodyWeight(e.target.value);
                                setCalculatedCalories(null);
                            }}
                            placeholder="e.g., 70"
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                        />
                    </div>

                    {/* Calculate Button */}
                    <button
                        onClick={handleCalculate}
                        disabled={!selectedExercise || !bodyWeight}
                        className="w-full px-6 py-3 bg-secondary text-white font-bold rounded-xl hover:bg-secondary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
                    >
                        <span className="flex items-center justify-center gap-2">
                            <Calculator className="w-5 h-5" />
                            Calculate Calories
                        </span>
                    </button>

                    {/* Results with animation */}
                    {calculatedCalories !== null && (
                        <div className={`p-4 bg-primary/10 rounded-xl border border-primary/20 animate-slideUp ${showConfetti ? 'animate-bounce' : ''}`}>
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="text-sm text-muted font-medium">Calories Burned</p>
                                    <p className="text-3xl font-black text-secondary animate-countUp">{calculatedCalories}</p>
                                    <p className="text-xs text-muted mt-1">
                                        {selectedExercise.name}
                                        {selectedExercise.unit === 'reps'
                                            ? ` • ${reps} reps × ${sets} sets${weightLifted ? ` @ ${weightLifted}kg` : ''}`
                                            : ` • ${formatTime(time)}`}
                                    </p>
                                </div>
                                <button
                                    onClick={handleLogActivity}
                                    disabled={isLogging || isLogged}
                                    className={`px-4 py-2 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 transform hover:scale-105 active:scale-95 ${isLogged
                                            ? 'bg-ok text-white shadow-lg shadow-ok/30'
                                            : 'bg-secondary text-white hover:bg-secondary/90 shadow-md hover:shadow-lg'
                                        } disabled:opacity-50`}
                                >
                                    {isLogged ? (
                                        <>
                                            <Check className="w-4 h-4 animate-checkmark" />
                                            Logged!
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4" />
                                            {isLogging ? 'Logging...' : 'Log'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Stopwatch */}
                <div>
                    <h4 className="font-bold text-text mb-4 flex items-center gap-2">
                        <Timer className="w-5 h-5 animate-pulse" />
                        Stopwatch (for Hold Exercises)
                    </h4>
                    <div className="bg-gradient-to-br from-secondary/10 to-primary/10 rounded-2xl p-8 border border-secondary/20 transition-all duration-300 hover:shadow-lg">
                        <div className="text-center mb-6">
                            <div className={`text-6xl font-mono font-black text-secondary mb-2 transition-all duration-200 ${isRunning ? 'animate-pulse' : ''}`}>
                                {formatTime(time)}
                            </div>
                            <p className="text-sm text-muted">Perfect for Plank, Wall Sit, etc.</p>
                        </div>

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={handleStartPause}
                                className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg ${isRunning
                                        ? 'bg-warn text-white hover:bg-warn/90'
                                        : 'bg-secondary text-white hover:bg-secondary/90'
                                    }`}
                            >
                                {isRunning ? (
                                    <>
                                        <Pause className="w-5 h-5" />
                                        Pause
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-5 h-5" />
                                        Start
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleReset}
                                className="px-6 py-3 bg-gray-200 text-text rounded-xl font-bold hover:bg-gray-300 transition-all duration-300 flex items-center gap-2 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                            >
                                <RotateCcw className="w-5 h-5" />
                                Reset
                            </button>
                        </div>

                        <div className="mt-6 p-3 bg-white/50 rounded-xl backdrop-blur-sm">
                            <p className="text-xs text-muted text-center">
                                💡 Start the timer, hold your position, then calculate calories using the recorded time
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideDown {
                    from { 
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes slideUp {
                    from { 
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes checkmark {
                    0% { transform: scale(0); }
                    50% { transform: scale(1.2); }
                    100% { transform: scale(1); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
                .animate-slideDown {
                    animation: slideDown 0.3s ease-out;
                }
                .animate-slideUp {
                    animation: slideUp 0.4s ease-out;
                }
                .animate-checkmark {
                    animation: checkmark 0.4s ease-out;
                }
            `}</style>
        </div>
    );
};

export default CalorieCalculator;
