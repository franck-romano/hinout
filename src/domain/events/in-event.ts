import { Event } from './event';

export interface InboundEvent {
  timestamp: number;
  httpVersion: string;
  statusCode: number;
  statusMessage: string;
  elapsedTime: [number, number];
  data?: string[];
}

export class InEvent extends Event {
  protected readonly eventType = 'IN';
  constructor(private event: InboundEvent) {
    super();
  }

  format(): string {
    const elapsedTimeInSec = this.event.elapsedTime[0];
    const elapsedTimeInMs = this.event.elapsedTime[1] / 1000000;
    return `[${this.event.timestamp}] ${this.eventType} - HTTP ${this.event.httpVersion} ${this.event.statusCode} ${this.event.statusMessage} - Elapsed time: ${elapsedTimeInSec}s ${elapsedTimeInMs}ms - Response: ${this.event.data}`;
  }
}
