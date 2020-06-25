import { tuyaApi } from './tuyaApi';

it('should export api object', () => {
  expect(tuyaApi).toEqual(expect.any(Object));
});
