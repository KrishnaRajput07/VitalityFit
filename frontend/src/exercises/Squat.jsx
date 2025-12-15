import React, { useState, useRef, useCallback } from 'react';
import PoseCamera from '../components/PoseCamera';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const Squat = () => {
    const [reps, setReps] = useState(0);
    const [feedback, setFeedback] = useState('Get ready');
    const [depth, setDepth] = useState(0);
    const [isGoodForm, setIsGoodForm] = useState(false);

    // Refs for logic to avoid re-renders
    const stateRef = useRef({
        stage: 'up', // up, down
        reps: 0,
        lastFeedback: '',
        prevAnkleY: null, // Track ankle position
    });

    const calculateAngle = (a, b, c) => {
        const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
        let angle = Math.abs(radians * 180.0 / Math.PI);
        if (angle > 180.0) angle = 360 - angle;
        return angle;
    };

    const onResults = useCallback((results) => {
        if (!results.poseLandmarks) return;

        const landmarks = results.poseLandmarks;

        // Key landmarks for Squat
        const leftHip = landmarks[23];
        const leftKnee = landmarks[25];
        const leftAnkle = landmarks[27];

        const rightHip = landmarks[24];
        const rightKnee = landmarks[26];
        const rightAnkle = landmarks[28];

        const leftShoulder = landmarks[11];
        const rightShoulder = landmarks[12];

        if (leftHip && leftKnee && leftAnkle && rightHip && rightKnee && rightAnkle) {
            const leftAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
            const rightAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
            const avgAngle = (leftAngle + rightAngle) / 2;

            // FIXED DEPTH CALCULATION
            const depthPercent = Math.min(100, Math.max(0, ((180 - avgAngle) / (180 - 90)) * 100));
            setDepth(depthPercent);

            // CRITICAL: Ankle Movement Detection
            // In a proper squat, ankles should stay relatively stationary
            // If ankles are moving up/down significantly, it's likely a knee lift, not a squat
            const avgAnkleY = (leftAnkle.y + rightAnkle.y) / 2;

            if (stateRef.current.prevAnkleY === null) {
                stateRef.current.prevAnkleY = avgAnkleY;
            }

            const ankleMovement = Math.abs(avgAnkleY - stateRef.current.prevAnkleY);
            const anklesStable = ankleMovement < 0.05; // Ankles must stay within 5% range

            // Update ankle position
            stateRef.current.prevAnkleY = avgAnkleY;

            // VALIDATION CHECKS
            // 1. Hip Height - hips should drop significantly
            const avgHipY = (leftHip.y + rightHip.y) / 2;
            const avgKneeY = (leftKnee.y + rightKnee.y) / 2;
            const hipDropped = avgHipY >= avgKneeY - 0.05;

            // 2. Knee Safety - knees shouldn't go too far past toes
            const leftKneeSafe = (leftKnee.x - leftAnkle.x) < 0.15;
            const rightKneeSafe = (rightKnee.x - rightAnkle.x) < 0.15;
            const kneesSafe = leftKneeSafe && rightKneeSafe;

            // 3. Torso angle - should stay relatively upright
            const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
            const torsoUpright = avgShoulderY < avgHipY;

            // 4. CRITICAL: Both feet should be on ground (ankle Y should be high/bottom of frame)
            const feetOnGround = avgAnkleY > 0.7; // Ankles should be in bottom 30% of frame

            // Squat Logic
            const currentState = stateRef.current;

            // Standing position
            if (avgAngle > 160 && currentState.stage === 'down') {
                // Only count if ankles were stable throughout movement
                if (anklesStable && feetOnGround) {
                    currentState.stage = 'up';
                    currentState.reps += 1;
                    setReps(currentState.reps);
                    setFeedback('Great rep!');
                    setIsGoodForm(true);
                } else {
                    currentState.stage = 'up';
                    setFeedback('Keep feet planted!');
                    setIsGoodForm(false);
                }
            } else if (avgAngle > 160) {
                currentState.stage = 'up';
                setFeedback('Squat down!');
                setIsGoodForm(true);
            }

            // Squatting down - only count if proper depth AND form checks pass
            if (avgAngle < 100 && currentState.stage === 'up') {
                if (!anklesStable) {
                    setFeedback('Keep feet planted!');
                    setIsGoodForm(false);
                } else if (!feetOnGround) {
                    setFeedback('Keep feet on ground!');
                    setIsGoodForm(false);
                } else if (hipDropped && kneesSafe && torsoUpright) {
                    currentState.stage = 'down';
                    setFeedback('Good depth! Now up.');
                    setIsGoodForm(true);
                } else {
                    // Provide specific feedback
                    if (!hipDropped) {
                        setFeedback('Drop hips lower!');
                        setIsGoodForm(false);
                    } else if (!kneesSafe) {
                        setFeedback('Knees too far forward!');
                        setIsGoodForm(false);
                    } else if (!torsoUpright) {
                        setFeedback('Keep chest up!');
                        setIsGoodForm(false);
                    }
                }
            }

            // Too deep warning
            if (avgAngle < 70) {
                setFeedback('Too deep! Careful.');
                setIsGoodForm(false);
            }

            // Partial squat warning
            if (avgAngle >= 100 && avgAngle < 140 && currentState.stage === 'up') {
                setFeedback('Go deeper...');
                setIsGoodForm(false);
            }
        } else {
            setFeedback('Make sure full body is visible');
            setIsGoodForm(false);
        }
    }, []);

    const reset = () => {
        stateRef.current.reps = 0;
        stateRef.current.stage = 'up';
        stateRef.current.prevAnkleY = null;
        setReps(0);
        setFeedback('Get ready');
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <Link to="/exercises" className="flex items-center gap-2 text-gray-400 hover:text-white transition">
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Library</span>
                </Link>
                <div className="flex gap-2">
                    <button onClick={reset} className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
                        <RefreshCw className="w-4 h-4" />
                        <span>Reset</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
                <div className="lg:col-span-2 relative bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
                    <PoseCamera onResults={onResults} />

                    {/* Overlay Stats */}
                    <div className="absolute top-4 left-4 bg-black/50 backdrop-blur px-4 py-2 rounded-xl border border-white/10">
                        <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Current Status</div>
                        <div className={`text-lg font-bold ${isGoodForm ? 'text-ok' : 'text-warn'}`}>{feedback}</div>
                    </div>
                </div>

                <div className="space-y-6 overflow-y-auto">
                    <div className="bg-panel border border-gray-800 p-6 rounded-2xl text-center">
                        <div className="text-sm text-gray-400 uppercase font-bold tracking-wider mb-2">Total Reps</div>
                        <div className="text-8xl font-black text-white mb-2 font-mono">{reps}</div>
                        <div className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold">
                            Target: 15
                        </div>
                    </div>

                    <div className="bg-panel border border-gray-800 p-6 rounded-2xl">
                        <div className="flex justify-between items-end mb-4">
                            <span className="font-bold">Squat Depth</span>
                            <span className="font-mono text-accent">{Math.round(depth)}%</span>
                        </div>
                        <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-200 ${depth > 80 ? 'bg-ok' : depth > 50 ? 'bg-accent' : 'bg-warn'}`}
                                style={{ width: `${depth}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-500">
                            <span>Standing</span>
                            <span>Parallel</span>
                            <span>Deep</span>
                        </div>
                    </div>

                    <div className="bg-panel border border-gray-800 p-6 rounded-2xl">
                        <h3 className="font-bold mb-4">Form Tips</h3>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li className="flex gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5"></div>
                                Keep your back straight and chest up
                            </li>
                            <li className="flex gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5"></div>
                                Feet shoulder-width apart, planted firmly
                            </li>
                            <li className="flex gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5"></div>
                                Lower until thighs are parallel to floor
                            </li>
                            <li className="flex gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5"></div>
                                Knees should track over toes, not past them
                            </li>
                            <li className="flex gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5"></div>
                                <strong>Keep feet on ground - no lifting!</strong>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Squat;
