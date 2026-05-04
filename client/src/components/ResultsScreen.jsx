import React from 'react';

function ResultsScreen({ gameState, isHost, onNext }) {
  const { question, votes } = gameState;
  
  const totalVotes = votes.mexico + votes.ai;
  const mexicoPercent = totalVotes === 0 ? 50 : Math.round((votes.mexico / totalVotes) * 100);
  const aiPercent = totalVotes === 0 ? 50 : Math.round((votes.ai / totalVotes) * 100);

  return (
    <div className="card fade-enter fade-enter-active">
      <h2>The Verdict is In!</h2>
      
      <div className="media-container" style={{ margin: '1.5rem 0', display: 'flex', justifyContent: 'center' }}>
        {question.video ? (
          <video 
            src={question.video} 
            controls 
            autoPlay 
            style={{ maxWidth: '100%', maxHeight: '350px', borderRadius: '12px', border: '4px solid var(--rosa-mexicano)' }} 
          />
        ) : question.image ? (
          <img src={question.image} alt="Is it Mexico or AI?" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '12px' }} />
        ) : null}
      </div>
      
      <p style={{ fontStyle: 'italic', marginBottom: '1rem' }}>"{question.description}"</p>
      
      <div className="results-scale">
        <div className="scale-mexico" style={{ width: `${mexicoPercent}%` }}></div>
        <div className="scale-ai" style={{ width: `${aiPercent}%` }}></div>
      </div>
      
      <div className="scale-labels">
        <span style={{ color: 'var(--rosa-mexicano)' }}>🇲🇽 México: {mexicoPercent}%</span>
        <span style={{ color: 'var(--cyan-mexicano)' }}>🤖 AI: {aiPercent}%</span>
      </div>

      <div className="correct-answer">
        This was... 
        <span style={{ color: question.isAI ? 'var(--cyan-mexicano)' : 'var(--rosa-mexicano)' }}>
          {question.isAI ? ' AI Generated! 🤖' : ' Real Mexico! 🇲🇽'}
        </span>
      </div>
      
      {isHost ? (
        <button 
          className="btn-mexico" 
          style={{ marginTop: '2rem' }}
          onClick={onNext}
        >
          Next Question ➡️
        </button>
      ) : (
        <p style={{ marginTop: '2rem', fontSize: '1.2em', color: 'var(--amarillo-brillante)' }}>
          Waiting for the host to start the next round...
        </p>
      )}
    </div>
  );
}

export default ResultsScreen;
