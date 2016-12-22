# XOS Northbound Rest Interface

This is an abstraction layer that provide REST APIs and WebSockets access to XOS.

## Development

This software can be executed on your local machine as long as NodeJs is installed.

To start it use: `npm install && npm start`

Alternatively you can invoke the start script `node src/server.js` directly to pass addictional paramenters:

- `--config mycfg.yml` to specify a different config file
- `LOG_LEVEL=error|warn|info|debug` to enable different logging level (default is `warn`)

If you are actively working on this project we suggest you to take a look to [nodemon](https://nodemon.io/) to observe changes in you code and automatically restart the server.

### Config

By default the used config is:
```
default:
  xos:
    host: xos
    port: 9999
  redis:
    host: redis
    port: 6379
  gateway:
    port: 3000
```

You can create a file called `config.yml` and replace one or more value.
You can also have different config files and load them using the `--config` flag (see above for usage).

### Tests

A comprehensive test suite defined using [Mocha](https://mochajs.org/), [Chai](http://chaijs.com/) and [Sinon](http://sinonjs.org/) is provided togheter with the project. To execute existing tests use `npm test`, while if you are currently working on it you can execute them in watch mode using `npm run test:dev`.

Styleguide are also applied using [EsLint](http://eslint.org/), to check style execute `npm run lint`.

## Notes

### Sample request to core authenticated method:

```
curl -H "x-csrftoken: TOKEN" -H "cookie: xoscsrftoken=TOKEN;xossessionid=SESSION_ID" 127.0.0.1:3000/api/core/instances/
```

### Websocket

Socket.io client library will be available at: `http://localhost:3000/socket.io/socket.io.js`

Remember that `redis` in the Frontend config is linked

### Test Client

To start the client: `cd spec; browser-sync start --server`

### Send a fake REDIS event

```
redis-cli -h xos.dev

# In progress
PUBLISH Slice "{\"pk\": 19, \"object\": {\"id\": 19,\"name\": \"mysite_test_redis\", \"backend_status\": \"0 - In Progress\"}, \"changed_fields\": [\"updated\", \"backend_status\"]}"

# Succes
PUBLISH Slice "{\"pk\": 19, \"object\": {\"id\": 19,\"name\": \"mysite_test_redis\", \"backend_status\": \"1 - Success\"}, \"changed_fields\": [\"updated\", \"backend_status\"]}"

# Error
PUBLISH Slice "{\"pk\": 19, \"object\": {\"id\": 19,\"name\": \"mysite_test_redis\", \"backend_status\": \"2 - Error\"}, \"changed_fields\": [\"updated\", \"backend_status\"]}"
```


