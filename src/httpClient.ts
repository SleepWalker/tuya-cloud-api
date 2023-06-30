import type { Response } from 'got/dist/source';
import type { NormalizedOptions } from 'got/dist/source/core';
import got from 'got';
import assert from 'assert';
import crypto from 'crypto';

const availableEndpoints = {
  eu: 'https://openapi.tuyaeu.com/v1.0',
  cn: 'https://openapi.tuyacn.com/v1.0',
  us: 'https://openapi.tuyaus.com/v1.0',
  in: 'https://openapi.tuyain.com/v1.0',
};

const defaultContext: {
  clientId: null | string;
  clientSecret: null | string;
  prefixUrl: string;
  getToken: (options: NormalizedOptions) => Promise<string | null>;
} = {
  clientId: null,
  clientSecret: null,
  prefixUrl: availableEndpoints.eu,
  getToken: async () => null,
};

export const httpClient = got.extend({
  responseType: 'json',
  retry: {
    limit: 4,
    methods: [
      'GET',
      // POST is used only for device command,
      // which is idempotent and can be safely retried
      'POST',
    ],
  },
  hooks: {
    init: [
      (options) => {
        const { prefixUrl } = defaultContext;

        options.prefixUrl = `${prefixUrl}/`;
      },
    ],

    beforeRequest: [
      async (options) => {
        const { clientId, getToken } = defaultContext;
        const accessToken = await getToken(options);

        assert(clientId, 'client id is required for request');

        const now = Date.now();

        const { url, method, json } = options;

        const signString = stringToSign(
          method.toUpperCase(),
          JSON.stringify(json),
          '',
          `${url.pathname}${url.search}`,
        );

        options.headers.client_id = clientId;
        options.headers.sign = createSign({
          payload: [clientId, accessToken, now, signString]
            .filter(Boolean)
            .join(''),
        });
        options.headers.t = String(now);
        options.headers.sign_method = 'HMAC-SHA256';
        options.headers.access_token = accessToken || '';
      },
    ],

    afterResponse: [
      (
        response: Response<
          { success: true } | { success: false; msg: string; code: number }
        >,
      ) => {
        const {
          request: {
            options: { method, url },
          },
          body,
        } = response;
        const requestName = `${method} ${url.pathname}${url.search}`;

        if (!body.success) {
          const error = new Error(
            `Error requesting ${requestName}: ${body.msg} (${body.code})`,
          );
          error['code'] = body.code;
          error['response'] = response;
          error['request'] = response.request;
          error['options'] = response.request.options;

          throw error;
        }

        return response;
      },
    ],
  },
});

function createSign({ payload }: { payload: string }): string {
  const { clientSecret } = defaultContext;

  assert(clientSecret, 'clientSecret required');

  return crypto
    .createHmac('sha256', clientSecret)
    .update(payload)
    .digest('hex')
    .toUpperCase();
}

function stringToSign(method, body = '', headers: '', url) {
  const sha256 = crypto.createHash('sha256').update(body).digest('hex');

  return `${method}\n${sha256}\n${headers}\n${url}`;
}

export const configure = ({
  clientId,
  clientSecret,
  getToken,
  serverLocation = 'eu',
}: {
  clientId: string;
  clientSecret: string;
  getToken: (options: NormalizedOptions) => Promise<string | null>;
  serverLocation?: string;
}): void => {
  const prefixUrl = availableEndpoints[serverLocation];

  assert(clientId, 'clientId required');
  assert(clientSecret, 'clientSecret required');
  assert(getToken, 'getToken required');
  assert(prefixUrl, `Unknown serverLocation: ${serverLocation}`);

  Object.assign(defaultContext, {
    clientId,
    clientSecret,
    prefixUrl,
    getToken,
  });
};
