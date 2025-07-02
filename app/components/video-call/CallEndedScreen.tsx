import React, { useEffect, useRef, useState } from 'react';
import { PhoneOff, X } from 'lucide-react';
import { Participant } from './types';

interface CallEndedScreenProps {
    duration: number;
    participant: Participant;
    onCloseTab: () => void;
    onStartNewCall: () => void;
}

export const CallEndedScreen: React.FC<CallEndedScreenProps> = ({
    duration,
    participant,
    onCloseTab,
    onStartNewCall
}) => {
    const [attentionEffect, setAttentionEffect] = useState(false);
    const notificationAudioRef = useRef<HTMLAudioElement | null>(null);

    // Handle the close tab button click with sound effect
    const handleCloseTab = () => {
        try {
            const clickSound = new Audio('/sounds/key-press.mp3');
            clickSound.volume = 0.5;
            clickSound.play()
                .then(() => {
                    // Small delay to let the sound play
                    setTimeout(() => {
                        onCloseTab();
                    }, 150);
                })
                .catch(err => {
                    console.error('Error playing click sound:', err);
                    onCloseTab();
                });
        } catch (err) {
            console.error('Error with click sound:', err);
            onCloseTab();
        }
        console.log('Close tab button clicked', duration);

        // Add haptic feedback if available
        if (navigator.vibrate) {
            navigator.vibrate(20);
        }
    };

    // Prevent browser bounce/scroll effects
    useEffect(() => {
        // Prevent scrolling
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';

        // --vh is handled globally to prevent hydration errors

        // Play notification sound after a delay to draw attention to the close button
        const notificationTimeout = setTimeout(() => {
            try {
                notificationAudioRef.current = new Audio('/sounds/success-chime.mp3');
                notificationAudioRef.current.volume = 0.4;
                notificationAudioRef.current.play().catch(err => console.error('Error playing sound:', err));
                setAttentionEffect(true);
            } catch (err) {
                console.error('Error with notification sound:', err);
            }
        }, 2000);

        return () => {
            document.body.style.overflow = originalStyle;
            clearTimeout(notificationTimeout);
            if (notificationAudioRef.current) {
                notificationAudioRef.current.pause();
                notificationAudioRef.current = null;
            }
        };
    }, []);

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-black p-4 w-full"
            style={{
                height: 'calc(var(--vh, 1vh) * 100)',
                paddingTop: 'max(1rem, env(safe-area-inset-top))',
                paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
                paddingLeft: 'max(1rem, env(safe-area-inset-left))',
                paddingRight: 'max(1rem, env(safe-area-inset-right))'
            }}
        >
            <div className="w-full max-w-md text-center text-white p-6 sm:p-8 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl">
                <div className="mb-6 sm:mb-10 relative">
                    {/* Red glow effect */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-red-500/10 filter blur-3xl"></div>

                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-red-500/20 to-red-600/30 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 border-2 border-red-500/30 shadow-lg shadow-red-500/20">
                        <PhoneOff size={36} className="text-red-400" />
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                        Call Ended
                    </h2>

                    <p className="text-gray-300 mb-3 text-base sm:text-lg">
                        Your call with <span className="font-semibold">{participant.name}</span> has ended
                    </p>

                    {attentionEffect && (
                        <div className="text-green-300 text-sm mt-2 mb-2 animate-pulse font-medium">
                            Please close the tab to continue
                        </div>
                    )}
                </div>

                <div className="space-y-5 sm:space-y-6">
                    <div className="relative">
                        {/* Animated arrow pointing to the Close Tab button */}
                        <div className="absolute -top-4 right-4 animate-bounce">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 4L12 14" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
                                <path d="M8 10L12 14L16 10" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>

                        <div className="relative">
                            {/* Spotlight effect */}
                            {attentionEffect && (
                                <div
                                    className="absolute w-full h-full rounded-xl bg-green-400/20 top-1/2 left-1/2 -z-10"
                                    style={{
                                        animation: 'spotlight 2s ease-in-out infinite alternate',
                                        transformOrigin: 'center'
                                    }}
                                ></div>
                            )}
                            <button
                                onClick={handleCloseTab}
                                className={`w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-6 py-4 sm:py-5 rounded-xl transition-all font-semibold text-lg flex items-center justify-center space-x-3 transform hover:scale-[1.03] border-2 border-green-500/30 shadow-lg shadow-green-500/30 ${attentionEffect ? 'breathe-animation' : 'animate-pulse'}`}
                                style={{ animationDuration: '2s' }}
                                aria-label="Close tab"
                            >
                                <X size={22} />
                                <span>Close Tab</span>
                            </button>
                        </div>

                        <div className="mt-1 text-green-400 text-xs">Tap here to continue</div>
                    </div>

                    <button
                        onClick={onStartNewCall}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 sm:py-4 rounded-xl transition-all font-medium flex items-center justify-center space-x-3 transform hover:scale-[1.02] shadow-md shadow-blue-500/10"
                        aria-label="Start new call"
                    >
                        <PhoneOff size={20} className="rotate-180" />
                        <span>Start New Call</span>
                    </button>
                </div>
            </div>
        </div>
    );
};