import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import Lobby from './components/Lobby'
import VotingScreen from './components/VotingScreen'
import ResultsScreen from './components/ResultsScreen'
import SplashReveal from './components/SplashReveal'
import FinalPresenterReveal from './components/FinalPresenterReveal'
import IntroReveal from './components/IntroReveal'
import WinnerScreen from './components/WinnerScreen'
import { useAudio } from './hooks/useAudio'
import './App.css'

const serverUrl = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '/';
const socket = io(serverUrl)

function App() {
  const [gameState, setGameState] = useState({ status: 'connecting' })
  const [role, setRole] = useState('unassigned')       // 'unassigned' | 'naming' | 'host' | 'player' | 'host-auth'
  const [playerName, setPlayerName] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [hostPasswordInput, setHostPasswordInput] = useState('')
  const { playSfx, stopBg, fadeSfx } = useAudio(gameState.globalMute)
  const prevStatusRef = useRef(null)
  const bgStarted = useRef(false)
  const bgAudioRef = useRef(null)

  useEffect(() => {
    socket.on('gameState', (state) => setGameState(state))
    return () => { socket.off('gameState') }
  }, [])



  useEffect(() => {
    if (bgAudioRef.current) bgAudioRef.current.muted = gameState.globalMute
  }, [gameState.globalMute])

  const duckBg = (volume) => {
    if (bgAudioRef.current) bgAudioRef.current.volume = volume
  }

  const startBg = (vol = 0.1) => {
    if (!bgStarted.current) {
      bgStarted.current = true
      const bg = new Audio('/audio/Fondo General.mp3')
      bg.loop = true
      bg.volume = vol
      bg.muted = gameState.globalMute
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
      
      const bg = new Audio('/audio/Cara a Cara.mp3')
      bg.loop = false // Play it once for the question duration
      bg.volume = 0.1 // 10% volume
      bg.muted = gameState.globalMute
      bg.play().catch(() => {})
      bgAudioRef.current = bg
      bgStarted.current = true
    }

    if (curr === 'revealing') {
      if (bgAudioRef.current) bgAudioRef.current.volume = 0.05
    }

    if (curr === 'waiting' && prev === 'results') {
      if (bgAudioRef.current) bgAudioRef.current.pause()
      bgStarted.current = false
      startBg()
    }

    if (curr === 'winner_reveal' || curr === 'intro') {
      if (bgAudioRef.current) bgAudioRef.current.pause()
      bgStarted.current = false
    }

    if (curr === 'game_over' && prev !== 'game_over') {
      if (bgAudioRef.current) bgAudioRef.current.pause()
      bgStarted.current = false
      playSfx('/audio/Tema del Ganador.mp3', 0.1)
      
      // Resume background music after 44 seconds
      setTimeout(() => {
        if (gameState.status === 'game_over' || prevStatusRef.current === 'game_over') {
          startBg()
        }
      }, 44000)
    }
  }, [gameState.status])

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handlePickHost = () => {
    startBg()
    setRole('host-auth')
  }

  const handleHostAuthSubmit = (e) => {
    e.preventDefault()
    if (hostPasswordInput.toLowerCase() === 'becka') {
      socket.emit('setName', { name: 'Host', isHost: true })
      setPlayerName('Host')
      setRole('host')
    } else {
      alert("Incorrect password!")
    }
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

  const handleStartGame  = () => { playSfx('/audio/Sting Principal.mp3', 0.2); socket.emit('startGame') }
  const handleNewGame    = () => { playSfx('/audio/Sting Principal.mp3', 0.2); socket.emit('resetGame') }
  const handleNextQuestion = () => { if (bgAudioRef.current) bgAudioRef.current.volume = 0.1; socket.emit('nextQuestion') }
  const handleVote       = (voteType) => socket.emit('vote', voteType)

  // ── Host volume dial ──────────────────────────────────────────────────────
  const renderVolumeDial = () => (
    <div style={{
      position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 10000,
      background: 'rgba(13,13,18,0.95)', border: '2px solid var(--rosa-mexicano)',
      borderRadius: '8px', padding: '0.6rem 1rem', display: 'flex',
      flexDirection: 'column', alignItems: 'center', gap: '0.3rem',
      backdropFilter: 'blur(8px)', boxShadow: '0 0 20px rgba(228,0,124,0.25)', minWidth: '130px',
    }}>
      <button 
        onClick={() => socket.emit('toggleMute', !gameState.globalMute)} 
        style={{ 
          background: gameState.globalMute ? 'rgba(228,0,124,0.3)' : 'transparent', 
          border: '1px solid var(--rosa-mexicano)', 
          borderRadius: '4px',
          color: 'var(--amarillo-brillante)', 
          cursor: 'pointer', 
          marginTop: '5px',
          padding: '4px 8px',
          fontFamily: "'Bebas Neue', sans-serif",
          letterSpacing: '2px',
          fontSize: '0.7rem'
        }}
      >
        {gameState.globalMute ? '🔇 UNMUTE ALL' : '🔊 MUTE ALL'}
      </button>
    </div>
  )

  const Header = ({ showHostBadge = false }) => (
    <>
      <div className="tv-channel-bar"><span>◈</span> CANAL 5 CDMX <span>◈</span> LIVE <span>◈</span></div>
      <h1 className="main-title">
        Mexico<br/>or AI?
        {showHostBadge && <span className="host-badge">HOST</span>}
      </h1>
    </>
  )

  // ── 1. Role selection ─────────────────────────────────────────────────────
  if (role === 'unassigned') {
    return (
      <div className="app-container">
        <Header />
        <div className="card">
          <h2>How are you playing?</h2>
          <div className="banner-strip">Select your role</div>
          <div className="role-selection">
            {!gameState.hasHost && (
              <button className="btn-start-big" onClick={handlePickHost}>👑 &nbsp; I'm the Host</button>
            )}
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

  // ── Host Authentication ───────────────────────────────────────────────────
  if (role === 'host-auth') {
    return (
      <div className="app-container">
        <Header />
        <div className="card">
          <h2>Host Authentication</h2>
          <div className="banner-strip">Enter password</div>
          <form onSubmit={handleHostAuthSubmit} style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <input
              type="password"
              autoFocus
              placeholder="Password..."
              value={hostPasswordInput}
              onChange={e => setHostPasswordInput(e.target.value)}
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
            <p style={{ color: 'var(--cyan-mexicano)', fontSize: '0.9rem', marginTop: '-0.5rem' }}>Hint: Name of your pet</p>
            <button type="submit" className="btn-start-big" style={{ marginTop: 0 }}>
              Unlock Host
            </button>
          </form>
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
      <div className="app-container">
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
      {isHost && renderVolumeDial()}

      {gameState.status === 'revealing' && gameState.question && (
        <SplashReveal question={gameState.question} playSfx={playSfx} fadeSfx={fadeSfx} socket={socket} />
      )}

      {gameState.status === 'intro' && (
        <IntroReveal
          socket={socket}
          isHost={isHost}
        />
      )}

      {gameState.status === 'winner_reveal' && (
        <FinalPresenterReveal
          socket={socket}
          isHost={isHost}
        />
      )}

      <div className="app-container">
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
            playSfx={playSfx}
          />
        )}

        {gameState.status === 'results' && (
          <ResultsScreen
            gameState={gameState}
            isHost={isHost}
            onNext={handleNextQuestion}
            onNewGame={handleNewGame}
            onVideoPlay={() => duckBg(0.05)}
            onVideoEnd={() => duckBg(0.1)}
            socketId={socket.id}
            socket={socket}
          />
        )}



        {gameState.status === 'game_over' && (
          <WinnerScreen
            gameState={gameState}
            socketId={socket.id}
            isHost={isHost}
            onNewGame={handleNewGame}
          />
        )}
      </div>
    </>
  )
}

export default App
