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
        <span className="font-mono text-lg text-white">
            {formatDuration(seconds)}
        </span>
    );
}; 