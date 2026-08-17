/**
 * N/cache mock - NetSuite Cache Module
 * @see https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4642573898.html
 */

let cacheStore = {};
let cacheConfig = {
  defaultTtl: 300,
};

const createMockCache = (name, scope) => ({
  name,
  scope,

  get: jest.fn((options) => {
    const key = options.key;
    const cached = cacheStore[name]?.[key];

    if (cached !== undefined) {
      return cached;
    }

    if (options.loader) {
      const value = options.loader();
      if (value !== undefined) {
        if (!cacheStore[name]) cacheStore[name] = {};
        cacheStore[name][key] = value;
      }
      return value;
    }

    return null;
  }),

  put: jest.fn((options) => {
    const { key, value, ttl } = options;
    if (!cacheStore[name]) cacheStore[name] = {};
    cacheStore[name][key] = value;
  }),

  remove: jest.fn((options) => {
    const { key } = options;
    if (cacheStore[name]) {
      delete cacheStore[name][key];
    }
  }),
});

module.exports = {
  getCache: jest.fn((options) => {
    const { name, scope } = options;
    return createMockCache(name, scope || 'PRIVATE');
  }),

  Scope: {
    PRIVATE: 'PRIVATE',
    PUBLIC: 'PUBLIC',
    PROTECTED: 'PROTECTED',
  },

  // 🔧 Test helpers
  __setCacheValue: (cacheName, key, value) => {
    if (!cacheStore[cacheName]) cacheStore[cacheName] = {};
    cacheStore[cacheName][key] = value;
  },

  __getCacheValue: (cacheName, key) => {
    return cacheStore[cacheName]?.[key];
  },

  __getState: () => JSON.parse(JSON.stringify(cacheStore)),

  __reset: () => {
    cacheStore = {};
    cacheConfig = { defaultTtl: 300 };
    jest.clearAllMocks();
  },
};