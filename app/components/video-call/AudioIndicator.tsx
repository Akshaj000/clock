import React from 'react';
import { Mic, MicOff } from 'lucide-react';

interface AudioIndicatorProps {
    isActive: boolean;
}

export const AudioIndicator: React.FC<AudioIndicatorProps> = ({ isActive }) => (
    <div className="flex items-center space-x-2 bg-black/40 backdrop-blur-md px-3 py-2 rounded-full shadow-lg border border-white/10">
        {isActive ? (
            <>
                <Mic size={18} className="text-green-400 filter drop-shadow" />
                <div className="flex space-x-0.5">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="w-1 bg-gradient-to-t from-green-500 to-green-300 rounded-full animate-pulse"
                            style={{
                                animationDelay: `${i * 0.15}s`,
                                height: `${Math.max(3, Math.random() * 10 + 5)}px`
                            }}
                        />
                    ))}
                </div>
            </>
        ) : (
            <MicOff size={18} className="text-red-400 filter drop-shadow" />
        )}
    </div>
);