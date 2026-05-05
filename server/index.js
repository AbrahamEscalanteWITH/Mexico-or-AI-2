const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const questions = require('./data/questions');

const app = express();
app.use(cors());

// Serve static files from the React app built dist directory
const path = require('path');
app.use(express.static(path.join(__dirname, '../client/dist')));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

let gameState = {
  status: 'waiting', // 'waiting', 'voting', 'results'
  currentQuestionIndex: 0,
  timeLeft: 20,
  votes: { mexico: 0, ai: 0 },
  totalPlayers: 0,
  hasVoted: new Set() // Store socket IDs
};

let timerInterval;

function broadcastState() {
  const stateToSend = {
    ...gameState,
    hasVoted: Array.from(gameState.hasVoted),
    question: questions[gameState.currentQuestionIndex]
  };
  io.emit('gameState', stateToSend);
}

function startNextRound() {
  gameState.status = 'voting';
  gameState.timeLeft = 20;
  gameState.votes = { mexico: 0, ai: 0 };
  gameState.hasVoted.clear();
  
  broadcastState();

  timerInterval = setInterval(() => {
    gameState.timeLeft -= 1;
    if (gameState.timeLeft <= 0) {
      clearInterval(timerInterval);
      endRound();
    } else {
      broadcastState();
    }
  }, 1000);
}

function endRound() {
  gameState.status = 'results';
  broadcastState();
}

io.on('connection', (socket) => {
  gameState.totalPlayers = io.engine.clientsCount;
  console.log(`Player connected. Total: ${gameState.totalPlayers}`);
  
  // Send current state to newly connected player
  socket.emit('gameState', {
    ...gameState,
    hasVoted: Array.from(gameState.hasVoted),
    question: questions[gameState.currentQuestionIndex]
  });

  socket.on('startGame', () => {
    if (gameState.status === 'waiting') {
      startNextRound();
    }
  });

  socket.on('nextQuestion', () => {
    if (gameState.status === 'results') {
      gameState.currentQuestionIndex = (gameState.currentQuestionIndex + 1) % questions.length;
      startNextRound();
    }
  });

  socket.on('vote', (voteType) => {
    if (gameState.status !== 'voting' || gameState.hasVoted.has(socket.id)) {
      return;
    }
    
    if (voteType === 'mexico' || voteType === 'ai') {
      gameState.votes[voteType] += 1;
      gameState.hasVoted.add(socket.id);
      broadcastState();
    }
  });

  socket.on('disconnect', () => {
    gameState.totalPlayers = io.engine.clientsCount;
    console.log(`Player disconnected. Total: ${gameState.totalPlayers}`);
    broadcastState();
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
