import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(useGSAP, SplitText);

function ResultsScreen({ gameState, isHost, onNext, onNewGame, onVideoPlay, onVideoEnd, socketId, socket }) {
  const { question, votes, scores = {}, playerNames = {}, questionNumber = 1, totalQuestions = 20 } = gameState;
  const totalVotes = votes.mexico + votes.ai;
  const mexicoPercent = totalVotes === 0 ? 50 : Math.round((votes.mexico / totalVotes) * 100);
  const aiPercent     = totalVotes === 0 ? 50 : Math.round((votes.ai / totalVotes) * 100);
  const isReal = !question.isAI;
  const myScore = scores[socketId] ?? 0;
  const medals = ['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣'];
  
  const videoRef = useRef(null);
  const container = useRef();
  const titleRef = useRef();
  const bannerRef = useRef();
  const mediaRef = useRef();
  const barMexRef = useRef();
  const barAiRef = useRef();

  useGSAP(() => {
    const tl = gsap.timeline();

    gsap.set(barMexRef.current, { width: 0 });
    gsap.set(barAiRef.current, { width: 0 });
    if (mediaRef.current) gsap.set(mediaRef.current, { opacity: 0, y: 30, scale: 0.95 });
    
    let splitTitle = null;
    if (titleRef.current) {
      splitTitle = new SplitText(titleRef.current, { type: "words,chars" });
      gsap.set(splitTitle.chars, { opacity: 0, y: 15, scale: 0.9 });
    }

    if (splitTitle) {
      tl.to(splitTitle.chars, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.4,
        stagger: 0.03,
        ease: "back.out(1.5)"
      });
    }

    if (bannerRef.current) {
      tl.fromTo(bannerRef.current, 
        { opacity: 0, scaleX: 0 },
        { opacity: 1, scaleX: 1, duration: 0.4, ease: "power2.out" }, "-=0.2"
      );
    }

    if (mediaRef.current) {
      tl.to(mediaRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.4)" }, "-=0.2");
    }

    tl.to(barMexRef.current, { width: `${mexicoPercent}%`, duration: 1.2, ease: "power3.out" }, "-=0.1")
      .to(barAiRef.current, { width: `${aiPercent}%`, duration: 1.2, ease: "power3.out" }, "<");
      
  }, { scope: container, dependencies: [mexicoPercent, aiPercent] });

  useEffect(() => {
    if (!isHost && socket) {
      const handleVideoAction = ({ action, time }) => {
        if (!videoRef.current) return;
        if (action === 'play') {
          videoRef.current.currentTime = time;
          videoRef.current.play().catch(() => {});
        } else if (action === 'pause') {
          videoRef.current.currentTime = time;
          videoRef.current.pause();
        } else if (action === 'seek') {
          videoRef.current.currentTime = time;
        }
      };
      socket.on('videoAction', handleVideoAction);
      return () => socket.off('videoAction', handleVideoAction);
    }
  }, [isHost, socket]);

  const handleHostPlay = (e) => {
    onVideoPlay();
    if (isHost && socket) socket.emit('videoAction', { action: 'play', time: e.target.currentTime });
  };

  const handleHostPause = (e) => {
    onVideoEnd();
    if (isHost && socket) socket.emit('videoAction', { action: 'pause', time: e.target.currentTime });
  };

  const handleHostSeek = (e) => {
    if (isHost && socket) socket.emit('videoAction', { action: 'seek', time: e.target.currentTime });
  };

  const handleVideoLoaded = () => {
    if (videoRef.current) {
      videoRef.current.volume = 0.5;
      if (videoRef.current.duration < 10) {
        videoRef.current.loop = true;
      }
    }
  };

  const leaderboard = Object.entries(scores)
    .filter(([id]) => playerNames[id] && playerNames[id] !== 'Host')
    .sort(([,a],[,b]) => b - a);

  return (
    <div ref={container} className="card fade-enter fade-enter-active">

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.5rem' }}>
        <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'0.8rem', letterSpacing:'4px', color:'var(--cyan-mexicano)', opacity:0.8 }}>
          QUESTION {questionNumber} / {totalQuestions}
        </span>
        {!isHost && (
          <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'0.8rem', letterSpacing:'3px', background:'rgba(228,0,124,0.15)', border:'1px solid var(--rosa-mexicano)', borderRadius:'4px', padding:'2px 10px', color:'var(--amarillo-brillante)' }}>
            ★ {myScore} PTS
          </span>
        )}
      </div>

      <h2 ref={titleRef}>The Verdict is In!</h2>

      <div ref={bannerRef} className="banner-strip" style={{ background: isReal ? 'var(--rosa-mexicano)' : 'var(--azul-retro)', fontSize:'1rem', letterSpacing:'6px' }}>
        {isReal ? '★ THIS REALLY HAPPENED IN MEXICO ★' : '★ THIS WAS AI GENERATED ★'}
      </div>

      {question.video && (
        <div ref={mediaRef} style={{ margin:'1.5rem 0' }}>
          <video
            ref={videoRef}
            src={question.video}
            controls={isHost}
            autoPlay
            playsInline
            onPlay={handleHostPlay}
            onPause={handleHostPause}
            onEnded={onVideoEnd}
            onSeeked={handleHostSeek}
            onLoadedMetadata={handleVideoLoaded}
            style={{
              maxWidth:'100%', width:'100%', maxHeight:'460px', borderRadius:'4px',
              border:`4px solid ${isReal ? 'var(--rosa-mexicano)' : 'var(--cyan-mexicano)'}`,
              boxShadow: isReal ? '0 0 40px rgba(228,0,124,0.5)' : '0 0 40px rgba(0,200,192,0.5)',
              display:'block',
            }}
          />
        </div>
      )}

      <p style={{ fontStyle:'italic', fontSize:'0.95rem', opacity:0.6, margin:'0 0 1.5rem 0', lineHeight:1.5 }}>
        "{question.description}"
      </p>

      <div className="results-scale">
        <div ref={barMexRef} className="scale-mexico" style={{ width: '0%' }} />
        <div ref={barAiRef} className="scale-ai"     style={{ width: '0%' }} />
      </div>
      <div className="scale-labels">
        <span style={{ color:'var(--rosa-mexicano)' }}>🇲🇽 Mexico &nbsp;{mexicoPercent}%</span>
        <span style={{ color:'var(--cyan-mexicano)' }}>{aiPercent}% &nbsp;AI 🤖</span>
      </div>

      {leaderboard.length > 0 && (
        <div style={{ marginTop:'1.5rem', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'4px', overflow:'hidden' }}>
          <div style={{ background:'rgba(228,0,124,0.2)', padding:'0.3rem 1rem', fontFamily:"'Bebas Neue',sans-serif", fontSize:'0.75rem', letterSpacing:'5px', color:'var(--amarillo-brillante)' }}>
            🏆 SCOREBOARD
          </div>
          {leaderboard.map(([id, pts], idx) => {
            const isMe = id === socketId;
            const name = playerNames[id] || `Player ${idx + 1}`;
            return (
              <div key={id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.4rem 1rem', background: isMe ? 'rgba(255,209,0,0.08)' : 'transparent', borderBottom: idx < leaderboard.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1rem', letterSpacing:'2px', color: isMe ? 'var(--amarillo-brillante)' : 'rgba(255,255,255,0.7)' }}>
                  {medals[idx]} {name}{isMe ? ' (YOU)' : ''}
                </span>
                <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.1rem', letterSpacing:'3px', color: isMe ? 'var(--amarillo-brillante)' : 'var(--cyan-mexicano)' }}>
                  {pts} pts
                </span>
              </div>
            );
          })}
        </div>
      )}

      {isHost ? (
        <div style={{ display:'flex', gap:'1rem', justifyContent:'center', marginTop:'2rem', flexWrap:'wrap' }}>
          <button className="btn-start-big" style={{ fontSize:'1.5rem', marginTop:0 }} onClick={onNext} id="next-question-btn">
            {questionNumber >= totalQuestions ? 'Finish Game 🏆' : 'Next Question ➡️'}
          </button>
          <button className="btn-ai" style={{ fontSize:'1.1rem', letterSpacing:'3px', padding:'0.7em 1.8em', marginTop:0 }} onClick={onNewGame} id="new-game-results-btn">
            🔄 New Game
          </button>
        </div>
      ) : (
        <p className="waiting-text" style={{ marginTop:'2rem' }}>● Waiting for the host...</p>
      )}
    </div>
  );
}

export default ResultsScreen;
