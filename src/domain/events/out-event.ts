import { Event, SerializedOutboundEvent } from './event';
export interface OutboundEvent {
  timestamp: number;
  host: string;
  method: string;
  path: string;
}

export class OutEvent extends Event {
  protected readonly eventType = 'OUT';
  constructor(private event: OutboundEvent) {
    super();
  }

  format(): SerializedOutboundEvent {
    return {
      eventType: this.eventType,
      host: this.event.host,
      method: this.event.host,
      path: this.event.path,
      timestamp: this.event.timestamp
    };
  }
}
