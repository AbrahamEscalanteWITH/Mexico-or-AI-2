import React from 'react';

function Lobby({ totalPlayers, playerNames = {}, onStart, onNewGame, isHost, questionNumber }) {
  const gameHasStarted = questionNumber > 0;
  const players = Object.entries(playerNames).filter(([, name]) => name !== 'Host');

  return (
    <div className="card fade-enter fade-enter-active">
      <h2>Waiting Room</h2>
      <div className="banner-strip">Connected to the show</div>

      <div className="player-count">{totalPlayers}</div>
      <div className="player-count-label">
        {totalPlayers === 1 ? 'Player connected' : 'Players connected'}
      </div>

      {/* Connected player names */}
      {players.length > 0 && (
        <div style={{ margin: '0.8rem 0 1rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center' }}>
          {players.map(([id, name]) => (
            <span key={id} style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '0.85rem',
              letterSpacing: '2px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(0,200,192,0.4)',
              borderRadius: '4px',
              padding: '3px 10px',
              color: 'var(--cyan-mexicano)',
            }}>
              🎮 {name}
            </span>
          ))}
        </div>
      )}

      <div className="stars-row">
        {'★ ★ ★ ★ ★'.split(' ').map((s, i) => <span key={i}>{s}</span>)}
      </div>

      {isHost ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
          <button className="btn-start-big" onClick={onStart} id="start-game-btn">
            🎬 &nbsp; Start the Show!
          </button>
          {gameHasStarted && (
            <button
              className="btn-ai"
              style={{ fontSize: '1rem', letterSpacing: '3px', padding: '0.6em 2em', marginTop: '0.2rem', animation: 'none' }}
              onClick={onNewGame}
              id="new-game-lobby-btn"
            >
              🔄 &nbsp; New Game (Reset & Reshuffle)
            </button>
          )}
        </div>
      ) : (
        <p className="waiting-text" style={{ marginTop: '1.5rem' }}>
          ● Waiting for the host to start...
        </p>
      )}

      <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', opacity: 0.4, letterSpacing: '2px', fontFamily: 'Bebas Neue, sans-serif' }}>
        SHARE THIS LINK WITH YOUR FRIENDS TO JOIN
      </p>
    </div>
  );
}

export default Lobby;
