// Frontend olmadan tÃ¼m oyunu terminalde oynatÄ±r. Ã–nce sunucuyu Ã§alÄ±ÅŸtÄ±r, sonra: npm run test:sim
require('dotenv').config();
const assert = require('node:assert/strict');
const { io } = require('socket.io-client');

const BASE = process.env.BASE || `http://localhost:${process.env.PORT || 3000}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const connect = () => new Promise((res) => { const s = io(BASE); s.on('connect', () => res(s)); });
const once = (s, e) => new Promise((res) => s.once(e, res));
const emit = (s, e, d) =>
  new Promise((res, rej) => s.emit(e, d, (r) => (r.ok ? res(r) : rej(new Error(`${e}: ${r.error}`)))));

async function api(path, method, body, token) {
  const r = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: r.status, data: await r.json() };
}

(async () => {
  // 1) YÃ¶netici giriÅŸi
  assert.equal((await api('/api/admin/login', 'POST', { password: 'yanlis' })).status, 401);
  const { token } = (await api('/api/admin/login', 'POST', { password: process.env.ADMIN_PASSWORD })).data;
  assert.ok(token);

  // Medya yÃ¼kleme testleri
  const deniedUpload = await fetch(BASE + '/api/upload', {
    method: 'POST',
    body: new FormData(),
  });
  assert.equal(deniedUpload.status, 401, 'Tokensiz medya yÃ¼kleme engellenmeli');

  const form = new FormData();
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/pZsAAAAASUVORK5CYII=',
    'base64'
  );
  form.append('file', new Blob([png], { type: 'image/png' }), 'test.png');

  const uploaded = await fetch(BASE + '/api/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  assert.equal(uploaded.status, 200, 'Admin medya yÃ¼kleyebilmeli');

  const uploadedData = await uploaded.json();
  assert.ok(uploadedData.url.startsWith('/uploads/'));

  const mediaCheck = await fetch(BASE + uploadedData.url);
  assert.equal(mediaCheck.status, 200, 'YÃ¼klenen medya eriÅŸilebilir olmalÄ±');

  console.log('âœ“ medya yÃ¼kleme ve eriÅŸim');
  assert.equal((await api('/api/quizzes', 'GET')).status, 401); // tokensiz eriÅŸilemez
  console.log('âœ“ yÃ¶netici giriÅŸi');

  // 2) Quiz oluÅŸtur (2 soru)
  const mkQ = (text) => ({
    text,
    timeLimit: 10,
    options: [
      { text: 'YanlÄ±ÅŸ', isCorrect: false, caption: 'OlmadÄ±!', effect: 'sad' },
      { text: 'DoÄŸru', isCorrect: true, caption: 'Harika!', effect: 'celebrate' },
    ],
  });
  const created = await api('/api/quizzes', 'POST', { title: 'Test', questions: [mkQ('Soru 1'), mkQ('Soru 2')] }, token);
  assert.equal(created.status, 201);
  const bad = await api('/api/quizzes', 'POST', { title: 'x', questions: [{ text: 'q', options: [{ text: 'a', isCorrect: true }] }] }, token);
  assert.equal(bad.status, 400); // tek ÅŸÄ±klÄ± soru reddedilmeli
  console.log('âœ“ quiz oluÅŸturma ve doÄŸrulama');

  // 3) Oyun kur, ekranÄ± ve oyuncularÄ± baÄŸla
  const host = await connect();
  const display = await connect();
  let [ali, veli, ayse] = await Promise.all([connect(), connect(), connect()]);
  const game = await emit(host, 'host:create-game', { token, quizId: created.data.id });
  assert.match(game.pin, /^\d{6}$/);
  assert.ok(game.qrDataUrl.startsWith('data:image/png'));
  await emit(display, 'display:connect', { pin: game.pin });
  await assert.rejects(emit(ali, 'host:start'), /Yetkisiz|Oyunda/); // oyuncu yÃ¶netemez
  await assert.rejects(emit(ali, 'player:join', { pin: '000000', nickname: 'x' }), /./);
  let aliJoin;

  for (const [s, name] of [[ali, 'ali'], [veli, 'veli'], [ayse, 'ayse']]) {
    const joined = await emit(s, 'player:join', { pin: game.pin, nickname: name });
    if (s === ali) aliJoin = joined;
  }

  // Oyuncu atma testi
  const zeynep = await connect();
  const zeynepJoin = await emit(zeynep, 'player:join', { pin: game.pin, nickname: 'zeynep' });
  const kickedEvent = once(zeynep, 'player:kicked');
  await emit(host, 'host:kick', { playerId: zeynepJoin.playerId });
  await kickedEvent;
  await assert.rejects(
    emit(zeynep, 'player:answer', { optionId: 0 }),
    /Oyunda/
  );
  console.log('âœ“ oyuncu atma');

  assert.ok(aliJoin.playerId);
  assert.ok(aliJoin.reconnectToken);

  const oldToken = aliJoin.reconnectToken;
  const aliReconnect = await connect();

  await assert.rejects(
    emit(aliReconnect, 'player:rejoin', {
      pin: game.pin,
      playerId: aliJoin.playerId,
      reconnectToken: '0'.repeat(64),
    }),
    /./
  );

  const rejoined = await emit(aliReconnect, 'player:rejoin', {
    pin: game.pin,
    playerId: aliJoin.playerId,
    reconnectToken: oldToken,
  });

  assert.ok(rejoined.reconnectToken);
  assert.notEqual(rejoined.reconnectToken, oldToken);

  await assert.rejects(
    emit(aliReconnect, 'player:rejoin', {
      pin: game.pin,
      playerId: aliJoin.playerId,
      reconnectToken: oldToken,
    }),
    /./
  );

  ali = aliReconnect;
  console.log('âœ“ gÃ¼venli oyuncu yeniden baÄŸlanma');
  await assert.rejects(emit(veli, 'player:join', { pin: game.pin, nickname: 'ALI' }), /./);
  console.log('âœ“ lobi:', game.pin);

  // 4) Soru dÃ¶ngÃ¼sÃ¼
  for (let i = 0; i < 2; i++) {
    const shown = once(display, 'question:show');
    await emit(host, i === 0 ? 'host:start' : 'host:next');
    const q = await shown;
    assert.ok(!JSON.stringify(q).includes('isCorrect'), 'DoÄŸru cevap ekrana sÄ±zmÄ±ÅŸ!');
    const correct = q.options.find((o) => o.text === 'DoÄŸru').id;
    const wrong = q.options.find((o) => o.text === 'YanlÄ±ÅŸ').id;

    const result = once(display, 'question:result');
    const aliFb = once(ali, 'answer:feedback');
    const veliFb = once(veli, 'answer:feedback');
    const ayseFb = once(ayse, 'answer:feedback');

    if (i === 0) {
      const paused = once(display, 'game:paused');
      await emit(host, 'host:pause');
      await paused;

      await assert.rejects(
        emit(ali, 'player:answer', { optionId: correct }),
        /cevap verilemez/i
      );

      const resumed = once(display, 'game:resumed');
      await emit(host, 'host:resume');
      await resumed;
      console.log('âœ“ duraklatma ve devam ettirme');
    }
    await emit(ali, 'player:answer', { optionId: correct });
    await assert.rejects(emit(ali, 'player:answer', { optionId: wrong }), /Zaten/);
    await sleep(400);
    await emit(veli, 'player:answer', { optionId: correct });
    if (i === 0) {
      await emit(ayse, 'player:answer', { optionId: wrong });
    } else {
      await emit(host, 'host:end-question');
      console.log('âœ“ soruyu erken bitirme');
    }

    assert.equal((await result).correctOptionId, correct);
    const [a, v, y] = await Promise.all([aliFb, veliFb, ayseFb]);
    assert.ok(a.correct && v.correct && !y.correct);
    assert.ok(a.scoreGained > v.scoreGained, 'HÄ±zlÄ± olan daha Ã§ok puan almalÄ±');
    assert.equal(y.scoreGained, 0);
    assert.equal(a.feedback.effect, 'celebrate');

    const ranking = once(display, 'ranking:show');
    await emit(host, 'host:next'); // sonuÃ§ -> sÄ±ralama
    const r = await ranking;
    assert.equal(r.ranking[0].nickname, 'ali');
    assert.equal(r.isLast, i === 1);
    console.log(`âœ“ soru ${i + 1}:`, r.ranking.map((x) => `${x.rank}.${x.nickname}=${x.score}`).join(' '));
  }

  // 5) Final
  const fin = once(display, 'game:finished');
  await emit(host, 'host:next');
  const f = await fin;
  assert.equal(f.ranking[0].nickname, 'ali');
  console.log('âœ“ final sÄ±ralamasÄ±:', f.ranking.map((x) => `${x.nickname}=${x.score}`).join(' '));

  console.log('\nTÃœM TESTLER GEÃ‡TÄ°');
  process.exit(0);
})().catch((e) => { console.error('\nâœ— TEST BAÅARISIZ:', e.message); process.exit(1); });
