import { expect } from './config';
import formatter from '../src/formatter';
import eventTypes from '../src/domain/events/event-types'

describe('Formatter', () => {
  describe('.(event)', () => {
    context('outbound event', () => {
      it('properly formats event', () => {
        // GIVEN
        const outboundEvent = {
          host: 'http://foo.com',
          method: 'GET',
          path: '/bar',
          eventType: eventTypes.OUT
        };
        // WHEN
        const actual = formatter(outboundEvent);
        // THEN
        expect(actual).to.equal(`OUT - ${outboundEvent.method} ${outboundEvent.host}${outboundEvent.path}`);
      });
    });
    context('inbound event', () => {
      it('properly formats event', () => {
        // GIVEN
        const inboundEvent = {
          httpVersion: '1.1',
          statusCode: 200,
          statusMessage: 'OK',
          eventType: eventTypes.IN
        };
        // WHEN
        const actual = formatter(inboundEvent);
        // THEN
        expect(actual).to.equal(
          `IN - HTTP ${inboundEvent.httpVersion} ${inboundEvent.statusCode} ${inboundEvent.statusMessage}`
        );
      });
    });
  });
});
