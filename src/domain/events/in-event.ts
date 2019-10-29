export interface InEvent {
  httpVersion: string;
  statusCode: number;
  statusMessage: string;
  eventType: string;
  elapsedTime: [number, number];
}
