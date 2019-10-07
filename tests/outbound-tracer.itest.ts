import http from 'http';
import server from './server';
import { sinon, expect } from './config';
import OutboundTracer from '../src/outbound-tracer';

describe('Outbound Tracer', () => {
  describe('.(logFn)', () => {
    context('http', () => {
      const fakeServer = server.start();
      after(() => fakeServer.close());
      it('logs the emitted event using the provided { logFn }', async () => {
        // GIVEN
        const logFn = sinon.spy();
        const outboundTracer = new OutboundTracer(logFn);
        // WHEN
        outboundTracer.observe();
        http.get('http://localhost:8081/foo', () => {
          // THEN
          expect(logFn).to.have.been.calledWith({});
          outboundTracer.removeAllListeners();
        });
      });
    });
  });
});
