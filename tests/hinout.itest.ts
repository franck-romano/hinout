import http from 'http';
import server from './server';
import Hinout from '../src/hinout';
import { sinon, expect } from './config';

describe('Hinout', () => {
  let fakeServer;
  before(() => (fakeServer = server.listen(8081)));
  after(() => fakeServer.close());

  describe('.(logFn)', () => {
    const host = 'localhost';
    const port = 8081;
    const path = '/foo';
    const expectedHost = `${host}:${port}`;

    context('http', () => {
      context('http.get()', () => {
        it('logs inbound an outbound request', async () => {
          // GIVEN
          const logFn = sinon.spy();
          new Hinout({ logFn }).observe();
          // WHEN
          http
            .get(`http://${host}:${port}${path}`, result => {
              result.on('data', () => { });
              expect(logFn.getCall(0)).to.have.been.calledWith({ host: expectedHost, method: 'GET', path: '/foo' });
              expect(logFn.getCall(1)).to.have.been.calledWith({
                httpVersion: '1.1',
                statusCode: 200,
                statusMessage: 'OK'
              });
            })
            .on('error', () => { });
        });
      });

      context('http.request()', () => {
        [
          { method: 'GET', statusCode: 200, statusMessage: 'OK' },
          { method: 'POST', statusCode: 201, statusMessage: 'Created' },
          { method: 'PUT', statusCode: 200, statusMessage: 'OK' },
          { method: 'DELETE', statusCode: 200, statusMessage: 'OK' }
        ].forEach(({ method, statusCode, statusMessage }) => {
          context(`HTTP method: ${method}`, () => {
            it('logs inbound an outbound request', async () => {
              // GIVEN
              const logFn = sinon.spy();
              new Hinout({ logFn }).observe();
              // WHEN
              const req = http
                .request({ host, port, path, method }, result => {
                  result.on('data', () => { });
                  result.on('end', () => {
                    expect(logFn).to.have.been.calledWith({ host: expectedHost, method, path });
                    expect(logFn).to.have.been.calledWith({
                      httpVersion: '1.1',
                      statusCode,
                      statusMessage
                    });
                    logFn.resetHistory();
                  });
                })
                .on('error', () => { });

              req.write('end', () => {
                req.end();
              });
            });
          });
        });
      });
    });
  });
});
