
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
  
  const winston = require('winston');
  const fs = require('fs');
  const path = require('path');
  const level = process.env.LOG_LEVEL || 'debug';
  winston.level = level;

  const logFile = path.join(__dirname, '../../logs/xos-nb-rest');

  // clear old logs
  ['error', 'debug'].forEach(l => {
    try {
      fs.statSync(`${logFile}.${l}.log`)
      fs.unlinkSync(`${logFile}.${l}.log`);
    }
    catch(e) {
      // log does not exist
    }
  });

  // create a custom logger with colorized console and persistance to file
  const logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({level: level, colorize: true}),
      new (winston.transports.File)({name: 'error-log', level: 'error', filename: `${logFile}.error.log`}),
      new (winston.transports.File)({name: 'debug-log', level: 'debug', filename: `${logFile}.debug.log`})
    ]
  });

  module.exports = logger;

})();