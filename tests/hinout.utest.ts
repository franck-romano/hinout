import http from 'http';
import nock from 'nock';
import { EventEmitter } from 'events';
import { sinon, expect } from './config';
import Hinout from '../src/hinout';

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
      it('attaches an emitter on http.get function call', () => {
        // WHEN
        hinout.collect();
        http.get(url);
        // THEN
        expect(prependOnceListenerSpy).to.have.been.calledWith('finish', sinon.match.func);
      });

      it('attaches an emitter on http.request function call', () => {
        // WHEN
        hinout.collect();
        http.request(url);
        // THEN
        expect(prependOnceListenerSpy).to.have.been.calledWith('finish', sinon.match.func);
      });

      it('reacts to emitted events', () => {
        // GIVEN
        const event = { some: 'event' };
        const onCallbackSpy = sinon.spy();
        const onSpy = sinon.spy(Hinout.prototype, 'on');
        const hinout = new Hinout({ logFn: sinon.spy(), format: sinon.spy() });
        // WHEN
        hinout.collect();
        hinout.on('out', onCallbackSpy);
        hinout.emit('out', event);
        hinout.on('in', onCallbackSpy);
        hinout.emit('int', event);
        // THEN
        expect(Hinout.prototype.on).to.have.been.called();
        expect(onCallbackSpy).to.have.been.calledWith(event);
        onSpy.restore();
      });
    });

  });
});
