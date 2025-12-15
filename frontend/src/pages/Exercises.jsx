import React from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, Activity, ArrowRight, Zap, Heart } from 'lucide-react';
import CalorieCalculator from '../components/CalorieCalculator';

const ExerciseCard = ({ title, desc, path, icon: Icon, difficulty, color }) => (
    <Link to={path} className="group bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full">
        <div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color} text-white shadow-lg`}>
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-xl text-text mb-2 group-hover:text-secondary transition-colors">{title}</h3>
            <p className="text-muted text-sm leading-relaxed mb-4">{desc}</p>
        </div>
        <div className="flex items-center justify-between mt-4 border-t border-gray-50 pt-4">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">{difficulty}</span>
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition">
                <ArrowRight className="w-4 h-4" />
            </div>
        </div>
    </Link>
);

const Exercises = () => {
    const exercises = [
        { title: 'Squat Master', desc: 'Perfect your squat form with real-time depth analysis.', path: '/exercises/squat', icon: Dumbbell, difficulty: 'Beginner', color: 'bg-orange-500' },
        { title: 'Pushup Pro', desc: 'Build chest strength with AI rep counting and form feedback.', path: '/exercises/pushup', icon: Zap, difficulty: 'Intermediate', color: 'bg-blue-500' },
        { title: 'Lunge Logic', desc: 'Ensure proper knee alignment and balance in your lunges.', path: '/exercises/lunge', icon: Activity, difficulty: 'Beginner', color: 'bg-purple-500' },
        { title: 'Bicep Blaster', desc: 'Isolate your biceps with strict form monitoring.', path: '/exercises/bicep-curl', icon: Dumbbell, difficulty: 'Beginner', color: 'bg-red-500' },
        { title: 'Cat-Cow Flow', desc: 'Improve spinal flexibility with guided yoga flow.', path: '/exercises/cat-cow', icon: Heart, difficulty: 'Relaxing', color: 'bg-green-500' },
        { title: 'Arm Circles', desc: 'Warm up your shoulders with tracked rotations.', path: '/exercises/arm-circle', icon: Activity, difficulty: 'Warmup', color: 'bg-yellow-500' },
    ];

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-10">
                <h2 className="text-3xl font-bold text-text mb-2">AI Workout Library</h2>
                <p className="text-muted">Select a workout to view details and start training.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {exercises.map((ex, i) => (
                    <ExerciseCard key={i} {...ex} />
                ))}
            </div>

            {/* Calorie Calculator Section */}
            <CalorieCalculator />
        </div>
    );
};

export default Exercises;
