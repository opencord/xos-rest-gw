(function () {
  'use strict';
  
  const socketIo = require('./websocket.js');
  const config = require('../config/config.js').redis;
  const logger = require('../config/logger.js');
  const socket = socketIo.get();

  var redis = require('redis');
  var client = redis.createClient({
    host: config.host,
    port: config.port
  });

  client.on('error', function (err) {
    logger.log('error', err);
  });

  client.on('ready', function () {
    logger.log('info', 'Redis connected');
  });

  client.on('subscribe', function (channel) {
    logger.log('debug', `Subscribed to channel: ${channel}`);
  });

  client.on('message', function (channel, message) {
    logger.log('warn', 'sub channel ' + channel + ': ' + message);

    let msg;
    try {
      msg = JSON.parse(message);
      // TODO find the user that needs to be notified for msg.object update
      socket.emit('event', {model: channel, msg: msg});
    }
    catch(e) {
      // send the event also if it is not JSON
      msg = message;
      socket.emit('event', {model: channel, msg: msg});
    }

  });

  const watchedCollections = [
    'Instance',
    'Node',
    'Service',
    'Slice',
    'Site',
    'Subscriber',
    'Tenant'
  ];

  watchedCollections.forEach(c => {
    client.subscribe(c);
  });
})();