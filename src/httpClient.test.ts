import nock from 'nock';

import { httpClient, configure } from './httpClient';

const clientId = 'clientId';
const clientSecret = 'clientSecret';
const token = 'token';

it('should send api request', async () => {
  const scope = nock(/openapi\.tuyaeu/, {
    reqheaders: {
      client_id: clientId,
      sign: /.+/,
      t: /\d+/,
      sign_method: 'HMAC-SHA256',
      access_token: token,
    },
  })
    .get('/v1.0/foo')
    .reply(200, { success: true });

  configure({
    clientId,
    clientSecret,
    getToken: async () => token,
  });

  const resp = await httpClient.get('foo');

  expect(resp.body).toEqual({ success: true });

  scope.done();
});

it('should allow select api host', async () => {
  const scope = nock(/openapi\.tuyacn/, {
    reqheaders: {
      client_id: clientId,
      sign: /.+/,
      t: /\d+/,
      sign_method: 'HMAC-SHA256',
      access_token: token,
    },
  })
    .get('/v1.0/foo')
    .reply(200, { success: true });

  configure({
    clientId,
    clientSecret,
    getToken: async () => token,
    serverLocation: 'cn',
  });

  const resp = await httpClient.get('foo');

  expect(resp.body).toEqual({ success: true });

  scope.done();
});
