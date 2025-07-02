import React from 'react';
import { ControlButtonProps } from './types';

export const ControlButton: React.FC<ControlButtonProps> = ({
    icon,
    onClick,
    active,
    danger = false,
    title,
    className = ''
}) => (
    <button
        onClick={onClick}
        title={title}
        aria-label={title}
        className={`p-3 sm:p-4 rounded-full backdrop-blur-lg border focus:outline-none focus:ring-2 transition-all duration-200 flex items-center justify-center
            ${danger
                ? 'bg-red-500/90 hover:bg-red-600 text-white border-red-400/20 hover:border-red-400/40 shadow-lg shadow-red-500/20 hover:shadow-red-500/30 focus:ring-red-400'
                : active
                    ? 'bg-blue-600/90 hover:bg-blue-700 text-white border-blue-400/20 hover:border-blue-400/40 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 focus:ring-blue-400'
                    : 'bg-gray-800/80 hover:bg-gray-700/80 text-gray-200 border-gray-700/30 hover:border-gray-600/50 shadow-lg shadow-black/10 hover:shadow-black/20 focus:ring-gray-500'}
            ${className}`}
    >
        {icon}
    </button>
);