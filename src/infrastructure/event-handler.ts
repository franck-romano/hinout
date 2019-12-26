import http from 'http';
import https from 'https';
import { EventEmitter } from 'events';
import eventTypes from '../domain/events/event-types';
import { OutEvent } from '../domain/events/out-event';
import { InEvent } from '../domain/events/in-event';

export default class EventHandler extends EventEmitter {
  constructor() {
    super();
  }

  attachListeners(): void {
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

  private attachListenersToFn(fn: Function, ...args): Request {
    const startTime = process.hrtime();
    const request = fn(...args);
    this.emitOnOutbound(request);
    this.emitOnInbound(request, startTime);

    return request;
  }

  private emitOnOutbound(request): void {
    const { method, path } = request;
    const host = request.getHeader('host');
    request.prependOnceListener('finish', () => {
      const outboundEvent: OutEvent = { timestamp: Date.now(), host, method, path, eventType: eventTypes.OUT };
      this.emit(eventTypes.OUT, outboundEvent);
    });
  }

  private emitOnInbound(request, startTime: [number, number]): void {
    request.prependOnceListener('response', response => {
      const { statusCode, statusMessage, httpVersion } = response;
      const elapsedTime = process.hrtime(startTime);
      const inboundEvent: InEvent = {
        timestamp: Date.now(),
        httpVersion,
        statusCode,
        statusMessage,
        eventType: eventTypes.IN,
        elapsedTime
      };
      this.emit(eventTypes.IN, inboundEvent);
    });
  }
}
