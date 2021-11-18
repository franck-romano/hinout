import nock from 'nock';
import http from 'http';
import https from 'https';
import { EventEmitter } from 'events';
import { sinon, expect } from './config';
import { EventHandler } from '../src/infrastructure/EventHandler';

describe('Event Handler', () => {
  describe('.attachListeners()', () => {
    let hinoutHttpNock, hinoutHttpsNock, prependOnceListenerStub, emitStub;
    const eventHandler = new EventHandler();
    beforeEach(() => {
      hinoutHttpNock = nock(httpUrl);
      hinoutHttpsNock = nock(httpsUrl);
      hinoutHttpNock.get('/').reply(200);
      hinoutHttpsNock.get('/').reply(200);
      emitStub = sinon.stub(EventEmitter.prototype, 'emit');
      prependOnceListenerStub = sinon.stub(EventEmitter.prototype, 'prependOnceListener');
    });

    afterEach(() => {
      nock.cleanAll();
      emitStub.restore();
      prependOnceListenerStub.restore();
    });

    const httpUrl = 'http://some-url.com';
    const httpsUrl = 'https://some-url.com';
    [
      { moduleUnderTest: http, name: 'http', url: httpUrl },
      { moduleUnderTest: https, name: 'https', url: httpsUrl }
    ].forEach(({ moduleUnderTest, name, url }) => {
      context(`${name} module`, () => {
        context('.get()', () => {
          context('outbounding event', () => {
            it('attaches a listeners and emits an event', () => {
              // GIVEN
              eventHandler.attachListeners();
              // WHEN
              moduleUnderTest.get(url);
              // THEN
              prependOnceListenerStub.withArgs('finish').yield();
              expect(prependOnceListenerStub).to.have.been.calledWith('finish');
              expect(emitStub).to.have.been.called();
            });
          });

          context('inbounding event', () => {
            it('attaches a listeners and emits an event', () => {
              // GIVEN
              eventHandler.attachListeners();
              // WHEN
              moduleUnderTest.get(url);
              // THEN
              expect(prependOnceListenerStub).to.have.been.calledWith('response');
              expect(emitStub).to.have.been.called();
            });
          });
        });

        context('.request()', () => {
          context('outbounding event', () => {
            it('attaches a listeners and emits an event', () => {
              // GIVEN
              eventHandler.attachListeners();
              // WHEN
              moduleUnderTest.request(url);
              // THEN
              prependOnceListenerStub.withArgs('finish').yield();
              expect(prependOnceListenerStub).to.have.been.calledWith('finish');
              expect(emitStub).to.have.been.called();
            });
          });

          context('inbounding event', () => {
            it('attaches a listeners and emits an event', () => {
              // GIVEN
              eventHandler.attachListeners();
              // WHEN
              moduleUnderTest.request(url);
              // THEN
              expect(prependOnceListenerStub).to.have.been.calledWith('response');
              expect(emitStub).to.have.been.called();
            });
          });
        });
      });
    });
  });
});
