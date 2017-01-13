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

  // dynamically load Model names to listen on channels
  // NOTE how to listen for models defined by services?
  request.get(`${config.xos.host}:${config.xos.port}/api/utility/modeldefs`)
  .end((err, res) => {
    if (err) {
      logger.log('error', err);
    }
    if (res) {
      const models = _.map(res.body, i => i.name);
      _.forEach(models, c => {
        client.subscribe(c);
      });
    }
  });

})();