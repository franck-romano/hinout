import http from 'http';
import nock from 'nock';
import sinon from 'sinon';
import chai, { expect as chaiExpect } from 'chai';
import { EventEmitter } from 'events';
import OutboundTracer from '../src/outbound-tracer';
const expect: any = chaiExpect;
import sinonChai from 'sinon-chai';
import dirtyChai from 'dirty-chai';
import chaiAsPromised from 'chai-as-promised';

chai.should();
chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(dirtyChai);

describe('Http Log Tracer', () => {
  const outboundUrl = 'http://some-url.com';
  let prependOnceListenerSpy, emitSpy, onSpy, outboundNock;

  beforeEach(() => {
    outboundNock = nock(outboundUrl);
    onSpy = sinon.spy(EventEmitter.prototype, 'on');
    emitSpy = sinon.spy(EventEmitter.prototype, 'emit');
    prependOnceListenerSpy = sinon.spy(EventEmitter.prototype, 'prependOnceListener');
  });
  afterEach(() => {
    onSpy.restore();
    nock.cleanAll();
    emitSpy.restore();
    prependOnceListenerSpy.restore();
  });

  describe('.(logFn)', () => {
    beforeEach(() => outboundNock.get('/').reply(200));
    describe('.collect()', () => {
      it('attaches an emitter on http.get function call', () => {
        // GIVEN
        const outboundTracer = new OutboundTracer();
        // WHEN
        outboundTracer.collect();
        http.get(outboundUrl);
        // THEN
        expect(prependOnceListenerSpy).to.have.been.calledWith('finish', sinon.match.func);
      });

      it('attaches an emitter on http.request function call', () => {
        // GIVEN
        const outboundTracer = new OutboundTracer();
        // WHEN
        outboundTracer.collect();
        http.request(outboundUrl);
        // THEN
        expect(prependOnceListenerSpy).to.have.been.calledWith('finish', sinon.match.func);
      });
    });

    describe('.listen()', () => {
      it('logs emitted events', () => {
        // GIVEN
        const logFnSpy = sinon.spy();
        const outboundTracer = new OutboundTracer(logFnSpy);
        // WHEN
        outboundTracer.listen();
        // THEN
        const args = onSpy.getCall(1).args;
        expect(args.length).to.equal(2);
        expect(args[0]).to.equal('outbound-ended');
        expect(args[1]).to.equal(logFnSpy);
      });
    });
  });
});
