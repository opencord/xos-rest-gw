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