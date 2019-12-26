import { InEvent } from './domain/events/in-event';
import eventTypes from './domain/events/event-types';
import { OutEvent } from './domain/events/out-event';
import { HinoutOptions } from './domain/hinout-options';

export default class Hinout {
  private logFn;
  private formatFn;
  private eventHandler;
  private isCollecting = false;

  constructor(options: HinoutOptions) {
    this.logFn = options.logFn;
    this.formatFn = options.formatFn;
    this.eventHandler = options.eventHandler;
    this.interceptEmittedEvents();
  }

  /**
   *  Starts collecting and writing HTTP(s) requests logs to sdout
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
    this.eventHandler.on(eventTypes.OUT, (event: OutEvent) => this.logFn(this.formatFn(event)));
    this.eventHandler.on(eventTypes.IN, (event: InEvent) => this.logFn(this.formatFn(event)));
  }
}
