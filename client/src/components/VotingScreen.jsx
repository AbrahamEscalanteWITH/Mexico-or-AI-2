import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useRive, useStateMachineInput } from '@rive-app/react-canvas';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(useGSAP, SplitText);

/**
 * RiveMexicoButton
 * Renders the .riv Mexico button and manually drives
 * the "isHovering" and "isDown" boolean inputs so hover
 * and click animations play correctly.
 */
const RiveMexicoButton = ({ onClick, disabled }) => {
  const { rive, RiveComponent } = useRive({
    src: '/rive/button_mex.riv',
    stateMachines: 'State Machine 1',
    autoplay: true,
  });

  const isHoveringInput = useStateMachineInput(rive, 'State Machine 1', 'isHovering');
  const isDownInput     = useStateMachineInput(rive, 'State Machine 1', 'isDown');

  const setHover = (val) => { if (isHoveringInput) isHoveringInput.value = val; };
  const setDown  = (val) => { if (isDownInput)     isDownInput.value     = val; };

  return (
    <div
      style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1, display: 'inline-block', width: '220px', height: '80px' }}
      onMouseEnter={() => { if (!disabled) setHover(true); }}
      onMouseLeave={() => { setHover(false); setDown(false); }}
      onMouseDown={() =>  { if (!disabled) setDown(true);  }}
      onMouseUp={() =>    { if (!disabled) setDown(false); }}
      onClick={() =>      { if (!disabled && onClick) onClick(); }}
    >
      <RiveComponent style={{ width: '100%', height: '100%', display: 'block', pointerEvents: 'none' }} />
    </div>
  );
};

function VotingScreen({ gameState, onVote, socketId, isHost, playerName, playSfx }) {
  const { question, timeLeft, hasVoted, status, questionNumber = 1, totalQuestions = 20, votes } = gameState;
  const userVoted = hasVoted.includes(socketId);
  const isReadingPhase = status === 'reading';
  const isUrgent = !isReadingPhase && timeLeft <= 5;
  const myVote = gameState.socketVotes?.[socketId];

  const [showButtons, setShowButtons] = useState(false);
  const [hideVoteAnimation, setHideVoteAnimation] = useState(false);

  const container = useRef();
  const descRef = useRef();
  const buttonsRef = useRef();

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

  useGSAP(() => {
    if (!question) return;
    
    setShowButtons(false);
    const tl = gsap.timeline();

    gsap.set(buttonsRef.current, { autoAlpha: 0, scale: 0.8, y: 20 });

    if (descRef.current) {
      gsap.set(descRef.current, { opacity: 0, filter: "blur(20px)" });
      
      tl.to(descRef.current, {
        opacity: 1,
        filter: "blur(0px)",
        duration: 1,
        ease: "power2.out",
        delay: 0.8
      });
      
      tl.to(buttonsRef.current, {
        autoAlpha: 1,
        scale: 1,
        y: 0,
        duration: 0.6,
        ease: "back.out(1.7)",
        onStart: () => setShowButtons(true)
      }, "+=0.2");
    }
    
    return () => {
      tl.kill();
    };
  }, { scope: container, dependencies: [question?.id] });

  const totalVotes = (votes?.mexico || 0) + (votes?.ai || 0);

  return (
    <div ref={container} className="card fade-enter fade-enter-active">
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
        <p className="event-description-text" ref={descRef}>
          {question?.description}
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
          <div ref={buttonsRef} style={{ pointerEvents: showButtons ? 'auto' : 'none' }}>
            <div className="voting-buttons">
              <RiveMexicoButton onClick={() => onVote('mexico')} disabled={userVoted} id="vote-mexico" />
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
