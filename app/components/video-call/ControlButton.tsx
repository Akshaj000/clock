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
        className={`p-3 rounded-full transition-all duration-200 flex items-center justify-center ${danger
                ? active
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-gray-600 hover:bg-gray-500 text-white'
                : active
                    ? 'bg-gray-600 hover:bg-gray-500 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            } ${className}`}
    >
        {icon}
    </button>
); 