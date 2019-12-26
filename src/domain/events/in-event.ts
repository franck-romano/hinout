export interface InEvent {
  timestamp: number;
  httpVersion: string;
  statusCode: number;
  statusMessage: string;
  eventType: string;
  elapsedTime: [number, number];
}
