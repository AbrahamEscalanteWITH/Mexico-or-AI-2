import React, { useRef, useEffect } from 'react';

function ResultsScreen({ gameState, isHost, onNext, onNewGame, onVideoPlay, onVideoEnd, socketId, socket }) {
  const { question, votes, scores = {}, playerNames = {}, questionNumber = 1, totalQuestions = 20 } = gameState;
  const totalVotes = votes.mexico + votes.ai;
  const mexicoPercent = totalVotes === 0 ? 50 : Math.round((votes.mexico / totalVotes) * 100);
  const aiPercent     = totalVotes === 0 ? 50 : Math.round((votes.ai / totalVotes) * 100);
  const isReal = !question.isAI;
  const myScore = scores[socketId] ?? 0;
  const medals = ['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣'];
  
  const videoRef = useRef(null);

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
    <div className="card fade-enter fade-enter-active">

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

      <h2>The Verdict is In!</h2>

      <div className="banner-strip" style={{ background: isReal ? 'var(--rosa-mexicano)' : 'var(--azul-retro)', fontSize:'1rem', letterSpacing:'6px' }}>
        {isReal ? '★ THIS REALLY HAPPENED IN MEXICO ★' : '★ THIS WAS AI GENERATED ★'}
      </div>

      {question.video && (
        <div className="media-reveal" style={{ margin:'1.5rem 0' }}>
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
        <div className="scale-mexico" style={{ width:`${mexicoPercent}%` }} />
        <div className="scale-ai"     style={{ width:`${aiPercent}%` }} />
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
