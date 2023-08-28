import type { URL as URLFromModule } from 'url';
import crypto from 'crypto';

/**
 * @see https://developer.tuya.com/en/docs/iot/new-singnature?id=Kbw0q34cs2e5g#title-2-Structure
 */
export function createStringToSign({
  url,
  method,
  body = {},
  headers = {},
}: {
  url: URL | URLFromModule;

  /**
   * Upper case method name: GET, POST, PUT, and DELETE
   */
  method: string;
  body?: { [key: string]: any };
  headers?: { [key: string]: any };
}) {
  const sha256 = crypto
    .createHash('sha256')
    .update(body && Object.keys(body).length ? JSON.stringify(body) : '')
    .digest('hex');
  let normalizedUrl = url.pathname;
  const { searchParams } = url;
  const orderedKeys = [...url.searchParams.keys()].sort();

  // NOTE: we can not use searchParams.size because it may not be implemented
  if (orderedKeys.length) {
    const parts: string[] = [];

    for (const key of orderedKeys) {
      const value = searchParams.get(key);

      let part = key;

      if (value) {
        part += `=${value}`;
      }

      parts.push(part);
    }

    normalizedUrl += `?${parts.join('&')}`;
  }

  let headersString = '';

  if (headers && Object.keys(headers).length) {
    headersString = Object.entries(headers).reduce(
      (acc, pair) => acc + `${pair.join(':')}\n`,
      '',
    );
  }

  return `${method}\n${sha256}\n${headersString}\n${normalizedUrl}`;
}
