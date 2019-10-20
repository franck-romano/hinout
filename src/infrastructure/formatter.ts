import { InEvent } from '../domain/events/in-event';
import { OutEvent } from '../domain/events/out-event';
import eventTypes from '../domain/events/event-types';

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
