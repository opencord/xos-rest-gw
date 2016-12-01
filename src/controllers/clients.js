(function () {
  'use strict';
  const _ = require('lodash');
  const clients = [];

  exports.clients = clients;

  exports.add = (client) => {
    // TODO check id that client is already there
    if(!_.find(clients, ({id: client.id}))) {
      clients.push(client);
    }
  }

  exports.remove = (client) => {
    _.remove(clients, {id: client.id});
  }
})();