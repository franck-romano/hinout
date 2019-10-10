# Hinout
Trace any inbounding and outbounding http request from your Node.js application

### Motivation

This module aims to ease logging outbounding and inbounding http requests.


### How it works ?

Each http client library like [Axios](https://github.com/axios/axios) or [Request](https://github.com/request/request) are using http and https Node.js internal modules.<!---->
So basically, `Hinout` adds listeners to those modules and emits an event once the request is gone or when the server receives a response.
As soon as the event is fired, a formatter formats the event and then, passed the result to `console.log`.

### Usage

Simply import the module in any file of your application:

```js
import Hinout from 'hinout'
```

Then start collecting using :

```js
Hinout.collect()
```

Each http request will be logged using `console.log`  by default.

### What is missing ?
- [ ] Disable logging and onyl emit event
- [ ] Writing events to a file
- [ ] Logging payload and response of an HTTP request
- [ ] Support for HTTPS Node.js module
- [ ] Integration with existing logging libraries (for example [pino](https://github.com/pinojs/pino) or [winston](https://github.com/winstonjs/winston))
