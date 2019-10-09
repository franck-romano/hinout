import eventTypes from './event-types';

interface OutEvent {
  host: string;
  method: string;
  path: string;
  eventType: string;
}

interface InEvent {
  httpVersion: string;
  statusCode: number;
  statusMessage: string;
  eventType: string;
}

export default (event: OutEvent | InEvent) => {
  if (event.eventType === eventTypes.OUT) {
    const { host, method, path, eventType } = event as OutEvent;
    return `${eventType.toUpperCase()} - ${method} ${host}${path}`;
  }
  if (event.eventType === eventTypes.IN) {
    const { httpVersion, statusCode, statusMessage, eventType } = event as InEvent;
    return `${eventType.toUpperCase()} - HTTP ${httpVersion} ${statusCode} ${statusMessage}`;
  }
};
