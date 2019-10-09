import http from 'http';
import server from './server';
import Hinout from '../src/hinout';
import { sinon, expect } from './config';

describe('Hinout', () => {
  let fakeServer;
  before(() => (fakeServer = server.listen(8081)));
  after(() => fakeServer.close());

  describe('.({ logFn })', () => {
    const host = 'localhost';
    const port = 8081;
    const path = '/foo';
    const errorPath = '/bar'
    const expectedHost = `${host}:${port}`;

    context('http', () => {
      context('sucess', () => {
        context('.get(url)', () => {
          it('logs inbound an outbound request', async () => {
            // GIVEN
            const logFn = sinon.spy();
            new Hinout({ logFn }).observe();
            // WHEN
            http
              .get(`http://${host}:${port}${path}`, result => {
                result.on('data', () => { });
                expect(logFn.getCall(0)).to.have.been.calledWith({ host: expectedHost, method: 'GET', path });
                expect(logFn.getCall(1)).to.have.been.calledWith({
                  httpVersion: '1.1',
                  statusCode: 200,
                  statusMessage: 'OK'
                });
              })
              .on('error', () => { });
          });
        })

        context('.request(options)', () => {
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

      context('error', () => {
        context('http.get()', () => {
          it('logs inbound an outbound request', async () => {
            // GIVEN
            const logFn = sinon.spy();
            new Hinout({ logFn }).observe();
            // WHEN
            http
              .get(`http://${host}:${port}${errorPath}`, result => {
                result.on('data', () => { });
                expect(logFn.getCall(0)).to.have.been.calledWith({ host: expectedHost, method: 'GET', path: errorPath });
                expect(logFn.getCall(1)).to.have.been.calledWith({
                  httpVersion: '1.1',
                  statusCode: 400,
                  statusMessage: 'Bad Request'
                });
              })
          });
        });


        context('http.request()', () => {
          [
            { method: 'GET', statusCode: 400, statusMessage: 'Bad Request' },
            { method: 'POST', statusCode: 401, statusMessage: 'Unauthorized' },
            { method: 'PUT', statusCode: 404, statusMessage: 'Not Found' },
            { method: 'DELETE', statusCode: 403, statusMessage: 'Forbidden' }
          ]
            .forEach(({ method, statusCode, statusMessage }) => {
              context(`HTTP method: ${method}`, () => {
                it('logs inbound an outbound request', () => {
                  // GIVEN
                  const logFn = sinon.spy();
                  new Hinout({ logFn }).observe();
                  // WHEN
                  const req = http
                    .request({ host, port, path: errorPath, method }, result => {
                      result.on('data', () => { });
                      result.on('end', () => {
                        expect(logFn).to.have.been.calledWith({ host: expectedHost, method, path: errorPath });
                        expect(logFn).to.have.been.calledWith({
                          httpVersion: '1.1',
                          statusCode,
                          statusMessage
                        });
                      });
                    })

                  req.write('end', () => {
                    req.end();
                  });
                })
              });
            });
        });
      });
    });
  });
});
