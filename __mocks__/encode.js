/**
 * N/encode mock - NetSuite Encode Module
 * @see https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4358552361.html
 */

module.exports = {
  Encoding: {
    UTF_8: 'UTF_8',
    BASE_16: 'BASE_16',
    BASE_32: 'BASE_32',
    BASE_64: 'BASE_64',
    BASE_64_URL_SAFE: 'BASE_64_URL_SAFE',
    HEX: 'HEX',
  },

  convert: jest.fn((options) => {
    const { string, inputEncoding, outputEncoding } = options;

    // Base64 to UTF-8
    if (inputEncoding === 'BASE_64' && outputEncoding === 'UTF_8') {
      return Buffer.from(string, 'base64').toString('utf8');
    }

    // UTF-8 to Base64
    if (inputEncoding === 'UTF_8' && outputEncoding === 'BASE_64') {
      return Buffer.from(string, 'utf8').toString('base64');
    }

    // UTF-8 to HEX
    if (inputEncoding === 'UTF_8' && outputEncoding === 'HEX') {
      return Buffer.from(string, 'utf8').toString('hex');
    }

    // HEX to UTF-8
    if (inputEncoding === 'HEX' && outputEncoding === 'UTF_8') {
      return Buffer.from(string, 'hex').toString('utf8');
    }

    // Base64 URL Safe to UTF-8
    if (inputEncoding === 'BASE_64_URL_SAFE' && outputEncoding === 'UTF_8') {
      const base64 = string.replace(/-/g, '+').replace(/_/g, '/');
      return Buffer.from(base64, 'base64').toString('utf8');
    }

    // UTF-8 to Base64 URL Safe
    if (inputEncoding === 'UTF_8' && outputEncoding === 'BASE_64_URL_SAFE') {
      return Buffer.from(string, 'utf8')
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    }

    // Return unchanged if conversion not supported
    return string;
  }),
};