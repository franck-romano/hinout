import http from 'http';
import { EventEmitter } from 'events';
import eventTypes from './event-types';

interface HinoutOptions {
  logFn: Function;
  format: Function;
}

export default class Hinout extends EventEmitter {
  private logFn;
  private format;
  constructor(options: HinoutOptions) {
    super();
    this.logFn = options.logFn;
    this.format = options.format;
    this.on(eventTypes.OUT, event => this.logFn(this.format(event)));
    this.on(eventTypes.IN, event => this.logFn(this.format(event)));
  }

  /**
   *  Starts collecting and writing http requests logs to sdout
   * @returns {Hinout} Instanciated Hinout object
   */
  collect(): Hinout {
    const functions = [{ fnName: 'get', fn: http.get }, { fnName: 'request', fn: http.request }];
    functions.forEach(({ fnName, fn }) => {
      const fnWithListeners = this.attachListenersToFn.bind(this, fn);
      http[fnName] = fnWithListeners;
    });
    return this;
  }

  /**
   * Overrides Hinout logging function
   * @param {Function} logFn Logging function to use
   * @returns {Hinout} Instanciated Hinout object
   */
  setLoggingFunction(logFn: Function): Hinout {
    this.logFn = logFn;
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
