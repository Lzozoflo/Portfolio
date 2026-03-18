import express from 'express';
const app = express();
const port = 3000;

app.get('/api/health', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log(`Backend listening on port ${port}`));