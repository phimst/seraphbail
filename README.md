# seraphbail

> CommonJS WhatsApp Web API library — fork of Baileys with stability & anti-ban improvements.

---

## Install

```bash
npm i seraphbail
```

A postinstall script automatically patches a known `whatsapp-rust-bridge` CJS export issue — no manual steps needed.

---

## What's Different

| Feature | Status |
|---|---|
| Full CommonJS (no ESM) | ✅ |
| Custom pairing code support | ✅ (inherited, 8-char) |
| Smart Presence Manager | ✅ |
| Auto-retry on failed send | ✅ |
| Better WA disconnect error messages | ✅ |
| `suggestedReconnectMs` on connection close | ✅ |
| Memory leak fix on device cache | ✅ |
| Album message helper | ✅ |
| Reachout Risk Score | ✅ new |
| Adaptive Send Throttle | ✅ new |
| Session Health Monitor | ✅ new |
| `.seraphdonate` easter egg command | ✅ new (opt-in) |
| Auto-patched `whatsapp-rust-bridge` install | ✅ new |

---

## Anti-Ban Toolkit (new in 1.1.0)

These three modules work together automatically once you connect — no setup required, though each is also exported standalone if you want to build your own logic on top.

### Reachout Risk Score
Tracks your account's own send pattern in a rolling window (frequency, group vs personal ratio, burst gaps) and produces a `low` / `medium` / `high` risk level — proactively, before WhatsApp issues a 463 restriction.

```js
sock.getRiskScore()
// { level: 'medium', score: 42, metrics: { messagesInWindow: 18, perMinute: 3.2, groupRatio: 0.6, avgGapMs: 4200, failureRate: 0 } }
```

### Adaptive Send Throttle
Automatically applied inside `sock.sendMessage()`. Slows down based on your account's own recent error history — not a hardcoded delay. A clean history eases back toward a fast base delay; recent failures or a 429 push it up (429 enforces a hard 60s+ cooldown).

```js
sock.getAdaptiveDelay() // current recommended delay in ms
// disable auto-throttling if you want to manage pacing yourself:
makeWASocket({ enableAdaptiveThrottle: false })
```

### Session Health Monitor
```js
sock.getSessionHealth()
// { uptimeMs: 1823000, reconnects: 1, sent: 140, failed: 2, successRate: 0.986, status: 'healthy', lastError: 405 }
```

---

## Album Message

```js
await sock.sendAlbumMessage(jid, [
  { image: { url: './foto1.jpg' } },
  { image: { url: './foto2.jpg' } },
  { video: { url: './video1.mp4' } }
])
```
Sends a linked album (min. 2 items) with a small natural delay between items to avoid a burst-send pattern.

---

## `.seraphdonate` (opt-in)

Disabled by default. When enabled, replying with the trigger command sends back a QR/image found at `donasi.<png|jpg|jpeg|webp>` in your project root.

```js
makeWASocket({
  enableDonateCommand: true,
  donateCommand: '.seraphdonate',   // optional, this is the default
  donateCaption: 'Support seraphbail! ☕'
})
```

---

## Smart Presence Manager

```js
const { createPresenceManager } = require('seraphbail')

sock.ev.on('connection.update', async ({ connection }) => {
  if (connection === 'open') {
    const pm = createPresenceManager(sock)
    await pm.start()   // cycles available ↔ unavailable naturally
    sock.ev.once('connection.update', ({ connection }) => {
      if (connection === 'close') pm.stop()
    })
  }
})
```

---

## Smarter Reconnect & Errors

```js
const { getReconnectDelay, isSafeToReconnect, getDisconnectDescription } = require('seraphbail')

sock.ev.on('connection.update', ({ connection, lastDisconnect, suggestedReconnectMs }) => {
  if (connection === 'close') {
    const code = lastDisconnect?.error?.output?.statusCode
    console.log(getDisconnectDescription(code))
    if (isSafeToReconnect(code)) {
      setTimeout(() => startSock(), suggestedReconnectMs ?? 3000)
    }
  }
})
```

---

## Credits

| Project | Author | Notes |
|---|---|---|
| [Baileys](https://github.com/WhiskeySockets/Baileys) | WhiskeySockets | Original library, base v7.0.0-rc13 |
| **LotusBail** | @Primrose_Lotus | CJS migration, interactive buttons, USync bypass |

seraphbail builds on top of LotusBail (v7.0.0-rc13), which is itself a CJS port of official Baileys.
Full credit for the CJS migration goes to **@Primrose_Lotus**.

---

## License

MIT
