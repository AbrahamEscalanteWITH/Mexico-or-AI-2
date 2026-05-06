import React, { useEffect, useRef } from 'react';

function SplashReveal({ question, playSfx, fadeSfx, socket }) {
  const isReal = !question.isAI;
  const videoRef = useRef(null);

  const handleVideoLoaded = () => {
    if (videoRef.current) {
      videoRef.current.volume = 0.5;
    }
  };

  useEffect(() => {
    if (isReal) {
      playSfx('/audio/Sting del Ganador.mp3', 0.2); // 20%
    } else {
      playSfx('/audio/Objetivo Alcanzado.mp3', 0.2); // 20%
    }
  }, []);

  const handleVideoEnded = () => {
    if (socket) socket.emit('revealComplete');
  };

  // ── MEXICO answer: full-screen MP4 ───────────────────────────────────────
  if (isReal) {
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
          src="/mexico-splash.mp4"
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

  // ── AI answer: CSS animated splash ───────────────────────────────────────
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at center, #001B5E 0%, #000D1A 100%)',
      animation: 'splashIn 0.3s ease-out',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(12)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute', left: 0, right: 0, height: '2px',
            background: `rgba(0,200,192,${0.05 + (i % 3) * 0.03})`,
            top: `${(i / 12) * 100}%`,
            animation: `sweepLine 1.5s ${i * 0.08}s ease-in-out infinite alternate`,
          }} />
        ))}
      </div>

      <p style={{
        fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(1rem, 3vw, 1.5rem)',
        letterSpacing: '12px', color: '#00C8C0', margin: '0 0 1rem 0',
        opacity: 0.8, animation: 'splashLabelIn 0.5s 0.1s ease-out both', textTransform: 'uppercase',
      }}>★ AI Generated ★</p>

      <div style={{
        fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(6rem, 28vw, 22rem)',
        lineHeight: 0.85, textAlign: 'center', letterSpacing: '-0.02em', color: '#00C8C0',
        textShadow: '8px 8px 0 #1B3FAB, 0 0 80px rgba(0,200,192,0.6), 0 0 160px rgba(0,100,255,0.3)',
        animation: 'splashWordIn 0.5s 0.05s cubic-bezier(0.175, 0.885, 0.32, 1.275) both',
        WebkitTextStroke: '2px rgba(255,255,255,0.1)',
      }}>AI</div>

      <div style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', marginTop: '1rem', animation: 'splashLabelIn 0.6s 0.3s ease-out both' }}>
        🤖
      </div>

      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '8px',
        background: 'linear-gradient(90deg, #1B3FAB, #00C8C0, #1B3FAB)',
        animation: 'barReveal 0.6s 0.2s ease-out both',
      }} />

      <style>{`
        @keyframes splashIn { from { opacity: 0; transform: scale(1.05); } to { opacity: 1; transform: scale(1); } }
        @keyframes splashWordIn { from { opacity: 0; transform: scale(0.5) rotate(-6deg); } to { opacity: 1; transform: scale(1) rotate(0deg); } }
        @keyframes splashLabelIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 0.8; transform: translateY(0); } }
        @keyframes barReveal { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes sweepLine { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(100%); opacity: 1; } }
      `}</style>
    </div>
  );
}

export default SplashReveal;
