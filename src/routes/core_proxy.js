(function () {
  'use strict';

  const request = require('superagent');
  const logger = require('../config/logger.js');

  module.exports = function(app) {

    const proxyRequest = (req, res) => {

      // debugging helper
      if(!req.headers['x-csrftoken']){
        logger.log('warn', `csrftoken is missing and is required for authentication`);
      }
      if(!req.headers['x-sessionid']){
        logger.log('warn', `Session id is missing and is required for authentication`);
      }

      const config = require('../config/config.js').xos;
      // pick the correct method from superAgent
      const makeReq = request[req.method.toLowerCase()];

      // start the request
      let sentReq = makeReq(`${config.host}:${config.port}${req.url}`);
      
      // if needed add a body to the request
      if(req.method === 'POST' || req.method === 'PUT') {
        sentReq = sentReq
          .send(req.body)
      }

      // extend with auth info
      sentReq = sentReq
        .set('x-csrftoken', req.headers['x-csrftoken'] || null)
        .set('cookie', `xossessionid=${req.headers['x-sessionid']}` || null)

      // handle response
      sentReq
        .end((err, r) => {
          if(err) {
            logger.log('error', err);
            return res.status(500).send(err);
          }
          logger.log('debug', r.status, r.body);
          return res.status(r.status).type('json').send(r.body);
        });
    };

    app.all('/api/core', proxyRequest);
    app.all('/api/core/*', proxyRequest);
    app.all('/api/services', proxyRequest);
    app.all('/api/services/*', proxyRequest);
    app.all('/api/utility', proxyRequest);
    app.all('/api/utility/*', proxyRequest);
  };
})();