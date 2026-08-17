/**
 * N/https mock - NetSuite HTTPS Module
 * @see https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4418229131.html
 */

let mockConfig = {
  response: {
    code: 200,
    body: '{}',
    headers: {},
  },
  throwError: null,
};

const buildResponse = () => ({
  code: mockConfig.response.code,
  body: mockConfig.response.body,
  headers: mockConfig.response.headers,
  getHeaders: jest.fn(() => mockConfig.response.headers),
});

const httpsMethod = jest.fn((options = {}) => {
  if (mockConfig.throwError) {
    throw mockConfig.throwError;
  }
  return buildResponse();
});

const createSecureString = (options = {}) => ({
  _value: options.input || '',
  appendString: jest.fn(function(options) {
    this._value += options.input || '';
    return this;
  }),
  appendSecureString: jest.fn(function(options) {
    if (options.secureString && options.secureString._value) {
      this._value += options.secureString._value;
    }
    return this;
  }),
  convertEncoding: jest.fn(function() {
    return this;
  }),
  hash: jest.fn(function() {
    return this;
  }),
  hmac: jest.fn(function() {
    return this;
  }),
  toString: jest.fn(function() {
    return this._value;
  }),
});

module.exports = {
  // HTTPS methods
  get: httpsMethod,
  post: httpsMethod,
  put: httpsMethod,
  delete: httpsMethod,
  request: httpsMethod,
  requestSuitelet: httpsMethod,
  requestRestlet: httpsMethod,

  // Secure string methods
  createSecureString: jest.fn((options) => createSecureString(options)),

  createSecureKey: jest.fn((options) => ({
    _secret: options.secret,
    _encoding: options.encoding || 'UTF_8',
  })),

  createHmac: jest.fn((options) => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn(() => createSecureString({ input: 'mock_hmac_digest' })),
  })),

  // Enums
  Method: {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
    HEAD: 'HEAD',
  },

  Encoding: {
    UTF_8: 'UTF_8',
    BASE_64: 'BASE_64',
    BASE_64_URL_SAFE: 'BASE_64_URL_SAFE',
    HEX: 'HEX',
  },

  HashAlg: {
    SHA1: 'SHA1',
    SHA256: 'SHA256',
    SHA512: 'SHA512',
    MD5: 'MD5',
  },

  SecretRef: {
    SCRIPT_OWNER: 'SCRIPT_OWNER',
    COMPANY_OWNER: 'COMPANY_OWNER',
  },

  // 🔧 test controls
  __setMockResponse: (response) => {
    mockConfig.response = {
      ...mockConfig.response,
      ...response,
    };
  },

  __throwError: (error) => {
    mockConfig.throwError = error;
  },

  __reset: () => {
    mockConfig = {
      response: {
        code: 200,
        body: '{}',
        headers: {},
      },
      throwError: null,
    };
    jest.clearAllMocks();
  },
};