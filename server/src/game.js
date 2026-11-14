const {
  randomInt,
  randomUUID,
  randomBytes,
  createHash,
  timingSafeEqual,
} = require('crypto');
const QRCode = require('qrcode');
const { calculateScore } = require('./scoring');
const { saveResults } = require('./quizRepo');

const CLIENT_URL = (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0].trim();
const RESULT_TO_RANKING_MS = Number(process.env.RESULT_TO_RANKING_MS || 5000);

const games = new Map(); // pin -> Game

class Game {
  constructor(io, pin, quiz) {
    this.io = io;
    this.pin = pin;
    this.quiz = quiz;
    this.state = 'lobby'; // lobby | question | result | ranking | finished
    this.paused = false;
    this.players = new Map(); // playerId -> player
    this.qIndex = -1;
    this.timer = null;
    this.rankingTimer = null;
    this.startedAt = 0;
    this.deadline = 0;
    this.remainingMs = 0;
    this.pausedAt = 0;
    this.pausedTotal = 0;
    this.qrDataUrl = null;
    this.lastCorrectOptionId = null;
  }

  // ---------- yardımcılar ----------
  room(role) {
    return `game:${this.pin}:${role}`;
  }
  get question() {
    return this.quiz.questions[this.qIndex];
  }
  get total() {
    return this.quiz.questions.length;
  }
  emitScreens(event, data) {
    this.io.to(this.room('host')).to(this.room('display')).emit(event, data);
  }
  emitAll(event, data) {
    this.io.to(this.room('host')).to(this.room('display')).to(this.room('players')).emit(event, data);
  }
  currentRemaining() {
    return this.paused ? this.remainingMs : Math.max(0, this.deadline - Date.now());
  }
  answeredCount() {
    return [...this.players.values()].filter((p) => p.answers.has(this.qIndex)).length;
  }

  async connectInfo() {
    const joinUrl = `${CLIENT_URL}/join?pin=${this.pin}`;
    const displayUrl = `${CLIENT_URL}/display?pin=${this.pin}`;
    if (!this.qrDataUrl) this.qrDataUrl = await QRCode.toDataURL(joinUrl, { margin: 1, width: 400 });
    return { pin: this.pin, joinUrl, displayUrl, qrDataUrl: this.qrDataUrl };
  }

  status() {
    return {
      state: this.state,
      paused: this.paused,
      questionNumber: this.qIndex + 1,
      totalQuestions: this.total,
      remainingMs: this.state === 'question' ? this.currentRemaining() : 0,
      answered: this.state === 'question' ? this.answeredCount() : 0,
      playerCount: this.players.size,
    };
  }
  emitStatus() {
    this.io.to(this.room('host')).emit('host:status', this.status());
  }

  snapshot(playerId) {
    const snap = { state: this.state, paused: this.paused, lobby: this.lobbyInfo(), status: this.status() };
    if (this.state === 'question') snap.question = this.publicQuestion();
    if (this.state === 'result' || this.state === 'ranking') snap.correctOptionId = this.lastCorrectOptionId;
    if (this.state === 'ranking' || this.state === 'finished') snap.ranking = this.ranking();
    if (playerId) snap.answered = !!this.players.get(playerId)?.answers.has(this.qIndex);
    return snap;
  }

  // ---------- bağlantı ve oyuncular ----------
  attach(socket, role, player) {
    socket.join(this.room(role));
    socket.data.pin = this.pin;
    socket.data.role = role;
    if (player) {
      socket.data.playerId = player.id;
      player.socketId = socket.id;
      player.connected = true;
    }
  }

  lobbyInfo() {
    const players = [...this.players.values()];
    return {
      count: players.length,
      connected: players.filter((p) => p.connected).length,
      players: players.map((p) => ({ id: p.id, nickname: p.nickname, connected: p.connected })),
    };
  }
  broadcastLobby() {
    this.emitScreens('lobby:update', this.lobbyInfo());
  }

  addPlayer(socket, nickname) {
    if (this.state !== 'lobby') {
      throw new Error('Oyun başladı, artık katılınamaz');
    }

    const name = String(nickname || '').trim().slice(0, 20);
    if (!name) throw new Error('İsim gerekli');

    const taken = [...this.players.values()].some(
      (p) => p.nickname.toLowerCase() === name.toLowerCase()
    );

    if (taken) throw new Error('Bu isim alınmış');

    const reconnectToken = randomBytes(32).toString('hex');

    const player = {
      id: randomUUID(),
      nickname: name,
      socketId: socket.id,
      reconnectTokenHash: createHash('sha256')
        .update(reconnectToken)
        .digest('hex'),
      score: 0,
      totalTimeMs: 0,
      connected: true,
      answers: new Map(),
    };

    this.players.set(player.id, player);
    this.attach(socket, 'players', player);
    this.broadcastLobby();

    return { player, reconnectToken };
  }

  rejoinPlayer(socket, playerId, reconnectToken) {
    const player = this.players.get(playerId);

    if (!player) {
      throw new Error('Oyuncu bulunamadı');
    }

    if (
      typeof reconnectToken !== 'string' ||
      !/^[a-f0-9]{64}$/i.test(reconnectToken)
    ) {
      throw new Error('Geçersiz yeniden bağlanma anahtarı');
    }

    const providedHash = createHash('sha256')
      .update(reconnectToken)
      .digest();

    const storedHash = Buffer.from(player.reconnectTokenHash, 'hex');

    if (
      storedHash.length !== providedHash.length ||
      !timingSafeEqual(storedHash, providedHash)
    ) {
      throw new Error('Geçersiz yeniden bağlanma anahtarı');
    }

    const oldSocket = this.io.sockets.sockets.get(player.socketId);

    if (oldSocket && oldSocket.id !== socket.id) {
      oldSocket.emit('player:session-replaced');
      oldSocket.leave(this.room('players'));
      oldSocket.data.role = null;
      oldSocket.data.playerId = null;
    }

    const newReconnectToken = randomBytes(32).toString('hex');

    player.reconnectTokenHash = createHash('sha256')
      .update(newReconnectToken)
      .digest('hex');

    this.attach(socket, 'players', player);
    this.broadcastLobby();

    return {
      player,
      reconnectToken: newReconnectToken,
    };
  }
  handleDisconnect(socket) {
    if (socket.data.role !== 'players') return;
    const player = this.players.get(socket.data.playerId);
    if (player && player.socketId === socket.id) {
      player.connected = false;
      this.broadcastLobby();
      this.checkAllAnswered();
    }
  }

  kick(playerId) {
    const player = this.players.get(playerId);
    if (!player) throw new Error('Oyuncu bulunamadı');
    this.players.delete(playerId);
    const sock = this.io.sockets.sockets.get(player.socketId);
    if (sock) {
      sock.emit('player:kicked');
      sock.leave(this.room('players'));
      sock.data.role = null;
    }
    this.broadcastLobby();
    this.checkAllAnswered();
  }

  // ---------- oyun akışı ----------
  start() {
    if (this.state !== 'lobby') throw new Error('Oyun zaten başladı');
    if (this.players.size === 0) throw new Error('Lobide kimse yok');
    this.nextQuestion();
  }

  nextQuestion() {
    clearTimeout(this.rankingTimer);
    this.qIndex++;
    const q = this.question;
    this.state = 'question';
    this.paused = false;
    this.pausedTotal = 0;
    this.startedAt = Date.now();
    this.remainingMs = q.timeLimit * 1000;
    this.deadline = this.startedAt + this.remainingMs;
    this.timer = setTimeout(() => this.endQuestion(), this.remainingMs);
    this.emitAll('question:show', this.publicQuestion());
    this.emitStatus();
  }

  // Doğru cevap burada ASLA bulunmaz
  publicQuestion() {
    const q = this.question;
    return {
      index: this.qIndex,
      total: this.total,
      text: q.text,
      mediaUrl: q.mediaUrl,
      timeLimit: q.timeLimit,
      remainingMs: this.currentRemaining(),
      options: q.options.map((o) => ({ id: o.id, text: o.text })),
    };
  }

  submitAnswer(playerId, optionId) {
    if (this.state !== 'question' || this.paused) throw new Error('Şu an cevap verilemez');
    if (Date.now() > this.deadline) throw new Error('Süre doldu');
    const player = this.players.get(playerId);
    if (!player) throw new Error('Oyuncu bulunamadı');
    if (player.answers.has(this.qIndex)) throw new Error('Zaten cevapladın');
    if (!this.question.options.some((o) => o.id === optionId)) throw new Error('Geçersiz şık');
    player.answers.set(this.qIndex, {
      optionId,
      responseMs: Date.now() - this.startedAt - this.pausedTotal,
    });
    this.io.to(this.room('host')).emit('answer:count', {
      answered: this.answeredCount(),
      total: this.players.size,
    });
    this.checkAllAnswered();
  }

  checkAllAnswered() {
    if (this.state !== 'question' || this.paused) return;
    const connected = [...this.players.values()].filter((p) => p.connected);
    if (connected.length > 0 && connected.every((p) => p.answers.has(this.qIndex))) this.endQuestion();
  }

  endQuestion() {
    if (this.state !== 'question') throw new Error('Şu an açık bir soru yok');
    clearTimeout(this.timer);
    this.paused = false;
    this.state = 'result';
    const q = this.question;
    const correct = q.options.find((o) => o.isCorrect);
    this.lastCorrectOptionId = correct.id;

    for (const p of this.players.values()) {
      const a = p.answers.get(this.qIndex);
      if (!a) continue;
      a.correct = a.optionId === correct.id;
      a.gained = calculateScore({ correct: a.correct, responseMs: a.responseMs, timeLimitMs: q.timeLimit * 1000 });
      p.score += a.gained;
      if (a.correct) p.totalTimeMs += a.responseMs;
    }

    const ranking = this.ranking();
    // Ana ekran ve yönetici: sadece doğru cevap
    this.emitScreens('question:result', { correctOptionId: correct.id, correctText: correct.text });
    // Her katılımcıya kendi geri bildirimi (seçtiği şıkkın GIF/yazı/efekti)
    for (const p of this.players.values()) {
      const a = p.answers.get(this.qIndex);
      const chosen = a && q.options.find((o) => o.id === a.optionId);
      this.io.to(p.socketId).emit('answer:feedback', {
        answered: !!a,
        correct: !!a && a.correct,
        scoreGained: a ? a.gained : 0,
        totalScore: p.score,
        rank: ranking.find((r) => r.playerId === p.id).rank,
        feedback: chosen
          ? { gifUrl: chosen.gifUrl, caption: chosen.caption, effect: chosen.effect }
          : { gifUrl: null, caption: null, effect: 'timeup' },
      });
    }
    this.emitStatus();
    this.rankingTimer = setTimeout(() => this.showRanking(), RESULT_TO_RANKING_MS);
  }

  showRanking() {
    if (this.state !== 'result') return;
    clearTimeout(this.rankingTimer);
    this.state = 'ranking';
    this.emitScreens('ranking:show', {
      ranking: this.ranking(),
      isLast: this.qIndex + 1 >= this.total,
    });
    this.emitStatus();
  }

  // Yönetici "Sonraki soru" düğmesi
  next() {
    if (this.state === 'result') return this.showRanking();
    if (this.state !== 'ranking') throw new Error('Şu an sonraki soruya geçilemez');
    if (this.qIndex + 1 >= this.total) this.finish();
    else this.nextQuestion();
  }

  pause() {
    if (this.state !== 'question' || this.paused) return;
    this.paused = true;
    this.remainingMs = Math.max(0, this.deadline - Date.now());
    this.pausedAt = Date.now();
    clearTimeout(this.timer);
    this.emitAll('game:paused', { remainingMs: this.remainingMs });
    this.emitStatus();
  }

  resume() {
    if (!this.paused) return;
    this.paused = false;
    this.pausedTotal += Date.now() - this.pausedAt;
    this.deadline = Date.now() + this.remainingMs;
    this.timer = setTimeout(() => this.endQuestion(), this.remainingMs);
    this.emitAll('game:resumed', { remainingMs: this.remainingMs });
    this.emitStatus();
  }

  finish() {
    if (this.state === 'finished') return;
    clearTimeout(this.timer);
    clearTimeout(this.rankingTimer);
    this.state = 'finished';
    this.paused = false;
    const ranking = this.ranking();
    saveResults(this.quiz.id, this.pin, ranking);
    this.emitAll('game:finished', { ranking });
    this.emitStatus();
    setTimeout(() => games.delete(this.pin), 30 * 60 * 1000).unref(); // 30 dk sonra bellekten sil
  }

  // Puana göre, eşitlikte doğru cevaplarda toplam süresi kısa olan önde
  ranking() {
    return [...this.players.values()]
      .sort((a, b) => b.score - a.score || a.totalTimeMs - b.totalTimeMs)
      .map((p, i) => ({ rank: i + 1, playerId: p.id, nickname: p.nickname, score: p.score }));
  }
}

function createGame(io, quiz) {
  let pin;
  do {
    pin = String(randomInt(100000, 1000000));
  } while (games.has(pin));
  const game = new Game(io, pin, quiz);
  games.set(pin, game);
  return game;
}

function getGame(pin) {
  const game = games.get(String(pin || ''));
  if (!game) throw new Error('Geçersiz PIN');
  return game;
}

module.exports = { createGame, getGame, games };
