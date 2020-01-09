import { Event, SerializedInboundEvent } from './event';
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

  format(): SerializedInboundEvent {
    return {
      eventType: this.eventType,
      elapsedTimeInMs: this.computeElapsedTimeInMs(this.event.elapsedTime),
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

  private computeElapsedTimeInMs(elapsedTime: [number, number]): number {
    const elapsedTimeInNs = elapsedTime[0] * 1000000000 + elapsedTime[1];
    const elapsedTimeInMs = elapsedTimeInNs / 1000000;

    return elapsedTimeInMs;
  }
}
