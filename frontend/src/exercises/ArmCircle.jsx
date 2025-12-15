import React, { useState, useCallback, useRef } from 'react';
import PoseCamera from '../components/PoseCamera';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const ArmCircle = () => {
    const [reps, setReps] = useState(0);
    const [feedback, setFeedback] = useState('Raise arms to sides');

    // Track which quadrants have been visited for each arm
    const quadrantStateRef = useRef({
        left: { visited: new Set(), lastQuadrant: null, reps: 0 },
        right: { visited: new Set(), lastQuadrant: null, reps: 0 }
    });

    const getQuadrant = (wrist, shoulder) => {
        // Determine quadrant based on wrist position relative to shoulder
        // Quadrants: 1=Top, 2=Right, 3=Bottom, 4=Left (clockwise from top)
        const dx = wrist.x - shoulder.x;
        const dy = wrist.y - shoulder.y;

        if (Math.abs(dy) > Math.abs(dx)) {
            return dy < 0 ? 1 : 3; // Top or Bottom
        } else {
            return dx > 0 ? 2 : 4; // Right or Left
        }
    };

    const onResults = useCallback((results) => {
        if (!results.poseLandmarks) return;

        const lm = results.poseLandmarks;

        const leftShoulder = lm[11];
        const leftWrist = lm[15];
        const rightShoulder = lm[12];
        const rightWrist = lm[16];

        if (leftShoulder.visibility > 0.5 && leftWrist.visibility > 0.5 &&
            rightShoulder.visibility > 0.5 && rightWrist.visibility > 0.5) {

            const state = quadrantStateRef.current;

            // Check left arm
            const leftQuadrant = getQuadrant(leftWrist, leftShoulder);
            if (leftQuadrant !== state.left.lastQuadrant) {
                state.left.visited.add(leftQuadrant);
                state.left.lastQuadrant = leftQuadrant;

                // If all 4 quadrants visited, count a rep and reset
                if (state.left.visited.size === 4) {
                    state.left.reps += 1;
                    state.left.visited.clear();
                    setFeedback('Great circle! Keep going.');
                }
            }

            // Check right arm
            const rightQuadrant = getQuadrant(rightWrist, rightShoulder);
            if (rightQuadrant !== state.right.lastQuadrant) {
                state.right.visited.add(rightQuadrant);
                state.right.lastQuadrant = rightQuadrant;

                // If all 4 quadrants visited, count a rep and reset
                if (state.right.visited.size === 4) {
                    state.right.reps += 1;
                    state.right.visited.clear();
                    setFeedback('Great circle! Keep going.');
                }
            }

            // Update total reps (sum of both arms)
            const totalReps = state.left.reps + state.right.reps;
            setReps(totalReps);

            // Provide guidance
            const leftProgress = state.left.visited.size;
            const rightProgress = state.right.visited.size;

            if (leftProgress === 0 && rightProgress === 0) {
                setFeedback('Raise arms and start circling');
            } else if (leftProgress > 0 || rightProgress > 0) {
                setFeedback(`Keep circling... (${Math.max(leftProgress, rightProgress)}/4)`);
            }
        } else {
            setFeedback('Make sure both arms are visible');
        }
    }, []);

    const reset = () => {
        quadrantStateRef.current = {
            left: { visited: new Set(), lastQuadrant: null, reps: 0 },
            right: { visited: new Set(), lastQuadrant: null, reps: 0 }
        };
        setReps(0);
        setFeedback('Raise arms to sides');
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <Link to="/exercises" className="flex items-center gap-2 text-gray-400 hover:text-white transition">
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Library</span>
                </Link>
                <button onClick={reset} className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
                    <RefreshCw className="w-4 h-4" />
                    <span>Reset</span>
                </button>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
                <div className="lg:col-span-2 relative bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
                    <PoseCamera onResults={onResults} />
                    <div className="absolute top-4 left-4 bg-black/50 backdrop-blur px-4 py-2 rounded-xl border border-white/10">
                        <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Status</div>
                        <div className="text-lg font-bold text-white">{feedback}</div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-panel border border-gray-800 p-6 rounded-2xl text-center">
                        <div className="text-sm text-gray-400 uppercase font-bold tracking-wider mb-2">Total Circles</div>
                        <div className="text-8xl font-black text-white mb-2 font-mono">{reps}</div>
                        <div className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold">
                            Target: 20
                        </div>
                    </div>

                    <div className="bg-panel border border-gray-800 p-6 rounded-2xl">
                        <h3 className="font-bold text-xl mb-4">Form Tips</h3>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li className="flex gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5"></div>
                                Keep arms straight and extended
                            </li>
                            <li className="flex gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5"></div>
                                Make large, smooth circles
                            </li>
                            <li className="flex gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5"></div>
                                Control the movement, don't rush
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArmCircle;
