import React, { useState, useRef, useCallback, useEffect } from 'react';
import PoseCamera from '../components/PoseCamera';
import { ArrowLeft, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import { Link } from 'react-router-dom';
import useSpeech from '../hooks/useSpeech';

const Squat = () => {
    const [reps, setReps] = useState(0);
    const [feedback, setFeedback] = useState('Get ready');
    const [depth, setDepth] = useState(0);
    const [isGoodForm, setIsGoodForm] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    // AI Voice Integration
    const { speak } = useSpeech();
    const lastSpokenRepRef = useRef(0);
    const lastFeedbackTimeRef = useRef(0);

    // Refs for logic to avoid re-renders
    const stateRef = useRef({
        stage: 'up', // up, down
        reps: 0,
        lastFeedback: '',
        prevAnkleY: null, // Track ankle position
    });

    // Initial Greeting
    useEffect(() => {
        speak("Welcome. Please show your complete body to start.");
    }, [speak]);

    const calculateAngle = (a, b, c) => {
        const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
        let angle = Math.abs(radians * 180.0 / Math.PI);
        if (angle > 180.0) angle = 360 - angle;
        return angle;
    };

    const provideAudioFeedback = (msg, isRep = false) => {
        if (isMuted) return;

        const now = Date.now();
        // Don't spam incorrect form feedback - wait 3 seconds
        if (!isRep && now - lastFeedbackTimeRef.current < 3000) return;

        speak(msg);
        lastFeedbackTimeRef.current = now;
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
            const avgAnkleY = (leftAnkle.y + rightAnkle.y) / 2;

            if (stateRef.current.prevAnkleY === null) {
                stateRef.current.prevAnkleY = avgAnkleY;
            }

            const ankleMovement = Math.abs(avgAnkleY - stateRef.current.prevAnkleY);
            const anklesStable = ankleMovement < 0.05;

            stateRef.current.prevAnkleY = avgAnkleY;

            // VALIDATION CHECKS
            const avgHipY = (leftHip.y + rightHip.y) / 2;
            const avgKneeY = (leftKnee.y + rightKnee.y) / 2;
            const hipDropped = avgHipY >= avgKneeY - 0.05;

            const leftKneeSafe = (leftKnee.x - leftAnkle.x) < 0.15;
            const rightKneeSafe = (rightKnee.x - rightAnkle.x) < 0.15;
            const kneesSafe = leftKneeSafe && rightKneeSafe;

            const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
            const torsoUpright = avgShoulderY < avgHipY;

            const feetOnGround = avgAnkleY > 0.7; // Ankles should be in bottom 30% of frame

            // Squat Logic
            const currentState = stateRef.current;

            // Standing position
            if (avgAngle > 160 && currentState.stage === 'down') {
                if (anklesStable && feetOnGround) {
                    currentState.stage = 'up';
                    currentState.reps += 1;
                    setReps(currentState.reps);
                    setFeedback('Great rep!');
                    setIsGoodForm(true);

                    // Audio: Count the rep
                    speak(`${currentState.reps} done`);
                } else {
                    currentState.stage = 'up';
                    setFeedback('Keep feet planted!');
                    setIsGoodForm(false);
                    // Audio correction removed to prevent overlap
                }
            } else if (avgAngle > 160) {
                currentState.stage = 'up';
                setFeedback('Squat down!');
                setIsGoodForm(true);
            }

            // Squatting down
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
                    if (!hipDropped) {
                        setFeedback('Drop hips lower!');
                        setIsGoodForm(false);
                    } else if (!kneesSafe) {
                        setFeedback('Knees back!');
                        setIsGoodForm(false);
                    } else if (!torsoUpright) {
                        setFeedback('Chest up!');
                        setIsGoodForm(false);
                    }
                }
            }

            // Too deep warning
            if (avgAngle < 70) {
                setFeedback('Too deep!');
                setIsGoodForm(false);
            }

        } else {
            setFeedback('Show complete body');
            setIsGoodForm(false);
            // Initial prompt only handled by useEffect, no real-time spam
        }
    }, [isMuted, speak]);

    const reset = () => {
        stateRef.current.reps = 0;
        stateRef.current.stage = 'up';
        stateRef.current.prevAnkleY = null;
        setReps(0);
        setFeedback('Get ready');
        speak("Resetting. Get ready.");
    };

    return (
        // Changed container to min-h-screen and removed fixed height to allow scrolling
        <div className="min-h-screen flex flex-col pb-12 md:h-[calc(100vh-8rem)]">
            <div className="flex items-center justify-between mb-4 px-1">
                <Link to="/exercises" className="flex items-center gap-2 text-gray-400 hover:text-white transition">
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back</span>
                </Link>
                <div className="flex gap-2">
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
                {/* Camera Section - Increased Height, Rounded corners, Shadow */}
                <div className="lg:col-span-2 relative bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-800 min-h-[75vh] lg:min-h-0 ring-1 ring-white/10">
                    <PoseCamera onResults={onResults} />

                    {/* Overlay Stats */}
                    <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                        <div className="bg-black/60 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 shadow-lg">
                            <div className="text-xs text-gray-300 uppercase font-bold tracking-wider mb-1">Status</div>
                            <div className={`text-xl font-bold flex items-center gap-2 ${isGoodForm ? 'text-ok' : 'text-warn'}`}>
                                {isGoodForm ? <span className="w-2 h-2 bg-ok rounded-full animate-pulse" /> : <span className="w-2 h-2 bg-warn rounded-full" />}
                                {feedback}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Section - Now scrollable on mobile */}
                <div className="space-y-6">
                    <div className="bg-panel border border-gray-800 p-6 rounded-3xl text-center shadow-lg relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>
                        <div className="text-sm text-gray-400 uppercase font-bold tracking-wider mb-2 relative z-10">Total Reps</div>
                        <div className="text-7xl md:text-9xl font-black text-white mb-2 font-mono relative z-10 tracking-tighter">{reps}</div>
                        <div className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-accent text-sm font-bold relative z-10 border border-accent/20">
                            Target: 15
                        </div>
                    </div>

                    <div className="bg-panel border border-gray-800 p-6 rounded-3xl shadow-lg">
                        <div className="flex justify-between items-end mb-4">
                            <span className="font-bold text-lg">Squat Depth</span>
                            <span className="font-mono text-accent text-xl font-bold">{Math.round(depth)}%</span>
                        </div>
                        <div className="h-4 bg-gray-900 rounded-full overflow-hidden p-0.5 border border-gray-700/50">
                            <div
                                className={`h-full rounded-full transition-all duration-300 ${depth > 80 ? 'bg-gradient-to-r from-ok to-green-400' : depth > 50 ? 'bg-gradient-to-r from-accent to-blue-400' : 'bg-gradient-to-r from-warn to-orange-400'}`}
                                style={{ width: `${depth}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between mt-3 text-xs font-semibold text-gray-500 uppercase tracking-widest">
                            <span>Standing</span>
                            <span>Parallel</span>
                            <span>Deep</span>
                        </div>
                    </div>

                    <div className="bg-panel border border-gray-800 p-6 rounded-3xl shadow-lg">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            Form Tips
                        </h3>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li className="flex gap-3 items-start">
                                <div className="min-w-[6px] h-[6px] rounded-full bg-accent mt-2"></div>
                                <span className="leading-relaxed">Keep your back straight and chest up aimed at the wall</span>
                            </li>
                            <li className="flex gap-3 items-start">
                                <div className="min-w-[6px] h-[6px] rounded-full bg-accent mt-2"></div>
                                <span className="leading-relaxed">Feet shoulder-width apart, planted firmly like tree roots</span>
                            </li>
                            <li className="flex gap-3 items-start">
                                <div className="min-w-[6px] h-[6px] rounded-full bg-accent mt-2"></div>
                                <span className="leading-relaxed"><strong>Keep feet on ground</strong> - lifting heels focuses inaccurate muscles</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Squat;
