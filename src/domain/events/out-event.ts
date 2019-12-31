import { Event } from './event';
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

  format(): string {
    return `[${this.event.timestamp}] ${this.eventType} - ${this.event.method} ${this.event.host}${this.event.path}`;
  }
}
