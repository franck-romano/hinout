import https from 'https';
import { EventEmitter } from 'events';
import { EVENT_TYPES } from '../domain/events/EventTypes';
import { InboundEventAttributes } from '../domain/events/InboundEvent';
import { OutboundEventAttributes } from '../domain/events/OutboundEvent';
import http, { ClientRequest, ClientRequestArgs, IncomingMessage } from 'http';

export class EventHandler extends EventEmitter {
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

  private attachListenersToFn(fn: Function, ...args): ClientRequest {
    const startTime = process.hrtime();
    const request: ClientRequest = fn(...args);

    this.emitOnOutbound(request);
    this.emitOnInbound(request, startTime);

    return request;
  }

  private emitOnOutbound(request: ClientRequest & ClientRequestArgs): void {
    const { method, path } = request;
    const host = request.getHeader('host') as string;
    request.prependOnceListener('finish', () => {
      const outboundEvent: OutboundEventAttributes = {
        timestamp: Date.now(),
        host,
        method: method as string,
        path
      };

      this.emit(EVENT_TYPES.OUTBOUND, outboundEvent);
    });
  }

  private emitOnInbound(request: ClientRequest, startTime: [number, number]): void {
    request.prependOnceListener('response', (response: IncomingMessage) => {
      const elapsedTime = process.hrtime(startTime);

      const data: string[] = [];
      response.on('data', (chunk) => {
        data.push(chunk.toString());
      });

      response.on('end', () => {
        const { statusCode, statusMessage, httpVersion } = response;
        const inboundEvent: InboundEventAttributes = {
          timestamp: Date.now(),
          httpVersion,
          statusCode: statusCode as number,
          statusMessage: statusMessage as string,
          elapsedTime,
          data
        };

        this.emit(EVENT_TYPES.INBOUND, inboundEvent);
      });
    });
  }
}
