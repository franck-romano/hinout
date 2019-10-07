import http from 'http';
import nock from 'nock';
import { EventEmitter } from 'events';
import { sinon, expect } from '../tests/config';
import OutboundTracer from '../src/outbound-tracer';

describe('Outbound Tracer', () => {
  const outboundUrl = 'http://some-url.com';
  let prependOnceListenerSpy, emitSpy, outboundNock;

  beforeEach(() => {
    outboundNock = nock(outboundUrl);
    emitSpy = sinon.spy(EventEmitter.prototype, 'emit');
    prependOnceListenerSpy = sinon.spy(EventEmitter.prototype, 'prependOnceListener');
  });
  afterEach(() => {
    nock.cleanAll();
    emitSpy.restore();
    prependOnceListenerSpy.restore();
  });

  describe('.(logFn)', () => {
    beforeEach(() => outboundNock.get('/').reply(200));
    describe('.collect()', () => {
      let outboundTracer;
      beforeEach(() => (outboundTracer = new OutboundTracer()));
      afterEach(() => outboundTracer.removeAllListeners());
      it('attaches an emitter on http.get function call', () => {
        // WHEN
        outboundTracer.collect();
        http.get(outboundUrl);
        // THEN
        expect(prependOnceListenerSpy).to.have.been.calledWith('finish', sinon.match.func);
      });

      it('attaches an emitter on http.request function call', () => {
        // WHEN
        outboundTracer.collect();
        http.request(outboundUrl);
        // THEN
        expect(prependOnceListenerSpy).to.have.been.calledWith('finish', sinon.match.func);
      });
    });

    describe('.observe()', () => {
      it('reacts to emitted events', () => {
        // GIVEN
        const event = { some: 'event' };
        const onCallbackSpy = sinon.spy();
        const onSpy = sinon.spy(OutboundTracer.prototype, 'on');
        const outboundTracer = new OutboundTracer();
        // WHEN
        outboundTracer.on('outbound', onCallbackSpy);
        outboundTracer.emit('outbound', event);
        outboundTracer.observe();
        // THEN
        expect(OutboundTracer.prototype.on).to.have.been.called();
        expect(onCallbackSpy).to.have.been.calledWith(event);
        onSpy.restore();
      });
    });
  });
});
