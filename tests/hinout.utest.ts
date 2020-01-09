import Hinout from '../src/hinout';
import { sinon, expect } from './config';
import { InEvent } from '../src/domain/events/in-event';
import { OutEvent } from '../src/domain/events/out-event';
import EventHandler from '../src/infrastructure/event-handler';
import { SerializedOutboundEvent, SerializedInboundEvent } from '../src/domain/events/event';

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
            eventType: 'OUT',
            timestamp: 12345,
            host: 'https://foo.bar.com',
            method: 'GET',
            path: '/'
          };
          const logFnSpy = sinon.spy();
          const onCallbackSpy = sinon.spy();
          sinon.stub(OutEvent.prototype, 'format').returns(event);
          // WHEN
          new Hinout({
            logFn: logFnSpy,
            eventHandler
          }).collect();

          eventHandler.on('out', onCallbackSpy).emit('out', event);
          // THEN
          expect(onSpy).to.have.been.called();
          expect(OutEvent.prototype.format).to.have.been.called();
          expect(onCallbackSpy).to.have.been.calledWith(event);
          expect(logFnSpy).to.have.been.calledWith(event);
        });
      });
      context('inbound events', () => {
        it('logs the formatted event', () => {
          // GIVEN
          const event: SerializedInboundEvent = {
            eventType: 'IN',
            timestamp: 12345,
            httpVersion: '1.1',
            statusCode: 200,
            statusMessage: 'OK',
            elapsedTimeInMs: 12,
            data: null
          };
          const logFnSpy = sinon.spy();
          const onCallbackSpy = sinon.spy();
          sinon.stub(InEvent.prototype, 'format').returns(event);
          // WHEN
          new Hinout({
            logFn: logFnSpy,
            eventHandler
          }).collect();

          eventHandler.on('in', onCallbackSpy).emit('in', event);
          // THEN
          expect(onSpy).to.have.been.called();
          expect(InEvent.prototype.format).to.have.been.called();
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

        eventHandler.emit('out', 'some-event');
        // THEN
        expect(defaultLogFn).to.not.have.been.called();
        expect(newLoggerFn).to.have.been.called();
      });
    });
  });
});
