import { drawConnectors, drawLandmarks as drawMediapipeLandmarks } from '@mediapipe/drawing_utils';
import { POSE_CONNECTIONS } from '@mediapipe/pose';

export const calculateAngle = (a, b, c) => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180.0) angle = 360 - angle;
    return angle;
};

export const drawLandmarks = (ctx, landmarks) => {
    drawConnectors(ctx, landmarks, POSE_CONNECTIONS, { color: '#bef264', lineWidth: 4 });
    drawMediapipeLandmarks(ctx, landmarks, { color: '#15803d', lineWidth: 2, radius: 4 });
};
