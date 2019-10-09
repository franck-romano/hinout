import http from 'http';
import { EventEmitter } from 'events';
import eventTypes from './event-types';

interface HinoutOptions {
  logFn?: Function;
}

export default class Hinout extends EventEmitter {
  private logFn;
  constructor(options?: HinoutOptions) {
    super();
    this.logFn = (options && options.logFn) || console.log;
    this.on(eventTypes.OUT, this.logFn);
    this.on(eventTypes.IN, this.logFn);
  }

  collect(): Hinout {
    const functions = [{ fnName: 'get', fn: http.get }, { fnName: 'request', fn: http.request }];
    functions.forEach(({ fnName, fn }) => {
      http[fnName] = this.attachListenersToFn.bind(this, fn);
    });
    return this;
  }

  private attachListenersToFn(fn: Function, ...args) {
    const request = fn(...args);
    this.emitOnOutbound(request);
    this.emitOnInbound(request);

    return request;
  }

  private emitOnOutbound(request): void {
    const { method, path } = request;
    const host = request.getHeader('host');
    request.prependOnceListener('finish', () =>
      this.emit(eventTypes.OUT, { host, method, path, eventType: eventTypes.OUT })
    );
  }

  private emitOnInbound(request): void {
    request.prependOnceListener('response', response => {
      const { statusCode, statusMessage, httpVersion } = response;
      this.emit(eventTypes.IN, { httpVersion, statusCode, statusMessage, eventType: eventTypes.IN });
    });
  }
}
