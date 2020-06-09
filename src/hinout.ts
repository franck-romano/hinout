import eventTypes from './domain/events/event-types';
import { HinoutOptions } from './domain/hinout-options';
import EventHandler from './infrastructure/event-handler';
import { InEvent, InboundEvent } from './domain/events/in-event';
import { OutEvent, OutboundEvent } from './domain/events/out-event';

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
   * @returns {Hinout} Instanciated Hinout object
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
   * @returns {Hinout} Instanciated Hinout object
   */
  setLoggingFunction(logFn: Function): Hinout {
    this.logFn = logFn;
    return this;
  }

  private interceptEmittedEvents(): void {
    this.eventHandler.on(eventTypes.OUT, (outboundEvent: OutboundEvent) => {
      this.logFn(new OutEvent(outboundEvent).format());
    });
    this.eventHandler.on(eventTypes.IN, (inboundEvent: InboundEvent) => {
      this.logFn(new InEvent(inboundEvent).format());
    });
  }
}
