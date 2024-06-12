// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const cors = require('cors');  // Add CORS middleware to handle requests from the frontend

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

mongoose.connect('mongodb://atlas-sql-66687be6da8a630fc85bd0d7-wgihm.a.query.mongodb.net/sample_mflix?ssl=true&authSource=admin/chat', { useNewUrlParser: true, useUnifiedTopology: true });

const MessageSchema = new mongoose.Schema({
  user: String,
  message: String,
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', MessageSchema);

app.use(cors());  // Use CORS middleware

app.get('/chats', async (req, res) => {
  try {
    const messages = await Message.find();
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chats' });
  }
});

wss.on('connection', (ws) => {
  ws.on('message', async (data) => {
    const { user, message } = JSON.parse(data);
    const newMessage = new Message({ user, message });
    await newMessage.save();

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(newMessage));
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

app.get('/', (req, res) => {
  res.send('WebSocket server is running');
});

server.listen(5000, () => {
  console.log('Server started on port 5000');
});
