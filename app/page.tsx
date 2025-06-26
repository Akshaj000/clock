'use client';

import { useState, useEffect } from 'react';
import { VideoCallDemo } from './components/video-call';

export default function Home() {
  const [callStarted, setCallStarted] = useState(false);
  const [connectError, setConnectError] = useState(false);
  const [glitch, setGlitch] = useState(false);

  // Simulate connecting and always show glitch first, then retry, then call
  useEffect(() => {
    if (!callStarted && !connectError) {
      setGlitch(true);
      const glitchTimer = setTimeout(() => {
        setGlitch(false);
        setConnectError(true);
      }, 1800);
      return () => clearTimeout(glitchTimer);
    }
  }, [callStarted, connectError]);

  const handleRetry = () => {
    setConnectError(false);
    setGlitch(true);
    setTimeout(() => {
      setGlitch(false);
      setCallStarted(true);
    }, 1200);
  };

  return (
    <main className="min-h-screen w-full max-w-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-0 sm:p-0 overflow-x-hidden">
      <div className="relative w-full max-w-full flex items-center justify-center">
        {connectError ? (
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="text-red-400 text-2xl font-bold animate-pulse">Problem connecting to John</div>
            <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center shadow-lg relative overflow-hidden">
              <img src="/john.png" alt="John" className="w-20 h-20 rounded-full object-cover opacity-60" style={{ filter: 'grayscale(1) blur(1px)' }} />
              <div className="absolute inset-0 bg-black bg-opacity-30 animate-pulse" style={{ mixBlendMode: 'screen' }} />
              <div className="absolute inset-0 animate-glitch" />
            </div>
            <div className="text-gray-300 text-lg">Network glitch. Please try again.</div>
            <button
              className="mt-4 px-8 py-3 bg-blue-500 text-white rounded-lg text-lg font-semibold shadow active:scale-95 transition-transform"
              onClick={handleRetry}
            >
              Retry
            </button>
            <div className="text-gray-400 text-sm">Network unstable</div>
          </div>
        ) : !callStarted ? (
          <div className="flex flex-col items-center justify-center gap-6">
            <div className={`text-white text-2xl font-bold ${glitch ? 'animate-pulse' : 'animate-fade'}`}>Connecting to John...</div>
            <div className={`w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center shadow-lg relative overflow-hidden ${glitch ? 'animate-glitch' : ''}`}>
              <img src="/john.png" alt="John" className={`w-20 h-20 rounded-full object-cover ${glitch ? 'opacity-60 blur-[1.5px]' : ''}`} />
              {glitch && <div className="absolute inset-0 bg-white bg-opacity-10 animate-glitch" style={{ mixBlendMode: 'screen' }} />}
            </div>
            <div className="text-gray-300 text-lg">{glitch ? 'Trying to connect...' : 'Please wait'}</div>
            {glitch && <div className="text-red-400 text-sm animate-pulse">Network unstable...</div>}
          </div>
        ) : (
          <VideoCallDemo />
        )}
      </div>
      <style jsx global>{`
        @keyframes glitch {
          0% { filter: none; }
          20% { filter: contrast(2) brightness(1.2) hue-rotate(10deg); }
          40% { filter: blur(2px) contrast(1.5); }
          60% { filter: grayscale(1) brightness(0.8); }
          80% { filter: none; }
          100% { filter: none; }
        }
        .animate-glitch {
          animation: glitch 0.7s infinite linear alternate;
        }
        @keyframes fade {
          0% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        .animate-fade {
          animation: fade 1.2s ease-in;
        }
      `}</style>
    </main>
  );
}
