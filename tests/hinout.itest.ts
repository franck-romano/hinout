import http from 'http';
import server from './server';
import Hinout from '../src/hinout';
import format from '../src/formatter'
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
    // GIVEN
    const logFn = sinon.spy();
    new Hinout({ logFn, format }).collect()
    afterEach(() => logFn.resetHistory())

    context('http', () => {
      context('sucess', () => {
        context('.get(url)', () => {
          it('logs inbound an outbound request', async () => {
            // WHEN
            await httpGetPromisified(host, port, path);
            // THEN
            expect(logFn).to.have.been.calledTwice()
            expect(logFn.getCall(0)).to.have.been.calledWith(`OUT - GET ${host}:${port}${path}`);
            expect(logFn.getCall(1)).to.have.been.calledWith('IN - HTTP 1.1 200 OK');
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
                // WHEN
                await httpRequestPromisified(host, port, path, method)
                // THEN
                expect(logFn).to.have.been.calledTwice()
                expect(logFn.getCall(0)).to.have.been.calledWith(`OUT - ${method} ${host}:${port}${path}`);
                expect(logFn.getCall(1)).to.have.been.calledWith(`IN - HTTP 1.1 ${statusCode} ${statusMessage}`);
              });
            });
          });
        });
      });

      context('error', () => {
        context('http.get()', () => {
          it('logs inbound an outbound request', async () => {
            // WHEN
            await httpGetPromisified(host, port, errorPath);
            // THEN
            expect(logFn).to.have.been.calledTwice()
            expect(logFn.getCall(0)).to.have.been.calledWith(`OUT - GET ${host}:${port}${errorPath}`);
            expect(logFn.getCall(1)).to.have.been.calledWith('IN - HTTP 1.1 400 Bad Request');

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
                it('logs inbound an outbound request', async () => {
                  // WHEN
                  await httpRequestPromisified(host, port, errorPath, method)
                  // THEN
                  expect(logFn).to.have.been.calledTwice()
                  expect(logFn.getCall(0)).to.have.been.calledWith(`OUT - ${method} ${host}:${port}${errorPath}`);
                  expect(logFn.getCall(1)).to.have.been.calledWith(`IN - HTTP 1.1 ${statusCode} ${statusMessage}`);
                })
              });
            });
        });
      });
    });
  });
});

function httpGetPromisified(host: string, port: number, path: string) {
  return new Promise((resolve, reject) => {
    const data: any = []
    http
      .get(`http://${host}:${port}${path}`, result => {
        result.on('data', (chunk) => {
          data.push(chunk.toString())
        });
        result.on('end', () => resolve(...data));
        result.on('error', reject);
      }).end()

  });
}

function httpRequestPromisified(host: string, port: number, path: string, method: string) {
  return new Promise((resolve, reject) => {
    const data: any = []
    http
      .request({ host, port, path, method }, result => {
        result.on('data', (chunk) => {
          data.push(chunk.toString())
        });
        result.on('end', () => resolve(...data));
        result.on('error', reject);
      })
      .end();
  });
}

