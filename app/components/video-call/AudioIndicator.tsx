import React from 'react';
import { Mic, MicOff } from 'lucide-react';

interface AudioIndicatorProps {
    isActive: boolean;
}

export const AudioIndicator: React.FC<AudioIndicatorProps> = ({ isActive }) => (
    <div className="flex items-center space-x-2 bg-black bg-opacity-60 px-3 py-2 rounded-full">
        {isActive ? (
            <>
                <Mic size={18} className="text-green-400" />
                <div className="flex space-x-1">
                    {[0, 0.1, 0.2].map((delay) => (
                        <div
                            key={delay}
                            className="w-1 h-4 bg-green-400 rounded animate-pulse"
                            style={{
                                animationDelay: `${delay}s`,
                                height: `${Math.random() * 3 + 3}px`
                            }}
                        />
                    ))}
                </div>
            </>
        ) : (
            <MicOff size={18} className="text-red-400" />
        )}
    </div>
); 