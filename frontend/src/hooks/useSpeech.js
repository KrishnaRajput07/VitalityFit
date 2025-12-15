import { useState, useEffect, useCallback } from 'react';

const useSpeech = () => {
    const [voices, setVoices] = useState([]);
    const [speaking, setSpeaking] = useState(false);
    const [supported, setSupported] = useState(false);

    useEffect(() => {
        if ('speechSynthesis' in window) {
            setSupported(true);
            const loadVoices = () => {
                const available = window.speechSynthesis.getVoices();
                setVoices(available);
            };

            window.speechSynthesis.onvoiceschanged = loadVoices;
            loadVoices();
        }
    }, []);

    const speak = useCallback((text) => {
        if (!supported || !text) return;

        // Cancel current speech to avoid queue buildup for rapid feedback
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Try to find a female voice (Google US English Female, Microsoft Zira, etc.)
        const femaleVoice = voices.find(v =>
            v.name.includes('Google US English') ||
            v.name.includes('Samantha') ||
            v.name.includes('Zira') ||
            v.name.includes('Female')
        );

        if (femaleVoice) {
            utterance.voice = femaleVoice;
        }

        // Adjust parameters for a more natural "AI" tone/pace
        utterance.rate = 1.0;
        utterance.pitch = 1.1; // Slightly higher pitch for clarity
        utterance.volume = 1.0;

        utterance.onstart = () => setSpeaking(true);
        utterance.onend = () => setSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, [voices, supported]);

    const cancel = useCallback(() => {
        if (supported) {
            window.speechSynthesis.cancel();
            setSpeaking(false);
        }
    }, [supported]);

    return { speak, cancel, speaking, supported };
};

export default useSpeech;
