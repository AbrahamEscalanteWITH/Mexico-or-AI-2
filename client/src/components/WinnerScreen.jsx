import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

function WinnerScreen({ gameState, socketId, isHost, onNewGame }) {
  const { scores = {}, playerNames = {} } = gameState;

  // Leaderboard — exclude host
  const leaderboard = Object.entries(scores)
    .filter(([id]) => playerNames[id] && playerNames[id] !== 'Host')
    .sort(([, a], [, b]) => b - a);

  const topScore = leaderboard.length > 0 ? leaderboard[0][1] : 0;
  // There could be multiple winners with the same score
  const winners = leaderboard.filter(([, score]) => score === topScore && score > 0);
  
  return (
    <div className="card fade-enter fade-enter-active" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
      <h2 style={{ fontSize: '3.5rem', marginBottom: '0.5rem', textShadow: '0 0 20px rgba(228,0,124,0.5)' }}>GAME OVER!</h2>
      
      {winners.length > 0 ? (
        <>
          <div className="banner-strip" style={{ fontSize: '1.2rem', letterSpacing: '6px' }}>
            ★ AND THE TRUTH MASTER IS... ★
          </div>
          
          <div style={{ margin: '3rem 0' }}>
            {winners.map(([id, score], idx) => {
              const name = playerNames[id];
              return (
                <div key={id} style={{ 
                  animation: `splashIn 0.8s ${idx * 0.5}s ease-out both`,
                  marginBottom: '2rem'
                }}>
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
        <button className="btn-start-big" style={{ marginTop: '2rem' }} onClick={onNewGame}>
          🔄 Play Again
        </button>
      )}

      <style>{`
        @keyframes splashIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}

export default WinnerScreen;
