import React, { useEffect, useRef } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(useGSAP, SplitText);

function SplashReveal({ question, playSfx, fadeSfx, socket }) {
  const container = useRef();
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

  useGSAP(() => {
    const tl = gsap.timeline();
    
    // Split text on the main word
    const mySplitText = new SplitText(".splash-main-word", { type: "chars" });
    const chars = mySplitText.chars;

    gsap.set(".splash-bg", { opacity: 0, scale: 1.05 });
    gsap.set(chars, { opacity: 0, scale: 0.5, rotation: -6 });
    gsap.set(".splash-label", { opacity: 0, y: 20 });
    gsap.set(".splash-bar", { scaleX: 0, transformOrigin: "left center" });

    tl.to(".splash-bg", { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" })
      .to(chars, {
        opacity: 1,
        scale: 1,
        rotation: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: "back.out(1.7)"
      }, "-=0.2")
      .to(".splash-label", {
        opacity: 0.8,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
        stagger: 0.2
      }, "-=0.5")
      .to(".splash-bar", {
        scaleX: 1,
        duration: 0.6,
        ease: "power2.out"
      }, "-=0.4");
  }, { scope: container });

  // ── MEXICO answer: CSS animated splash with Lottie ───────────────────────
  if (isReal) {
    return (
      <div ref={container} className="splash-bg" style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at center, #E4007C 0%, #1A000E 100%)',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {[...Array(12)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute', left: 0, right: 0, height: '2px',
              background: `rgba(255,209,0,${0.05 + (i % 3) * 0.03})`,
              top: `${(i / 12) * 100}%`,
              animation: `sweepLine 1.5s ${i * 0.08}s ease-in-out infinite alternate`,
            }} />
          ))}
        </div>

        <p className="splash-label" style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(1rem, 3vw, 1.5rem)',
          letterSpacing: '12px', color: '#FFD100', margin: '0 0 1rem 0',
          textTransform: 'uppercase',
        }}>★ REAL PHOTO ★</p>

        <div className="splash-main-word" style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(4rem, 18vw, 16rem)',
          lineHeight: 0.85, textAlign: 'center', letterSpacing: '-0.02em', color: '#FFD100',
          textShadow: '8px 8px 0 #CE1126, 0 0 80px rgba(255,209,0,0.6), 0 0 160px rgba(228,0,124,0.3)',
          WebkitTextStroke: '2px rgba(255,255,255,0.1)',
        }}>MEXICO</div>

        <div className="splash-label" style={{ width: 'clamp(150px, 20vw, 300px)', marginTop: '2rem' }}>
          <DotLottieReact src="/media/mexico-flag.lottie" autoplay loop />
        </div>

        <div className="splash-bar" style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '8px',
          background: 'linear-gradient(90deg, #CE1126, #FFD100, #006847)',
        }} />

        <style>{`
          @keyframes sweepLine { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(100%); opacity: 1; } }
        `}</style>
      </div>
    );
  }

  // ── AI answer: CSS animated splash ───────────────────────────────────────
  return (
    <div ref={container} className="splash-bg" style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at center, #001B5E 0%, #000D1A 100%)',
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

      <p className="splash-label" style={{
        fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(1rem, 3vw, 1.5rem)',
        letterSpacing: '12px', color: '#00C8C0', margin: '0 0 1rem 0',
        textTransform: 'uppercase',
      }}>★ AI Generated ★</p>

      <div className="splash-main-word" style={{
        fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(6rem, 28vw, 22rem)',
        lineHeight: 0.85, textAlign: 'center', letterSpacing: '-0.02em', color: '#00C8C0',
        textShadow: '8px 8px 0 #1B3FAB, 0 0 80px rgba(0,200,192,0.6), 0 0 160px rgba(0,100,255,0.3)',
        WebkitTextStroke: '2px rgba(255,255,255,0.1)',
      }}>AI</div>

      <div className="splash-label" style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', marginTop: '1rem' }}>
        🤖
      </div>

      <div className="splash-bar" style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '8px',
        background: 'linear-gradient(90deg, #1B3FAB, #00C8C0, #1B3FAB)',
      }} />

      <style>{`
        @keyframes sweepLine { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(100%); opacity: 1; } }
      `}</style>
    </div>
  );
}

export default SplashReveal;
