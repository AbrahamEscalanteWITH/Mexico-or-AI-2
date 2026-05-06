import React, { useState, useEffect } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

function VotingScreen({ gameState, onVote, socketId, isHost, playerName, playSfx }) {
  const { question, timeLeft, hasVoted, status, questionNumber = 1, totalQuestions = 20, votes } = gameState;
  const userVoted = hasVoted.includes(socketId);
  const isReadingPhase = status === 'reading';
  const isUrgent = !isReadingPhase && timeLeft <= 5;
  const myVote = gameState.socketVotes?.[socketId];

  const [revealedWords, setRevealedWords] = useState([]);
  const [showButtons, setShowButtons] = useState(false);
  const [lastQuestionId, setLastQuestionId] = useState(null);
  const [hideVoteAnimation, setHideVoteAnimation] = useState(false);

  const words = question?.description ? question.description.split(' ') : [];

  useEffect(() => {
    if (showButtons && timeLeft === 6) {
      if (playSfx) playSfx('/audio/Countdown.wav', 0.2);
    }
  }, [timeLeft, showButtons, playSfx]);

  useEffect(() => {
    if (userVoted) {
      setHideVoteAnimation(false);
      const t = setTimeout(() => setHideVoteAnimation(true), 2500);
      return () => clearTimeout(t);
    }
  }, [userVoted]);

  useEffect(() => {
    if (!question) return;
    const questionId = question.id;
    if (questionId === lastQuestionId) return;

    setLastQuestionId(questionId);
    setRevealedWords([]);
    setShowButtons(false);

    const wordDelay = 200;
    const startDelay = 800;
    words.forEach((_, i) => {
      setTimeout(() => setRevealedWords(prev => [...prev, i]), startDelay + i * wordDelay);
    });
    const totalTime = startDelay + words.length * wordDelay + 600;
    setTimeout(() => setShowButtons(true), totalTime);
  }, [question?.id]);

  const totalVotes = (votes?.mexico || 0) + (votes?.ai || 0);

  return (
    <div className="card fade-enter fade-enter-active">
      {/* Big background countdown */}
      {showButtons && timeLeft <= 6 && timeLeft > 0 && (
        <div style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '80vh',
          fontFamily: "'Bebas Neue', sans-serif",
          color: 'var(--rosa-mexicano)',
          opacity: 0.1,
          pointerEvents: 'none',
          zIndex: 0,
          lineHeight: 1,
          textShadow: '0 0 50px rgba(228,0,124,0.5)'
        }}>
          {timeLeft}
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Question counter */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.75rem', letterSpacing: '5px', color: 'var(--cyan-mexicano)', opacity: 0.7 }}>
            QUESTION {questionNumber} / {totalQuestions}
          </span>
          {isHost && (
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.7rem', letterSpacing: '3px', color: 'var(--amarillo-brillante)', background: 'rgba(228,0,124,0.15)', border: '1px solid var(--rosa-mexicano)', borderRadius: '4px', padding: '2px 8px' }}>
              👑 HOST VIEW
            </span>
          )}
        </div>

        {/* Timer */}
        <div className="timer-wrapper" style={{
          transition: 'opacity 0.8s ease, transform 0.8s ease',
          opacity: isReadingPhase ? 0 : 1,
          transform: isReadingPhase ? 'translateY(-10px)' : 'translateY(0)',
          pointerEvents: isReadingPhase ? 'none' : 'auto',
          marginBottom: isReadingPhase ? '-4rem' : '0',
        }}>
          <span className={`timer${isUrgent ? ' warning' : ''}`}>{String(timeLeft).padStart(2, '0')}</span>
          <span className="timer-label">SECONDS</span>
        </div>

      <div className="event-intro-label">● LIVE &nbsp;—&nbsp; EVENT</div>

      {/* Description */}
      <div className="event-description-box">
        <p className="event-description-text">
          {words.map((word, i) => (
            <span key={`${question?.id}-${i}`} className="word" style={{
              display: 'inline-block',
              opacity: revealedWords.includes(i) ? 1 : 0,
              transform: revealedWords.includes(i) ? 'translateY(0)' : 'translateY(18px)',
              transition: 'opacity 0.35s ease, transform 0.35s ease',
              margin: '0 3px',
            }}>{word}</span>
          ))}
        </p>
      </div>

      {/* Host: live vote tally instead of buttons */}
      {isHost ? (
        <div style={{ marginTop: '1rem' }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.75rem', letterSpacing: '4px', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem' }}>
            LIVE VOTES — {totalVotes} cast
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <div style={{ flex: 1, background: 'rgba(228,0,124,0.15)', border: '2px solid var(--rosa-mexicano)', borderRadius: '4px', padding: '0.8rem', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', color: 'var(--rosa-mexicano)', lineHeight: 1 }}>{votes?.mexico || 0}</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.7rem', letterSpacing: '3px', color: 'rgba(255,255,255,0.5)' }}>🇲🇽 MEXICO</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(0,200,192,0.15)', border: '2px solid var(--cyan-mexicano)', borderRadius: '4px', padding: '0.8rem', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', color: 'var(--cyan-mexicano)', lineHeight: 1 }}>{votes?.ai || 0}</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.7rem', letterSpacing: '3px', color: 'rgba(255,255,255,0.5)' }}>🤖 AI</div>
            </div>
          </div>
        </div>
      ) : (
        /* Player: voting buttons */
        <>
          <div style={{
            opacity: showButtons ? 1 : 0,
            transform: showButtons ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(20px)',
            transition: 'opacity 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275), transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            pointerEvents: showButtons ? 'auto' : 'none',
          }}>
            <div className="voting-buttons">
              <button className="btn-mexico" onClick={() => onVote('mexico')} disabled={userVoted} id="vote-mexico">
                🇲🇽 &nbsp; Mexico
              </button>
              <button className="btn-ai" onClick={() => onVote('ai')} disabled={userVoted} id="vote-ai">
                🤖 &nbsp; AI
              </button>
            </div>
          </div>
          {userVoted && (
            <div className="vote-submitted" style={{ marginTop: '1rem', position: 'relative' }}>
              ✓ &nbsp; Vote submitted — waiting for others...
              
              {/* Lottie Animations based on vote */}
              {myVote === 'mexico' && !hideVoteAnimation && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '80%', maxWidth: '600px' }}>
                    <DotLottieReact src="/lottie/mexico.lottie" autoplay />
                  </div>
                </div>
              )}
              
              {myVote === 'ai' && !hideVoteAnimation && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '80%', maxWidth: '600px' }}>
                    <DotLottieReact src="/lottie/ai.lottie" autoplay />
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
}

export default VotingScreen;
