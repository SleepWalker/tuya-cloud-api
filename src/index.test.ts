import { tuyaApi } from './';

it('should export api object', () => {
  expect(tuyaApi).toEqual(expect.any(Object));
});
