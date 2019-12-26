import { InEvent } from '../domain/events/in-event';
import { OutEvent } from '../domain/events/out-event';
import eventTypes from '../domain/events/event-types';

export default (event: OutEvent | InEvent) => {
  if (event.eventType === eventTypes.OUT) {
    const { timestamp, host, method, path, eventType } = event as OutEvent;
    return `[${timestamp}] ${eventType.toUpperCase()} - ${method} ${host}${path}`;
  }

  if (event.eventType === eventTypes.IN) {
    const { timestamp, httpVersion, statusCode, statusMessage, eventType, elapsedTime } = event as InEvent;
    const elapsedTimeInSec = elapsedTime[0];
    const elapsedTimeInMs = elapsedTime[1] / 1000000;

    return `[${timestamp}] ${eventType.toUpperCase()} - HTTP ${httpVersion} ${statusCode} ${statusMessage} - Elapsed time: ${elapsedTimeInSec}s ${elapsedTimeInMs}ms`;
  }
};
