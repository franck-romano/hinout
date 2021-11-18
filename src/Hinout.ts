import { EVENT_TYPES } from './domain/events/EventTypes';
import { HinoutOptions } from './domain/HinoutOptions';
import { InboundEvent, InboundEventAttributes } from './domain/events/InboundEvent';
import { OutboundEvent, OutboundEventAttributes } from './domain/events/OutboundEvent';
import { EventHandler } from './infrastructure/EventHandler';

export default class Hinout {
  private logFn;
  private eventHandler: EventHandler;
  private isCollecting = false;

  constructor(options: HinoutOptions) {
    this.logFn = options.logFn;
    this.eventHandler = options.eventHandler;
    this.interceptEmittedEvents();
  }

  /**
   * Starts collecting and writing HTTP(s) requests logs to sdout
   * @returns {Hinout} Instantiated Hinout object
   */
  collect(): Hinout {
    if (!this.isCollecting) {
      this.eventHandler.attachListeners();
      this.isCollecting = true;
    }
    return this;
  }

  /**
   * Overrides Hinout logging function
   * @param {Function} logFn Logging function to use
   * @returns {Hinout} Instantiated Hinout object
   */
  setLoggingFunction(logFn: Function): Hinout {
    this.logFn = logFn;
    return this;
  }

  private interceptEmittedEvents(): void {
    this.eventHandler.on(EVENT_TYPES.OUTBOUND, (outboundEvent: OutboundEventAttributes) => {
      this.logFn(new OutboundEvent(outboundEvent).format());
    });

    this.eventHandler.on(EVENT_TYPES.INBOUND, (inboundEvent: InboundEventAttributes) => {
      this.logFn(new InboundEvent(inboundEvent).format());
    });
  }
}
