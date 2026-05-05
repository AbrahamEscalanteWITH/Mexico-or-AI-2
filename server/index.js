const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const questions = require('./data/questions');

const app = express();
app.use(cors());

const path = require('path');
app.use(express.static(path.join(__dirname, '../client/dist')));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let questionPool = shuffle(questions);

let gameState = {
  status: 'waiting',
  currentQuestionIndex: 0,
  timeLeft: 20,
  votes: { mexico: 0, ai: 0 },
  totalPlayers: 0,
  hasVoted: new Set(),
  scores: {},        // { socketId: number }
  socketVotes: {},   // { socketId: 'mexico'|'ai' }
  playerNames: {},   // { socketId: string }
  hostId: null,      // socket ID of the host
  questionNumber: 0,
};

let timerInterval;
let revealTimeout;
let revealDone = false;

function broadcastState() {
  const stateToSend = {
    ...gameState,
    hasVoted: Array.from(gameState.hasVoted),
    question: questionPool[gameState.currentQuestionIndex],
    totalQuestions: questionPool.length,
    scores: { ...gameState.scores },
    playerNames: { ...gameState.playerNames },
  };
  io.emit('gameState', stateToSend);
}

function advanceToResults() {
  if (revealDone) return;
  revealDone = true;
  clearTimeout(revealTimeout);
  gameState.status = 'results';
  broadcastState();
}

function startNextRound() {
  gameState.status = 'reading';
  gameState.timeLeft = 20;
  gameState.votes = { mexico: 0, ai: 0 };
  gameState.hasVoted.clear();
  gameState.socketVotes = {};
  broadcastState();

  setTimeout(() => {
    gameState.status = 'voting';
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
  }, 5000);
}

function endRound() {
  const currentQ = questionPool[gameState.currentQuestionIndex];
  const correctVote = currentQ.isAI ? 'ai' : 'mexico';

  // Award 1 pt to each player (not host) who voted correctly
  gameState.hasVoted.forEach((socketId) => {
    if (socketId === gameState.hostId) return; // host doesn't score
    const theirVote = gameState.socketVotes[socketId];
    if (theirVote === correctVote) {
      gameState.scores[socketId] = (gameState.scores[socketId] || 0) + 1;
    }
  });

  revealDone = false;
  gameState.status = 'revealing';
  broadcastState();

  if (currentQ.isAI) {
    revealTimeout = setTimeout(advanceToResults, 4000);
  } else {
    // Mexico video: client fires 'revealComplete'; 20s safety fallback
    revealTimeout = setTimeout(advanceToResults, 20000);
  }
}

io.on('connection', (socket) => {
  gameState.totalPlayers = io.engine.clientsCount;
  gameState.scores[socket.id] = gameState.scores[socket.id] || 0;
  console.log(`Connected: ${socket.id}. Total: ${gameState.totalPlayers}`);

  socket.emit('gameState', {
    ...gameState,
    hasVoted: Array.from(gameState.hasVoted),
    question: questionPool[gameState.currentQuestionIndex],
    totalQuestions: questionPool.length,
    scores: { ...gameState.scores },
    playerNames: { ...gameState.playerNames },
  });

  // Player registers their name (and optionally marks themselves as host)
  socket.on('setName', ({ name, isHost }) => {
    gameState.playerNames[socket.id] = name || 'Player';
    if (isHost) gameState.hostId = socket.id;
    broadcastState();
  });

  socket.on('startGame', () => {
    if (gameState.status === 'waiting') {
      gameState.questionNumber = 1;
      startNextRound();
    }
  });

  socket.on('revealComplete', () => {
    if (gameState.status === 'revealing') advanceToResults();
  });

  socket.on('nextQuestion', () => {
    if (gameState.status === 'results') {
      gameState.currentQuestionIndex = (gameState.currentQuestionIndex + 1) % questionPool.length;
      gameState.questionNumber += 1;
      startNextRound();
    }
  });

  socket.on('resetGame', () => {
    clearInterval(timerInterval);
    clearTimeout(revealTimeout);
    revealDone = false;
    questionPool = shuffle(questions);
    gameState.status = 'waiting';
    gameState.currentQuestionIndex = 0;
    gameState.timeLeft = 20;
    gameState.votes = { mexico: 0, ai: 0 };
    gameState.hasVoted.clear();
    gameState.scores = {};
    gameState.socketVotes = {};
    gameState.questionNumber = 0;
    // Keep names, reset scores
    for (const id of io.sockets.sockets.keys()) {
      gameState.scores[id] = 0;
    }
    broadcastState();
  });

  socket.on('vote', (voteType) => {
    // Host cannot vote
    if (socket.id === gameState.hostId) return;
    const votingAllowed = gameState.status === 'voting' || gameState.status === 'reading';
    if (!votingAllowed || gameState.hasVoted.has(socket.id)) return;

    if (voteType === 'mexico' || voteType === 'ai') {
      gameState.votes[voteType] += 1;
      gameState.hasVoted.add(socket.id);
      gameState.socketVotes[socket.id] = voteType;
      broadcastState();
    }
  });

  socket.on('disconnect', () => {
    gameState.totalPlayers = io.engine.clientsCount;
    delete gameState.playerNames[socket.id];
    if (gameState.hostId === socket.id) gameState.hostId = null;
    console.log(`Disconnected: ${socket.id}. Total: ${gameState.totalPlayers}`);
    broadcastState();
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
