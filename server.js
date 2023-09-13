const http = require('http');
const express = require('express');
const fs = require('fs');

const app = express();
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
// Set up a simple HTTP server to serve the animated HTML
const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Pinging');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});
// Listen to a random available port
const serverPort = 0;

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${server.address().port} is already in use.`);
  } else {
    console.error('An error occurred while trying to listen on the port:', err);
  }
  process.exit(1);
});

server.listen(serverPort, () => {
  const actualPort = server.address().port;
  console.log(`Server running on port ${actualPort}.`);
});
