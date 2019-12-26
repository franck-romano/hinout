import { expect } from '../config';
import formatter from '../../src/infrastructure/formatter';
import eventTypes from '../../src/domain/events/event-types';
import { OutEvent } from '../../src/domain/events/out-event';
import { InEvent } from '../../src/domain/events/in-event';

describe('Formatter', () => {
  describe('.(event)', () => {
    context('outbound event', () => {
      it('properly formats event', () => {
        // GIVEN
        const outboundEvent: OutEvent = {
          timestamp: 12345,
          host: 'http://foo.com',
          method: 'GET',
          path: '/bar',
          eventType: eventTypes.OUT
        };
        // WHEN
        const actual = formatter(outboundEvent);
        // THEN
        expect(actual).to.equal(
          `[${outboundEvent.timestamp}] OUT - ${outboundEvent.method} ${outboundEvent.host}${outboundEvent.path}`
        );
      });
    });
    context('inbound event', () => {
      it('properly formats event', () => {
        // GIVEN
        const inboundEvent: InEvent = {
          timestamp: 12345,
          httpVersion: '1.1',
          statusCode: 200,
          statusMessage: 'OK',
          eventType: eventTypes.IN,
          elapsedTime: [0, 1] as [number, number]
        };
        // WHEN
        const actual = formatter(inboundEvent);
        // THEN
        expect(actual).to.equal(
          `[${inboundEvent}] IN - HTTP ${inboundEvent.httpVersion} ${inboundEvent.statusCode} ${inboundEvent.statusMessage}`
        );
      });
    });
  });
});
