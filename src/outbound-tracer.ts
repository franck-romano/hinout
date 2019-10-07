import http from 'http';
import { EventEmitter } from 'events';

export default class OutboundTracer extends EventEmitter {
  constructor(private logFn = console.log) {
    super();
    this.collect();
  }

  observe() {
    this.on('outbound', this.logFn);
  }

  private collect() {
    const functions = [{ fnName: 'get', fn: http.get }, { fnName: 'request', fn: http.request }];
    functions.forEach(({ fnName, fn }) => {
      http[fnName] = this.addEmitter.bind(this, fn);
    });
  }

  private addEmitter(fn: Function, ...args) {
    const overridedHttp = fn(...args);
    const { method, path } = overridedHttp;
    const host = overridedHttp.getHeader('host');
    overridedHttp.prependOnceListener('finish', () => {
      this.emit('outbound', { host, method, path });
    });
    return overridedHttp;
  }
}
