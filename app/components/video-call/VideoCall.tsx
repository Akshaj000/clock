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
        videoEnabled: false,
        error: null
    });
    const [callDuration, setCallDuration] = useState(initialDuration);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!isActive) return;

        const initializeAudio = async () => {
            try {
                if (!audioRef.current) {
                    // Play a short connecting sound only once at the start of the call
                    const audio = new Audio('/sounds/audio.mp3');
                    audio.loop = false;
                    audio.volume = 0.3;
                    audio.addEventListener('ended', () => {
                        handleEndCall();
                    });
                    await audio.play();
                    audioRef.current = audio;
                }

                setMediaState(prev => ({
                    ...prev,
                    error: null
                }));

            } catch (err) {
                console.error("Audio playback error:", err);
                setMediaState(prev => ({
                    ...prev,
                    error: "Could not play audio"
                }));
            }
        };

        initializeAudio();

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.removeEventListener('ended', handleEndCall);
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
    }, [isActive]);

    const toggleMedia = useCallback((type: 'audio' | 'video') => {
        setMediaState(prev => {
            const newState = { ...prev };

            if (type === 'audio') {
                newState.audioEnabled = !prev.audioEnabled;
                if (audioRef.current) {
                    audioRef.current.muted = !newState.audioEnabled;
                }
            } else {
                newState.videoEnabled = !prev.videoEnabled;
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
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.removeEventListener('ended', onEnd);
            audioRef.current = null;
        }

        onEnd();
    }, [onEnd]);

    if (!isActive) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 flex flex-col z-50 min-h-screen w-full max-w-full overflow-x-hidden">
            {/* Main Video Area */}
            <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center w-full max-w-full">
                {mediaState.error ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        <div className="text-center text-white">
                            <VideoOff size={48} className="mx-auto mb-4 opacity-50" />
                            <p className="text-lg mb-2">Media Unavailable</p>
                            <p className="text-sm opacity-75">{mediaState.error}</p>
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full relative flex flex-col items-center justify-center">
                        {/* Remote Participant Video */}
                        <div className="w-full flex items-center justify-center">
                            {participant.isVideoOn ? (
                                <img
                                    src={participant.image}
                                    alt={`Video feed from ${participant.name}`}
                                    className="object-cover rounded-full max-w-[180px] max-h-[180px] sm:max-w-[300px] sm:max-h-[300px] w-40 h-40 sm:w-72 sm:h-72"
                                />
                            ) : (
                                <div className="w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center bg-gray-700 rounded-full">
                                    <span className="text-white text-3xl sm:text-4xl font-semibold">{participant.avatar}</span>
                                </div>
                            )}
                            {/* Participant info overlay */}
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-base sm:text-lg bg-black bg-opacity-60 px-4 py-2 rounded-full">
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
                        {/* Local Video Preview - Now just showing a static avatar */}
                        <div className="absolute top-4 left-4 w-24 h-16 sm:w-60 sm:h-40 bg-gray-800 rounded-lg overflow-hidden shadow-xl border-2 border-gray-600 flex items-center justify-center">
                            <div className="w-full h-full flex items-center justify-center bg-gray-700">
                                <div
                                    className="w-10 h-10 sm:w-16 sm:h-16 bg-gray-600 rounded-full flex items-center justify-center"
                                    aria-label="Your camera is off"
                                >
                                    <span className="text-white text-base sm:text-xl font-semibold">You</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {/* Call info overlay */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span>Live • <DurationDisplay seconds={callDuration} /></span>
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
            <div className="bg-gray-800 p-2 sm:p-4 flex flex-col sm:flex-row items-center justify-between shadow-lg w-full max-w-full gap-2 sm:gap-0">
                <div className="flex items-center space-x-2 sm:space-x-4 mb-2 sm:mb-0">
                    <DurationDisplay seconds={callDuration} />
                    <div className="text-gray-400 text-xs sm:text-sm">
                        1-on-1 call with {participant.name}
                    </div>
                </div>
                {/* Main Controls */}
                <div className="flex items-center space-x-2 sm:space-x-3">
                    <ControlButton
                        icon={mediaState.audioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                        onClick={() => toggleMedia('audio')}
                        active={mediaState.audioEnabled}
                        title={mediaState.audioEnabled ? 'Mute microphone' : 'Unmute microphone'}
                    />
                    <ControlButton
                        icon={mediaState.videoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                        onClick={() => toggleMedia('video')}
                        active={mediaState.videoEnabled}
                        title={mediaState.videoEnabled ? 'Turn off camera' : 'Turn on camera'}
                    />
                    <ControlButton
                        icon={<PhoneOff size={20} />}
                        onClick={handleEndCall}
                        active={false}
                        danger={true}
                        title="End call"
                        className="hover:scale-105 transform transition-transform"
                    />
                </div>
                {/* Secondary Controls */}
                <div className="flex items-center space-x-1 sm:space-x-2 mt-2 sm:mt-0">
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