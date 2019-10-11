import http from 'http';
import nock from 'nock';
import Hinout from '../src/hinout';
import { EventEmitter } from 'events';
import { sinon, expect } from './config';

describe('Hinout', () => {
  const url = 'http://some-url.com';
  let prependOnceListenerSpy, emitSpy, hinoutNock;

  beforeEach(() => {
    hinoutNock = nock(url);
    emitSpy = sinon.spy(EventEmitter.prototype, 'emit');
    prependOnceListenerSpy = sinon.spy(EventEmitter.prototype, 'prependOnceListener');
  });
  afterEach(() => {
    nock.cleanAll();
    emitSpy.restore();
    prependOnceListenerSpy.restore();
  });

  describe('.({ logFn })', () => {
    beforeEach(() => hinoutNock.get('/').reply(200));
    describe('.collect()', () => {
      let hinout;
      beforeEach(() => (hinout = new Hinout({ logFn: sinon.spy(), format: sinon.spy() })));
      afterEach(() => hinout.removeAllListeners());
      context('attaching listeners', () => {
        it('attaches listeners to http.get function', () => {
          // WHEN
          hinout.collect();
          http.get(url);
          // THEN
          expect(prependOnceListenerSpy).to.have.been.calledWith('finish', sinon.match.func);
          expect(prependOnceListenerSpy).to.have.been.calledWith('response', sinon.match.func);

        });

        it('attaches listeners to http.request function', () => {
          // WHEN
          hinout.collect();
          http.request(url);
          // THEN
          expect(prependOnceListenerSpy).to.have.been.calledWith('finish', sinon.match.func);
          expect(prependOnceListenerSpy).to.have.been.calledWith('response', sinon.match.func);
        });
      })

      context('observing emitted events', () => {
        it('logs the formatted event', () => {
          // GIVEN
          const event = { some: 'event' };
          const logFnSpy = sinon.spy()
          const formatStub = sinon.stub().returns('event')
          const onSpy = sinon.spy(Hinout.prototype, 'on');
          const onCallbackSpy = sinon.spy();
          const hinout = new Hinout({ logFn: logFnSpy, format: formatStub });
          // WHEN
          hinout.collect();
          hinout.on('out', onCallbackSpy);
          hinout.emit('out', event);
          // THEN
          expect(onSpy).to.have.been.called();
          expect(onCallbackSpy).to.have.been.calledWith(event);
          expect(logFnSpy).to.have.been.calledWith('event')
          onSpy.restore();
        });
      })

    });

    describe(".setLoggingFunction(logFn)", () => {
      it("replaces { logFn } with the new logging function", async () => {
        // GIVEN
        const newLoggerFn = sinon.stub()
        const defaultLogFn = sinon.stub()
        // WHEN
        new Hinout({ logFn: defaultLogFn, format: sinon.spy() })
          .setLoggingFunction(newLoggerFn)
          .collect()
          .emit('out', 'some-event')
        // THEN
        expect(defaultLogFn).to.not.have.been.called()
        expect(newLoggerFn).to.have.been.called()
      })
    })
  });
});
