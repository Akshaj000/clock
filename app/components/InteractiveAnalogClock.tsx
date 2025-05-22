'use client';

import React, { useState, useEffect, useRef } from 'react';
import PhoneCall from './PhoneCall';

interface ClockCenter {
    x: number;
    y: number;
}

const InteractiveAnalogClock: React.FC = () => {
    const [currentTime, setCurrentTime] = useState<Date>(new Date());
    const [triggerTime] = useState({ hours: 3, minutes: 30 });
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [dragType, setDragType] = useState<'hour' | 'minute' | null>(null);
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [isManualMode, setIsManualMode] = useState<boolean>(false);
    const clockRef = useRef<HTMLDivElement>(null);

    // Update clock every second when not in manual mode
    useEffect(() => {
        if (!isManualMode && !isDragging) {
            const interval = setInterval(() => {
                setCurrentTime(new Date());
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isManualMode, isDragging]);

    // Check for trigger time match
    useEffect(() => {
        const currentHours = currentTime.getHours() % 12;
        const currentMinutes = currentTime.getMinutes();

        if (currentHours === triggerTime.hours && currentMinutes === triggerTime.minutes) {
            setShowAlert(true);
        }
    }, [currentTime, triggerTime]);

    const getClockCenter = (): ClockCenter => {
        if (!clockRef.current) return { x: 0, y: 0 };
        const rect = clockRef.current.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
    };

    const getAngleFromPosition = (clientX: number, clientY: number): number => {
        const center = getClockCenter();
        const deltaX = clientX - center.x;
        const deltaY = clientY - center.y;
        let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
        angle = (angle + 90) % 360;
        if (angle < 0) angle += 360;
        return angle;
    };

    const handleMouseDown = (e: React.MouseEvent, type: 'hour' | 'minute') => {
        e.preventDefault();
        setIsDragging(true);
        setDragType(type);
        setIsManualMode(true);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging || !dragType) return;

        const angle = getAngleFromPosition(e.clientX, e.clientY);
        const newTime = new Date(currentTime);

        if (dragType === 'hour') {
            const hours = Math.floor((angle / 30) % 12);
            newTime.setHours(hours);
        } else if (dragType === 'minute') {
            const minutes = Math.floor((angle / 6) % 60);
            newTime.setMinutes(minutes);
        }

        setCurrentTime(newTime);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setDragType(null);
    };

    // Attach global mouse events
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, dragType, currentTime]);

    const hourAngle = (currentTime.getHours() % 12) * 30 + (currentTime.getMinutes() * 0.5);
    const minuteAngle = currentTime.getMinutes() * 6;
    const secondAngle = currentTime.getSeconds() * 6;

    return (
        <div className="h-screen w-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 flex items-center justify-center">
            <div className="rounded-full shadow-2xl border-8 border-amber-950"
                style={{
                    background: 'linear-gradient(45deg, #8B4513, #A0522D)',
                    boxShadow: '0 0 50px rgba(0, 0, 0, 0.5)'
                }}>
                {/* Clock Display */}
                <div className="flex justify-center">
                    <div
                        ref={clockRef}
                        className="relative w-[90vh] h-[90vh] rounded-full shadow-2xl border-8 border-amber-950"
                        style={{
                            cursor: isDragging ? 'grabbing' : 'grab',
                            background: `
                                radial-gradient(circle at center, #8B4513, #654321),
                                repeating-linear-gradient(
                                    45deg,
                                    rgba(139, 69, 19, 0.1) 0px,
                                    rgba(139, 69, 19, 0.1) 2px,
                                    transparent 2px,
                                    transparent 4px
                                ),
                                repeating-linear-gradient(
                                    -45deg,
                                    rgba(139, 69, 19, 0.1) 0px,
                                    rgba(139, 69, 19, 0.1) 2px,
                                    transparent 2px,
                                    transparent 4px
                                )
                            `,
                            boxShadow: 'inset 0 0 100px rgba(0, 0, 0, 0.6)'
                        }}
                    >
                        {/* Clock Numbers */}
                        {[...Array(12)].map((_, i) => {
                            const angle = (i + 1) * 30 - 90;
                            const x = Math.cos(angle * Math.PI / 180) * (0.4 * 90) + 'vh';
                            const y = Math.sin(angle * Math.PI / 180) * (0.4 * 90) + 'vh';
                            return (
                                <div
                                    key={i}
                                    className="absolute w-16 h-16 flex items-center justify-center text-4xl font-serif font-bold drop-shadow-lg"
                                    style={{
                                        left: `calc(50% + ${x} - 32px)`,
                                        top: `calc(50% + ${y} - 32px)`,
                                        color: '#2c1810',
                                        textShadow: '1px 1px 2px rgba(255, 255, 255, 0.3)'
                                    }}
                                >
                                    {i + 1}
                                </div>
                            );
                        })}

                        {/* Hour Markers */}
                        {[...Array(12)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-2 h-12 rounded-full shadow-lg"
                                style={{
                                    left: '50%',
                                    top: '24px',
                                    transformOrigin: '50% 42vh',
                                    transform: `translateX(-50%) rotate(${i * 30}deg)`,
                                    background: 'linear-gradient(to bottom, #2c1810, #4a2511)',
                                    boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
                                }}
                            />
                        ))}

                        {/* Minute Markers */}
                        {[...Array(60)].map((_, i) => (
                            i % 5 !== 0 && (
                                <div
                                    key={i}
                                    className="absolute w-1 h-6 rounded-full"
                                    style={{
                                        left: '50%',
                                        top: '24px',
                                        transformOrigin: '50% 42vh',
                                        transform: `translateX(-50%) rotate(${i * 6}deg)`,
                                        background: '#2c1810'
                                    }}
                                />
                            )
                        ))}

                        {/* Hour Hand */}
                        <div
                            className="absolute rounded-full cursor-grab transition-all duration-200 hover:shadow-lg"
                            style={{
                                width: '8px',
                                height: '25vh',
                                left: '50%',
                                top: '50%',
                                transformOrigin: '50% 100%',
                                transform: `translateX(-50%) translateY(-100%) rotate(${hourAngle}deg)`,
                                cursor: isDragging && dragType === 'hour' ? 'grabbing' : 'grab',
                                background: 'linear-gradient(to top, #1a0f0f, #2c1810)',
                                boxShadow: isDragging && dragType === 'hour' ?
                                    '0 0 20px rgba(0, 0, 0, 0.5)' :
                                    '2px 2px 4px rgba(0, 0, 0, 0.3)'
                            }}
                            onMouseDown={(e) => handleMouseDown(e, 'hour')}
                        />

                        {/* Minute Hand */}
                        <div
                            className="absolute rounded-full cursor-grab transition-all duration-200 hover:shadow-lg"
                            style={{
                                width: '6px',
                                height: '35vh',
                                left: '50%',
                                top: '50%',
                                transformOrigin: '50% 100%',
                                transform: `translateX(-50%) translateY(-100%) rotate(${minuteAngle}deg)`,
                                cursor: isDragging && dragType === 'minute' ? 'grabbing' : 'grab',
                                background: 'linear-gradient(to top, #2c1810, #4a2511)',
                                boxShadow: isDragging && dragType === 'minute' ?
                                    '0 0 20px rgba(0, 0, 0, 0.5)' :
                                    '2px 2px 4px rgba(0, 0, 0, 0.3)'
                            }}
                            onMouseDown={(e) => handleMouseDown(e, 'minute')}
                        />

                        {/* Second Hand */}
                        {!isManualMode && (
                            <div
                                className="absolute rounded-full"
                                style={{
                                    width: '3px',
                                    height: '40vh',
                                    left: '50%',
                                    top: '50%',
                                    transformOrigin: '50% 100%',
                                    transform: `translateX(-50%) translateY(-100%) rotate(${secondAngle}deg)`,
                                    background: '#8B4513',
                                    boxShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)'
                                }}
                            />
                        )}

                        {/* Center Dot */}
                        <div
                            className="absolute w-10 h-10 rounded-full border-4"
                            style={{
                                left: '50%',
                                top: '50%',
                                transform: 'translate(-50%, -50%)',
                                background: 'radial-gradient(circle at 30% 30%, #8B4513, #4a2511)',
                                borderColor: '#2c1810',
                                boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Phone Call Alert */}
            <PhoneCall
                isActive={showAlert}
                onEnd={() => setShowAlert(false)}
            />
        </div>
    );
};

export default InteractiveAnalogClock; 