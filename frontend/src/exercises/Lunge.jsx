import React, { useRef, useState } from 'react';
import PoseCamera from '../components/PoseCamera';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import useSpeech from '../hooks/useSpeech';

const Lunge = () => {
    const [reps, setReps] = useState(0);
    const [feedback, setFeedback] = useState('Stand tall to start');
    const [isMuted, setIsMuted] = useState(false);
    const { speak } = useSpeech();

    React.useEffect(() => {
        speak("Welcome. Show full body.");
    }, [speak]);
    const stateRef = useRef({ current: 'up', reps: 0, prevAnkleY: null });
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

        // Get both legs
        const leftHip = lm[23];
        const leftKnee = lm[25];
        const leftAnkle = lm[27];

        const rightHip = lm[24];
        const rightKnee = lm[26];
        const rightAnkle = lm[28];

        const leftShoulder = lm[11];
        const rightShoulder = lm[12];

        if (leftHip.visibility > 0.5 && leftKnee.visibility > 0.5 && leftAnkle.visibility > 0.5 &&
            rightHip.visibility > 0.5 && rightKnee.visibility > 0.5 && rightAnkle.visibility > 0.5) {

            // VALIDATION CHECKS
            // 1. Detect which leg is forward (based on knee angle)
            const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
            const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);

            // Use the leg with smaller angle (more bent) as the working leg
            const workingAngle = Math.min(leftKneeAngle, rightKneeAngle);
            const frontLeg = leftKneeAngle < rightKneeAngle ? 'left' : 'right';

            // CRITICAL: Ankle Stability Check
            // In a proper lunge, back ankle may lift slightly, but front ankle stays planted
            const frontAnkle = frontLeg === 'left' ? leftAnkle : rightAnkle;
            const backAnkle = frontLeg === 'left' ? rightAnkle : leftAnkle;

            if (stateRef.current.prevAnkleY === null) {
                stateRef.current.prevAnkleY = frontAnkle.y;
            }

            const frontAnkleMovement = Math.abs(frontAnkle.y - stateRef.current.prevAnkleY);
            const frontAnkleStable = frontAnkleMovement < 0.08; // Front ankle must stay stable

            // Update ankle position
            stateRef.current.prevAnkleY = frontAnkle.y;

            // 2. Feet on ground check - at least one foot should be firmly planted
            const frontFootOnGround = frontAnkle.y > 0.65; // Front foot in bottom 35% of frame
            const feetProperlyPlaced = frontFootOnGround;

            // 3. Torso Upright Check - shoulders should be above hips
            const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
            const avgHipY = (leftHip.y + rightHip.y) / 2;
            const torsoUpright = avgShoulderY < avgHipY + 0.05;

            // 4. Front knee shouldn't go past toes
            const frontKnee = frontLeg === 'left' ? leftKnee : rightKnee;
            const kneeSafe = (frontKnee.x - frontAnkle.x) < 0.15;

            // Lunge Logic
            const isStanding = workingAngle > 160;
            const isLunging = workingAngle < 100;

            const currentState = stateRef.current;

            // Provide feedback
            if (!frontAnkleStable) {
                setFeedback('Keep front foot planted!');
            } else if (!feetProperlyPlaced) {
                setFeedback('Keep feet on ground!');
            } else if (!torsoUpright) {
                setFeedback('Keep torso upright!');
            } else if (!kneeSafe) {
                setFeedback('Knee too far forward!');
            } else if (isStanding) {
                if (currentState.current === 'down' && frontAnkleStable && feetProperlyPlaced && torsoUpright && kneeSafe) {
                    countRef.current += 1;
                    setReps(countRef.current);
                    setReps(countRef.current);
                    setFeedback('Great rep!');
                    if (!isMuted) speak(`${countRef.current} done`);
                }
                currentState.current = 'up';
            } else if (isLunging && frontAnkleStable && feetProperlyPlaced && torsoUpright && kneeSafe) {
                currentState.current = 'down';
                setFeedback('Hold... and up!');
            } else if (currentState.current === 'up' && workingAngle < 140) {
                setFeedback('Go lower...');
            }
        } else {
            setFeedback('Make sure full body is visible');
        }
    };

    const reset = () => {
        countRef.current = 0;
        setReps(0);
        stateRef.current = { current: 'up', reps: 0, prevAnkleY: null };
        setFeedback('Stand tall');
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
                <div className="lg:col-span-2 relative bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-800 min-h-[75vh] lg:min-h-0 ring-1 ring-white/10">
                    <PoseCamera onResults={onResults} />
                    <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                        <div className="bg-black/60 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 shadow-lg">
                            <div className="text-xs text-gray-300 uppercase font-bold tracking-wider mb-1">Status</div>
                            <div className={`text-xl font-bold flex items-center gap-2 ${feedback.includes('Great') ? 'text-ok' : feedback.includes('Keep') || feedback.includes('Knee') ? 'text-bad' : 'text-gray-200'}`}>
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
                            <li className="flex gap-3 items-start"><div className="min-w-[6px] h-[6px] rounded-full bg-accent mt-2"></div>Keep front foot planted</li>
                            <li className="flex gap-3 items-start"><div className="min-w-[6px] h-[6px] rounded-full bg-accent mt-2"></div>Torso upright</li>
                            <li className="flex gap-3 items-start"><div className="min-w-[6px] h-[6px] rounded-full bg-accent mt-2"></div>Knee behind toe</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Lunge;
