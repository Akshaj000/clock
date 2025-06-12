import React from 'react';
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
}) => {
    return (
        <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
            <div className="text-center text-white max-w-md">
                <div className="mb-8">
                    <div className="relative">
                        <div className="w-32 h-32 bg-blue-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                            <Image
                                src={caller.image}
                                alt={`${caller.name}'s profile`}
                                width={96}
                                height={96}
                                className="rounded-full object-cover"
                            />
                        </div>
                        <div className="absolute inset-0 -m-4 rounded-full border-4 border-blue-500 animate-ping opacity-75"></div>
                        <div className="absolute inset-0 -m-8 rounded-full border-4 border-blue-400 animate-ping opacity-50" style={{ animationDelay: '0.5s' }}></div>
                        <div className="absolute inset-0 -m-12 rounded-full border-4 border-blue-300 animate-ping opacity-25" style={{ animationDelay: '1s' }}></div>
                    </div>

                    <h2 className="text-4xl font-bold mb-3 animate-pulse">Incoming Call</h2>
                    <div className="flex items-center justify-center space-x-2 mb-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <p className="text-gray-300 text-xl">{caller.name} is calling...</p>
                    </div>
                    <p className="text-gray-400 text-sm">Tap to answer</p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={onAnswer}
                        className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg transition-all font-semibold flex items-center justify-center space-x-2 transform hover:scale-105"
                        aria-label="Answer call"
                    >
                        <PhoneOff size={24} className="rotate-180" />
                        <span>Answer Call</span>
                    </button>
                    <button
                        onClick={onDecline}
                        className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-lg transition-all font-semibold flex items-center justify-center space-x-2 transform hover:scale-105"
                        aria-label="Decline call"
                    >
                        <PhoneOff size={24} />
                        <span>Decline Call</span>
                    </button>
                </div>
            </div>
        </div>
    );
}; 