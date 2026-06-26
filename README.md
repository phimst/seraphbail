# seraphbail

> CommonJS WhatsApp Web API library — fork of Baileys with stability & DX improvements.

---

## Install

```bash
npm i seraphbail
```

---

## What's Different

| Feature | Status |
|---|---|
| Full CommonJS (no ESM) | ✅ |
| Smart Presence Manager | ✅ new |
| Auto-retry on failed send | ✅ new |
| Better WA disconnect error messages | ✅ new |
| `suggestedReconnectMs` on connection close | ✅ new |
| Memory leak fix on device cache | ✅ new |

---

## New Features

### Smart Presence Manager
```js
const { createPresenceManager } = require('seraphbail')

sock.ev.on('connection.update', async ({ connection }) => {
  if (connection === 'open') {
    const pm = createPresenceManager(sock)
    await pm.start()   // auto-cycles available ↔ unavailable naturally
    
    sock.ev.on('connection.update', ({ connection }) => {
      if (connection === 'close') pm.stop()
    })
  }
})
```

### Smarter Reconnect
```js
const { getReconnectDelay, isSafeToReconnect } = require('seraphbail')

sock.ev.on('connection.update', ({ connection, lastDisconnect, suggestedReconnectMs }) => {
  if (connection === 'close') {
    const code = lastDisconnect?.error?.output?.statusCode
    if (isSafeToReconnect(code)) {
      setTimeout(() => startSock(), suggestedReconnectMs ?? 3000)
    }
  }
})
```

### Better Error Messages
```js
const { getDisconnectDescription } = require('seraphbail')
// getDisconnectDescription(405) → "Connection Closed — server rejected connection (safe to reconnect)"
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
