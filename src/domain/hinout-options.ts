import EventHandler from '../infrastructure/event-handler';

export interface HinoutOptions {
  logFn(formattedEvent: string): void;
  eventHandler: EventHandler;
}
