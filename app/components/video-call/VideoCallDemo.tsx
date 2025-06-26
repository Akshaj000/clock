import React, { useState } from 'react';
import { VideoCall } from './VideoCall';
import { CallEndedScreen } from './CallEndedScreen';
import { Participant } from './types';

export const VideoCallDemo: React.FC = () => {
    const [callState, setCallState] = useState<'active' | 'ended'>('active');
    const [callDuration, setCallDuration] = useState(0);

    const participant: Participant = {
        id: 1,
        name: 'John',
        avatar: 'SW',
        isMicOn: true,
        isVideoOn: true,
        image: '/john.png'
    };

    const endCall = () => {
        setCallState('ended');
    };

    const startNewCall = () => {
        setCallState('active');
        setCallDuration(0);
    };

    const closeTab = () => {
        window.location.href = 'http://10.159.246.31';
    };

    switch (callState) {
        case 'active':
            return <VideoCall isActive onEnd={endCall} participant={participant} callDuration={callDuration} />;
        case 'ended':
        default:
            return (
                <CallEndedScreen
                    duration={callDuration}
                    participant={participant}
                    onViewRecording={closeTab}
                    onStartNewCall={startNewCall}
                />
            );
    }
};