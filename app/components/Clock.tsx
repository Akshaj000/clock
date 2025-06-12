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

    // Mock router for demo - replace with actual Next.js router
    const router = useRouter();

    useEffect(() => {
        const hours = time.getHours();
        const minutes = time.getMinutes();
        const hour12 = hours % 12 || 12; // Convert 0 to 12 for 12-hour format

        // Check for 3:30 (any AM/PM)
        if (hour12 === 3 && minutes === 30 && !hasTriggeredCall) {
            if (onTimeReached) {
                onTimeReached();
                setHasTriggeredCall(true);
            }
        }

        // Check for 8:00 (any AM/PM) only after call has been triggered
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
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const radius = rect.width / 2;

        return { centerX, centerY, radius };
    };

    const getHandFromPosition = (clientX: number, clientY: number) => {
        const { centerX, centerY, radius } = getClockCenter();

        const distance = Math.sqrt(
            Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2)
        );

        // Hour hand zone: within 45% of radius
        // Minute hand zone: between 45% and 80% of radius
        if (distance < radius * 0.45) {
            return 'hour';
        } else if (distance < radius * 0.8) {
            return 'minute';
        }
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

    const handleClockInteraction = (position: Position) => {
        if (!activeHand) return;

        const { centerX, centerY } = getClockCenter();

        // Calculate angle from center
        const angle = Math.atan2(position.clientY - centerY, position.clientX - centerX);
        // Convert to degrees, with 12 o'clock as 0 degrees
        const degrees = (angle * 180) / Math.PI + 90;
        const normalizedDegrees = (degrees + 360) % 360;

        const newTime = new Date(time);

        if (activeHand === 'hour') {
            // For 12-hour clock: each position represents 1 hour
            // 12 o'clock = 12, 1 o'clock = 1, etc.
            const hour12 = Math.round(normalizedDegrees / 30) % 12 || 12; // Convert 0 to 12
            const currentHour = time.getHours();
            const isPM = currentHour >= 12;

            // Convert to 24-hour format for internal use
            const newHour = isPM ? (hour12 === 12 ? 12 : hour12 + 12) : (hour12 === 12 ? 0 : hour12);
            newTime.setHours(newHour);
            console.log('Setting hour to:', newHour, '(12-hour:', hour12, isPM ? 'PM' : 'AM', ')');
        } else if (activeHand === 'minute') {
            // Each minute is 6 degrees (360/60)
            const minutes = Math.round(normalizedDegrees / 6) % 60;
            newTime.setMinutes(minutes);
            console.log('Setting minutes to:', minutes);
        }

        console.log('New time:', newTime.toLocaleTimeString());
        setTime(newTime);
    };

    // Add global event listeners for mouse events
    useEffect(() => {
        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                handleMove({ clientX: e.clientX, clientY: e.clientY });
            }
        };

        const handleGlobalMouseUp = () => {
            if (isDragging) {
                handleEnd();
            }
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleGlobalMouseMove);
            document.addEventListener('mouseup', handleGlobalMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleGlobalMouseMove);
            document.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [isDragging, activeHand, handleMove]);

    const hours = time.getHours();
    const minutes = time.getMinutes();

    // Calculate hand positions
    const hourDegrees = (hours % 12) * 30 + minutes * 0.5;
    const minuteDegrees = minutes * 6;

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
                {/* Clock Face */}
                <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-900 to-gray-800 border-8 border-white/20 relative shadow-2xl backdrop-blur-md overflow-hidden">
                    {/* Radial gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full"></div>

                    {/* Hour Numbers */}
                    {[...Array(12)].map((_, i) => {
                        const hour = i + 1;
                        const angle = (hour * 30 - 90) * (Math.PI / 180);
                        const radius = 240; // Increased radius for larger clock
                        const x = Math.cos(angle) * radius;
                        const y = Math.sin(angle) * radius;

                        return (
                            <div
                                key={i}
                                className="absolute text-5xl font-light text-white text-opacity-90 select-none pointer-events-none"
                                style={{
                                    left: '50%',
                                    top: '50%',
                                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                                    textShadow: '0 0 15px rgba(255, 255, 255, 0.3)'
                                }}
                            >
                                {hour}
                            </div>
                        );
                    })}

                    {/* Hour Marks */}
                    {[...Array(12)].map((_, i) => (
                        <div
                            key={`mark-${i}`}
                            className="absolute w-2 h-12 bg-gradient-to-b from-white/80 to-white/40 rounded-full"
                            style={{
                                left: '50%',
                                top: '10px',
                                transformOrigin: '50% 290px',
                                transform: `translateX(-50%) rotate(${i * 30}deg)`,
                                boxShadow: '0 0 10px rgba(255, 255, 255, 0.2)'
                            }}
                        />
                    ))}

                    {/* Minute Marks */}
                    {[...Array(60)].map((_, i) => {
                        if (i % 5 !== 0) { // Skip hour marks
                            return (
                                <div
                                    key={`minute-mark-${i}`}
                                    className="absolute w-1 h-6 bg-white/30 rounded-full"
                                    style={{
                                        left: '50%',
                                        top: '12px',
                                        transformOrigin: '50% 288px',
                                        transform: `translateX(-50%) rotate(${i * 6}deg)`
                                    }}
                                />
                            );
                        }
                        return null;
                    })}

                    {/* Minute Hand */}
                    <div
                        className={`absolute w-3 bg-gradient-to-b from-white to-white/80 rounded-full transition-all duration-200 z-20 ${activeHand === 'minute' ? 'bg-opacity-100 shadow-lg shadow-white/50' : ''}`}
                        style={{
                            height: '240px',
                            left: '50%',
                            top: '50%',
                            transformOrigin: 'bottom center',
                            transform: `translateX(-50%) translateY(-100%) rotate(${minuteDegrees}deg)`,
                            filter: activeHand === 'minute' ? 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.6))' : 'drop-shadow(0 0 5px rgba(0, 0, 0, 0.3))'
                        }}
                    />

                    {/* Hour Hand */}
                    <div
                        className={`absolute w-4 bg-gradient-to-b from-white to-white/80 rounded-full transition-all duration-200 z-10 ${activeHand === 'hour' ? 'bg-opacity-100 shadow-lg shadow-white/50' : ''}`}
                        style={{
                            height: '180px',
                            left: '50%',
                            top: '50%',
                            transformOrigin: 'bottom center',
                            transform: `translateX(-50%) translateY(-100%) rotate(${hourDegrees}deg)`,
                            filter: activeHand === 'hour' ? 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.6))' : 'drop-shadow(0 0 5px rgba(0, 0, 0, 0.3))'
                        }}
                    />

                    {/* Center Dot */}
                    <div className="absolute w-12 h-12 bg-gradient-to-br from-white to-white/80 rounded-full shadow-lg z-30"
                        style={{
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            filter: 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.4))'
                        }}
                    >
                        <div className="absolute inset-1.5 bg-gray-800 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}