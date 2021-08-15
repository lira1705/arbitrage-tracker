const WebSocketServer = require('ws').Server;
const Rabbit = require('./rabbit');
const OpportunityDetector = require("./detector");
require('dotenv').config();

const WS_PORT = process.env.WS_PORT;
const WS_PATH = process.env.WS_PATH;


const listeners = []
async function startServer() {
  const rabbit = await (new Rabbit()).initialize();
  wss = new WebSocketServer({ port: WS_PORT, path: WS_PATH });

  wss.on('connection', async function (ws) {
    const history = await rabbit.getAllAvailableMessages();
    console.log(`New connection, sending all ${history.length} messages`);
    for (let oldMessage of history) {
      await ws.send(JSON.stringify(oldMessage));
    }
    listeners.push(ws);

    ws.on("close", () => {
      listeners.splice(listeners.indexOf(ws), 1);
    })
  });

  rabbit.subscribe((msg) => {
    if (!msg) return;
    try {
      const message = JSON.parse(msg.content.toString())
      console.log(`New message: ${message}`);
      message.opportunities = OpportunityDetector(message)
      console.log(`New opportunities: ${message.opportunities}`);
      listeners.forEach(ws => ws.send(message));
    } catch (e) {
      console.log(e);
    }
  })
}

startServer()
console.log('Server started')
