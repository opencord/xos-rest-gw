
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