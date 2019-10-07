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
              expect(logFn).to.have.been.calledWith({});
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
              .request({ host: 'localhost', port: 8081, path: '/foo', method }, res => {
                res.on('data', () => {});
                res.on('end', () => {
                  expect(logFn).to.have.been.calledWith({});
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

function req(options) {
  return new Promise((resolve, reject) => {});
}
