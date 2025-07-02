import React, { useEffect } from 'react';
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
}) => {    // Prevent browser bounce/scroll effects
    useEffect(() => {
        // Prevent scrolling
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';
        console.log(duration);

        // --vh is handled globally to prevent hydration errors

        return () => {
            document.body.style.overflow = originalStyle;
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
                </div>

                <div className="space-y-3 sm:space-y-4">
                    <button
                        onClick={onCloseTab}
                        className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 sm:py-4 rounded-xl transition-all font-medium flex items-center justify-center space-x-3 transform hover:scale-[1.02] border border-white/5 shadow-md"
                        aria-label="Close tab"
                    >
                        <X size={20} />
                        <span>Close Tab</span>
                    </button>

                    <button
                        onClick={onStartNewCall}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 sm:py-4 rounded-xl transition-all font-medium flex items-center justify-center space-x-3 transform hover:scale-[1.02] shadow-lg shadow-blue-500/20"
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