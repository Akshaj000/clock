import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    Mic, MicOff, Video, VideoOff, PhoneOff,
    Settings, Users, MessageSquare, MoreVertical,
    Maximize, Minimize
} from 'lucide-react';
import { VideoCallProps, MediaState } from './types';
import { ControlButton } from './ControlButton';
import { DurationDisplay } from './DurationDisplay';

export const VideoCall: React.FC<VideoCallProps> = ({
    isActive = true,
    onEnd = () => { },
    participant = {
        id: 1,
        name: 'John',
        avatar: 'SW',
        isMicOn: true,
        isVideoOn: true,
        image: '/john.png'
    },
    callDuration: initialDuration = 0
}) => {
    const [mediaState, setMediaState] = useState<MediaState>({
        stream: null,
        audioEnabled: false,
        videoEnabled: true,
        error: null
    });
    const [callDuration, setCallDuration] = useState(initialDuration);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isCallEnding, setIsCallEnding] = useState(false);

    // Refs
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);

    // Cleanup function to stop all media and clear resources
    const cleanupResources = useCallback(() => {
        // Stop audio with proper cleanup
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.removeEventListener('ended', handleEndCall);
            // Ensure audio is fully stopped before nullifying
            try {
                audioRef.current.src = '';
                audioRef.current.load();
            } catch (e) {
                console.error("Error stopping audio:", e);
            }
            audioRef.current = null;
        }

        // Stop video stream
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                track.stop();
            });
            localStreamRef.current = null;
        }

        // Clear timer
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        // Reset video element
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, []);

    // Handle ending the call
    const handleEndCall = useCallback(() => {
        if (isCallEnding) return; // Prevent multiple calls

        setIsCallEnding(true);
        cleanupResources();

        // Call the parent's onEnd callback
        setTimeout(() => {
            onEnd();
        }, 100); // Small delay to ensure cleanup completes
    }, [onEnd, cleanupResources, isCallEnding]);

    // Initialize camera
    const initializeCamera = useCallback(async () => {
        if (isCallEnding) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            });

            localStreamRef.current = stream;
            if (videoRef.current && !isCallEnding) {
                videoRef.current.srcObject = stream;
            }

            setMediaState(prev => ({
                ...prev,
                stream,
                videoEnabled: true,
                error: null
            }));
        } catch (err) {
            console.error("Camera access error:", err);
            setMediaState(prev => ({
                ...prev,
                error: "Could not access camera"
            }));
        }
    }, [isCallEnding]);

    // Initialize audio playback
    const initializeAudio = useCallback(async () => {
        if (isCallEnding || audioRef.current) return; // Prevent multiple audio instances

        try {
            // Wait 3 seconds before starting audio
            await new Promise(resolve => setTimeout(resolve, 1500));

            if (isCallEnding || audioRef.current) return; // Double check after delay

            const audio = new Audio('/sounds/audio.mp3');
            audio.loop = false;
            audio.volume = 0.3;

            // Set up event listener before assigning to ref
            const handleAudioEnd = () => {
                if (!isCallEnding) {
                    handleEndCall();
                }
            };

            audio.addEventListener('ended', handleAudioEnd);

            // Assign to ref before playing to prevent race conditions
            audioRef.current = audio;

            await audio.play();

            setMediaState(prev => ({
                ...prev,
                error: null
            }));
        } catch (err) {
            console.error("Audio playback error:", err);
            // Clean up on error
            if (audioRef.current) {
                audioRef.current = null;
            }
            setMediaState(prev => ({
                ...prev,
                error: "Could not play audio"
            }));
        }
    }, [handleEndCall, isCallEnding]);

    // Toggle media (video only, audio is disabled)
    const toggleMedia = useCallback((type: 'audio' | 'video') => {
        if (isCallEnding) return;

        if (type === 'video') {
            setMediaState(prev => {
                const newVideoEnabled = !prev.videoEnabled;

                if (localStreamRef.current) {
                    localStreamRef.current.getVideoTracks().forEach(track => {
                        track.enabled = newVideoEnabled;
                    });
                }

                if (!newVideoEnabled && localStreamRef.current) {
                    localStreamRef.current.getTracks().forEach(track => track.stop());
                    localStreamRef.current = null;
                    if (videoRef.current) {
                        videoRef.current.srcObject = null;
                    }
                } else if (newVideoEnabled) {
                    initializeCamera();
                }

                return {
                    ...prev,
                    videoEnabled: newVideoEnabled
                };
            });
        }
        // Audio toggle is ignored as per requirement
    }, [initializeCamera, isCallEnding]);

    // Toggle fullscreen
    const toggleFullscreen = useCallback(() => {
        if (isCallEnding) return;

        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
                .then(() => setIsFullscreen(true))
                .catch(console.error);
        } else {
            document.exitFullscreen()
                .then(() => setIsFullscreen(false))
                .catch(console.error);
        }
    }, [isCallEnding]);

    // Effect for camera initialization
    useEffect(() => {
        if (isActive && mediaState.videoEnabled && !isCallEnding) {
            initializeCamera();
        }

        return () => {
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
                localStreamRef.current = null;
            }
        };
    }, [isActive, mediaState.videoEnabled, initializeCamera, isCallEnding]);

    // Effect for audio initialization
    useEffect(() => {
        if (!isActive || isCallEnding || audioRef.current) return; // Prevent multiple audio instances

        let isMounted = true; // Track if component is still mounted

        const setupAudio = async () => {
            if (!isMounted || audioRef.current) return;
            await initializeAudio();
        };

        setupAudio();

        return () => {
            isMounted = false;
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.removeEventListener('ended', handleEndCall);
                audioRef.current = null;
            }
        };
    }, [isActive, initializeAudio, handleEndCall, isCallEnding]);

    // Effect for call timer
    useEffect(() => {
        if (!isActive || isCallEnding) {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            return;
        }

        timerRef.current = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [isActive, isCallEnding]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cleanupResources();
        };
    }, [cleanupResources]);    // Handle mobile viewport adjustments
    useEffect(() => {
        // Prevent scrolling
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';

        // Only handle overflow, don't modify --vh as it's handled globally
        // to prevent hydration errors

        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []);

    // Don't render if call is not active or is ending
    if (!isActive || isCallEnding) return null;

    return (
        <div
            className="fixed left-0 top-0 w-full bg-gradient-to-br from-gray-900 via-gray-950 to-black flex flex-col z-50 overflow-hidden"
            style={{
                height: 'calc(var(--vh, 1vh) * 100)',
                paddingTop: 'env(safe-area-inset-top)',
                paddingBottom: 'env(safe-area-inset-bottom)',
                paddingLeft: 'env(safe-area-inset-left)',
                paddingRight: 'env(safe-area-inset-right)'
            }}
        >
            {/* Main Video Area */}
            <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center w-full min-h-0 min-w-0">
                {mediaState.error ? (
                    <div className="w-full h-full flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                        <div className="text-center text-white p-6 sm:p-8 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl max-w-md">
                            <VideoOff size={52} className="mx-auto mb-5 opacity-70 text-red-300" />
                            <p className="text-xl mb-3 font-medium">Media Unavailable</p>
                            <p className="text-sm text-gray-300">{mediaState.error}</p>
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full relative flex flex-col items-center justify-center min-h-0 min-w-0">
                        {/* Remote Participant Video */}
                        <div className="w-full flex items-center justify-center">
                            {participant.isVideoOn ? (
                                <div className="relative">
                                    <img
                                        src={participant.image}
                                        alt={`Video feed from ${participant.name}`}
                                        className="object-cover rounded-3xl shadow-2xl border-2 border-blue-900/50 max-w-[240px] max-h-[240px] sm:max-w-[360px] sm:max-h-[360px] w-60 h-60 sm:w-[360px] sm:h-[360px] transition-all duration-300"
                                    />
                                    {/* Subtle overlay gradient for better text contrast */}
                                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                                </div>
                            ) : (
                                <div className="w-48 h-48 sm:w-60 sm:h-60 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-xl border border-gray-700/50 overflow-hidden">
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-t from-black/40 to-transparent">
                                        <span className="text-white text-5xl sm:text-6xl font-semibold drop-shadow-xl">
                                            {participant.avatar}
                                        </span>
                                    </div>
                                </div>
                            )}
                            {/* Participant info overlay */}
                            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white text-lg sm:text-xl backdrop-blur-lg bg-black/50 px-7 py-3 rounded-full shadow-xl border border-white/10 flex items-center gap-3">
                                <span className="font-semibold tracking-wide">{participant.name}</span>
                                {participant.isMicOn && (
                                    <span className="flex h-3 w-3 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Local Video Preview */}
                        <div className="absolute top-7 left-7 w-32 h-24 sm:w-64 sm:h-44 bg-gray-900/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-2xl border border-blue-900/30 hover:border-blue-800/50 transition-all duration-300 hover:scale-105 hover:shadow-blue-900/20">
                            {mediaState.videoEnabled ? (
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover"
                                    style={{ transform: 'scaleX(-1)' }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                                    <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gray-700/80 rounded-full flex items-center justify-center border border-gray-600/50">
                                        <span className="text-white text-lg sm:text-2xl font-medium">You</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Fullscreen toggle */}
                <ControlButton
                    icon={isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                    onClick={toggleFullscreen}
                    active={isFullscreen}
                    title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                    className="absolute top-7 right-7 shadow-lg"
                />
            </div>

            {/* Control Bar */}
            <div className="bg-black/60 backdrop-blur-lg p-5 flex flex-col sm:flex-row items-center justify-between shadow-2xl w-full max-w-full gap-3 sm:gap-0 border-t border-white/5">
                <div className="flex items-center space-x-4 sm:space-x-6 mb-3 sm:mb-0">
                    <DurationDisplay seconds={callDuration} />
                    <div className="text-gray-300 text-xs sm:text-sm">
                        1-on-1 call with <span className="font-medium text-white">{participant.name}</span>
                    </div>
                </div>

                {/* Main Controls */}
                <div className="flex items-center space-x-3 sm:space-x-5">
                    <ControlButton
                        icon={mediaState.audioEnabled ? <Mic size={22} /> : <MicOff size={22} />}
                        onClick={() => toggleMedia('audio')}
                        active={mediaState.audioEnabled}
                        title={mediaState.audioEnabled ? 'Mute microphone' : 'Unmute microphone'}
                    />
                    <ControlButton
                        icon={mediaState.videoEnabled ? <Video size={22} /> : <VideoOff size={22} />}
                        onClick={() => toggleMedia('video')}
                        active={mediaState.videoEnabled}
                        title={mediaState.videoEnabled ? 'Turn off camera' : 'Turn on camera'}
                    />
                    <ControlButton
                        icon={<PhoneOff size={22} />}
                        onClick={handleEndCall}
                        active={false}
                        danger={true}
                        title="End call"
                        className="hover:scale-110 transform transition-transform shadow-xl"
                    />
                </div>

                {/* Secondary Controls */}
                <div className="flex items-center space-x-2 sm:space-x-3 mt-3 sm:mt-0">
                    <ControlButton
                        icon={<Users size={18} />}
                        onClick={() => { }}
                        active={false}
                        title="Participants"
                    />
                    <ControlButton
                        icon={<MessageSquare size={18} />}
                        onClick={() => { }}
                        active={false}
                        title="Chat"
                    />
                    <ControlButton
                        icon={<Settings size={18} />}
                        onClick={() => { }}
                        active={false}
                        title="Settings"
                    />
                    <ControlButton
                        icon={<MoreVertical size={18} />}
                        onClick={() => { }}
                        active={false}
                        title="More options"
                    />
                </div>
            </div>
        </div>
    );
};