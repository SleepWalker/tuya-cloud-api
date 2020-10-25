import type { NormalizedOptions } from 'got/dist/source/core';
import type {
  TokenResponse,
  DeviceWithFunctions,
  DeviceResponse,
  FunctionsResponse,
  DeviceCommandsResponse,
  Device,
  DeviceListResponse,
  DeviceFunctions,
  DeviceStatusResponse,
  DeviceFunctionStatus,
} from './types';
import { httpClient, configure } from './httpClient';

interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  ttl: number;
}

class TuyaApi {
  tokenRequest: {
    expiresAt: number;
    promise: Promise<string>;
  } = {
    expiresAt: Date.now() - 3,
    promise: Promise.resolve(''),
  };

  async authorize({
    apiClientId,
    apiClientSecret,
    serverLocation,
  }: {
    apiClientId: string;
    apiClientSecret: string;
    serverLocation?: string;
  }) {
    configure({
      clientId: apiClientId,
      clientSecret: apiClientSecret,
      serverLocation,
      getToken: (options) => this.getTokenForRequest(options),
    });
  }

  async getToken({
    grantType = 1,
    refreshToken = null,
  }: {
    // if refresh token is passed, it will be used to request new token
    refreshToken?: string | null;
    grantType?:
      | 1 // simple mode
      // auth code mode
      | 2;
  } = {}): Promise<TokenData> {
    let uri = 'token';

    if (refreshToken) {
      uri += `/${refreshToken}`;
    }

    const { body } = await httpClient.get<TokenResponse>(uri, {
      searchParams: {
        grant_type: grantType,
      },
    });

    const { result } = body;
    const ttl = (result.expire_time - 20) * 1000;

    return {
      accessToken: result.access_token,
      refreshToken: result.refresh_token,
      expiresAt: Date.now() - ttl,
      ttl,
    };
  }

  async getTokenForRequest(options: NormalizedOptions): Promise<string | null> {
    if (options.url.pathname.includes('/token')) {
      // do not add accessToken if it is token request
      return null;
    }

    let { promise } = this.tokenRequest;

    if (Date.now() > this.tokenRequest.expiresAt) {
      const request = {
        // this will be updated, when we get a token
        expiresAt: Date.now() + 10000,
        promise: this.getToken({
          grantType: 1,
        }).then(
          ({ expiresAt, accessToken }) => {
            this.tokenRequest.expiresAt = expiresAt;

            return accessToken;
          },
          (error) => {
            console.error('Error requesting token', {
              error,
            });

            this.tokenRequest.expiresAt = Date.now() - 3;

            throw error;
          },
        ),
      };

      this.tokenRequest = request;

      ({ promise } = request);
    }

    return promise;
  }

  async getDeviceWithFunctions({
    deviceId,
  }: {
    deviceId: string;
  }): Promise<DeviceWithFunctions> {
    const [device, functions] = await Promise.all([
      this.getDevice({ deviceId }),
      this.getDeviceFunctions({ deviceId }),
    ]);

    return {
      ...device,
      functions,
    };
  }

  async getDevice({ deviceId }: { deviceId: string }): Promise<Device> {
    const { body } = await httpClient.get<DeviceResponse>(
      `devices/${deviceId}`,
    );

    return body.result;
  }

  async getDeviceStatus({
    deviceId,
  }: {
    deviceId: string;
  }): Promise<DeviceFunctionStatus[]> {
    const { body } = await httpClient.get<DeviceStatusResponse>(
      `devices/${deviceId}/status`,
    );

    return body.result;
  }

  async getDeviceList({ uid }: { uid: string }): Promise<Device[]> {
    const { body } = await httpClient.get<DeviceListResponse>(
      `users/${uid}/devices`,
    );

    return body.result;
  }

  async getDeviceFunctions({
    deviceId,
  }: {
    deviceId: string;
  }): Promise<DeviceFunctions> {
    const { body } = await httpClient.get<FunctionsResponse>(
      `devices/${deviceId}/functions`,
    );

    return body.result;
  }

  async sendCommand({
    deviceId,
    commands,
  }: {
    deviceId: string;
    commands: {
      code: string;
      value: any;
    }[];
  }): Promise<boolean> {
    const { body } = await httpClient.post<DeviceCommandsResponse>(
      `devices/${deviceId}/commands`,
      {
        json: {
          commands,
        },
      },
    );

    return body.result;
  }
}

export const tuyaApi = new TuyaApi();
