import React, { useRef, useState } from 'react';
import PoseCamera from '../components/PoseCamera';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Pushup = () => {
    const [reps, setReps] = useState(0);
    const [feedback, setFeedback] = useState('Get into plank position');
    const stateRef = useRef('up');
    const countRef = useRef(0);

    const calculateAngle = (a, b, c) => {
        const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
        let angle = Math.abs(radians * 180.0 / Math.PI);
        if (angle > 180.0) angle = 360 - angle;
        return angle;
    };

    const onResults = (results) => {
        if (!results.poseLandmarks) return;
        const lm = results.poseLandmarks;

        // Left side: Shoulder(11), Elbow(13), Wrist(15), Hip(23), Knee(25), Ankle(27)
        const shoulder = lm[11];
        const elbow = lm[13];
        const wrist = lm[15];
        const hip = lm[23];
        const knee = lm[25];
        const ankle = lm[27];

        if (shoulder.visibility > 0.5 && elbow.visibility > 0.5 && wrist.visibility > 0.5 &&
            hip.visibility > 0.5 && ankle.visibility > 0.5) {

            const elbowAngle = calculateAngle(shoulder, elbow, wrist);

            // VALIDATION CHECKS
            // 1. Plank Position - body should be in a straight line (shoulder-hip-ankle)
            const bodyAngle = calculateAngle(shoulder, hip, ankle);
            const goodPlank = bodyAngle > 160; // Nearly straight line

            // 2. Hip shouldn't sag or pike
            const hipHeight = hip.y;
            const shoulderHeight = shoulder.y;
            const hipSag = hipHeight > shoulderHeight + 0.15; // Hip too low
            const hipPike = hipHeight < shoulderHeight - 0.05; // Hip too high
            const hipAligned = !hipSag && !hipPike;

            // 3. Proper pushup range
            const isFullyExtended = elbowAngle > 160;
            const isFullyLowered = elbowAngle < 90;

            // Provide detailed feedback
            if (!goodPlank) {
                setFeedback('Keep body straight!');
            } else if (hipSag) {
                setFeedback('Don\'t let hips sag!');
            } else if (hipPike) {
                setFeedback('Don\'t pike hips up!');
            } else if (isFullyExtended) {
                if (stateRef.current === 'down' && goodPlank && hipAligned) {
                    countRef.current += 1;
                    setReps(countRef.current);
                    setFeedback('Good push!');
                }
                stateRef.current = 'up';
            } else if (isFullyLowered && goodPlank && hipAligned) {
                stateRef.current = 'down';
                setFeedback('Push up now!');
            } else if (stateRef.current === 'up' && elbowAngle < 140) {
                setFeedback('Lower chest...');
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
                <h1 className="text-xl font-black text-secondary">Pushup AI</h1>
                <div className="px-4 py-1 bg-primary/20 text-secondary rounded-lg font-bold text-sm">
                    Reps: {reps}
                </div>
            </div>
            <div className="flex-1 relative">
                <PoseCamera onResults={onResults} />
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-8 py-4 rounded-2xl shadow-xl text-center">
                    <div className="text-3xl font-black text-secondary mb-1">{reps}</div>
                    <div className="text-sm font-bold text-muted uppercase tracking-wider mb-2">Repetitions</div>
                    <div className={`text-lg font-bold ${feedback.includes('Good') ? 'text-ok' : feedback.includes('Keep') || feedback.includes('Don') ? 'text-bad' : 'text-text'}`}>
                        {feedback}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Pushup;
