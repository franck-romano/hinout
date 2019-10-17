import fs from 'fs'
import path from 'path'
import https from "https";
import express from 'express';

const app = express();
app.get('/foo', (_, res) => res.send('bar'));
app.post('/foo', (_, res) => res.sendStatus(201));
app.put('/foo', (_, res) => res.send('bar'));
app.delete('/foo', (_, res) => res.sendStatus(200));

app.get('/bar', (_, res) => res.sendStatus(400));
app.post('/bar', (_, res) => res.sendStatus(401));
app.put('/bar', (_, res) => res.sendStatus(404));
app.delete('/bar', (_, res) => res.sendStatus(403));


const httpServer = app
const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'cert.pem'))
};
const httpsServer = https.createServer(httpsOptions, app)

export { httpServer, httpsServer };
