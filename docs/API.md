# Backend API Sözleşmesi

Sunucu: `http://<sunucu-ip>:3000`. Frontend ve backend bu dosyaya uyar. Değişiklik olursa önce burası güncellenir.

## Genel kurallar
- Tüm socket olayları **ack** ile cevap verir: `{ ok: true, ... }` veya `{ ok: false, error: "mesaj" }`.
  Örnek: `socket.emit('player:join', {pin, nickname}, (res) => { if (!res.ok) alert(res.error) })`
- Yönetici REST uçları `Authorization: Bearer <token>` ister. Token `/api/admin/login` ile alınır (12 saat geçerli).
- Medya adresleri göreli gelir (`/uploads/abc.png`). Ekranda gösterirken başına sunucu adresini ekle.
- **Doğru cevap hiçbir zaman soru ile gelmez.** Sadece süre bitince `question:result` ile gelir.

## REST
| Uç | Açıklama |
|---|---|
| `POST /api/admin/login` `{password}` | `{token}` döner. Yanlışsa 401 |
| `GET /api/quizzes` | Quiz listesi: `[{id,title,createdAt,questionCount}]` |
| `GET /api/quizzes/:id` | Tam quiz (doğru şıklar dahil) |
| `POST /api/quizzes` | Quiz oluştur. Gövde aşağıda |
| `PUT /api/quizzes/:id` | Quiz'i komple değiştir (aynı gövde) |
| `DELETE /api/quizzes/:id` | Sil |
| `POST /api/upload` (multipart, alan adı `file`) | `{url}` döner. png/jpg/gif/webp/mp4/webm, en fazla 50 MB |

Quiz gövdesi:
```json
{
  "title": "Gazebo ve ROS",
  "questions": [{
    "text": "ROS nedir?",
    "mediaUrl": "/uploads/x.png",
    "timeLimit": 20,
    "options": [
      { "text": "Robot İşletim Sistemi", "isCorrect": true,  "gifUrl": "/uploads/a.gif", "caption": "Aferin!", "effect": "celebrate" },
      { "text": "Bir oyun",              "isCorrect": false, "effect": "sad" }
    ]
  }]
}
```
- `mediaUrl`, `gifUrl`, `caption`, `effect` isteğe bağlı. `effect`: `celebrate | sad | laugh | surprise | timeup`
- 2-6 şık, **tam bir** doğru şık. `timeLimit` 5-120 sn. Hatalı gövdede 400 ve `details` listesi döner.

## Socket olayları

### Yönetici (dashboard)
| Olay (istemci → sunucu) | Veri | Cevap |
|---|---|---|
| `host:create-game` | `{token, quizId}` | `{pin, joinUrl, displayUrl, qrDataUrl}` |
| `host:reconnect` | `{token, pin}` | Aynı + `snapshot` (sayfa yenilenince kullan) |
| `host:start` | — | Yarışmayı başlatır, ilk soru gider |
| `host:next` | — | Sonuçtayken sıralamaya, sıralamadayken sonraki soruya (son soruysa finale) geçer |
| `host:end-question` | — | Süreyi bitirir |
| `host:pause` / `host:resume` | — | Soruyu durdurur / devam ettirir |
| `host:kick` | `{playerId}` | Katılımcıyı çıkarır |
| `host:finish` | — | Oyunu bitirir, final sıralaması gider |

Yöneticinin dinlediği olaylar: `lobby:update`, `host:status`, `answer:count`, `question:show`, `question:result`, `ranking:show`, `game:paused`, `game:resumed`, `game:finished`.

### Ana ekran
- `display:connect` `{pin}` → `{pin, joinUrl, qrDataUrl, snapshot}`. Lobide QR ve PIN gösterilir.
- Dinler: `lobby:update`, `question:show`, `question:result`, `ranking:show`, `game:paused`, `game:resumed`, `game:finished`.

### Katılımcı
- `player:join` `{pin, nickname}` → `{playerId, nickname}`. **`playerId`'yi localStorage'a kaydet.** Oyun başladıktan sonra katılınamaz.
- `player:rejoin` `{pin, playerId}` → `{snapshot}` (bağlantı kopup gelirse veya sayfa yenilenirse)
- `player:answer` `{optionId}` → `{}`. Her soruda bir kez
- Dinler: `question:show`, `answer:feedback`, `game:paused`, `game:resumed`, `game:finished`, `player:kicked`

### Olay verileri
- `lobby:update`: `{count, connected, players:[{id,nickname,connected}]}`
- `question:show`: `{index, total, text, mediaUrl, timeLimit, remainingMs, options:[{id,text}]}`. Geri sayımı `remainingMs`'den yap.
- `question:result` (yönetici + ana ekran): `{correctOptionId, correctText}`
- `answer:feedback` (sadece o katılımcıya): `{answered, correct, scoreGained, totalScore, rank, feedback:{gifUrl, caption, effect}}`. Cevap vermediyse `effect: "timeup"`.
- `ranking:show` (yönetici + ana ekran): `{ranking:[{rank,playerId,nickname,score}], isLast}`
- `host:status`: `{state, paused, questionNumber, totalQuestions, remainingMs, answered, playerCount}`
- `answer:count`: `{answered, total}`
- `game:finished`: `{ranking:[...]}`
- `snapshot`: `{state, paused, lobby, status, question?, correctOptionId?, ranking?, answered?}`. Yeniden bağlanan ekranı tek seferde doğru duruma getirir.

### Oyun durumları
`lobby → question → result → ranking → (question …) → finished`

Soru, süre dolunca **veya** bağlı herkes cevaplayınca kapanır. Doğru cevap gösterildikten ~5 sn sonra sıralama kendiliğinden gelir (yönetici `host:next` ile hemen geçebilir). Sonraki soruya geçiş **sadece** yönetici ile olur.

### Puanlama
Yanlış = 0. Doğru = 500 ile 1000 arası; ne kadar hızlıysa o kadar yüksek. Eşitlikte doğru cevaplarının toplam süresi kısa olan öndedir.
