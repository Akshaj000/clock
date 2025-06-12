import React, { useEffect, useRef, useState } from 'react';
import { Participant } from './types';

interface VideoCallRecordingProps {
    participant: Participant;
    duration: number;
    onStop: () => void;
    onStartNewCall: () => void;
    onPlaybackEnd: () => void;
}

export const VideoCallRecording: React.FC<VideoCallRecordingProps> = ({
    participant,
    onStop,
    onStartNewCall,
    onPlaybackEnd
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackTime, setPlaybackTime] = useState(0);
    const [audioDuration, setAudioDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const startPlayback = async () => {
        try {
            if (!audioRef.current) {
                const audio = new Audio('/sounds/audio.mp3');
                audio.loop = false; // Recording should not loop
                audio.volume = 0.7; // Adjust volume as needed
                audio.onloadedmetadata = () => {
                    console.log('Audio metadata loaded. Duration:', audio.duration);
                    setAudioDuration(audio.duration);
                };
                audioRef.current = audio;
            }

            console.log('Attempting to play audio...');
            // Reset playback time if it's already at the end
            if (audioRef.current.currentTime >= audioDuration) {
                audioRef.current.currentTime = 0;
                setPlaybackTime(0);
            }

            await audioRef.current.play();
            setIsPlaying(true);

            // Update playback time every second
            playbackIntervalRef.current = setInterval(() => {
                if (audioRef.current) {
                    setPlaybackTime(Math.floor(audioRef.current.currentTime));
                }
            }, 1000);

        } catch (e) {
            console.error("Playback audio failed:", e);
            setIsPlaying(false);
        }
    };

    const stopPlayback = () => {
        if (playbackIntervalRef.current) {
            clearInterval(playbackIntervalRef.current);
        }

        if (audioRef.current) {
            audioRef.current.pause();
            // audioRef.current.currentTime = 0; // Don't reset time on pause, only on stop or ended
        }

        setIsPlaying(false);
    };

    const togglePlayback = () => {
        if (isPlaying) {
            stopPlayback();
        } else {
            startPlayback();
        }
    };

    const seekTo = (time: number) => {
        const newTime = Math.max(0, Math.min(audioDuration, time));
        setPlaybackTime(newTime);
        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
        }
    };

    useEffect(() => {
        // Handle audio ending naturally
        const handleAudioEnded = () => {
            stopPlayback();
            onPlaybackEnd();
        };

        if (audioRef.current) {
            audioRef.current.addEventListener('ended', handleAudioEnded);
        }

        return () => {
            if (playbackIntervalRef.current) {
                clearInterval(playbackIntervalRef.current);
            }
            if (audioRef.current) {
                audioRef.current.removeEventListener('ended', handleAudioEnded);
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [audioDuration, onPlaybackEnd]); // Re-run effect if audioDuration changes

    return (
        <div className="fixed inset-0 bg-gray-900 flex flex-col">
            {/* Recording Header */}
            <div className="bg-gray-800 p-4 flex items-center justify-between border-b border-gray-700">
                <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-white font-semibold">Call Recording</span>
                    <span className="text-gray-400">with {participant.name}</span>
                </div>
                <div>
                    <button
                        onClick={onStop}
                        className="text-gray-400 hover:text-white transition-colors"
                        aria-label="Close recording"
                    >
                        ✕ Close
                    </button>
                    <button
                        onClick={onStartNewCall}
                        className="text-blue-400 hover:text-blue-300 transition-colors ml-4"
                        aria-label="Start new call"
                    >
                        Start New Call
                    </button>
                </div>
            </div>

            {/* Main Video Area */}
            <div className="flex-1 relative">
                {/* Removed participant image as recording is audio-only */}
                {/* <img
                    src={participant.image}
                    alt={`Recording of ${participant.name}`}
                    className="w-full h-full object-cover"
                /> */}

                {/* Playback overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    {!isPlaying && (
                        <button
                            onClick={togglePlayback}
                            className="w-20 h-20 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all transform hover:scale-105"
                            aria-label="Play recording"
                        >
                            <div className="w-0 h-0 border-l-[20px] border-l-gray-800 border-t-[14px] border-t-transparent border-b-[14px] border-b-transparent ml-1"></div>
                        </button>
                    )}
                </div>

                {/* Playback info */}
                <div className="absolute top-4 left-4 bg-black bg-opacity-60 text-white px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm">
                            Recording • {formatTime(playbackTime)} / {formatTime(audioDuration)}
                        </span>
                        {isPlaying && (
                            <span className="text-xs bg-blue-500 px-2 py-1 rounded-full">
                                Playing
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Playback Controls */}
            <div className="bg-gray-800 p-6">
                {/* Progress Bar */}
                <div className="mb-4">
                    <div className="flex items-center space-x-4 text-white text-sm mb-2">
                        <span>{formatTime(playbackTime)}</span>
                        <div className="flex-1 bg-gray-600 h-2 rounded-full overflow-hidden">
                            <div
                                className="bg-blue-500 h-full transition-all duration-300"
                                style={{ width: `${(playbackTime / audioDuration) * 100}%` }}
                            ></div>
                        </div>
                        <span>{formatTime(audioDuration)}</span>
                    </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-center space-x-4">
                    <button
                        onClick={() => seekTo(playbackTime - 10)}
                        className="p-3 bg-gray-600 hover:bg-gray-500 text-white rounded-full transition-colors"
                        aria-label="Rewind 10 seconds"
                    >
                        ⏪ 10s
                    </button>

                    <button
                        onClick={togglePlayback}
                        className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                        {isPlaying ? '⏸️' : '▶️'}
                    </button>

                    <button
                        onClick={() => seekTo(playbackTime + 10)}
                        className="p-3 bg-gray-600 hover:bg-gray-500 text-white rounded-full transition-colors"
                        aria-label="Forward 10 seconds"
                    >
                        10s ⏩
                    </button>
                </div>
            </div>
        </div>
    );
}; 