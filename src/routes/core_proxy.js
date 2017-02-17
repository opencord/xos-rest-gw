(function () {
  'use strict';

  const request = require('superagent');
  const logger = require('../config/logger.js');

  module.exports = function(app) {

    const proxyRequest = (req, res) => {

      // debugging helper
      if(!req.headers['x-csrftoken']){
        logger.log('warn', `csrftoken is missing and is required for authentication for ${req.url}`);
      }
      if(!req.headers['x-sessionid']){
        logger.log('warn', `Session id is missing and is required for authentication for ${req.url}`);
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
      if(req.headers['x-csrftoken'] && req.headers['x-sessionid']){
        sentReq = sentReq
          .set('x-csrftoken', req.headers['x-csrftoken'] || null)
          .set('cookie', `xoscsrftoken=${req.headers['x-csrftoken']}; xossessionid=${req.headers['x-sessionid']}` || null)
      }

      // handle response
      sentReq
        .end((err, r) => {
          if(err) {
            logger.log('error', sentReq.method, sentReq.url, err);
            let errRes;
            try {
              errRes = err.response.error;
            }
            catch(e) {
              errRes = err;
            }
            return res.status(err.status).send(errRes);
          }
          logger.log('debug', sentReq.method, sentReq.url, r.status);
          logger.log('silly', r.text)
          return res.status(r.status).type('json').send(r.body);
        });
    };

    app.all('/api/core', proxyRequest);
    app.all('/api/core/*', proxyRequest);
    app.all('/api/service', proxyRequest);
    app.all('/api/service/*', proxyRequest);
    app.all('/api/tenant', proxyRequest);
    app.all('/api/tenant/*', proxyRequest);
    app.all('/api/utility', proxyRequest);
    app.all('/api/utility/*', proxyRequest);
  };
})();
