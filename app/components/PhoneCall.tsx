'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Phone, PhoneOff, PhoneIncoming, Clock, Play, Pause, X } from 'lucide-react';

interface CallLog {
    timestamp: Date;
    duration: number;
}

interface PhoneCallProps {
    isActive: boolean;
    onEnd: () => void;
}

const PhoneCall: React.FC<PhoneCallProps> = ({ isActive, onEnd }) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const ringingRef = useRef<HTMLAudioElement | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [showCallLogs, setShowCallLogs] = useState(false);
    const [callLogs, setCallLogs] = useState<CallLog[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentPlayingIndex, setCurrentPlayingIndex] = useState<number | null>(null);
    const [callStartTime, setCallStartTime] = useState<Date | null>(null);
    const [callDuration, setCallDuration] = useState<number>(0);

    // Handle ringing sound
    useEffect(() => {
        if (isActive && !isAnswered && ringingRef.current) {
            ringingRef.current.currentTime = 0;
            ringingRef.current.volume = 0.5;
            ringingRef.current.play();
        } else if (ringingRef.current) {
            ringingRef.current.pause();
            ringingRef.current.currentTime = 0;
        }
    }, [isActive, isAnswered]);

    useEffect(() => {
        if (!isActive) {
            setIsAnswered(false);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            if (ringingRef.current) {
                ringingRef.current.pause();
                ringingRef.current.currentTime = 0;
            }
            if (callStartTime) {
                const duration = Math.floor((new Date().getTime() - callStartTime.getTime()) / 1000);
                setCallLogs(prev => [...prev, { timestamp: callStartTime, duration }]);
                setCallStartTime(null);
            }
        }
    }, [isActive, callStartTime]);

    useEffect(() => {
        if (isAnswered) {
            // Stop ringing when call is answered
            if (ringingRef.current) {
                ringingRef.current.pause();
                ringingRef.current.currentTime = 0;
            }
            setCallStartTime(new Date());
            const playAudio = async () => {
                try {
                    if (audioRef.current) {
                        audioRef.current.volume = 1.0;
                        await audioRef.current.play();
                    }
                } catch (error) {
                    console.error('Error playing audio:', error);
                }
            };
            playAudio();
        }
    }, [isAnswered]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (callStartTime && isAnswered) {
            interval = setInterval(() => {
                setCallDuration(Math.floor((new Date().getTime() - callStartTime.getTime()) / 1000));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [callStartTime, isAnswered]);

    const handleAnswer = () => {
        setIsAnswered(true);
    };

    const handleEnd = () => {
        setIsAnswered(false);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        onEnd();
    };

    const handleAudioEnd = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
        }
        // End the call when audio finishes playing
        if (isAnswered) {
            handleEnd();
        }
    };

    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatTimestamp = (date: Date): string => {
        return date.toLocaleString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
            month: 'short',
            day: 'numeric'
        });
    };

    const playRecording = async (index: number) => {
        if (currentPlayingIndex === index && isPlaying) {
            audioRef.current?.pause();
            setIsPlaying(false);
        } else {
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                try {
                    await audioRef.current.play();
                    setIsPlaying(true);
                    setCurrentPlayingIndex(index);
                } catch (error) {
                    console.error('Error playing recording:', error);
                }
            }
        }
    };

    return (
        <>
            <audio
                ref={audioRef}
                src="/phonecallaudio.wav"
                onEnded={() => {
                    setIsPlaying(false);
                    handleAudioEnd();
                }}
                loop={false}
            />
            <audio
                ref={ringingRef}
                src="/sounds/phone-ringing.mp3"
                loop
            />
            {(isActive || showCallLogs) && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 max-w-md w-full mx-4 border border-gray-600 shadow-2xl">
                        {/* Phone Header */}
                        <div className="flex justify-between items-center mb-6">
                            <div className="text-gray-400">
                                {isActive ? (
                                    isAnswered ? 'Call in Progress' : 'Incoming Call'
                                ) : (
                                    'Call History'
                                )}
                            </div>
                            <button
                                onClick={() => {
                                    if (isActive) handleEnd();
                                    setShowCallLogs(false);
                                }}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {isActive ? (
                            /* Active Call Interface */
                            <div className="text-center">
                                <div className="w-24 h-24 bg-gray-700 rounded-full mx-auto mb-6 flex items-center justify-center">
                                    <Clock className="text-blue-400" size={48} />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    Time Alert
                                </h2>
                                <p className="text-gray-300 mb-4">
                                    {isAnswered ? formatDuration(callDuration) : 'Incoming...'}
                                </p>
                                <div className="flex gap-4 justify-center mt-8">
                                    {!isAnswered ? (
                                        <button
                                            onClick={handleAnswer}
                                            className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-600 transition-colors shadow-lg"
                                        >
                                            <Phone size={32} />
                                        </button>
                                    ) : null}
                                    <button
                                        onClick={handleEnd}
                                        className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-lg"
                                    >
                                        <PhoneOff size={32} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Call Logs Interface */
                            <div className="space-y-4">
                                {callLogs.length === 0 ? (
                                    <p className="text-center text-gray-400">No call history yet</p>
                                ) : (
                                    callLogs.map((log, index) => (
                                        <div
                                            key={index}
                                            className="bg-gray-700 rounded-xl p-4 flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                                    <PhoneIncoming size={20} className="text-white" />
                                                </div>
                                                <div>
                                                    <div className="text-white font-medium">Time Alert</div>
                                                    <div className="text-sm text-gray-400">
                                                        {formatTimestamp(log.timestamp)} • {formatDuration(log.duration)}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => playRecording(index)}
                                                className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors"
                                            >
                                                {currentPlayingIndex === index && isPlaying ? (
                                                    <Pause size={20} />
                                                ) : (
                                                    <Play size={20} />
                                                )}
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Call Logs Button */}
            {!isActive && callLogs.length > 0 && !showCallLogs && (
                <button
                    onClick={() => setShowCallLogs(true)}
                    className="fixed bottom-8 right-8 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
                >
                    <Phone size={24} />
                </button>
            )}
        </>
    );
};

export default PhoneCall; 