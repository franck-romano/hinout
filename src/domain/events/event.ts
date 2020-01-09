export interface SerializedInboundEvent {
  eventType: string;
  timestamp: number;
  httpVersion: string;
  statusCode: number;
  statusMessage: string;
  elapsedTimeInMs: number;
  data: null | string;
}
export interface SerializedOutboundEvent {
  eventType: string;
  timestamp: number;
  host: string;
  method: string;
  path: string;
}

export abstract class Event {
  protected abstract format(): SerializedInboundEvent | SerializedOutboundEvent;
}
