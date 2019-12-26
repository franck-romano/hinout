import http from 'http';
import https from 'https';
import Hinout from '../src/hinout';
import { sinon, expect } from './config';
import { httpServer, httpsServer } from './server';
import format from '../src/infrastructure/formatter';
import EventHandler from '../src/infrastructure/event-handler';

describe('Hinout', () => {
  const path = '/foo';
  const errorPath = '/bar';
  const host = 'localhost';
  const logFn = sinon.spy();
  new Hinout({ logFn, formatFn: format, eventHandler: new EventHandler() }).collect();

  const processHrtimeStub = sinon.stub(process, 'hrtime');
  const dateNowStub = sinon.stub(Date, 'now');
  beforeEach(() => {
    dateNowStub.returns(12345);
    processHrtimeStub.returns([0, 0]);
  });
  afterEach(() => {
    logFn.resetHistory();
    dateNowStub.reset();
    processHrtimeStub.reset();
  });

  describe('.({ logFn , formatFn, eventHandler })', () => {
    [
      {
        module: http,
        moduleUnderTest: 'HTTP',
        server: httpServer,
        port: 8081
      },
      {
        module: https,
        moduleUnderTest: 'HTTPS',
        server: httpsServer,
        port: 8443
      }
    ].forEach(({ module, moduleUnderTest, server, port }) => {
      context(`${moduleUnderTest}`, () => {
        let fakeServer;
        before(() => {
          fakeServer = server.listen(port);
          process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
        });
        after(() => {
          fakeServer.close();
          process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';
        });

        context('succes', () => {
          context('.get(url)', () => {
            it('logs inbound and outbound request', async () => {
              // WHEN
              await get(path, module);
              // THEN
              expect(logFn).to.have.been.calledTwice();
              expect(logFn.getCall(0)).to.have.been.calledWith(`[12345] OUT - GET ${host}:${port}${path}`);
              expect(logFn.getCall(1)).to.have.been.calledWith('[12345] IN - HTTP 1.1 200 OK - Elapsed time: 0s 0ms');
            });
          });

          context('.request(options)', () => {
            [
              { method: 'GET', statusCode: 200, statusMessage: 'OK' },
              { method: 'POST', statusCode: 201, statusMessage: 'Created' },
              { method: 'PUT', statusCode: 200, statusMessage: 'OK' },
              { method: 'DELETE', statusCode: 200, statusMessage: 'OK' }
            ].forEach(({ method, statusCode, statusMessage }) => {
              context(`HTTP method: ${method}`, () => {
                it('logs inbound and outbound request', async () => {
                  // WHEN
                  await request(method, path, module);
                  // THEN
                  expect(logFn).to.have.been.calledTwice();
                  expect(logFn.getCall(0)).to.have.been.calledWith(`[12345] OUT - ${method} ${host}:${port}${path}`);
                  expect(logFn.getCall(1)).to.have.been.calledWith(
                    `[12345] IN - HTTP 1.1 ${statusCode} ${statusMessage} - Elapsed time: 0s 0ms`
                  );
                });
              });
            });
          });
        });

        context('error', () => {
          context('.get()', () => {
            it('logs inbound and outbound request', async () => {
              // WHEN
              await get(errorPath, module);
              // THEN
              expect(logFn).to.have.been.calledTwice();
              expect(logFn.getCall(0)).to.have.been.calledWith(`[12345] OUT - GET ${host}:${port}${errorPath}`);
              expect(logFn.getCall(1)).to.have.been.calledWith(
                '[12345] IN - HTTP 1.1 400 Bad Request - Elapsed time: 0s 0ms'
              );
            });
          });

          context('.request()', () => {
            [
              { method: 'GET', statusCode: 400, statusMessage: 'Bad Request' },
              { method: 'POST', statusCode: 401, statusMessage: 'Unauthorized' },
              { method: 'PUT', statusCode: 404, statusMessage: 'Not Found' },
              { method: 'DELETE', statusCode: 403, statusMessage: 'Forbidden' }
            ].forEach(({ method, statusCode, statusMessage }) => {
              context(`HTTP method: ${method}`, () => {
                it('logs inbound and outbound request', async () => {
                  // WHEN
                  await request(method, errorPath, module);
                  // THEN
                  expect(logFn).to.have.been.calledTwice();
                  expect(logFn.getCall(0)).to.have.been.calledWith(
                    `[12345] OUT - ${method} ${host}:${port}${errorPath}`
                  );
                  expect(logFn.getCall(1)).to.have.been.calledWith(
                    `[12345] IN - HTTP 1.1 ${statusCode} ${statusMessage} - Elapsed time: 0s 0ms`
                  );
                });
              });
            });
          });
        });
      });
    });
  });
});

function get(path: string, module: typeof http | typeof https) {
  const isHttps = module === https;
  const host = isHttps ? 'https://localhost:8443' : 'http://localhost:8081';
  return new Promise((resolve, reject) => {
    const data: any = [];
    module['get'](`${host}${path}`, result => {
      result.on('data', chunk => {
        data.push(chunk.toString());
      });
      result.on('end', () => resolve(...data));
      result.on('error', reject);
    }).end();
  });
}

function request(method: string, path: string, module: typeof http | typeof https) {
  const isHttps = module === https;
  const port = isHttps ? 8443 : 8081;
  return new Promise((resolve, reject) => {
    const data: any = [];
    module['request']({ host: 'localhost', port, path, method }, result => {
      result.on('data', chunk => {
        data.push(chunk.toString());
      });
      result.on('end', () => resolve(...data));
      result.on('error', reject);
    }).end();
  });
}
