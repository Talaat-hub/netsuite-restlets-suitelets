/**
 * N/query mock - NetSuite Query Module (SuiteQL)
 * @see https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_1510275060.html
 */

let mockResults = [];
let mockPagedCount = 0;

const createResultSet = (results = []) => ({
  results: results,
  columns: [],
  types: [],

  asMappedResults: jest.fn(() => results),

  iterator: jest.fn(() => {
    let index = 0;
    return {
      each: jest.fn((callback) => {
        while (index < results.length) {
          const result = callback({
            value: {
              values: results[index],
              getValue: jest.fn((idx) => results[index]?.[idx]),
              asMap: jest.fn(() => results[index]),
            },
          });
          index++;
          if (result === false) break;
        }
      }),
    };
  }),
});

const createPagedData = (count = 0) => ({
  count,
  pageSize: 1000,
  pageCount: Math.ceil(count / 1000) || 1,

  iterator: jest.fn(() => {
    let pageIndex = 0;
    return {
      each: jest.fn((callback) => {
        while (pageIndex < Math.ceil(count / 1000)) {
          const result = callback({
            value: {
              data: mockResults,
              pageRange: { index: pageIndex, start: pageIndex * 1000 },
            },
          });
          pageIndex++;
          if (result === false) break;
        }
      }),
    };
  }),

  fetch: jest.fn((options) => ({
    data: createResultSet(mockResults),
    isFirst: options.index === 0,
    isLast: options.index >= Math.ceil(count / 1000) - 1,
    pagedData: this,
    pageRange: { index: options.index, start: options.index * 1000 },
  })),
});

const createQuery = () => ({
  type: null,
  columns: [],
  condition: null,
  filters: [],
  sort: [],

  createColumn: jest.fn((options) => options),
  createCondition: jest.fn((options) => options),
  createSort: jest.fn((options) => options),

  run: jest.fn(() => createResultSet(mockResults)),

  runPaged: jest.fn((options) => createPagedData(mockPagedCount)),

  toSuiteQL: jest.fn(() => ({
    query: 'SELECT * FROM table',
    params: [],
  })),
});

module.exports = {
  runSuiteQL: jest.fn((options) => createResultSet(mockResults)),

  runSuiteQLPaged: jest.fn((options) => createPagedData(mockPagedCount)),

  create: jest.fn((options) => createQuery()),

  load: jest.fn((options) => createQuery()),

  delete: jest.fn((options) => true),

  listTables: jest.fn(() => []),

  // Query types
  Type: {
    CUSTOMER: 'customer',
    EMPLOYEE: 'employee',
    ITEM: 'item',
    TRANSACTION: 'transaction',
    VENDOR: 'vendor',
    SUBSIDIARY: 'subsidiary',
    LOCATION: 'location',
    DEPARTMENT: 'department',
    CLASSIFICATION: 'classification',
  },

  RelativeDate: {
    TODAY: 'TODAY',
    YESTERDAY: 'YESTERDAY',
    TOMORROW: 'TOMORROW',
    THIS_WEEK: 'THIS_WEEK',
    LAST_WEEK: 'LAST_WEEK',
    NEXT_WEEK: 'NEXT_WEEK',
    THIS_MONTH: 'THIS_MONTH',
    LAST_MONTH: 'LAST_MONTH',
    NEXT_MONTH: 'NEXT_MONTH',
    THIS_QUARTER: 'THIS_QUARTER',
    LAST_QUARTER: 'LAST_QUARTER',
    NEXT_QUARTER: 'NEXT_QUARTER',
    THIS_YEAR: 'THIS_YEAR',
    LAST_YEAR: 'LAST_YEAR',
    NEXT_YEAR: 'NEXT_YEAR',
  },

  Aggregate: {
    AVERAGE: 'AVERAGE',
    COUNT: 'COUNT',
    COUNT_DISTINCT: 'COUNT_DISTINCT',
    MAX: 'MAX',
    MEDIAN: 'MEDIAN',
    MIN: 'MIN',
    SUM: 'SUM',
  },

  Operator: {
    AFTER: 'AFTER',
    BEFORE: 'BEFORE',
    BETWEEN: 'BETWEEN',
    CONTAIN: 'CONTAIN',
    EMPTY: 'EMPTY',
    EMPTY_NOT: 'EMPTY_NOT',
    ENDWITH: 'ENDWITH',
    EQUAL: 'EQUAL',
    EQUAL_NOT: 'EQUAL_NOT',
    GREATER: 'GREATER',
    GREATER_OR_EQUAL: 'GREATER_OR_EQUAL',
    IS: 'IS',
    IS_NOT: 'IS_NOT',
    LESS: 'LESS',
    LESS_OR_EQUAL: 'LESS_OR_EQUAL',
    ON: 'ON',
    ON_OR_AFTER: 'ON_OR_AFTER',
    ON_OR_BEFORE: 'ON_OR_BEFORE',
    START_WITH: 'START_WITH',
    WITHIN: 'WITHIN',
  },

  SortLocale: {
    ARABIC: 'ARABIC',
    ARMENIAN: 'ARMENIAN',
    BENGALI: 'BENGALI',
    BULGARIAN: 'BULGARIAN',
    CATALAN: 'CATALAN',
    CHINESE: 'CHINESE',
    CZECH: 'CZECH',
    DANISH: 'DANISH',
    DUTCH: 'DUTCH',
    EBCDIC: 'EBCDIC',
    ENGLISH: 'ENGLISH',
  },

  // 🔧 Test helpers
  __setMockResults: (results) => {
    mockResults = results;
  },

  __setMockPagedCount: (count) => {
    mockPagedCount = count;
  },

  __getState: () => ({
    results: [...mockResults],
    pagedCount: mockPagedCount,
  }),

  __reset: () => {
    mockResults = [];
    mockPagedCount = 0;
    jest.clearAllMocks();
  },
};