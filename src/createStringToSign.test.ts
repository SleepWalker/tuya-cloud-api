import { createStringToSign } from './createStringToSign';

it('should create signature for get requests', () => {
  const sign = createStringToSign({
    url: new URL('/foo?x=1&a=2', 'http://0.0.0.0'),
    method: 'GET',
  });

  expect(sign).toEqual(
    [
      'GET',
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      '',
      '/foo?a=2&x=1',
    ].join('\n'),
  );
});

it('should encode body', () => {
  const sign = createStringToSign({
    url: new URL('/foo', 'http://0.0.0.0'),
    method: 'POST',
    body: { foo: 'bar' },
  });

  expect(sign).toEqual(
    [
      'POST',
      '7a38bf81f383f69433ad6e900d35b3e2385593f76a7b7ab5d4355b8ba41ee24b',
      '',
      '/foo',
    ].join('\n'),
  );
});

it('should encode headers', () => {
  const sign = createStringToSign({
    url: new URL('/foo', 'http://0.0.0.0'),
    method: 'POST',
    headers: { foo: '1', bar: '2' },
  });

  expect(sign).toEqual(
    [
      'POST',
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      ['foo:1', 'bar:2'].join('\n'),
      // when we have headers there should be an extra new-line according to docs
      // https://developer.tuya.com/en/docs/iot/new-singnature?id=Kbw0q34cs2e5g#title-24-Why%20does%20a%20blank%20line%20exist%20in%20stringToSign%3F
      '',
      '/foo',
    ].join('\n'),
  );
});
