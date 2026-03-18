import express from 'express'
const app = express()
app.get('/api/health', (_, res) => res.json({ ok: true }))
app.listen(3000, () => console.log('Backend on :3000'))