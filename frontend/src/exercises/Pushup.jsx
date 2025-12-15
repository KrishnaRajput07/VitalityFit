import React, { useRef, useState } from 'react';
import PoseCamera from '../components/PoseCamera';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import useSpeech from '../hooks/useSpeech';

const Pushup = () => {
    const [reps, setReps] = useState(0);
    const [feedback, setFeedback] = useState('Get into plank position');
    const [isMuted, setIsMuted] = useState(false);

    // AI Voice Integration
    const { speak } = useSpeech();

    // Initial Greeting
    React.useEffect(() => {
        speak("Welcome. Please show your complete body to start.");
    }, [speak]);

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
                    countRef.current += 1;
                    setReps(countRef.current);
                    setFeedback('Good push!');
                    if (!isMuted) speak(`${countRef.current} done`);
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

    const reset = () => {
        countRef.current = 0;
        setReps(0);
        stateRef.current = 'up';
        setFeedback('Get into plank position');
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
                {/* Camera Section */}
                <div className="lg:col-span-2 relative bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-800 min-h-[75vh] lg:min-h-0 ring-1 ring-white/10">
                    <PoseCamera onResults={onResults} />

                    {/* Overlay Stats */}
                    <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                        <div className="bg-black/60 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 shadow-lg">
                            <div className="text-xs text-gray-300 uppercase font-bold tracking-wider mb-1">Status</div>
                            <div className={`text-xl font-bold flex items-center gap-2 ${feedback.includes('Good') ? 'text-ok' : feedback.includes('Keep') || feedback.includes('Don') ? 'text-bad' : 'text-gray-200'}`}>
                                {feedback}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="space-y-6">
                    <div className="bg-panel border border-gray-800 p-6 rounded-3xl text-center shadow-lg relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>
                        <div className="text-sm text-gray-400 uppercase font-bold tracking-wider mb-2 relative z-10">Total Reps</div>
                        <div className="text-7xl md:text-9xl font-black text-white mb-2 font-mono relative z-10 tracking-tighter">{reps}</div>
                    </div>

                    <div className="bg-panel border border-gray-800 p-6 rounded-3xl shadow-lg">
                        <h3 className="font-bold mb-4 flex items-center gap-2">Form Tips</h3>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li className="flex gap-3 items-start"><div className="min-w-[6px] h-[6px] rounded-full bg-accent mt-2"></div>Keep body in straight line</li>
                            <li className="flex gap-3 items-start"><div className="min-w-[6px] h-[6px] rounded-full bg-accent mt-2"></div>Don't let hips sag</li>
                            <li className="flex gap-3 items-start"><div className="min-w-[6px] h-[6px] rounded-full bg-accent mt-2"></div>Lower chest to floor</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Pushup;
