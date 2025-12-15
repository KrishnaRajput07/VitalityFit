import React, { useRef, useState } from 'react';
import PoseCamera from '../components/PoseCamera';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import useSpeech from '../hooks/useSpeech';

const CatCow = () => {
    const [feedback, setFeedback] = useState('Come to tabletop position');
    const [state, setState] = useState('Neutral');
    const [reps, setReps] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const { speak } = useSpeech();

    React.useEffect(() => {
        speak("Welcome. Tabletop position.");
    }, [speak]);
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
                    if (!isMuted) speak("Cat");
                }
                currentState.current = 'cat';
                setState('Cat 🐱');
                setFeedback('Round your spine, tuck chin');
            } else if (spineAngle > 185) {
                // Cow pose (arched spine)
                if (currentState.current === 'cat') {
                    currentState.reps += 1;
                    setReps(currentState.reps);
                    if (!isMuted) speak("Cow");
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

    const reset = () => {
        setReps(0);
        setState('Neutral');
        setFeedback('Come to tabletop position');
        stateRef.current = { current: 'neutral', reps: 0 };
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
                    {/* Reset Button added implied */}
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
                <div className="lg:col-span-2 relative bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-800 min-h-[75vh] lg:min-h-0 ring-1 ring-white/10">
                    <PoseCamera onResults={onResults} />
                    <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                        <div className="bg-black/60 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 shadow-lg">
                            <div className="text-xs text-gray-300 uppercase font-bold tracking-wider mb-1">Current Pose</div>
                            <div className={`text-xl font-bold flex items-center gap-2 ${state.includes('Cat') || state.includes('Cow') ? 'text-ok' : 'text-gray-200'}`}>
                                {feedback}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-panel border border-gray-800 p-6 rounded-3xl text-center shadow-lg relative overflow-hidden group">
                        <div className="text-sm text-gray-400 uppercase font-bold tracking-wider mb-2 relative z-10">Cycles</div>
                        <div className="text-7xl md:text-9xl font-black text-white mb-2 font-mono relative z-10 tracking-tighter">{reps}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CatCow;
