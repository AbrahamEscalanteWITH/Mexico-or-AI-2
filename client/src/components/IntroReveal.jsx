import React, { useRef } from 'react';

function IntroReveal({ socket, isHost }) {
  const videoRef = useRef(null);

  const handleVideoLoaded = () => {
    if (videoRef.current) {
      videoRef.current.volume = 0.5;
    }
  };

  const handleVideoEnded = () => {
    if (isHost && socket) {
      socket.emit('finishIntro');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'splashIn 0.2s ease-out',
      overflow: 'hidden',
    }}>
      <video
        ref={videoRef}
        src="/media/Introduccion.mp4"
        autoPlay
        playsInline
        onEnded={handleVideoEnded}
        onLoadedMetadata={handleVideoLoaded}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
      <style>{`
        @keyframes splashIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}

export default IntroReveal;
