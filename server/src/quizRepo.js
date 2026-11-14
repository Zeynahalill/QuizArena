const db = require('./db');

function getQuiz(id) {
  const quiz = db.prepare('SELECT id, title FROM quizzes WHERE id = ?').get(id);
  if (!quiz) return null;
  const questions = db.prepare('SELECT * FROM questions WHERE quiz_id = ? ORDER BY position').all(id);
  const optStmt = db.prepare('SELECT * FROM options WHERE question_id = ? ORDER BY position');
  quiz.questions = questions.map((q) => ({
    id: q.id,
    text: q.text,
    mediaUrl: q.media_url,
    timeLimit: q.time_limit,
    options: optStmt.all(q.id).map((o) => ({
      id: o.id,
      text: o.text,
      isCorrect: !!o.is_correct,
      gifUrl: o.gif_url,
      caption: o.caption,
      effect: o.effect,
    })),
  }));
  return quiz;
}

function listQuizzes() {
  return db
    .prepare(
      `SELECT q.id, q.title, q.created_at AS createdAt,
        (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) AS questionCount
       FROM quizzes q ORDER BY q.id DESC`
    )
    .all();
}

const saveQuiz = db.transaction((data, existingId) => {
  let id = existingId;
  if (id) {
    db.prepare('UPDATE quizzes SET title = ? WHERE id = ?').run(data.title, id);
    db.prepare('DELETE FROM questions WHERE quiz_id = ?').run(id); // şıklar CASCADE ile silinir
  } else {
    id = Number(db.prepare('INSERT INTO quizzes (title) VALUES (?)').run(data.title).lastInsertRowid);
  }
  const insQ = db.prepare(
    'INSERT INTO questions (quiz_id, position, text, media_url, time_limit) VALUES (?, ?, ?, ?, ?)'
  );
  const insO = db.prepare(
    'INSERT INTO options (question_id, position, text, is_correct, gif_url, caption, effect) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  data.questions.forEach((q, qi) => {
    const qid = Number(insQ.run(id, qi, q.text, q.mediaUrl ?? null, q.timeLimit).lastInsertRowid);
    q.options.forEach((o, oi) => {
      insO.run(qid, oi, o.text, o.isCorrect ? 1 : 0, o.gifUrl ?? null, o.caption ?? null, o.effect ?? null);
    });
  });
  return id;
});

function deleteQuiz(id) {
  return db.prepare('DELETE FROM quizzes WHERE id = ?').run(id).changes > 0;
}

const saveResults = db.transaction((quizId, pin, ranking) => {
  const ins = db.prepare('INSERT INTO game_results (quiz_id, pin, nickname, score, rank) VALUES (?, ?, ?, ?, ?)');
  ranking.forEach((r) => ins.run(quizId, pin, r.nickname, r.score, r.rank));
});

module.exports = { getQuiz, listQuizzes, saveQuiz, deleteQuiz, saveResults };
