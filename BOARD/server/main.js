import http from "node:http";
import { WebSocketServer } from "ws";
import express from "express";

import {
  onMessage,
  onWsClose,
  onWsConnect,
  loadData,
  saveData,
} from "./wss.js";

await loadData();
setInterval(saveData, 30000);

const app = express();

let counter = 0;
app.get("/", (req, res, next) => {
  counter = counter + 1;
  console.log(counter);
  next();
});

app.use(express.static("client"));

const server = http.createServer(app);

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    onMessage(JSON.parse(message.toString()), ws);
  });
  ws.on("close", () => {
    onWsClose(ws);
  });
  onWsConnect(ws);
});

const host = "localhost";
const port = 8000;

server.listen(port, host, () => {
  console.log(`server started on http://${host}:${port}`);
});
