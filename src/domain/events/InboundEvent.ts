import { Event, SerializedInboundEvent } from './Event';
import { EVENT_TYPES } from './EventTypes';

export interface InboundEventAttributes {
  timestamp: number;
  httpVersion: string;
  statusCode: number;
  statusMessage: string;
  elapsedTime: [number, number];
  data?: string[];
}

export class InboundEvent extends Event {
  constructor(private event: InboundEventAttributes) {
    super();
  }

  format(): SerializedInboundEvent {
    return {
      eventType: EVENT_TYPES.INBOUND,
      elapsedTimeInMs: InboundEvent.computeElapsedTimeInMs(this.event.elapsedTime),
      httpVersion: this.event.httpVersion,
      statusCode: this.event.statusCode,
      statusMessage: this.event.statusMessage,
      data: this.formatData(),
      timestamp: this.event.timestamp
    };
  }

  private formatData(): string | null {
    if (!this.event.data) {
      return null;
    }
    return this.event.data[0];
  }

  private static computeElapsedTimeInMs(elapsedTime: [number, number]): number {
    const elapsedTimeInNs = elapsedTime[0] * 1000000000 + elapsedTime[1];
    return elapsedTimeInNs / 1000000;
  }
}
