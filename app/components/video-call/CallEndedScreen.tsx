import React from 'react';
import { PhoneOff, Video } from 'lucide-react';
import { Participant } from './types';
import { DurationDisplay } from './DurationDisplay';

interface CallEndedScreenProps {
    duration: number;
    participant: Participant;
    onViewRecording: () => void;
    onStartNewCall: () => void;
}

export const CallEndedScreen: React.FC<CallEndedScreenProps> = ({
    duration,
    participant,
    onViewRecording,
    onStartNewCall
}) => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-800 via-gray-900 to-black">
        <div className="text-center text-white max-w-md">
            <div className="mb-8">
                <div className="w-20 h-20 bg-red-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <PhoneOff size={40} className="text-red-400" />
                </div>
                <h2 className="text-3xl font-bold mb-3">Call Ended</h2>
                <p className="text-gray-300 mb-2">Your call with {participant.name} has ended</p>
                <p className="text-sm text-gray-400">Duration: <DurationDisplay seconds={duration} /></p>
            </div>

            <div className="space-y-4">
                <button
                    onClick={onViewRecording}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg transition-all font-semibold flex items-center justify-center space-x-2"
                    aria-label="View call recording"
                >
                    <Video size={20} />
                    <span>View Call Recording</span>
                </button>
                <button
                    onClick={onStartNewCall}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white px-6 py-4 rounded-lg transition-all font-semibold flex items-center justify-center space-x-2"
                    aria-label="Start new call"
                >
                    <PhoneOff size={20} />
                    <span>Start New Call</span>
                </button>
            </div>
        </div>
    </div>
); 