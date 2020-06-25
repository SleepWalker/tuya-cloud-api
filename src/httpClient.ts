import type { Response } from 'got/dist/source';
import type { NormalizedOptions } from 'got/dist/source/core';
import got from 'got';
import assert from 'assert';
import crypto from 'crypto';

const defaultContext: {
  clientId: null | string;
  clientSecret: null | string;
  channelId: null | string;
  getToken: (options: NormalizedOptions) => Promise<string | null>;
} = {
  clientId: null,
  clientSecret: null,
  channelId: null,
  getToken: async () => null,
};

export const httpClient = got.extend({
  prefixUrl: 'https://openapi.tuyaeu.com/v1.0/',
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
    beforeRequest: [
      async (options) => {
        const { clientId, getToken } = defaultContext;
        const now = Date.now();
        const accessToken = await getToken(options);

        assert(clientId, 'client id is required for request');

        options.headers.client_id = clientId;
        options.headers.sign = createSign({
          payload: [clientId, accessToken, now].filter(Boolean).join(''),
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

export const configure = ({
  clientId,
  clientSecret,
  channelId,
  getToken,
}: {
  clientId: string;
  clientSecret: string;
  channelId: string;
  getToken: (options: NormalizedOptions) => Promise<string | null>;
}): void => {
  assert(clientId, 'clientId required');
  assert(clientSecret, 'clientSecret required');
  assert(channelId, 'channelId required');
  assert(getToken, 'getToken required');

  Object.assign(defaultContext, {
    clientId,
    clientSecret,
    channelId,
    getToken,
  });
};
