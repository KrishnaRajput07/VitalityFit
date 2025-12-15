import React, { useRef, useState } from 'react';
import PoseCamera from '../components/PoseCamera';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Lunge = () => {
    const [reps, setReps] = useState(0);
    const [feedback, setFeedback] = useState('Stand tall to start');
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
                    setFeedback('Great rep!');
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

    return (
        <div className="h-screen flex flex-col bg-background">
            <div className="p-4 flex items-center justify-between bg-white shadow-sm z-10">
                <Link to="/exercises" className="flex items-center gap-2 font-bold text-muted hover:text-text">
                    <ArrowLeft className="w-5 h-5" /> Back
                </Link>
                <h1 className="text-xl font-black text-secondary">Lunge AI</h1>
                <div className="px-4 py-1 bg-primary/20 text-secondary rounded-lg font-bold text-sm">
                    Reps: {reps}
                </div>
            </div>
            <div className="flex-1 relative">
                <PoseCamera onResults={onResults} />
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-8 py-4 rounded-2xl shadow-xl text-center">
                    <div className="text-3xl font-black text-secondary mb-1">{reps}</div>
                    <div className="text-sm font-bold text-muted uppercase tracking-wider mb-2">Repetitions</div>
                    <div className={`text-lg font-bold ${feedback.includes('Great') ? 'text-ok' : feedback.includes('Keep') || feedback.includes('Knee') ? 'text-bad' : 'text-text'}`}>
                        {feedback}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Lunge;
