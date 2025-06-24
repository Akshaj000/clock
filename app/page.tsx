'use client';

import { useState } from 'react';
import { VideoCall } from './components/video-call/VideoCall';
import { RingingScreen } from './components/video-call/RingingScreen';

export default function Home() {
  const [callStarted, setCallStarted] = useState(false);
  const callDuration = 0;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="relative">
        {!callStarted ? (
          <RingingScreen
            onAnswer={() => setCallStarted(true)}
            onDecline={() => { }}
            caller={{
              id: 1,
              name: 'John',
              avatar: 'SW',
              isMicOn: true,
              isVideoOn: true,
              image: '/john.png'
            }}
          />
        ) : (
          <VideoCall
            isActive={true}
            onEnd={() => { }}
            participant={{
              id: 1,
              name: 'John',
              avatar: 'SW',
              isMicOn: true,
              isVideoOn: true,
              image: '/john.png'
            }}
            callDuration={callDuration}
          />
        )}
      </div>
    </main>
  );
}
