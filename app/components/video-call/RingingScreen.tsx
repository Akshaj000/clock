import React, { useEffect } from 'react';
import { PhoneOff } from 'lucide-react';
import { Participant } from './types';
import Image from 'next/image';

interface RingingScreenProps {
    onAnswer: () => void;
    onDecline: () => void;
    caller?: Participant;
}

export const RingingScreen: React.FC<RingingScreenProps> = ({
    onAnswer,
    onDecline,
    caller = {
        id: 1,
        name: 'John',
        avatar: 'SW',
        isMicOn: true,
        isVideoOn: true,
        image: '/john.png'
    }
}) => {    // Prevent browser bounce/scroll effects
    useEffect(() => {
        // Prevent scrolling
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';

        // --vh is handled globally to prevent hydration errors

        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black flex items-center justify-center z-50 w-full"
            style={{
                height: 'calc(var(--vh, 1vh) * 100)',
                paddingTop: 'env(safe-area-inset-top)',
                paddingBottom: 'env(safe-area-inset-bottom)',
                paddingLeft: 'env(safe-area-inset-left)',
                paddingRight: 'env(safe-area-inset-right)'
            }}>
            <div className="w-full max-w-md mx-4 text-center text-white p-6 sm:p-8 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl">
                <div className="mb-6 sm:mb-10">
                    <div className="relative">
                        <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full mx-auto mb-6 relative overflow-hidden border-4 border-blue-500/30 shadow-2xl shadow-blue-500/20">
                            <Image
                                src={caller.image}
                                alt={`${caller.name}'s profile`}
                                width={144}
                                height={144}
                                className="object-cover"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent"></div>
                        </div>

                        {/* Animated rings */}
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute inset-0 rounded-full border-4 border-blue-400/40 animate-ping"
                                style={{
                                    animationDuration: `${1.5 + i * 0.5}s`,
                                    animationDelay: `${i * 0.3}s`,
                                    scale: `${1 + (i + 1) * 0.2}`
                                }}
                            ></div>
                        ))}
                    </div>

                    <h2 className="text-3xl sm:text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200 animate-pulse" style={{ animationDuration: '2s' }}>
                        Incoming Call
                    </h2>

                    <div className="flex items-center justify-center space-x-2 mb-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <p className="text-gray-300 text-lg sm:text-xl font-medium">
                            {caller.name} <span className="text-gray-400 text-base sm:text-lg">is calling...</span>
                        </p>
                    </div>
                    <p className="text-gray-400 text-sm mt-4 opacity-75">Tap to answer</p>
                </div>

                <div className="space-y-3 sm:space-y-4">
                    <button
                        onClick={onAnswer}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 sm:py-4 rounded-xl transition-all font-semibold flex items-center justify-center space-x-3 transform hover:scale-[1.02] shadow-lg shadow-green-600/20"
                        aria-label="Answer call"
                    >
                        <PhoneOff size={22} className="rotate-180" />
                        <span>Answer Call</span>
                    </button>
                    <button
                        onClick={onDecline}
                        className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 sm:py-4 rounded-xl transition-all font-semibold flex items-center justify-center space-x-3 transform hover:scale-[1.02] shadow-lg shadow-red-600/20"
                        aria-label="Decline call"
                    >
                        <PhoneOff size={22} />
                        <span>Decline Call</span>
                    </button>
                </div>
            </div>
        </div>
    );
};