const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const multer = require('multer');
const { z } = require('zod');
const { checkPassword, signToken, requireAdmin } = require('./auth');
const repo = require('./quizRepo');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const optionSchema = z.object({
  text: z.string().min(1),
  isCorrect: z.boolean(),
  gifUrl: z.string().nullish(),
  caption: z.string().nullish(),
  effect: z.enum(['celebrate', 'sad', 'laugh', 'surprise', 'timeup']).nullish(),
});
const questionSchema = z.object({
  text: z.string().min(1),
  mediaUrl: z.string().nullish(),
  timeLimit: z.number().int().min(5).max(120).default(20),
  options: z
    .array(optionSchema)
    .min(2)
    .max(6)
    .refine((o) => o.filter((x) => x.isCorrect).length === 1, 'Tam olarak bir doğru şık olmalı'),
});
const quizSchema = z.object({
  title: z.string().min(1),
  questions: z.array(questionSchema).min(1),
});

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) => cb(null, crypto.randomUUID() + path.extname(file.originalname).toLowerCase()),
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /^(image\/(png|jpe?g|gif|webp)|video\/(mp4|webm))$/.test(file.mimetype);
    cb(ok ? null : new Error('Sadece png, jpg, gif, webp, mp4, webm yüklenebilir'), ok);
  },
});

const router = express.Router();

router.post('/admin/login', (req, res) => {
  if (!checkPassword(req.body?.password ?? '')) return res.status(401).json({ error: 'Şifre yanlış' });
  res.json({ token: signToken() });
});

function parseQuiz(req, res) {
  const parsed = quizSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'Geçersiz quiz',
      details: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
    });
    return null;
  }
  return parsed.data;
}

router.get('/quizzes', requireAdmin, (req, res) => res.json(repo.listQuizzes()));

router.get('/quizzes/:id', requireAdmin, (req, res) => {
  const quiz = repo.getQuiz(Number(req.params.id));
  if (!quiz) return res.status(404).json({ error: 'Quiz bulunamadı' });
  res.json(quiz);
});

router.post('/quizzes', requireAdmin, (req, res) => {
  const data = parseQuiz(req, res);
  if (!data) return;
  res.status(201).json(repo.getQuiz(repo.saveQuiz(data)));
});

router.put('/quizzes/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!repo.getQuiz(id)) return res.status(404).json({ error: 'Quiz bulunamadı' });
  const data = parseQuiz(req, res);
  if (!data) return;
  res.json(repo.getQuiz(repo.saveQuiz(data, id)));
});

router.delete('/quizzes/:id', requireAdmin, (req, res) => {
  if (!repo.deleteQuiz(Number(req.params.id))) return res.status(404).json({ error: 'Quiz bulunamadı' });
  res.json({ ok: true });
});

router.post('/upload', requireAdmin, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Dosya yok' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

module.exports = { router, UPLOAD_DIR };
