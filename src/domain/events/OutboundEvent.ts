import { Event, SerializedOutboundEvent } from './Event';
import { EVENT_TYPES } from './EventTypes';

export interface OutboundEventAttributes {
  timestamp: number;
  host: string;
  method: string;
  path: string;
}

export class OutboundEvent extends Event {
  constructor(private event: OutboundEventAttributes) {
    super();
  }

  format(): SerializedOutboundEvent {
    return {
      eventType: EVENT_TYPES.OUTBOUND,
      host: this.event.host,
      method: this.event.host,
      path: this.event.path,
      timestamp: this.event.timestamp
    };
  }
}
