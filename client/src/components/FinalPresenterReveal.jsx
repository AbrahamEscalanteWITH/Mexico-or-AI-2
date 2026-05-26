import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

function FinalPresenterReveal({ socket, isHost }) {
  const videoRef = useRef(null);

  const handleVideoLoaded = () => {
    if (videoRef.current) {
      videoRef.current.volume = 0.5;
    }
  };

  const handleVideoEnded = () => {
    if (isHost && socket) {
      socket.emit('finishWinnerReveal');
    }
  };

  const container = useRef();
  
  useGSAP(() => {
    gsap.from(container.current, { opacity: 0, duration: 0.5, ease: "power2.out" });
  }, { scope: container });

  return (
    <div ref={container} style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }}>
      <video
        ref={videoRef}
        src="/media/Presentador Final.mp4"
        autoPlay
        playsInline
        onEnded={handleVideoEnded}
        onError={handleVideoEnded}
        onLoadedMetadata={handleVideoLoaded}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    </div>
  );
}

export default FinalPresenterReveal;
