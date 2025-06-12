'use client';

import { useState } from 'react';
import Clock from './components/Clock';
import { VideoCall } from './components/video-call/VideoCall';
import { VideoCallRecording } from './components/video-call/VideoCallRecording';

export default function Home() {
  const [showCall, setShowCall] = useState(false);
  const [showRecording, setShowRecording] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [callDuration] = useState(0);

  const handleTimeReached = () => {
    setShowCall(true);
  };

  const handleCallEnd = () => {
    setShowCall(false);
    setShowRecording(true);
  };

  const handleRecordingTimeReached = () => {
    setShowRecording(false);
    setShowSuccess(true);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="relative">
        {!showCall && !showRecording && !showSuccess ? (
          <Clock onTimeReached={handleTimeReached} />
        ) : showCall ? (
          <VideoCall
            isActive={true}
            onEnd={handleCallEnd}
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
        ) : showRecording ? (
          <div className="flex gap-8 items-center">
            <VideoCallRecording
              participant={{
                id: 1,
                name: 'John',
                avatar: 'SW',
                isMicOn: true,
                isVideoOn: true,
                image: '/john.png'
              }}
              duration={callDuration}
              onStop={() => { }}
              onStartNewCall={() => setShowCall(true)}
              onPlaybackEnd={() => { }}
            />
            <div className="w-64">
              <Clock onTimeReached={handleRecordingTimeReached} initialTriggeredCall={true} />
            </div>
          </div>
        ) : (
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4">Success!</h1>
            <p className="text-xl">You have completed all the steps.</p>
          </div>
        )}
      </div>
    </main>
  );
}
