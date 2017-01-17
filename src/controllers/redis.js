(function () {
  'use strict';
  
  const socketIo = require('./websocket.js');
  const config = require('../config/config.js');
  const logger = require('../config/logger.js');
  const request = require('superagent');
  const socket = socketIo.get();
  const _ = require('lodash');

  var redis = require('redis');
  
  var client = redis.createClient({
    host: config.redis.host,
    port: config.redis.port
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

  client.on('pmessage', function (pattern, channel, message) {
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

  // subscribe to all channels
  client.psubscribe('*');

})();