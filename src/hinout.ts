import http from 'http';
import { EventEmitter } from 'events';

interface HinoutOptions {
  logFn?: Function;
}

export default class Hinout extends EventEmitter {
  private logFn;
  constructor(options?: HinoutOptions) {
    super();
    this.logFn = (options && options.logFn) || console.log;
    this.collect();
  }

  observe() {
    this.on('out', this.logFn);
    this.on('in', this.logFn);
  }

  private collect() {
    const functions = [{ fnName: 'get', fn: http.get }, { fnName: 'request', fn: http.request }];
    functions.forEach(({ fnName, fn }) => {
      http[fnName] = this.emitEventOnOutboundAndInbound.bind(this, fn);
    });
  }

  private emitEventOnOutboundAndInbound(fn: Function, ...args) {
    const overridedHttp = fn(...args);
    const { method, path } = overridedHttp;
    const host = overridedHttp.getHeader('host');
    overridedHttp.prependOnceListener('finish', () => {
      this.emit('out', { host, method, path });
    });

    overridedHttp.prependOnceListener('response', response => {
      const { statusCode, statusMessage, httpVersion } = response;
      this.emit('in', { httpVersion, statusCode, statusMessage });
    });

    return overridedHttp;
  }
}
