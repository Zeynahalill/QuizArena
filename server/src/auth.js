const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const digest = (s) => crypto.createHash('sha256').update(String(s)).digest();

function checkPassword(input) {
  return crypto.timingSafeEqual(digest(input), digest(process.env.ADMIN_PASSWORD));
}

function signToken() {
  return jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '12h' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET).role === 'admin';
  } catch {
    return false;
  }
}

function requireAdmin(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer /, '');
  if (!verifyToken(token)) return res.status(401).json({ error: 'Yetkisiz' });
  next();
}

module.exports = { checkPassword, signToken, verifyToken, requireAdmin };
