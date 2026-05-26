import React, { useRef } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(useGSAP, SplitText);

function WinnerScreen({ gameState, socketId, isHost, onNewGame }) {
  const { scores = {}, playerNames = {} } = gameState;

  // Leaderboard — exclude host
  const leaderboard = Object.entries(scores)
    .filter(([id]) => playerNames[id] && playerNames[id] !== 'Host')
    .sort(([, a], [, b]) => b - a);

  const topScore = leaderboard.length > 0 ? leaderboard[0][1] : 0;
  // There could be multiple winners with the same score
  const winners = leaderboard.filter(([, score]) => score === topScore && score > 0);
  const container = useRef();

  useGSAP(() => {
    const tl = gsap.timeline();
    
    const titleSplit = new SplitText(".winner-title", { type: "chars" });
    gsap.set(titleSplit.chars, { opacity: 0, y: -20, scale: 0.5 });
    
    tl.to(titleSplit.chars, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.5,
      stagger: 0.05,
      ease: "back.out(1.7)"
    });
    
    tl.fromTo(".winner-banner", 
      { opacity: 0, scaleX: 0 }, 
      { opacity: 1, scaleX: 1, duration: 0.4, ease: "power2.out" }, 
      "-=0.2"
    );
    
    gsap.set(".winner-block", { opacity: 0, scale: 0.5, y: 30 });
    tl.to(".winner-block", {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.3,
      ease: "elastic.out(1, 0.5)"
    }, "-=0.2");
    
    gsap.set(".standings-block", { opacity: 0, y: 20 });
    tl.to(".standings-block", {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: "power2.out",
      stagger: 0.1
    }, "-=0.4");
  }, { scope: container });

  return (
    <div ref={container} className="card fade-enter fade-enter-active" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
      <h2 className="winner-title" style={{ fontSize: '3.5rem', marginBottom: '0.5rem', textShadow: '0 0 20px rgba(228,0,124,0.5)' }}>GAME OVER!</h2>
      
      {winners.length > 0 ? (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DotLottieReact src="/lottie/confetti.lottie" autoplay loop style={{ width: '100%', height: '100%' }} />
          </div>

          <div className="banner-strip winner-banner" style={{ fontSize: '1.2rem', letterSpacing: '6px', position: 'relative', zIndex: 1 }}>
            ★ AND THE TRUTH MASTER IS... ★
          </div>
          
          <div style={{ margin: '3rem 0', position: 'relative', zIndex: 1 }}>
            {winners.map(([id, score], idx) => {
              const name = playerNames[id];
              return (
                <div key={id} className="winner-block" style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ width: '80px', height: '80px' }}>
                      <DotLottieReact src="/lottie/winner.lottie" autoplay loop />
                    </div>
                    <div style={{ 
                      fontFamily: "'Bebas Neue', sans-serif", 
                      fontSize: '4rem', 
                      color: 'var(--amarillo-brillante)',
                      textShadow: '0 0 30px rgba(255,209,0,0.6)',
                      lineHeight: 1
                    }}>
                      {name}
                    </div>
                    <div style={{ width: '80px', height: '80px' }}>
                      <DotLottieReact src="/lottie/winner.lottie" autoplay loop />
                    </div>
                  </div>
                  <div style={{ 
                    fontFamily: "'Bebas Neue', sans-serif", 
                    fontSize: '1.5rem', 
                    letterSpacing: '4px',
                    color: 'var(--cyan-mexicano)',
                    marginTop: '0.5rem'
                  }}>
                    WITH {score} POINTS!
                  </div>
                </div>
              );
            })}
          </div>

          {/* Show the rest of the players */}
          <div className="standings-block" style={{ marginTop: '2rem', position: 'relative', zIndex: 1 }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', color: 'rgba(255,255,255,0.7)', marginBottom: '1rem' }}>
              Final Standings
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
              {leaderboard.filter(([, score]) => score !== topScore).map(([id, score], idx) => (
                <div key={id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '100%',
                  maxWidth: '300px',
                  background: 'rgba(255,255,255,0.05)',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '1rem'
                }}>
                  <span style={{ fontWeight: 'bold' }}>{idx + 2}. {playerNames[id]}</span>
                  <span style={{ color: 'var(--cyan-mexicano)' }}>{score} pts</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div style={{ margin: '3rem 0' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🤷‍♂️</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: '3px' }}>
            NO WINNERS THIS TIME!
          </div>
        </div>
      )}

      {isHost && (
        <button className="btn-start-big standings-block" style={{ marginTop: '2rem' }} onClick={onNewGame}>
          🔄 Play Again
        </button>
      )}
    </div>
  );
}

export default WinnerScreen;
