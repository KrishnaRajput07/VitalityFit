import React, { useEffect, useRef, useState } from 'react';
import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { POSE_CONNECTIONS } from '@mediapipe/pose';

const PoseCamera = ({ onResults, onFrame }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isCameraActive, setIsCameraActive] = useState(true);
    const lastFrameTimeRef = useRef(0);
    const frameSkipCount = useRef(0);
    const [cameraFeedback, setCameraFeedback] = useState('');

    useEffect(() => {
        const videoElement = videoRef.current;
        const canvasElement = canvasRef.current;
        const canvasCtx = canvasElement.getContext('2d');

        const pose = new Pose({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
            },
        });

        // PERFORMANCE & ACCURACY OPTIMIZATIONS
        pose.setOptions({
            modelComplexity: 1, // Balanced model
            smoothLandmarks: true,
            enableSegmentation: false,
            smoothSegmentation: false,
            minDetectionConfidence: 0.65, // Increased confidence
            minTrackingConfidence: 0.65,
        });

        pose.onResults((results) => {
            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

            // Draw the video frame
            // Maintain aspect ratio: explicit draw using actual video dimensions
            canvasCtx.drawImage(
                results.image, 0, 0, canvasElement.width, canvasElement.height
            );

            if (results.poseLandmarks) {
                // VISIBILITY CHECK
                // Check if key landmarks are visible: Hips, Knees, Ankles, Shoulders
                const keyIndices = [11, 12, 23, 24, 25, 26, 27, 28]; // Shoulders, Hips, Knees, Ankles
                let visibleCount = 0;

                keyIndices.forEach(idx => {
                    const lm = results.poseLandmarks[idx];
                    if (lm && lm.visibility > 0.65) {
                        visibleCount++;
                    }
                });

                // Require at least 50% of key body parts to be highly visible
                const isBodyVisible = visibleCount >= (keyIndices.length / 2);

                if (isBodyVisible) {
                    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
                        color: '#00FF00',
                        lineWidth: 3,
                    });
                    drawLandmarks(canvasCtx, results.poseLandmarks, {
                        color: '#FF0000',
                        lineWidth: 1.5,
                    });

                    if (onResults) {
                        onResults(results); // Only send results if body is visible
                    }
                } else {
                    // Body not fully visible - don't send results for counting
                    if (onResults) onResults({ ...results, poseLandmarks: null }); // Send null to stop counting

                    // Draw warning
                    canvasCtx.fillStyle = 'rgba(0,0,0,0.6)';
                    canvasCtx.fillRect(0, 0, canvasElement.width, 60);
                    canvasCtx.fillStyle = 'white';
                    canvasCtx.font = 'bold 24px sans-serif';
                    canvasCtx.fillText('Stand back! Full body likely not visible.', 20, 38);
                }
            }
            canvasCtx.restore();
        });

        const isMobile = window.innerWidth < 768;
        const resolution = {
            width: isMobile ? 480 : 640,
            height: isMobile ? 640 : 480
        };

        const camera = new Camera(videoElement, {
            onFrame: async () => {
                // FRAME RATE LIMITING
                frameSkipCount.current++;
                if (frameSkipCount.current % 2 !== 0) return;

                const now = performance.now();
                const timeSinceLastFrame = now - lastFrameTimeRef.current;

                if (timeSinceLastFrame < 66) return;

                lastFrameTimeRef.current = now;
                await pose.send({ image: videoElement });
                if (onFrame) onFrame();
            },
            width: resolution.width,
            height: resolution.height,
        });

        camera.start();

        return () => {
            camera.stop();
            pose.close();
        };
    }, [onResults, onFrame]);

    return (
        <div className="relative w-full h-full rounded-xl overflow-hidden bg-black flex items-center justify-center">
            {/* Ensure video/canvas maintains aspect ratio and fits within container without stretching */}
            <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full"
                style={{ display: 'none' }}
                playsInline
            ></video>
            <canvas
                ref={canvasRef}
                className="w-full h-full object-contain"
                width={window.innerWidth < 768 ? 480 : 640}
                height={window.innerWidth < 768 ? 640 : 480}
            ></canvas>
        </div>
    );
};

export default PoseCamera;
