import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import Lobby from './components/Lobby'
import VotingScreen from './components/VotingScreen'
import ResultsScreen from './components/ResultsScreen'
import SplashReveal from './components/SplashReveal'
import { useAudio } from './hooks/useAudio'
import './App.css'

const serverUrl = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '/';
const socket = io(serverUrl)

function App() {
  const [gameState, setGameState] = useState({ status: 'connecting' })
  const [role, setRole] = useState('unassigned')       // 'unassigned' | 'naming' | 'host' | 'player'
  const [playerName, setPlayerName] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [musicVol, setMusicVol] = useState(0.25)
  const { playSfx, stopBg } = useAudio()
  const prevStatusRef = useRef(null)
  const bgStarted = useRef(false)
  const bgAudioRef = useRef(null)

  useEffect(() => {
    socket.on('gameState', (state) => setGameState(state))
    return () => { socket.off('gameState') }
  }, [])

  // Sync dial → bgAudio
  useEffect(() => {
    if (bgAudioRef.current) bgAudioRef.current.volume = musicVol
  }, [musicVol])

  const duckBg = (volume) => {
    if (bgAudioRef.current) bgAudioRef.current.volume = volume
  }

  const startBg = (vol = musicVol) => {
    if (!bgStarted.current) {
      bgStarted.current = true
      const bg = new Audio('/audio/Fondo General.mp3')
      bg.loop = true
      bg.volume = vol
      bg.play().catch(() => {})
      bgAudioRef.current = bg
    }
  }

  // Audio on status changes
  useEffect(() => {
    const prev = prevStatusRef.current
    const curr = gameState.status
    prevStatusRef.current = curr

    if ((curr === 'reading' || curr === 'voting') && prev !== 'reading' && prev !== 'voting') {
      if (bgAudioRef.current) { bgAudioRef.current.pause(); bgAudioRef.current = null }
      bgStarted.current = false
      playSfx('/audio/Cara a Cara.mp3', 0.9)
      setTimeout(() => {
        const bg = new Audio('/audio/Fondo General.mp3')
        bg.loop = true
        bg.volume = musicVol
        bg.play().catch(() => {})
        bgAudioRef.current = bg
        bgStarted.current = true
      }, 2000)
    }

    if (curr === 'revealing') {
      if (bgAudioRef.current) bgAudioRef.current.volume = 0.05
    }

    if (curr === 'waiting' && prev === 'results') {
      if (bgAudioRef.current) bgAudioRef.current.pause()
      bgStarted.current = false
      startBg()
    }
  }, [gameState.status])

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handlePickHost = () => {
    startBg()
    // Host gets name "Host" internally, no name screen needed
    socket.emit('setName', { name: 'Host', isHost: true })
    setPlayerName('Host')
    setRole('host')
  }

  const handlePickPlayer = () => {
    startBg()
    setRole('naming')   // show name entry screen
  }

  const handleSubmitName = (e) => {
    e.preventDefault()
    const trimmed = nameInput.trim() || 'Player'
    socket.emit('setName', { name: trimmed, isHost: false })
    setPlayerName(trimmed)
    setRole('player')
  }

  const handleStartGame  = () => { playSfx('/audio/Sting Principal.mp3', 1.0); socket.emit('startGame') }
  const handleNewGame    = () => { playSfx('/audio/Sting Principal.mp3', 1.0); socket.emit('resetGame') }
  const handleNextQuestion = () => { if (bgAudioRef.current) bgAudioRef.current.volume = musicVol; socket.emit('nextQuestion') }
  const handleVote       = (voteType) => socket.emit('vote', voteType)
  const handleVolChange  = (e) => setMusicVol(parseFloat(e.target.value))

  // ── Host volume dial ──────────────────────────────────────────────────────
  const VolumeDial = () => (
    <div style={{
      position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 10000,
      background: 'rgba(13,13,18,0.95)', border: '2px solid var(--rosa-mexicano)',
      borderRadius: '8px', padding: '0.6rem 1rem', display: 'flex',
      flexDirection: 'column', alignItems: 'center', gap: '0.3rem',
      backdropFilter: 'blur(8px)', boxShadow: '0 0 20px rgba(228,0,124,0.25)', minWidth: '130px',
    }}>
      <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.65rem', letterSpacing: '4px', color: 'var(--amarillo-brillante)', opacity: 0.8 }}>
        🎚 MUSIC VOL
      </span>
      <input id="vol-slider" type="range" min="0" max="1" step="0.01" value={musicVol} onChange={handleVolChange}
        style={{ width: '100%', accentColor: 'var(--rosa-mexicano)', cursor: 'pointer' }} />
      <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.8rem', letterSpacing: '2px', color: 'var(--cyan-mexicano)' }}>
        {Math.round(musicVol * 100)}%
      </span>
    </div>
  )

  const Header = ({ showHostBadge = false }) => (
    <>
      <div className="tv-channel-bar"><span>◈</span> CHANNEL 5 CDMX <span>◈</span> LIVE <span>◈</span></div>
      <h1 className="main-title">
        Mexico<br/>or AI?
        {showHostBadge && <span className="host-badge">HOST</span>}
      </h1>
      <p className="title-sub">The Truth Game</p>
    </>
  )

  // ── 1. Role selection ─────────────────────────────────────────────────────
  if (role === 'unassigned') {
    return (
      <div className="app-container fade-enter fade-enter-active">
        <Header />
        <div className="card">
          <h2>How are you playing?</h2>
          <div className="banner-strip">Select your role</div>
          <div className="role-selection">
            <button className="btn-start-big" onClick={handlePickHost}>👑 &nbsp; I'm the Host</button>
            <button className="btn-mexico" style={{ fontSize: '1.4rem', letterSpacing: '3px', padding: '0.7em 2.5em' }} onClick={handlePickPlayer}>
              🎮 &nbsp; Join as Player
            </button>
          </div>
          <div className="stars-row" style={{ marginTop: '1.5rem' }}>
            {'★ ★ ★ ★ ★'.split(' ').map((s, i) => <span key={i}>{s}</span>)}
          </div>
        </div>
      </div>
    )
  }

  // ── 2. Player name entry ──────────────────────────────────────────────────
  if (role === 'naming') {
    return (
      <div className="app-container fade-enter fade-enter-active">
        <Header />
        <div className="card">
          <h2>What's your name?</h2>
          <div className="banner-strip">Enter your player name</div>
          <form onSubmit={handleSubmitName} style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <input
              id="player-name-input"
              type="text"
              autoFocus
              maxLength={20}
              placeholder="Your name..."
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '2px solid var(--rosa-mexicano)',
                borderRadius: '4px',
                padding: '0.6em 1.2em',
                fontSize: '1.6rem',
                fontFamily: "'Bebas Neue', sans-serif",
                letterSpacing: '4px',
                color: 'var(--amarillo-brillante)',
                textAlign: 'center',
                width: '100%',
                maxWidth: '320px',
                outline: 'none',
              }}
            />
            <button type="submit" className="btn-start-big" style={{ marginTop: 0 }}>
              🎮 &nbsp; Join the Game!
            </button>
          </form>
          <div className="stars-row" style={{ marginTop: '1.5rem' }}>
            {'★ ★ ★ ★ ★'.split(' ').map((s, i) => <span key={i}>{s}</span>)}
          </div>
        </div>
      </div>
    )
  }

  // ── 3. Main game ──────────────────────────────────────────────────────────
  const isHost = role === 'host'

  return (
    <>
      {/* Outside the animated container so position:fixed works */}
      {isHost && <VolumeDial />}

      {gameState.status === 'revealing' && gameState.question && (
        <SplashReveal question={gameState.question} playSfx={playSfx} socket={socket} />
      )}

      <div className="app-container fade-enter fade-enter-active">
        <Header showHostBadge={isHost} />

        {gameState.status === 'connecting' && (
          <div className="card"><h2>Connecting...</h2><p className="waiting-text">● Online</p></div>
        )}

        {gameState.status === 'waiting' && (
          <Lobby
            totalPlayers={gameState.totalPlayers}
            playerNames={gameState.playerNames || {}}
            onStart={handleStartGame}
            onNewGame={handleNewGame}
            isHost={isHost}
            questionNumber={gameState.questionNumber || 0}
          />
        )}

        {(gameState.status === 'reading' || gameState.status === 'voting') && (
          <VotingScreen
            gameState={gameState}
            onVote={handleVote}
            socketId={socket.id}
            isHost={isHost}
            playerName={playerName}
          />
        )}

        {gameState.status === 'results' && (
          <ResultsScreen
            gameState={gameState}
            isHost={isHost}
            onNext={handleNextQuestion}
            onNewGame={handleNewGame}
            onVideoPlay={() => duckBg(0.05)}
            onVideoEnd={() => duckBg(musicVol)}
            socketId={socket.id}
          />
        )}
      </div>
    </>
  )
}

export default App
