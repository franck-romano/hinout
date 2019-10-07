const express = require('express');

const app = express();

app.get('/foo', (_, res) => res.send('bar'));
app.post('/foo', (_, res) => res.send('bar'));
app.put('/foo', (_, res) => res.send('bar'));
app.delete('/foo', (_, res) => res.sendStatus(200));
app.get('/foo-redirect', (_, res) => res.redirect('/foo'));

export default app;
