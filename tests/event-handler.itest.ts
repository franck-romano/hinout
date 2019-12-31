import nock from 'nock';
import http from 'http';
import https from 'https';
import { EventEmitter } from 'events';
import { sinon, expect } from './config';
import EventHandler from '../src/infrastructure/event-handler';

describe.skip('Event Handler', () => {
  describe('.attachListeners()', () => {
    let hinoutHttpNock, hinoutHttpsNock, prependOnceListenerSpy, emitSpy;
    const eventHandler = new EventHandler();
    beforeEach(() => {
      hinoutHttpNock = nock(httpUrl);
      hinoutHttpsNock = nock(httpsUrl);
      hinoutHttpNock.get('/').reply(200);
      hinoutHttpsNock.get('/').reply(200);
      emitSpy = sinon.spy(EventEmitter.prototype, 'emit');
      prependOnceListenerSpy = sinon.spy(EventEmitter.prototype, 'prependOnceListener');
    });

    afterEach(() => {
      emitSpy.restore();
      prependOnceListenerSpy.restore();
      nock.cleanAll();
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
              prependOnceListenerSpy.withArgs('finish').yield();
              expect(prependOnceListenerSpy).to.have.been.calledWith('finish');
              expect(emitSpy).to.have.been.called();
            });
          });

          context('inbounding event', () => {
            it('attaches a listeners and emits an event', () => {
              // GIVEN
              eventHandler.attachListeners();
              // WHEN
              moduleUnderTest.get(url);
              // THEN
              expect(prependOnceListenerSpy).to.have.been.calledWith('response');
              expect(emitSpy).to.have.been.called();
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
              prependOnceListenerSpy.withArgs('finish').yield();
              expect(prependOnceListenerSpy).to.have.been.calledWith('finish');
              expect(emitSpy).to.have.been.called();
            });
          });

          context('inbounding event', () => {
            it('attaches a listeners and emits an event', () => {
              // GIVEN
              eventHandler.attachListeners();
              // WHEN
              moduleUnderTest.request(url);
              // THEN
              expect(prependOnceListenerSpy).to.have.been.calledWith('response');
              expect(emitSpy).to.have.been.called();
            });
          });
        });
      });
    });
  });
});
