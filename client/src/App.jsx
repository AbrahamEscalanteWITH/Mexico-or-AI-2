import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import Lobby from './components/Lobby'
import VotingScreen from './components/VotingScreen'
import ResultsScreen from './components/ResultsScreen'
import './App.css'

// Connect to the server dynamically based on environment
const serverUrl = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '/';
const socket = io(serverUrl)

function App() {
  const [gameState, setGameState] = useState({ status: 'connecting' })
  const [role, setRole] = useState('unassigned')

  useEffect(() => {
    socket.on('gameState', (state) => {
      setGameState(state)
    })

    return () => {
      socket.off('gameState')
    }
  }, [])

  const handleStartGame = () => {
    socket.emit('startGame')
  }

  const handleNextQuestion = () => {
    socket.emit('nextQuestion')
  }

  const handleVote = (voteType) => {
    socket.emit('vote', voteType)
  }

  if (role === 'unassigned') {
    return (
      <div className="app-container fade-enter fade-enter-active">
        <h1>México or AI</h1>
        <div className="card">
          <h2>Choose your role</h2>
          <div className="voting-buttons" style={{ flexDirection: 'column', gap: '1rem' }}>
            <button className="btn-ai" onClick={() => setRole('host')}>👑 Host Game</button>
            <button className="btn-mexico" onClick={() => setRole('player')}>🎮 Join as Player</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container fade-enter fade-enter-active">
      <h1>México or AI {role === 'host' ? '(Host)' : ''}</h1>
      
      {gameState.status === 'connecting' && (
        <div className="card">
          <h2>Connecting to server...</h2>
        </div>
      )}

      {gameState.status === 'waiting' && (
        <Lobby 
          totalPlayers={gameState.totalPlayers} 
          onStart={handleStartGame} 
          isHost={role === 'host'}
        />
      )}

      {gameState.status === 'voting' && (
        <VotingScreen 
          gameState={gameState} 
          onVote={handleVote} 
          socketId={socket.id}
        />
      )}

      {gameState.status === 'results' && (
        <ResultsScreen 
          gameState={gameState} 
          isHost={role === 'host'}
          onNext={handleNextQuestion}
        />
      )}
    </div>
  )
}

export default App
