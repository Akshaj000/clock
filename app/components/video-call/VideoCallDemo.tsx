import React, { useState } from 'react';
import { VideoCall } from './VideoCall';
import { RingingScreen } from './RingingScreen';
import { CallEndedScreen } from './CallEndedScreen';
import { VideoCallRecording } from './VideoCallRecording';
import { Participant } from './types';
import { useRouter } from 'next/navigation';

export const VideoCallDemo: React.FC = () => {
    const [callState, setCallState] = useState<'ringing' | 'active' | 'ended' | 'recording'>('ringing');
    const [callDuration, setCallDuration] = useState(0);
    const router = useRouter();

    const participant: Participant = {
        id: 1,
        name: 'John',
        avatar: 'SW',
        isMicOn: true,
        isVideoOn: true,
        image: '/john.png'
    };

    const answerCall = () => {
        setCallState('active');
        setCallDuration(0);
    };

    const declineCall = () => {
        setCallState('ended');
    };

    const endCall = () => {
        setCallState('ended');
    };

    const viewRecording = () => {
        setCallState('recording');
    };

    const startNewCall = () => {
        setCallState('ringing');
    };

    const closeRecording = () => {
        setCallState('ended');
    };

    const handlePlaybackEnd = () => {
        router.push('/success');
    };

    switch (callState) {
        case 'ringing':
            return <RingingScreen onAnswer={answerCall} onDecline={declineCall} caller={participant} />;
        case 'active':
            return <VideoCall isActive onEnd={endCall} participant={participant} callDuration={callDuration} />;
        case 'recording':
            return (
                <VideoCallRecording
                    participant={participant}
                    duration={45} // Simulated duration
                    onStop={closeRecording}
                    onStartNewCall={startNewCall}
                    onPlaybackEnd={handlePlaybackEnd}
                />
            );
        case 'ended':
        default:
            return (
                <CallEndedScreen
                    duration={callDuration}
                    participant={participant}
                    onViewRecording={viewRecording}
                    onStartNewCall={startNewCall}
                />
            );
    }
}; 