import EventHandler from '../infrastructure/event-handler';

export interface HinoutOptions {
  logFn: Function;
  formatFn: Function;
  eventHandler: EventHandler;
}
