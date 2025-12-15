import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, CheckCircle } from 'lucide-react';

const exerciseData = {
    'squat': {
        title: 'Squat Master',
        desc: 'The king of all exercises. Builds leg strength and core stability.',
        video: 'https://www.youtube.com/embed/aclHkVaku9U', // Placeholder embed
        benefits: ['Stronger Quads & Glutes', 'Improved Core Stability', 'Better Posture'],
        steps: ['Stand shoulder-width apart.', 'Lower hips back and down.', 'Keep chest up and back straight.', 'Drive back up through heels.']
    },
    'pushup': {
        title: 'Pushup Pro',
        desc: 'Classic upper body builder for chest, shoulders, and triceps.',
        video: 'https://www.youtube.com/embed/IODxDxX7oi4',
        benefits: ['Builds Chest & Triceps', 'Strengthens Core', 'No Equipment Needed'],
        steps: ['Start in plank position.', 'Lower body until chest nearly touches floor.', 'Push back up to start.', 'Keep body in straight line.']
    },
    'lunge': {
        title: 'Lunge Logic',
        desc: 'Unilateral leg training for balance and coordination.',
        video: 'https://www.youtube.com/embed/QOVaHwm-Q6U',
        benefits: ['Fixes Muscle Imbalances', 'Improves Balance', 'Tones Legs'],
        steps: ['Step forward with one leg.', 'Lower hips until both knees are 90°.', 'Push back to start.', 'Repeat on other side.']
    },
    'bicep-curl': {
        title: 'Bicep Blaster',
        desc: 'Isolate your biceps for bigger, stronger arms.',
        video: 'https://www.youtube.com/embed/ykJmrZ5v0Oo',
        benefits: ['Bigger Arms', 'Improved Grip Strength', 'Simple & Effective'],
        steps: ['Hold weights at sides.', 'Curl weights up towards shoulders.', 'Squeeze biceps at top.', 'Lower slowly.']
    },
    'cat-cow': {
        title: 'Cat-Cow Flow',
        desc: 'Gentle yoga flow to warm up the spine and relieve tension.',
        video: 'https://www.youtube.com/embed/kqnua4rHVVA',
        benefits: ['Spinal Flexibility', 'Relieves Back Pain', 'Calms the Mind'],
        steps: ['Start on hands and knees.', 'Inhale, arch back (Cow).', 'Exhale, round spine (Cat).', 'Repeat slowly.']
    },
    'arm-circle': {
        title: 'Arm Circles',
        desc: 'Simple warmup to loosen up shoulder joints.',
        video: 'https://www.youtube.com/embed/1P-yWbchN98', // Placeholder
        benefits: ['Shoulder Mobility', 'Warmup Upper Body', 'Prevents Injury'],
        steps: ['Stand tall with arms out.', 'Make small circles forward.', 'Gradually increase size.', 'Reverse direction.']
    }
};

const ExercisePreview = () => {
    const { id } = useParams();
    const data = exerciseData[id];
    const navigate = useNavigate();

    if (!data) return <div className="p-8 text-center">Exercise not found</div>;

    return (
        <div className="max-w-4xl mx-auto p-4">
            <Link to="/exercises" className="flex items-center gap-2 font-bold text-muted hover:text-text mb-6">
                <ArrowLeft className="w-5 h-5" /> Back to Library
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Video Section */}
                <div className="bg-black rounded-2xl overflow-hidden shadow-lg aspect-video">
                    <iframe
                        width="100%"
                        height="100%"
                        src={data.video}
                        title={data.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>

                {/* Info Section */}
                <div className="space-y-6">
                    <div>
                        <h1 className="text-4xl font-black text-secondary mb-2">{data.title}</h1>
                        <p className="text-lg text-muted">{data.desc}</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-lg mb-4">Key Benefits</h3>
                        <ul className="space-y-2">
                            {data.benefits.map((b, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm font-medium text-text">
                                    <CheckCircle className="w-4 h-4 text-ok" /> {b}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <button
                        onClick={() => navigate(`/exercises/${id}/start`)}
                        className="w-full py-4 bg-secondary text-white font-bold text-xl rounded-2xl hover:bg-secondary/90 transition shadow-xl shadow-secondary/20 flex items-center justify-center gap-3"
                    >
                        <Play className="w-6 h-6 fill-white" /> Start Workout
                    </button>
                </div>
            </div>

            <div className="mt-8 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-xl mb-4">How to Perform</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.steps.map((step, i) => (
                        <div key={i} className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center font-bold text-secondary flex-shrink-0">
                                {i + 1}
                            </div>
                            <p className="text-text font-medium pt-1">{step}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ExercisePreview;
