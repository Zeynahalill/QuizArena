const { verifyToken } = require('./auth');
const { getQuiz } = require('./quizRepo');
const { createGame, getGame, games } = require('./game');

module.exports = function registerSockets(io) {
  io.on('connection', (socket) => {
    // Her olay: (veri, ack) -> ack({ ok: true, ... }) veya ack({ ok: false, error })
    const on = (event, fn) =>
      socket.on(event, async (data, cb) => {
        const reply = typeof cb === 'function' ? cb : () => {};
        try {
          reply({ ok: true, ...(await fn(data || {})) });
        } catch (e) {
          reply({ ok: false, error: e.message });
        }
      });

    // Sadece yönetici odasına katılmış soket yönetim komutu verebilir
    const hostGame = () => {
      const game = games.get(socket.data.pin);
      if (!game || socket.data.role !== 'host') throw new Error('Yetkisiz');
      return game;
    };

    on('host:create-game', async ({ token, quizId }) => {
      if (!verifyToken(token)) throw new Error('Yetkisiz');
      const quiz = getQuiz(Number(quizId));
      if (!quiz) throw new Error('Quiz bulunamadı');
      const game = createGame(io, quiz);
      game.attach(socket, 'host');
      return { ...(await game.connectInfo()), state: game.state };
    });

    on('host:reconnect', async ({ token, pin }) => {
      if (!verifyToken(token)) throw new Error('Yetkisiz');
      const game = getGame(pin);
      game.attach(socket, 'host');
      return { ...(await game.connectInfo()), snapshot: game.snapshot() };
    });

    on('display:connect', async ({ pin }) => {
      const game = getGame(pin);
      game.attach(socket, 'display');
      return { ...(await game.connectInfo()), snapshot: game.snapshot() };
    });

    on('player:join', ({ pin, nickname }) => {
      const result = getGame(pin).addPlayer(socket, nickname);

      return {
        playerId: result.player.id,
        nickname: result.player.nickname,
        reconnectToken: result.reconnectToken,
      };
    });

    on('player:rejoin', ({ pin, playerId, reconnectToken }) => {
      const game = getGame(pin);
      const result = game.rejoinPlayer(socket, playerId, reconnectToken);

      return {
        playerId: result.player.id,
        nickname: result.player.nickname,
        reconnectToken: result.reconnectToken,
        snapshot: game.snapshot(result.player.id),
      };
    });

    on('player:answer', ({ optionId }) => {
      const game = games.get(socket.data.pin);
      if (!game || socket.data.role !== 'players') throw new Error('Oyunda değilsin');
      game.submitAnswer(socket.data.playerId, Number(optionId));
      return {};
    });

    const hostActions = {
      'host:start': (g) => g.start(),
      'host:next': (g) => g.next(),
      'host:end-question': (g) => g.endQuestion(),
      'host:pause': (g) => g.pause(),
      'host:resume': (g) => g.resume(),
      'host:finish': (g) => g.finish(),
    };
    for (const [event, action] of Object.entries(hostActions)) {
      on(event, () => {
        action(hostGame());
        return {};
      });
    }
    on('host:kick', ({ playerId }) => {
      hostGame().kick(playerId);
      return {};
    });

    socket.on('disconnect', () => {
      const game = games.get(socket.data.pin);
      if (game) game.handleDisconnect(socket);
    });
  });
};
