import http from 'http';
import { EventEmitter } from 'events';

export default class OutboundTracer extends EventEmitter {
  constructor(private logFn = console.log) {
    super();
  }

  collect() {
    const boundedGet = this.addEmitter.bind(this, http.get);
    const boundedRequest = this.addEmitter.bind(this, http.request);
    http.get = boundedGet;
    http.request = boundedRequest;
  }

  listen() {
    this.on('outbound', this.logFn);
  }

  private addEmitter(fn: Function, ...args) {
    const overridedHttp = fn(...args);
    overridedHttp.prependOnceListener('finish', () => {
      this.emit('outbound', {});
    });
    return overridedHttp;
  }
}
