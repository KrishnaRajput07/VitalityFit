import React, { useRef, useEffect, useState } from 'react';
import PoseCamera from '../components/PoseCamera';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import useSpeech from '../hooks/useSpeech';

const BicepCurl = () => {
    const [reps, setReps] = useState(0);
    const [feedback, setFeedback] = useState('Start curling!');
    const [arm, setArm] = useState('right');
    const [isMuted, setIsMuted] = useState(false);
    const { speak } = useSpeech();

    useEffect(() => {
        speak(`Welcome. Curling with ${arm} arm.`);
    }, [speak, arm]);
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
                setReps(countRef.current);
                setFeedback('Good curl! Lower slowly.');
                if (!isMuted) speak(`${countRef.current}`);
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

    const reset = () => {
        countRef.current = 0;
        setReps(0);
        stateRef.current = 'down';
        setFeedback('Start curling!');
        if (!isMuted) speak("Resetting.");
    };

    return (
        <div className="min-h-screen flex flex-col pb-12 md:h-[calc(100vh-8rem)]">
            <div className="flex items-center justify-between mb-4 px-1">
                <Link to="/exercises" className="flex items-center gap-2 text-gray-400 hover:text-white transition">
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back</span>
                </Link>
                <div className="flex gap-2">
                    <button onClick={() => setArm(arm === 'right' ? 'left' : 'right')} className="px-3 py-2 bg-gray-800 rounded-lg text-sm hover:bg-gray-700 transition font-bold">
                        {arm.toUpperCase()} ARM
                    </button>
                    <button onClick={() => setIsMuted(!isMuted)} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
                        {isMuted ? <VolumeX className="w-4 h-4 text-gray-400" /> : <Volume2 className="w-4 h-4 text-accent" />}
                    </button>
                    <button onClick={reset} className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
                        <RefreshCw className="w-4 h-4" />
                        <span className="hidden md:inline">Reset</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
                <div className="lg:col-span-2 relative bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-800 min-h-[75vh] lg:min-h-0 ring-1 ring-white/10">
                    <PoseCamera onResults={onResults} />
                    <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                        <div className="bg-black/60 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 shadow-lg">
                            <div className="text-xs text-gray-300 uppercase font-bold tracking-wider mb-1">Status</div>
                            <div className={`text-xl font-bold flex items-center gap-2 ${feedback.includes('Good') ? 'text-ok' : feedback.includes('Keep') ? 'text-warn' : 'text-bad'}`}>
                                {feedback}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-panel border border-gray-800 p-6 rounded-3xl text-center shadow-lg relative overflow-hidden group">
                        <div className="text-sm text-gray-400 uppercase font-bold tracking-wider mb-2 relative z-10">Total Reps</div>
                        <div className="text-7xl md:text-9xl font-black text-white mb-2 font-mono relative z-10 tracking-tighter">{reps}</div>
                    </div>
                    <div className="bg-panel border border-gray-800 p-6 rounded-3xl shadow-lg">
                        <h3 className="font-bold mb-4 flex items-center gap-2">Form Tips</h3>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li className="flex gap-3 items-start"><div className="min-w-[6px] h-[6px] rounded-full bg-accent mt-2"></div>Keep elbow pinned to side</li>
                            <li className="flex gap-3 items-start"><div className="min-w-[6px] h-[6px] rounded-full bg-accent mt-2"></div>Full range of motion</li>
                            <li className="flex gap-3 items-start"><div className="min-w-[6px] h-[6px] rounded-full bg-accent mt-2"></div>Don't swing body</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BicepCurl;
