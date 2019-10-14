import http from 'http';
import nock from 'nock';
import https from 'https';
import Hinout from '../src/hinout';
import { EventEmitter } from 'events';
import { sinon, expect } from './config';

describe('Hinout', () => {
  const httpUrl = 'http://some-url.com';
  const httpsUrl = 'https://some-url.com';
  let prependOnceListenerSpy, emitSpy, hinoutHttpNock, hinoutHttpsNock;

  beforeEach(() => {
    hinoutHttpNock = nock(httpUrl);
    hinoutHttpsNock = nock(httpsUrl);
    emitSpy = sinon.spy(EventEmitter.prototype, 'emit');
    prependOnceListenerSpy = sinon.spy(EventEmitter.prototype, 'prependOnceListener');
  });
  afterEach(() => {
    nock.cleanAll();
    emitSpy.restore();
    prependOnceListenerSpy.restore();
  });

  describe('.({ logFn, formatFn })', () => {
    beforeEach(() => {
      hinoutHttpNock.get('/').reply(200)
      hinoutHttpsNock.get('/').reply(200)
    });
    describe('.collect()', () => {
      let hinout;
      before(() => (hinout = new Hinout({ logFn: sinon.spy(), formatFn: sinon.spy() })));
      [
        { moduleUnderTest: http, name: 'http', url: httpUrl },
        { moduleUnderTest: https, name: 'https', url: httpsUrl },
      ]
        .forEach(({ moduleUnderTest, name, url }) => {
          context(`${name} module`, () => {
            context('.get()', () => {
              it(`attaches listeners only once for each event ("finish", "response")`, () => {
                // GIVEN
                hinout.collect().collect();
                // WHEN
                moduleUnderTest.get(url);
                // THEN
                expect(prependOnceListenerSpy).to.have.been.calledTwice()
                expect(prependOnceListenerSpy.getCall(0)).to.have.been.calledWith('finish', sinon.match.func);
                expect(prependOnceListenerSpy.getCall(1)).to.have.been.calledWith('response', sinon.match.func);
              });
            })

            context('.request()', () => {
              it(`attaches listeners only once for each event ("finish", "response")`, () => {
                // WHEN
                hinout.collect().collect();
                moduleUnderTest.request(url);
                // THEN
                expect(prependOnceListenerSpy).to.have.been.calledTwice()
                expect(prependOnceListenerSpy.getCall(0)).to.have.been.calledWith('finish', sinon.match.func);
                expect(prependOnceListenerSpy.getCall(1)).to.have.been.calledWith('response', sinon.match.func);
              })
            })
          })
        })
    })
  })

  context('observing emitted events', () => {
    it('logs the formatted event', () => {
      // GIVEN
      const event = { some: 'event' };
      const logFnSpy = sinon.spy()
      const formatStub = sinon.stub().returns('event')
      const onSpy = sinon.spy(Hinout.prototype, 'on');
      const onCallbackSpy = sinon.spy();
      // WHEN
      new Hinout({ logFn: logFnSpy, formatFn: formatStub })
        .collect()
        .on('out', onCallbackSpy)
        .emit('out', event);;
      // THEN
      expect(onSpy).to.have.been.called();
      expect(onCallbackSpy).to.have.been.calledWith(event);
      expect(logFnSpy).to.have.been.calledWith('event')
      onSpy.restore();
    });
  })

  describe('.setLoggingFunction(logFn)', () => {
    it('replaces { logFn } with the new logging function', async () => {
      // GIVEN
      const newLoggerFn = sinon.stub()
      const defaultLogFn = sinon.stub()
      // WHEN
      new Hinout({ logFn: defaultLogFn, formatFn: sinon.spy() })
        .setLoggingFunction(newLoggerFn)
        .collect()
        .emit('out', 'some-event')
      // THEN
      expect(defaultLogFn).to.not.have.been.called()
      expect(newLoggerFn).to.have.been.called()
    })
  });
});
