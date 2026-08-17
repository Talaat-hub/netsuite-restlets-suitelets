/**
 * N/http mock - NetSuite HTTP Module
 * @see https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4296359529.html
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

const httpMethod = jest.fn((options = {}) => {
  if (mockConfig.throwError) {
    throw mockConfig.throwError;
  }
  return buildResponse();
});

module.exports = {
  // HTTP methods
  get: httpMethod,
  post: httpMethod,
  put: httpMethod,
  delete: httpMethod,
  request: httpMethod,

  // Enums
  Method: {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
    HEAD: 'HEAD',
  },

  CacheDuration: {
    UNIQUE: 'UNIQUE',
    SHORT: 'SHORT',
    MEDIUM: 'MEDIUM',
    LONG: 'LONG',
  },

  RedirectType: {
    RECORD: 'RECORD',
    SUITELET: 'SUITELET',
    RESTLET: 'RESTLET',
    MEDIA_ITEM: 'MEDIA_ITEM',
    TASK_LINK: 'TASK_LINK',
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