import { InEvent } from './events/in-event';
import { OutEvent } from './events/out-event';
import EventHandler from '../infrastructure/event-handler';

export interface HinoutOptions {
  logFn(formattedEvent: string): void;
  formatFn(event: InEvent | OutEvent): string | undefined;
  eventHandler: EventHandler;
}
