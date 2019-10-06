import http from 'http';
import { EventEmitter } from 'events';

export default class OutboundTracer {
  private outboundEmitter;
  constructor(private logFn: Function = console.log) {
    this.logFn = logFn;
    this.outboundEmitter = new EventEmitter();
  }

  collect() {
    const boundedGet = this.addEmitter.bind(this, http.get);
    const boundedRequest = this.addEmitter.bind(this, http.request);
    http.get = boundedGet;
    http.request = boundedRequest;
  }

  listen() {
    this.outboundEmitter.on('outbound-ended', this.logFn);
  }

  private addEmitter(fn: Function, ...args) {
    const overridedHttp = fn(...args);
    overridedHttp.prependOnceListener('finish', () => {
      this.outboundEmitter.emit('outbound-ended', {});
    });
    return overridedHttp;
  }
}
