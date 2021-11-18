import Hinout from '../src/Hinout';
import { expect, sinon } from './config';
import { InboundEvent } from '../src/domain/events/InboundEvent';
import { OutboundEvent } from '../src/domain/events/OutboundEvent';
import { SerializedInboundEvent, SerializedOutboundEvent } from '../src/domain/events/Event';
import { EventHandler } from '../src/infrastructure/EventHandler';
import { EVENT_TYPES } from '../src/domain/events/EventTypes';

describe('Hinout', () => {
  const eventHandler = new EventHandler();

  describe('.({ logFn, eventHandler })', () => {
    describe('.collect()', () => {
      beforeEach(() => sinon.stub(eventHandler, 'attachListeners'));
      afterEach(() => {
        sinon.restore(), sinon.reset();
      });

      context('is not already collecting events', () => {
        it('attaches listeners', () => {
          // WHEN
          new Hinout({ eventHandler, logFn: sinon.stub() }).collect();
          // THEN
          expect(eventHandler.attachListeners).to.have.been.calledOnce();
        });
      });

      context('is already collecting events', () => {
        it('does not attach more listeners', () => {
          // WHEN
          new Hinout({ eventHandler, logFn: sinon.stub() }).collect().collect();
          // THEN
          expect(eventHandler.attachListeners).to.have.been.calledOnce();
        });
      });
    });

    context('observing emitted events', () => {
      let onSpy;
      beforeEach(() => (onSpy = sinon.spy(EventHandler.prototype, 'on')));
      afterEach(() => onSpy.restore());

      context('outbound events', () => {
        it('logs the formatted event', () => {
          // GIVEN
          const event: SerializedOutboundEvent = {
            eventType: EVENT_TYPES.OUTBOUND,
            timestamp: 12345,
            host: 'https://foo.bar.com',
            method: 'GET',
            path: '/'
          };
          const logFnSpy = sinon.spy();
          const onCallbackSpy = sinon.spy();
          sinon.stub(OutboundEvent.prototype, 'format').returns(event);
          // WHEN
          new Hinout({
            logFn: logFnSpy,
            eventHandler
          }).collect();

          eventHandler.on(EVENT_TYPES.OUTBOUND, onCallbackSpy).emit(EVENT_TYPES.OUTBOUND, event);
          // THEN

          expect(onSpy).to.have.been.called();
          expect(OutboundEvent.prototype.format).to.have.been.called();
          expect(onCallbackSpy).to.have.been.calledWith(event);
          expect(logFnSpy).to.have.been.calledWith(event);
        });
      });

      context('inbound events', () => {
        it('logs the formatted event', () => {
          // GIVEN
          const event: SerializedInboundEvent = {
            eventType: EVENT_TYPES.INBOUND,
            timestamp: 12345,
            httpVersion: '1.1',
            statusCode: 200,
            statusMessage: 'OK',
            elapsedTimeInMs: 12,
            data: null
          };
          const logFnSpy = sinon.spy();
          const onCallbackSpy = sinon.spy();
          sinon.stub(InboundEvent.prototype, 'format').returns(event);

          // WHEN
          new Hinout({
            logFn: logFnSpy,
            eventHandler
          }).collect();

          eventHandler.on(EVENT_TYPES.INBOUND, onCallbackSpy).emit(EVENT_TYPES.INBOUND, event);

          // THEN
          expect(onSpy).to.have.been.called();
          expect(InboundEvent.prototype.format).to.have.been.called();
          expect(onCallbackSpy).to.have.been.calledWith(event);
          expect(logFnSpy).to.have.been.calledWith(event);
        });
      });
    });

    describe('.setLoggingFunction(logFn)', () => {
      it('replaces { logFn } with the new logging function', async () => {
        // GIVEN
        const newLoggerFn = sinon.stub();
        const defaultLogFn = sinon.stub();
        // WHEN
        new Hinout({
          logFn: defaultLogFn,
          eventHandler
        })
          .setLoggingFunction(newLoggerFn)
          .collect();

        eventHandler.emit(EVENT_TYPES.OUTBOUND, 'some-event');
        // THEN
        expect(defaultLogFn).to.not.have.been.called();
        expect(newLoggerFn).to.have.been.called();
      });
    });
  });
});
