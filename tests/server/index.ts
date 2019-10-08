import express from 'express';

const app = express();

app.get('/foo', (_, res) => res.send('bar'));
app.post('/foo', (_, res) => res.sendStatus(201));
app.put('/foo', (_, res) => res.send('bar'));
app.delete('/foo', (_, res) => res.sendStatus(200));

export default app;
