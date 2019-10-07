const express = require('express');

const app = express();

app.use((_, res, next) => {
  res.setHeader('Date', new Date().toUTCString());
  return next();
});

app.get('/foo', (_, res) => res.send('bar'));
app.post('/foo', (_, res) => res.send('bar'));
app.put('/foo', (_, res) => res.send('bar'));
app.delete('/foo', (_, res) => res.sendStatus(200));
app.get('/foo', (_, res) => res.redirect('/foo'));

export default {
  start: () => app.listen(8081)
};
