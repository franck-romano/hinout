import { EventHandler } from '../infrastructure/EventHandler';

export interface HinoutOptions {
  logFn(formattedEvent: string): void;
  eventHandler: EventHandler;
}
