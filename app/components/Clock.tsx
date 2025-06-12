'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface ClockProps {
    onTimeReached?: () => void;
    initialTriggeredCall?: boolean;
}

interface Position {
    clientX: number;
    clientY: number;
}

export default function Clock({ onTimeReached, initialTriggeredCall = false }: ClockProps) {
    const [time, setTime] = useState(new Date());
    const [isDragging, setIsDragging] = useState(false);
    const [activeHand, setActiveHand] = useState<'hour' | 'minute' | null>(null);
    const [hasTriggeredCall, setHasTriggeredCall] = useState(initialTriggeredCall);
    const clockRef = useRef<HTMLDivElement>(null);

    const router = useRouter();

    useEffect(() => {
        const hours = time.getHours();
        const minutes = time.getMinutes();
        const hour12 = hours % 12 || 12;

        if (hour12 === 2 && minutes === 0 && !hasTriggeredCall) {
            if (onTimeReached) {
                onTimeReached();
                setHasTriggeredCall(true);
            }
        }

        if (hour12 === 8 && minutes === 0 && hasTriggeredCall) {
            if (onTimeReached) {
                onTimeReached();
            }
            router.push('/success');
        }
    }, [time, onTimeReached, hasTriggeredCall, router]);

    const getClockCenter = () => {
        if (!clockRef.current) return { centerX: 0, centerY: 0, radius: 0 };
        const rect = clockRef.current.getBoundingClientRect();
        return {
            centerX: rect.left + rect.width / 2,
            centerY: rect.top + rect.height / 2,
            radius: rect.width / 2
        };
    };

    const getHandFromPosition = (clientX: number, clientY: number) => {
        const { centerX, centerY, radius } = getClockCenter();
        const distance = Math.sqrt(
            Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2)
        );

        if (distance < radius * 0.45) return 'hour';
        if (distance < radius * 0.8) return 'minute';
        return null;
    };

    const handleStart = (position: Position) => {
        const hand = getHandFromPosition(position.clientX, position.clientY);
        if (!hand) return;
        setActiveHand(hand);
        setIsDragging(true);
        handleClockInteraction(position);
    };

    const handleMove = (position: Position) => {
        if (isDragging && activeHand) {
            handleClockInteraction(position);
        }
    };

    const handleEnd = () => {
        setIsDragging(false);
        setActiveHand(null);
    };

    const handleClockInteraction = (position: Position) => {
        if (!activeHand) return;

        const { centerX, centerY } = getClockCenter();
        const angle = Math.atan2(position.clientY - centerY, position.clientX - centerX);
        const degrees = (angle * 180) / Math.PI + 90;
        const normalizedDegrees = (degrees + 360) % 360;

        const newTime = new Date(time);

        if (activeHand === 'hour') {
            // Smooth hour movement (continuous)
            const hourValue = normalizedDegrees / 30; // 30 degrees per hour
            const currentHour = time.getHours();
            const isPM = currentHour >= 12;
            
            // Convert to 24-hour format while maintaining AM/PM
            let newHour = hourValue % 12;
            newHour = isPM ? (newHour === 0 ? 12 : newHour + 12) : (newHour === 0 ? 0 : newHour);
            newTime.setHours(newHour);
        } else if (activeHand === 'minute') {
            // Smooth minute movement (continuous)
            const minuteValue = normalizedDegrees / 6; // 6 degrees per minute
            newTime.setMinutes(minuteValue % 60);
        }

        setTime(newTime);
    };

    // Event handlers remain the same as before
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        handleStart({ clientX: e.clientX, clientY: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        handleMove({ clientX: e.clientX, clientY: e.clientY });
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        e.preventDefault();
        const touch = e.touches[0];
        handleStart({ clientX: touch.clientX, clientY: touch.clientY });
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        e.preventDefault();
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            handleMove({ clientX: touch.clientX, clientY: touch.clientY });
        }
    };

    useEffect(() => {
        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (isDragging) handleMove({ clientX: e.clientX, clientY: e.clientY });
        };

        const handleGlobalMouseUp = () => {
            if (isDragging) handleEnd();
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleGlobalMouseMove);
            document.addEventListener('mouseup', handleGlobalMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleGlobalMouseMove);
            document.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [isDragging]);

    const hours = time.getHours();
    const minutes = time.getMinutes();
    const hourDegrees = (hours % 12) * 30 + minutes * 0.5; // Continuous hour movement
    const minuteDegrees = minutes * 6; // Continuous minute movement

    return (
        <div className="flex flex-col items-center gap-8 p-8 w-full max-w-4xl mx-auto">
            <div
                ref={clockRef}
                className="relative w-[600px] h-[600px] cursor-pointer select-none touch-none transition-all duration-300 hover:scale-105"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleEnd}
                style={{ touchAction: 'none' }}
            >
                {/* Light mode clock face (same as before) */}
                <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-8 border-gray-300/50 relative shadow-lg overflow-hidden">
                    {/* Radial gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full"></div>

                    {/* Hour Numbers */}
                    {[...Array(12)].map((_, i) => {
                        const hour = i + 1;
                        const angle = (hour * 30 - 90) * (Math.PI / 180);
                        const radius = 240;
                        const x = Math.cos(angle) * radius;
                        const y = Math.sin(angle) * radius;

                        return (
                            <div
                                key={i}
                                className="absolute text-5xl font-medium text-gray-800 select-none pointer-events-none"
                                style={{
                                    left: '50%',
                                    top: '50%',
                                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                                    textShadow: '0 0 5px rgba(255, 255, 255, 0.8)'
                                }}
                            >
                                {hour}
                            </div>
                        );
                    })}

                    {/* Clock marks and hands (same as before) */}
                    {/* ... */}
                    
                    {/* Minute Hand */}
                    <div
                        className={`absolute w-3 bg-gradient-to-b from-gray-800 to-gray-600 rounded-full transition-all duration-100 z-20 ${activeHand === 'minute' ? 'shadow-lg shadow-gray-400/50' : ''}`}
                        style={{
                            height: '240px',
                            left: '50%',
                            top: '50%',
                            transformOrigin: 'bottom center',
                            transform: `translateX(-50%) translateY(-100%) rotate(${minuteDegrees}deg)`,
                            filter: activeHand === 'minute' ? 'drop-shadow(0 0 10px rgba(0, 0, 0, 0.3))' : 'drop-shadow(0 0 5px rgba(0, 0, 0, 0.2))',
                            transition: isDragging && activeHand === 'minute' ? 'none' : 'transform 0.2s ease-out'
                        }}
                    />

                    {/* Hour Hand */}
                    <div
                        className={`absolute w-4 bg-gradient-to-b from-gray-900 to-gray-700 rounded-full transition-all duration-100 z-10 ${activeHand === 'hour' ? 'shadow-lg shadow-gray-400/50' : ''}`}
                        style={{
                            height: '180px',
                            left: '50%',
                            top: '50%',
                            transformOrigin: 'bottom center',
                            transform: `translateX(-50%) translateY(-100%) rotate(${hourDegrees}deg)`,
                            filter: activeHand === 'hour' ? 'drop-shadow(0 0 10px rgba(0, 0, 0, 0.3))' : 'drop-shadow(0 0 5px rgba(0, 0, 0, 0.2))',
                            transition: isDragging && activeHand === 'hour' ? 'none' : 'transform 0.2s ease-out'
                        }}
                    />

                    {/* Center Dot */}
                    <div className="absolute w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-100 rounded-full shadow-lg z-30"
                        style={{
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            filter: 'drop-shadow(0 0 5px rgba(0, 0, 0, 0.2))'
                        }}
                    >
                        <div className="absolute inset-1.5 bg-gray-700 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}