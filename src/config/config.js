(function () {
  'use strict';
  
  // NOTE do we still need CLI args? 
  // Won't be better to use NODE_ENV and the native node-yaml-config feature

  const argv = require('yargs').argv;
  const path = require('path');
  const yaml_config = require('node-yaml-config');
  const logger = require('../config/logger.js');

  // if a config file is specified in as a CLI arguments use that one
  const cfgFile = argv.config || 'config.yml';

  let config;
  try {
    logger.log('debug', `Loading ${cfgFile}`);
    config = yaml_config.load(path.join(__dirname, cfgFile));
  }
  catch(e) {
    logger.log('debug', `No ${cfgFile} found, using default params`);
  }

  module.exports = {
    xos: {
      host: (config && config.xos) ? config.xos.host : 'xos',
      port: (config && config.xos) ? config.xos.port : 9999
    },
    redis: {
      host: (config && config.redis) ? config.redis.host : 'redis',
      port: (config && config.redis) ? config.redis.port : 6379
    },
    gateway: {
      port: (config && config.gateway) ? config.gateway.port : 3000
    }
  };
})();