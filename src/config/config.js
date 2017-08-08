
/*
 * Copyright 2017-present Open Networking Foundation

 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

 * http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


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
      port: (config && config.xos) ? config.xos.port : 8000
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