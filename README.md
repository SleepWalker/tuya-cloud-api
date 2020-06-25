A nodejs implementation of tuya cloud api:
https://docs.tuya.com/en/iot/open-api/api-list/api/api

## Installation

```bash
npm install tuya-cloud-api
```

or

```bash
yarn add tuya-cloud-api
```

## Usage Example

You can read [this issue](https://github.com/codetheweb/tuyapi/issues/323) to
find out where to get `deviceId`.

Follow
[this instructions](https://github.com/codetheweb/tuyapi/blob/master/docs/SETUP.md#linking-a-tuya-device-with-smart-link)
to get `apiClientId` and `apiClientSecret` values (`api-key` and `api-secret`
from the linked doc).

```js
import { tuyaApi } from 'tuya-cloud-api';

const apiClientId = '...';
const apiClientSecret = '...';
const deviceId = '...';
const code = 'switch_1';

async function toggleDevice(deviceId, state = false) {
  await tuyaApi.authorize({
    apiClientId,
    apiClientSecret,
  });

  // get fresh device info
  const deviceStatus = await tuyaApi.getDeviceStatus({
    deviceId: this.deviceId,
  });
  const switchStatus = deviceStatus.find((item) => item.code === code);

  if (!switchStatus) {
    throw new Error(`Can not find status for command: ${code}`);
  }

  if (switchStatus.value === state) {
    return;
  }

  await tuyaApi.sendCommand({
    deviceId,
    commands: [
      {
        code,
        value: state,
      },
    ],
  });
}

{
  (async () => {
    try {
      await toggleDevice(deviceId, true);

      console.log('Successfully toggled the device on!');
      process.exit(0);
    } catch (error) {
      console.error('Error toggling device on', error);
      process.exit(1);
    }
  })();
}
```
