import React from 'react';

function VotingScreen({ gameState, onVote, socketId }) {
  const { question, timeLeft, hasVoted } = gameState;
  const userVoted = hasVoted.includes(socketId);

  return (
    <div className="card fade-enter fade-enter-active">
      <div className={`timer ${timeLeft <= 5 ? 'warning' : ''}`}>
        00:{timeLeft.toString().padStart(2, '0')}
      </div>
      
      {question.image && (
        <div className="image-container">
          <img src={question.image} alt="Is it Mexico or AI?" />
        </div>
      )}
      
      <p className="description" style={{ fontSize: question.image ? '1.2rem' : '1.8rem', margin: '2rem 0', fontWeight: 'bold' }}>
        "{question.description}"
      </p>
      
      <div className="voting-buttons">
        <button 
          className="btn-mexico" 
          onClick={() => onVote('mexico')}
          disabled={userVoted}
        >
          🇲🇽 México
        </button>
        <button 
          className="btn-ai" 
          onClick={() => onVote('ai')}
          disabled={userVoted}
        >
          🤖 AI
        </button>
      </div>

      {userVoted && (
        <p style={{ marginTop: '1rem', color: 'var(--cyan-mexicano)', fontWeight: 'bold' }}>
          Vote submitted! Waiting for others...
        </p>
      )}
    </div>
  );
}

export default VotingScreen;
