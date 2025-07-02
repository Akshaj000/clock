import React, { useState, useEffect } from 'react';
import { WifiOff, X } from 'lucide-react';
import { Participant } from './types';

interface WifiPasswordScreenProps {
    participant: Participant;
    onRetry: () => void;
    correctPassword?: string;
}

export const WifiPasswordScreen: React.FC<WifiPasswordScreenProps> = ({
    participant,
    onRetry,
    correctPassword = '071490'
}) => {
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<boolean>(false);
    const [showErrorMessage, setShowErrorMessage] = useState<boolean>(false);

    // Prevent browser bounce/scroll effects
    useEffect(() => {
        // Prevent scrolling
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []);

    const handleNumberClick = (number: number) => {
        if (password.length < 6) {
            setPassword(prev => prev + number);
            setError(false);
            setShowErrorMessage(false);
        }
    };

    const handleBackspace = () => {
        setPassword(prev => prev.slice(0, -1));
        setError(false);
        setShowErrorMessage(false);
    };

    const handleSubmit = () => {
        if (password === correctPassword) {
            onRetry();
        } else {
            setError(true);
            setShowErrorMessage(true);
            setTimeout(() => {
                setShowErrorMessage(false);
            }, 2000);
        }
    };

    const renderNumberPad = () => {
        return (
            <div className="grid grid-cols-3 gap-3 w-full max-w-xs mx-auto mt-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button
                        key={num}
                        onClick={() => handleNumberClick(num)}
                        className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl text-2xl font-medium flex items-center justify-center transform hover:scale-105 transition-all duration-150 active:scale-95 border border-white/5 shadow-lg"
                    >
                        {num}
                    </button>
                ))}
                <button
                    onClick={handleBackspace}
                    className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl flex items-center justify-center transform hover:scale-105 transition-all duration-150 active:scale-95 border border-white/5 shadow-lg"
                >
                    <X size={24} />
                </button>
                <button
                    onClick={() => handleNumberClick(0)}
                    className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl text-2xl font-medium flex items-center justify-center transform hover:scale-105 transition-all duration-150 active:scale-95 border border-white/5 shadow-lg"
                >
                    0
                </button>
                <button
                    onClick={handleSubmit}
                    className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-lg font-medium flex items-center justify-center transform hover:scale-105 transition-all duration-150 active:scale-95 shadow-lg shadow-blue-500/20"
                >
                    OK
                </button>
            </div>
        );
    };

    const renderPasswordDisplay = () => {
        return (
            <div className="flex justify-center space-x-3 mt-6 mb-8">
                {Array(6).fill(0).map((_, index) => (
                    <div
                        key={index}
                        className={`w-9 h-9 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center border-2 transition-all duration-200 ${index < password.length
                            ? error
                                ? 'border-red-500 bg-red-500/20'
                                : 'border-blue-500 bg-blue-500/20'
                            : 'border-gray-600'
                            }`}
                    >
                        {index < password.length && (
                            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white"></div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

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
                <div className="mb-6 relative">
                    {/* Red glow effect */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-red-500/10 filter blur-3xl"></div>

                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-red-500/20 to-red-600/30 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-red-500/30 shadow-lg shadow-red-500/20">
                        <WifiOff size={36} className="text-red-400" />
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                        WiFi Disconnected
                    </h2>

                    <p className="text-gray-300 mb-3 text-base sm:text-lg">
                        Please enter the WiFi password to reconnect with <span className="font-semibold">{participant.name}</span>
                    </p>

                    {showErrorMessage && (
                        <div className="text-red-400 text-sm animate-pulse mt-2">
                            Incorrect password. Please try again.
                        </div>
                    )}

                    {renderPasswordDisplay()}
                    {renderNumberPad()}
                </div>
            </div>
        </div>
    );
};
