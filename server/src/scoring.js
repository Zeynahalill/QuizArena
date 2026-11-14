// Doğruysa 500-1000 puan: ne kadar hızlı cevaplandıysa o kadar yüksek. Yanlışsa 0.
function calculateScore({ correct, responseMs, timeLimitMs }) {
  if (!correct) return 0;
  const ratio = Math.min(1, Math.max(0, 1 - responseMs / timeLimitMs));
  return Math.round(500 + 500 * ratio);
}

module.exports = { calculateScore };
