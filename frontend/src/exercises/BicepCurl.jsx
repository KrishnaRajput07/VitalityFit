import React, { useRef, useEffect, useState } from 'react';
import PoseCamera from '../components/PoseCamera';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BicepCurl = () => {
    const [reps, setReps] = useState(0);
    const [feedback, setFeedback] = useState('Start curling!');
    const [arm, setArm] = useState('right');
    const stateRef = useRef('down');
    const countRef = useRef(0);
    const prevShoulderYRef = useRef(null);

    const onResults = (results) => {
        if (!results.poseLandmarks) return;

        const landmarks = results.poseLandmarks;
        const isRight = arm === 'right';

        // Indices for Right: 12, 14, 16; Left: 11, 13, 15
        const shoulder = landmarks[isRight ? 12 : 11];
        const elbow = landmarks[isRight ? 14 : 13];
        const wrist = landmarks[isRight ? 16 : 15];
        const hip = landmarks[isRight ? 24 : 23];

        if (shoulder.visibility > 0.5 && elbow.visibility > 0.5 && wrist.visibility > 0.5 && hip.visibility > 0.5) {
            const angle = calculateAngle(shoulder, elbow, wrist);

            // Initialize previous shoulder position
            if (prevShoulderYRef.current === null) {
                prevShoulderYRef.current = shoulder.y;
            }

            // VALIDATION CHECKS
            // 1. Shoulder Stability - shoulder shouldn't move up/down significantly
            const shoulderMovement = Math.abs(shoulder.y - prevShoulderYRef.current);
            const shoulderStable = shoulderMovement < 0.08; // Allow 8% movement

            // 2. Elbow Position - elbow should stay close to side (near hip)
            const elbowHipDistance = Math.abs(elbow.x - hip.x);
            const elbowAtSide = elbowHipDistance < 0.15; // Within 15% of body width

            // 3. Wrist Path - wrist should be moving upward toward shoulder during curl
            const wristMovingUp = wrist.y < elbow.y - 0.03; // Wrist above elbow

            // 4. Proper curl range - tighter thresholds
            const isFullyExtended = angle > 165;
            const isFullyCurled = angle < 45;

            // Update previous shoulder position
            prevShoulderYRef.current = shoulder.y;

            // Provide detailed feedback
            if (!shoulderStable) {
                setFeedback('Keep shoulder still!');
            } else if (!elbowAtSide) {
                setFeedback('Keep elbow at your side!');
            } else if (isFullyExtended) {
                stateRef.current = 'down';
                setFeedback('Curl up!');
            } else if (isFullyCurled && stateRef.current === 'down' && shoulderStable && elbowAtSide && wristMovingUp) {
                // Only count if ALL validation checks pass
                stateRef.current = 'up';
                countRef.current += 1;
                setReps(countRef.current);
                setFeedback('Good curl! Lower slowly.');
            } else if (stateRef.current === 'down' && angle < 120) {
                setFeedback('Keep curling...');
            }
        } else {
            setFeedback('Make sure your arm is visible.');
        }
    };

    // Helper function
    function calculateAngle(a, b, c) {
        const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
        let angle = Math.abs(radians * 180.0 / Math.PI);
        if (angle > 180.0) angle = 360 - angle;
        return angle;
    }

    return (
        <div className="h-screen flex flex-col bg-background">
            <div className="p-4 flex items-center justify-between bg-white shadow-sm z-10">
                <Link to="/exercises" className="flex items-center gap-2 font-bold text-muted hover:text-text">
                    <ArrowLeft className="w-5 h-5" /> Back
                </Link>
                <h1 className="text-xl font-black text-secondary">Bicep Curl AI</h1>
                <div className="flex gap-4">
                    <button onClick={() => setArm(arm === 'right' ? 'left' : 'right')} className="px-4 py-1 bg-gray-100 rounded-lg font-bold text-sm">
                        Current: {arm.toUpperCase()} Arm
                    </button>
                    <div className="px-4 py-1 bg-primary/20 text-secondary rounded-lg font-bold text-sm">
                        Reps: {reps}
                    </div>
                </div>
            </div>

            <div className="flex-1 relative">
                <PoseCamera onResults={onResults} />

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-8 py-4 rounded-2xl shadow-xl text-center">
                    <div className="text-3xl font-black text-secondary mb-1">{reps}</div>
                    <div className="text-sm font-bold text-muted uppercase tracking-wider mb-2">Repetitions</div>
                    <div className={`text-lg font-bold ${feedback.includes('Good') ? 'text-ok' : feedback.includes('Keep') ? 'text-warn' : 'text-bad'}`}>
                        {feedback}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BicepCurl;
