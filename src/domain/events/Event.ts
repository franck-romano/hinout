import { EVENT_TYPES } from './EventTypes';

type MaybeData = null | string;

export interface SerializedInboundEvent {
  eventType: EVENT_TYPES.INBOUND;
  timestamp: number;
  httpVersion: string;
  statusCode: number;
  statusMessage: string;
  elapsedTimeInMs: number;
  data: MaybeData;
}

export interface SerializedOutboundEvent {
  eventType: EVENT_TYPES.OUTBOUND;
  timestamp: number;
  host: string;
  method: string;
  path: string;
}

export abstract class Event {
  protected abstract format(): SerializedInboundEvent | SerializedOutboundEvent;
}
