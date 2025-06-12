import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    Mic, MicOff, Video, VideoOff, PhoneOff,
    Settings, Users, MessageSquare, MoreVertical,
    Maximize, Minimize
} from 'lucide-react';
import { VideoCallProps, MediaState } from './types';
import { ControlButton } from './ControlButton';
import { DurationDisplay } from './DurationDisplay';
import { AudioIndicator } from './AudioIndicator';

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
        audioEnabled: true,
        videoEnabled: true,
        error: null
    });
    const [callDuration, setCallDuration] = useState(initialDuration);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!isActive) return;

        const initializeMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 1280, height: 720 },
                    audio: true
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }

                if (!audioRef.current) {
                    audioRef.current = new Audio('/sounds/audio.mp3');
                    audioRef.current.loop = false;
                    audioRef.current.volume = 0.3;
                    audioRef.current.addEventListener('ended', onEnd);
                    await audioRef.current.play();
                }

                setMediaState(prev => ({
                    ...prev,
                    stream,
                    error: null
                }));

            } catch (err) {
                console.error("Media initialization error:", err);
                setMediaState(prev => ({
                    ...prev,
                    error: "Could not access camera/microphone"
                }));
            }
        };

        initializeMedia();

        return () => {
            if (mediaState.stream) {
                mediaState.stream.getTracks().forEach(track => track.stop());
            }

            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.removeEventListener('ended', onEnd);
                audioRef.current = null;
            }
        };
    }, [isActive, onEnd]);

    useEffect(() => {
        if (!isActive) {
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
            }
        };
    }, [isActive, mediaState.stream]);

    const toggleMedia = useCallback((type: 'audio' | 'video') => {
        setMediaState(prev => {
            const newState = { ...prev };

            if (type === 'audio') {
                newState.audioEnabled = !prev.audioEnabled;
                if (prev.stream) {
                    prev.stream.getAudioTracks().forEach(track => {
                        track.enabled = newState.audioEnabled;
                    });
                }
                if (audioRef.current) {
                    audioRef.current.muted = !newState.audioEnabled;
                }
            } else {
                newState.videoEnabled = !prev.videoEnabled;
                if (prev.stream) {
                    prev.stream.getVideoTracks().forEach(track => {
                        track.enabled = newState.videoEnabled;
                    });
                }
            }

            return newState;
        });
    }, []);

    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
                .then(() => setIsFullscreen(true))
                .catch(console.error);
        } else {
            document.exitFullscreen()
                .then(() => setIsFullscreen(false))
                .catch(console.error);
        }
    }, []);

    const handleEndCall = useCallback(() => {
        if (mediaState.stream) {
            mediaState.stream.getTracks().forEach(track => track.stop());
        }

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.removeEventListener('ended', onEnd);
            audioRef.current = null;
        }

        onEnd();
    }, [mediaState.stream, onEnd]);

    if (!isActive) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 flex flex-col z-50">
            {/* Main Video Area */}
            <div className="flex-1 relative overflow-hidden">
                {mediaState.error ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        <div className="text-center text-white">
                            <VideoOff size={64} className="mx-auto mb-4 opacity-50" />
                            <p className="text-lg mb-2">Media Unavailable</p>
                            <p className="text-sm opacity-75">{mediaState.error}</p>
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full relative">
                        {/* Remote Participant Video */}
                        <div className="w-full h-full flex items-center justify-center">
                            {participant.isVideoOn ? (
                                <img
                                    src={participant.image}
                                    alt={`Video feed from ${participant.name}`}
                                    className="object-cover rounded-full max-w-[300px] max-h-[300px]"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-700">
                                    <div
                                        className="w-32 h-32 bg-blue-500 rounded-full flex items-center justify-center"
                                        aria-label={`Avatar for ${participant.name}`}
                                    >
                                        <span className="text-white text-4xl font-semibold">
                                            {participant.avatar}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Participant info overlay */}
                            <div className="absolute bottom-4 left-4 text-white text-lg bg-black bg-opacity-60 px-4 py-2 rounded-full">
                                {participant.name}
                                {participant.isMicOn && (
                                    <span className="ml-2 text-green-400">●</span>
                                )}
                            </div>

                            {/* Audio indicator */}
                            <div className="absolute top-4 right-4">
                                <AudioIndicator isActive={participant.isMicOn} />
                            </div>
                        </div>

                        {/* Local Video Preview */}
                        <div className="absolute top-4 left-4 w-60 h-40 bg-gray-800 rounded-lg overflow-hidden shadow-xl border-2 border-gray-600">
                            {mediaState.videoEnabled ? (
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover"
                                    aria-label="Your camera feed"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-700">
                                    <div
                                        className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center"
                                        aria-label="Your camera is off"
                                    >
                                        <span className="text-white text-xl font-semibold">You</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Call info overlay */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm">Live • <DurationDisplay seconds={callDuration} /></span>
                    </div>
                </div>

                {/* Fullscreen toggle */}
                <ControlButton
                    icon={isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                    onClick={toggleFullscreen}
                    active={isFullscreen}
                    title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                    className="absolute top-4 right-4"
                />
            </div>

            {/* Control Bar */}
            <div className="bg-gray-800 p-4 flex items-center justify-between shadow-lg">
                <div className="flex items-center space-x-4">
                    <DurationDisplay seconds={callDuration} />
                    <div className="text-gray-400 text-sm">
                        1-on-1 call with {participant.name}
                    </div>
                </div>

                {/* Main Controls */}
                <div className="flex items-center space-x-3">
                    <ControlButton
                        icon={mediaState.audioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
                        onClick={() => toggleMedia('audio')}
                        active={mediaState.audioEnabled}
                        title={mediaState.audioEnabled ? 'Mute microphone' : 'Unmute microphone'}
                    />

                    <ControlButton
                        icon={mediaState.videoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
                        onClick={() => toggleMedia('video')}
                        active={mediaState.videoEnabled}
                        title={mediaState.videoEnabled ? 'Turn off camera' : 'Turn on camera'}
                    />

                    <ControlButton
                        icon={<PhoneOff size={24} />}
                        onClick={handleEndCall}
                        active={false}
                        danger={true}
                        title="End call"
                        className="hover:scale-105 transform transition-transform"
                    />
                </div>

                {/* Secondary Controls */}
                <div className="flex items-center space-x-2">
                    <ControlButton
                        icon={<Users size={20} />}
                        onClick={() => { }}
                        active={false}
                        title="Participants"
                    />
                    <ControlButton
                        icon={<MessageSquare size={20} />}
                        onClick={() => { }}
                        active={false}
                        title="Chat"
                    />
                    <ControlButton
                        icon={<Settings size={20} />}
                        onClick={() => { }}
                        active={false}
                        title="Settings"
                    />
                    <ControlButton
                        icon={<MoreVertical size={20} />}
                        onClick={() => { }}
                        active={false}
                        title="More options"
                    />
                </div>
            </div>
        </div>
    );
}; 