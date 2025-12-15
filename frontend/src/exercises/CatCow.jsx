import React, { useRef, useState } from 'react';
import PoseCamera from '../components/PoseCamera';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const CatCow = () => {
    const [feedback, setFeedback] = useState('Come to tabletop position');
    const [state, setState] = useState('Neutral');
    const [reps, setReps] = useState(0);
    const stateRef = useRef({ current: 'neutral', reps: 0 });

    const calculateAngle = (a, b, c) => {
        const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
        let angle = Math.abs(radians * 180.0 / Math.PI);
        if (angle > 180.0) angle = 360 - angle;
        return angle;
    };

    const onResults = (results) => {
        if (!results.poseLandmarks) return;
        const lm = results.poseLandmarks;

        // For Cat-Cow, we measure spine curvature using shoulder-hip-knee angle
        const shoulder = lm[11]; // Left shoulder
        const hip = lm[23]; // Left hip
        const knee = lm[25]; // Left knee
        const ankle = lm[27]; // Left ankle

        if (shoulder.visibility > 0.5 && hip.visibility > 0.5 && knee.visibility > 0.5 && ankle.visibility > 0.5) {
            // Measure spine angle (shoulder-hip-knee)
            const spineAngle = calculateAngle(shoulder, hip, knee);

            // Also check if in tabletop (hip should be above knee)
            const inTabletop = hip.y < knee.y - 0.05;

            if (!inTabletop) {
                setState('Not in position');
                setFeedback('Get into tabletop position');
                return;
            }

            const currentState = stateRef.current;

            // Cat Pose: Spine rounds up (angle decreases, back arches upward)
            // Cow Pose: Spine dips down (angle increases, back sags downward)

            if (spineAngle < 155) {
                // Cat pose (rounded spine)
                if (currentState.current === 'cow') {
                    currentState.reps += 1;
                    setReps(currentState.reps);
                }
                currentState.current = 'cat';
                setState('Cat 🐱');
                setFeedback('Round your spine, tuck chin');
            } else if (spineAngle > 185) {
                // Cow pose (arched spine)
                if (currentState.current === 'cat') {
                    currentState.reps += 1;
                    setReps(currentState.reps);
                }
                currentState.current = 'cow';
                setState('Cow 🐮');
                setFeedback('Arch your back, lift head');
            } else {
                // Neutral
                currentState.current = 'neutral';
                setState('Neutral');
                setFeedback('Move between Cat and Cow');
            }
        } else {
            setFeedback('Make sure full body is visible');
        }
    };

    return (
        <div className="h-screen flex flex-col bg-background">
            <div className="p-4 flex items-center justify-between bg-white shadow-sm z-10">
                <Link to="/exercises" className="flex items-center gap-2 font-bold text-muted hover:text-text">
                    <ArrowLeft className="w-5 h-5" /> Back
                </Link>
                <h1 className="text-xl font-black text-secondary">Cat-Cow AI</h1>
                <div className="flex gap-4">
                    <div className="px-4 py-1 bg-primary/20 text-secondary rounded-lg font-bold text-sm">
                        Pose: {state}
                    </div>
                    <div className="px-4 py-1 bg-gray-100 rounded-lg font-bold text-sm">
                        Cycles: {reps}
                    </div>
                </div>
            </div>
            <div className="flex-1 relative">
                <PoseCamera onResults={onResults} />
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-8 py-4 rounded-2xl shadow-xl text-center">
                    <div className="text-3xl font-black text-secondary mb-1">{state}</div>
                    <div className="text-sm font-bold text-muted uppercase tracking-wider mb-2">Current Pose</div>
                    <div className={`text-lg font-bold ${state.includes('Cat') || state.includes('Cow') ? 'text-ok' : 'text-text'}`}>
                        {feedback}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CatCow;
