import http from 'http';
import https from 'https';
import { EventEmitter } from 'events';
import eventTypes from './event-types';

interface HinoutOptions {
  logFn: Function;
  formatFn: Function;
}

export default class Hinout extends EventEmitter {
  private logFn;
  private formatFn;
  private isCollecting;
  constructor(options: HinoutOptions) {
    super();
    this.logFn = options.logFn;
    this.isCollecting = false;
    this.formatFn = options.formatFn;
    this.on(eventTypes.OUT, event => this.logFn(this.formatFn(event)));
    this.on(eventTypes.IN, event => this.logFn(this.formatFn(event)));
  }

  /**
   *  Starts collecting and writing HTTP(s) requests logs to sdout
   * @returns {Hinout} Instanciated Hinout object
   */
  collect(): Hinout {
    if (!this.isCollecting) {
      [
        { module: http, fnName: 'get', fn: http.get },
        { module: http, fnName: 'request', fn: http.request },
        { module: https, fnName: 'get', fn: https.get },
        { module: https, fnName: 'request', fn: https.request }
      ].forEach(({ module, fnName, fn }) => {
        const fnWithListeners = this.attachListenersToFn.bind(this, fn);
        module[fnName] = fnWithListeners;
      });
    }
    this.isCollecting = true;

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
