import http from 'http';
import https from 'https';
import { SerializedInboundEvent, SerializedOutboundEvent } from '../src/domain/events/Event';
import Hinout from '../src/Hinout';
import { expect, sinon } from './config';
import { httpServer, httpsServer } from './server';
import { EventHandler } from '../src/infrastructure/EventHandler';
import { EVENT_TYPES } from '../src/domain/events/EventTypes';

describe('Hinout', () => {
  const path = '/foo';
  const errorPath = '/bar';
  const logFn = sinon.spy();
  new Hinout({ logFn, eventHandler: new EventHandler() }).collect();

  beforeEach(() => {
    sinon.stub(process, 'hrtime').returns([0, 0]);
    sinon.stub(Date, 'now').returns(12345);
  });
  afterEach(() => {
    logFn.resetHistory();
    sinon.restore();
  });

  describe('.({ logFn, eventHandler })', () => {
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

        context('success', () => {
          context('.get(url)', () => {
            it('logs inbound and outbound request', async () => {
              // GIVEN
              const expectedOutboundEvent: SerializedOutboundEvent = {
                eventType: EVENT_TYPES.OUTBOUND,
                host: `localhost:${port}`,
                method: `localhost:${port}`,
                path: '/foo',
                timestamp: 12345
              };

              const expectedInboundEvent: SerializedInboundEvent = {
                data: '{"foo":"bar"}',
                elapsedTimeInMs: 0,
                eventType: EVENT_TYPES.INBOUND,
                httpVersion: '1.1',
                statusCode: 200,
                statusMessage: 'OK',
                timestamp: 12345
              };
              // WHEN
              await get(path, module);
              // THEN
              expect(logFn.getCall(0)).to.have.been.calledWith(expectedOutboundEvent);
              expect(logFn.getCall(1)).to.have.been.calledWith(expectedInboundEvent);
            });
          });

          context('.request(options)', () => {
            [
              { method: 'GET', statusCode: 200, statusMessage: 'OK', response: '{"foo":"bar"}' },
              { method: 'POST', statusCode: 201, statusMessage: 'Created', response: 'Created' },
              { method: 'PUT', statusCode: 200, statusMessage: 'OK', response: '{"foo":"bar"}' },
              { method: 'DELETE', statusCode: 200, statusMessage: 'OK', response: 'OK' }
            ].forEach(({ method, statusCode, statusMessage, response }) => {
              context(`HTTP method: ${method}`, () => {
                it('logs inbound and outbound request', async () => {
                  const expectedOutboundEvent: SerializedOutboundEvent = {
                    eventType: EVENT_TYPES.OUTBOUND,
                    host: `localhost:${port}`,
                    method: `localhost:${port}`,
                    path: '/foo',
                    timestamp: 12345
                  };

                  const expectedInboundEvent: SerializedInboundEvent = {
                    data: response,
                    elapsedTimeInMs: 0,
                    eventType: EVENT_TYPES.INBOUND,
                    httpVersion: '1.1',
                    statusCode,
                    statusMessage,
                    timestamp: 12345
                  };
                  // WHEN
                  await request(method, path, module);
                  // THEN
                  expect(logFn.getCall(0)).to.have.been.calledWith(expectedOutboundEvent);
                  expect(logFn.getCall(1)).to.have.been.calledWith(expectedInboundEvent);
                });
              });
            });
          });
        });

        context('error', () => {
          context('.get()', () => {
            it('logs inbound and outbound request', async () => {
              // GIVEN
              const expectedOutboundEvent: SerializedOutboundEvent = {
                eventType: EVENT_TYPES.OUTBOUND,
                host: `localhost:${port}`,
                method: `localhost:${port}`,
                path: errorPath,
                timestamp: 12345
              };

              const expectedInboundEvent: SerializedInboundEvent = {
                data: 'Bad Request',
                elapsedTimeInMs: 0,
                eventType: EVENT_TYPES.INBOUND,
                httpVersion: '1.1',
                statusCode: 400,
                statusMessage: 'Bad Request',
                timestamp: 12345
              };
              // WHEN
              await get(errorPath, module);
              // THEN
              expect(logFn).to.have.been.calledTwice();
              expect(logFn.getCall(0)).to.have.been.calledWith(expectedOutboundEvent);
              expect(logFn.getCall(1)).to.have.been.calledWith(expectedInboundEvent);
            });
          });

          context('.request()', () => {
            [
              { method: 'GET', statusCode: 400, statusMessage: 'Bad Request', response: 'Bad Request' },
              { method: 'POST', statusCode: 401, statusMessage: 'Unauthorized', response: 'Unauthorized' },
              { method: 'PUT', statusCode: 404, statusMessage: 'Not Found', response: 'Not Found' },
              { method: 'DELETE', statusCode: 403, statusMessage: 'Forbidden', response: 'Forbidden' }
            ].forEach(({ method, statusCode, response }) => {
              context(`HTTP method: ${method}`, () => {
                it('logs inbound and outbound request', async () => {
                  // GIVEN
                  const expectedOutboundEvent: SerializedOutboundEvent = {
                    eventType: EVENT_TYPES.OUTBOUND,
                    host: `localhost:${port}`,
                    method: `localhost:${port}`,
                    path: errorPath,
                    timestamp: 12345
                  };

                  const expectedInboundEvent: SerializedInboundEvent = {
                    data: response,
                    elapsedTimeInMs: 0,
                    eventType: EVENT_TYPES.INBOUND,
                    httpVersion: '1.1',
                    statusCode,
                    statusMessage: response,
                    timestamp: 12345
                  };
                  // WHEN
                  await request(method, errorPath, module);
                  // THEN
                  expect(logFn).to.have.been.calledTwice();
                  expect(logFn.getCall(0)).to.have.been.calledWith(expectedOutboundEvent);
                  expect(logFn.getCall(1)).to.have.been.calledWith(expectedInboundEvent);
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
    const data: string[] = [];
    module['get'](`${host}${path}`, (result) => {
      result.on('data', (chunk) => {
        data.push(chunk.toString());
      });
      result.on('end', () => resolve(...(data as [any])));
      result.on('error', reject);
    }).end();
  });
}

function request(method: string, path: string, module: typeof http | typeof https) {
  const isHttps = module === https;
  const port = isHttps ? 8443 : 8081;
  return new Promise((resolve, reject) => {
    const data: string[] = [];
    module['request']({ host: 'localhost', port, path, method }, (result) => {
      result.on('data', (chunk) => {
        data.push(chunk.toString());
      });
      result.on('end', () => resolve(...(data as [any])));
      result.on('error', reject);
    }).end();
  });
}
