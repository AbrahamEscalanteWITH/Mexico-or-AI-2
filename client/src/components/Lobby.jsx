import React from 'react';

function Lobby({ totalPlayers, onStart, isHost }) {
  return (
    <div className="card fade-enter fade-enter-active">
      <h2>Welcome to the Party!</h2>
      <p className="description">
        Waiting for players to join...
        <br />
        <br />
        <strong>Current Players: {totalPlayers}</strong>
      </p>
      
      {isHost ? (
        <button className="btn-mexico" onClick={onStart}>
          Start Game
        </button>
      ) : (
        <p style={{ marginTop: '2rem', fontSize: '1.2em', color: 'var(--amarillo-brillante)' }}>
          Waiting for the host to start the game...
        </p>
      )}
    </div>
  );
}

export default Lobby;
