// Comprehensive Exercise Database with MET (Metabolic Equivalent) Values
// MET = Metabolic Equivalent of Task (1 MET = resting metabolic rate)
// Calories Burned = MET × Weight(kg) × Duration(hours)

export const exerciseDatabase = [
    // CARDIO EXERCISES
    { id: 1, name: 'Running (6 mph)', category: 'Cardio', met: 9.8, unit: 'minutes' },
    { id: 2, name: 'Running (8 mph)', category: 'Cardio', met: 11.8, unit: 'minutes' },
    { id: 3, name: 'Jogging (5 mph)', category: 'Cardio', met: 8.0, unit: 'minutes' },
    { id: 4, name: 'Walking (3 mph)', category: 'Cardio', met: 3.5, unit: 'minutes' },
    { id: 5, name: 'Walking (4 mph)', category: 'Cardio', met: 5.0, unit: 'minutes' },
    { id: 6, name: 'Cycling (moderate)', category: 'Cardio', met: 6.8, unit: 'minutes' },
    { id: 7, name: 'Cycling (vigorous)', category: 'Cardio', met: 10.0, unit: 'minutes' },
    { id: 8, name: 'Swimming (moderate)', category: 'Cardio', met: 5.8, unit: 'minutes' },
    { id: 9, name: 'Swimming (vigorous)', category: 'Cardio', met: 9.8, unit: 'minutes' },
    { id: 10, name: 'Jump Rope', category: 'Cardio', met: 12.3, unit: 'minutes' },
    { id: 11, name: 'Rowing Machine', category: 'Cardio', met: 7.0, unit: 'minutes' },
    { id: 12, name: 'Elliptical Trainer', category: 'Cardio', met: 5.0, unit: 'minutes' },
    { id: 13, name: 'Stair Climbing', category: 'Cardio', met: 8.8, unit: 'minutes' },
    { id: 14, name: 'HIIT Training', category: 'Cardio', met: 10.0, unit: 'minutes' },

    // STRENGTH TRAINING - UPPER BODY
    { id: 15, name: 'Bench Press', category: 'Strength - Chest', met: 6.0, unit: 'reps' },
    { id: 16, name: 'Incline Bench Press', category: 'Strength - Chest', met: 6.0, unit: 'reps' },
    { id: 17, name: 'Dumbbell Flyes', category: 'Strength - Chest', met: 5.0, unit: 'reps' },
    { id: 18, name: 'Push-ups', category: 'Strength - Chest', met: 3.8, unit: 'reps' },
    { id: 19, name: 'Chest Dips', category: 'Strength - Chest', met: 5.3, unit: 'reps' },

    { id: 20, name: 'Pull-ups', category: 'Strength - Back', met: 8.0, unit: 'reps' },
    { id: 21, name: 'Lat Pulldown', category: 'Strength - Back', met: 5.0, unit: 'reps' },
    { id: 22, name: 'Barbell Row', category: 'Strength - Back', met: 6.0, unit: 'reps' },
    { id: 23, name: 'Dumbbell Row', category: 'Strength - Back', met: 5.5, unit: 'reps' },
    { id: 24, name: 'Deadlift', category: 'Strength - Back', met: 6.0, unit: 'reps' },
    { id: 25, name: 'T-Bar Row', category: 'Strength - Back', met: 5.5, unit: 'reps' },

    { id: 26, name: 'Overhead Press', category: 'Strength - Shoulders', met: 6.0, unit: 'reps' },
    { id: 27, name: 'Lateral Raises', category: 'Strength - Shoulders', met: 4.0, unit: 'reps' },
    { id: 28, name: 'Front Raises', category: 'Strength - Shoulders', met: 4.0, unit: 'reps' },
    { id: 29, name: 'Arnold Press', category: 'Strength - Shoulders', met: 5.5, unit: 'reps' },
    { id: 30, name: 'Shrugs', category: 'Strength - Shoulders', met: 4.5, unit: 'reps' },

    { id: 31, name: 'Bicep Curls', category: 'Strength - Arms', met: 4.0, unit: 'reps' },
    { id: 32, name: 'Hammer Curls', category: 'Strength - Arms', met: 4.0, unit: 'reps' },
    { id: 33, name: 'Tricep Dips', category: 'Strength - Arms', met: 5.3, unit: 'reps' },
    { id: 34, name: 'Tricep Pushdown', category: 'Strength - Arms', met: 4.5, unit: 'reps' },
    { id: 35, name: 'Skull Crushers', category: 'Strength - Arms', met: 4.5, unit: 'reps' },
    { id: 36, name: 'Preacher Curls', category: 'Strength - Arms', met: 4.0, unit: 'reps' },

    // STRENGTH TRAINING - LOWER BODY
    { id: 37, name: 'Squats', category: 'Strength - Legs', met: 5.0, unit: 'reps' },
    { id: 38, name: 'Front Squats', category: 'Strength - Legs', met: 5.5, unit: 'reps' },
    { id: 39, name: 'Leg Press', category: 'Strength - Legs', met: 5.0, unit: 'reps' },
    { id: 40, name: 'Lunges', category: 'Strength - Legs', met: 4.0, unit: 'reps' },
    { id: 41, name: 'Bulgarian Split Squats', category: 'Strength - Legs', met: 4.5, unit: 'reps' },
    { id: 42, name: 'Leg Extension', category: 'Strength - Legs', met: 3.5, unit: 'reps' },
    { id: 43, name: 'Leg Curl', category: 'Strength - Legs', met: 3.5, unit: 'reps' },
    { id: 44, name: 'Calf Raises', category: 'Strength - Legs', met: 3.0, unit: 'reps' },
    { id: 45, name: 'Romanian Deadlift', category: 'Strength - Legs', met: 6.0, unit: 'reps' },

    // CORE
    { id: 46, name: 'Crunches', category: 'Core', met: 3.8, unit: 'reps' },
    { id: 47, name: 'Sit-ups', category: 'Core', met: 3.8, unit: 'reps' },
    { id: 48, name: 'Plank', category: 'Core', met: 4.0, unit: 'minutes' },
    { id: 49, name: 'Russian Twists', category: 'Core', met: 4.5, unit: 'reps' },
    { id: 50, name: 'Leg Raises', category: 'Core', met: 4.0, unit: 'reps' },
    { id: 51, name: 'Mountain Climbers', category: 'Core', met: 8.0, unit: 'reps' },
    { id: 52, name: 'Bicycle Crunches', category: 'Core', met: 4.5, unit: 'reps' },

    // FUNCTIONAL & SPORTS
    { id: 53, name: 'Burpees', category: 'Functional', met: 8.0, unit: 'reps' },
    { id: 54, name: 'Box Jumps', category: 'Functional', met: 7.0, unit: 'reps' },
    { id: 55, name: 'Kettlebell Swings', category: 'Functional', met: 6.0, unit: 'reps' },
    { id: 56, name: 'Battle Ropes', category: 'Functional', met: 7.0, unit: 'minutes' },
    { id: 57, name: 'Farmer\'s Walk', category: 'Functional', met: 5.5, unit: 'minutes' },
    { id: 58, name: 'Sled Push', category: 'Functional', met: 8.0, unit: 'minutes' },

    { id: 59, name: 'Basketball', category: 'Sports', met: 6.5, unit: 'minutes' },
    { id: 60, name: 'Soccer', category: 'Sports', met: 7.0, unit: 'minutes' },
    { id: 61, name: 'Tennis', category: 'Sports', met: 7.3, unit: 'minutes' },
    { id: 62, name: 'Boxing', category: 'Sports', met: 9.0, unit: 'minutes' },
];

// Helper function to calculate calories
export const calculateCalories = (exercise, repsOrMinutes, weightKg) => {
    if (!exercise || !repsOrMinutes || !weightKg) return 0;

    let durationHours;

    if (exercise.unit === 'reps') {
        // Estimate: 1 rep = ~3 seconds on average
        const totalSeconds = repsOrMinutes * 3;
        durationHours = totalSeconds / 3600;
    } else {
        // Already in minutes
        durationHours = repsOrMinutes / 60;
    }

    // Formula: Calories = MET × Weight(kg) × Duration(hours)
    const calories = exercise.met * weightKg * durationHours;
    return Math.round(calories * 10) / 10; // Round to 1 decimal
};

// Get exercise categories
export const getCategories = () => {
    const categories = [...new Set(exerciseDatabase.map(ex => ex.category))];
    return ['All', ...categories.sort()];
};

// Filter exercises by category
export const filterByCategory = (category) => {
    if (category === 'All') return exerciseDatabase;
    return exerciseDatabase.filter(ex => ex.category === category);
};
