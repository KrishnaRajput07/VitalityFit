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

    useEffect(() => {
        const videoElement = videoRef.current;
        const canvasElement = canvasRef.current;
        const canvasCtx = canvasElement.getContext('2d');

        const pose = new Pose({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
            },
        });

        // PERFORMANCE OPTIMIZATIONS
        pose.setOptions({
            modelComplexity: 0, // Changed from 1 to 0 (lighter model)
            smoothLandmarks: true,
            enableSegmentation: false,
            smoothSegmentation: false,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });

        pose.onResults((results) => {
            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

            // Draw the video frame
            canvasCtx.drawImage(
                results.image, 0, 0, canvasElement.width, canvasElement.height
            );

            if (results.poseLandmarks) {
                drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
                    color: '#00FF00',
                    lineWidth: 3, // Reduced from 4
                });
                drawLandmarks(canvasCtx, results.poseLandmarks, {
                    color: '#FF0000',
                    lineWidth: 1.5, // Reduced from 2
                });
            }
            canvasCtx.restore();

            if (onResults) {
                onResults(results);
            }
        });

        const camera = new Camera(videoElement, {
            onFrame: async () => {
                // FRAME RATE LIMITING - Process every 2nd frame (30fps -> 15fps)
                frameSkipCount.current++;
                if (frameSkipCount.current % 2 !== 0) {
                    return; // Skip this frame
                }

                const now = performance.now();
                const timeSinceLastFrame = now - lastFrameTimeRef.current;

                // Minimum 66ms between frames (max 15 FPS)
                if (timeSinceLastFrame < 66) {
                    return;
                }

                lastFrameTimeRef.current = now;
                await pose.send({ image: videoElement });
                if (onFrame) onFrame();
            },
            width: 640, // Reduced from 1280
            height: 480, // Reduced from 720
        });

        camera.start();

        return () => {
            camera.stop();
            pose.close();
        };
    }, [onResults, onFrame]);

    return (
        <div className="relative w-full h-full rounded-xl overflow-hidden bg-black">
            <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)', display: 'none' }} // Hide video, show canvas
                playsInline
            ></video>
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover"
                width={640}
                height={480}
            ></canvas>
        </div>
    );
};

export default PoseCamera;
