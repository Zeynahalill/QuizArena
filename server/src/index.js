require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');

for (const key of ['ADMIN_PASSWORD', 'JWT_SECRET']) {
  if (!process.env[key]) {
    console.error(`HATA: ${key} .env dosyasında tanımlı olmalı (.env.example'a bak)`);
    process.exit(1);
  }
}

const { router, UPLOAD_DIR } = require('./routes');
const registerSockets = require('./sockets');

const PORT = Number(process.env.PORT || 3000);
const origins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((s) => s.trim());

const app = express();
app.use(cors({ origin: origins }));
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(UPLOAD_DIR));
app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/api', router);
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(400).json({ error: err.message });
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: origins } });
registerSockets(io);

server.listen(PORT, () => console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`));
