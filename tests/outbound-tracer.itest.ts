import http from 'http';
import server from './server';
import { sinon, expect } from './config';
import OutboundTracer from '../src/outbound-tracer';

describe('Outbound Tracer', () => {
  let fakeServer;
  before(() => {
    fakeServer = server.listen(8081);
  });

  after(() => {
    fakeServer.close();
  });

  describe('.(logFn)', () => {
    const host = 'localhost';
    const port = 8081;
    const path = '/foo';
    const expectedHost = `${host}:${port}`;
    context('http', () => {
      context('http.get()', () => {
        it('logs the emitted event using the provided { logFn }', async () => {
          // GIVEN
          const logFn = sinon.spy();
          const outboundTracer = new OutboundTracer(logFn);
          // WHEN
          outboundTracer.observe();
          http
            .get('http://localhost:8081/foo', res => {
              res.on('data', () => {});
              expect(logFn).to.have.been.calledWith({ host: expectedHost, method: 'GET', path: '/foo' });
            })
            .on('error', () => {});
        });
      });

      context('http.request()', () => {
        ['GET', 'PUT', 'DELETE', 'POST'].forEach(method => {
          it('logs the emitted event using the provided { logFn }', async () => {
            // GIVEN
            const logFn = sinon.spy();
            const outboundTracer = new OutboundTracer(logFn);
            // WHEN
            outboundTracer.observe();
            const req = http
              .request({ host, port, path, method }, res => {
                res.on('data', () => {});
                res.on('end', () => {
                  expect(logFn).to.have.been.calledWith({ host: expectedHost, method, path });
                });
              })
              .on('error', () => {});

            req.write('end', () => {
              req.end();
            });
          });
        });
      });
    });
  });
});
