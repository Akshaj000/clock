import React from 'react';

interface DurationDisplayProps {
    seconds: number;
}

export const DurationDisplay: React.FC<DurationDisplayProps> = ({ seconds }) => {
    const formatDuration = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center space-x-1">
            <div className="px-2.5 py-1 bg-black/30 backdrop-blur-md rounded-md border border-white/10 shadow-inner">
                <span className="font-mono text-lg font-bold tracking-wider text-white">
                    {formatDuration(seconds)}
                </span>
            </div>
        </div>
    );
};