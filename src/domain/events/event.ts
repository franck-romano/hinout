import { InEvent } from './in-event';
import { OutEvent } from './out-event';

export interface SerializedEvent<E = Record<string, string | number>> {
  type: InEvent | OutEvent;
  data: E;
}

export abstract class Event {
  protected abstract format(): string;
}
