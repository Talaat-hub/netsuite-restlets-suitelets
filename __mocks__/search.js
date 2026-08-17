/**
 * N/search mock - NetSuite Search Module
 * @see https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4345764122.html
 */

let mockResults = [];
let mockLookupFields = {};
let searchStore = {};
let nextSearchId = 1000;

const createResult = (data = {}) => ({
  id: data.id || '1',
  recordType: data.recordType || 'transaction',
  columns: data.columns || [],

  getValue: jest.fn((options) => {
    const name = typeof options === 'string' ? options : (options.name || options.column?.name);
    return data[name];
  }),

  getText: jest.fn((options) => {
    const name = typeof options === 'string' ? options : (options.name || options.column?.name);
    return data[`${name}_text`] || data[name];
  }),

  getAllColumns: jest.fn(() => data.columns || []),
});

const createResultSet = (results = []) => ({
  columns: [],

  getRange: jest.fn((options) => {
    const { start, end } = options;
    return results.slice(start, end).map(createResult);
  }),

  each: jest.fn((callback) => {
    for (const result of results) {
      const shouldContinue = callback(createResult(result));
      if (shouldContinue === false) break;
    }
    return true;
  }),
});

const createPagedData = (results = []) => ({
  count: results.length,
  pageSize: 1000,
  pageCount: Math.ceil(results.length / 1000) || 1,
  pageRanges: [],

  fetch: jest.fn((options) => ({
    data: createResultSet(results),
    isFirst: options.index === 0,
    isLast: options.index === 0,
  })),

  iterator: jest.fn(() => ({
    each: jest.fn((callback) => {
      callback({
        value: {
          data: createResultSet(results),
        },
      });
      return true;
    }),
  })),
});

const createSearch = (options = {}) => {
  const searchId = options.id || null;
  const searchType = options.type || null;

  return {
    searchId,
    searchType: searchType,
    type: searchType,
    isPublic: options.isPublic || false,
    title: options.title || '',
    id: searchId,
    filters: options.filters || [],
    filterExpression: options.filterExpression || [],
    columns: options.columns || [],

    run: jest.fn(() => createResultSet(mockResults)),

    runPaged: jest.fn((options) => createPagedData(mockResults)),

    save: jest.fn((options) => {
      const id = options?.title || searchId || nextSearchId++;
      searchStore[id] = { ...options, type: searchType };
      return id;
    }),
  };
};

module.exports = {
  Type: {
    // Transactions
    TRANSACTION: 'transaction',
    SALES_ORDER: 'salesorder',
    PURCHASE_ORDER: 'purchaseorder',
    INVOICE: 'invoice',
    CREDIT_MEMO: 'creditmemo',
    CASH_SALE: 'cashsale',
    ESTIMATE: 'estimate',
    OPPORTUNITY: 'opportunity',
    ITEM_FULFILLMENT: 'itemfulfillment',
    ITEM_RECEIPT: 'itemreceipt',
    JOURNAL_ENTRY: 'journalentry',
    VENDOR_BILL: 'vendorbill',
    VENDOR_CREDIT: 'vendorcredit',
    VENDOR_PAYMENT: 'vendorpayment',
    CUSTOMER_PAYMENT: 'customerpayment',
    EXPENSE_REPORT: 'expensereport',
    INVENTORY_ADJUSTMENT: 'inventoryadjustment',
    TRANSFER_ORDER: 'transferorder',
    RETURN_AUTHORIZATION: 'returnauthorization',
    WORK_ORDER: 'workorder',

    // Entities
    CUSTOMER: 'customer',
    VENDOR: 'vendor',
    EMPLOYEE: 'employee',
    CONTACT: 'contact',
    PARTNER: 'partner',
    LEAD: 'lead',
    PROSPECT: 'prospect',

    // Items
    ITEM: 'item',
    INVENTORY_ITEM: 'inventoryitem',
    ASSEMBLY_ITEM: 'assemblyitem',
    NON_INVENTORY_ITEM: 'noninventoryitem',
    SERVICE_ITEM: 'serviceitem',
    KIT_ITEM: 'kititem',

    // Other
    ACCOUNT: 'account',
    SUBSIDIARY: 'subsidiary',
    LOCATION: 'location',
    DEPARTMENT: 'department',
    CLASSIFICATION: 'classification',
    FOLDER: 'folder',
    FILE: 'file',
    MESSAGE: 'message',
    NOTE: 'note',
    CUSTOM_RECORD: 'customrecord',
  },

  Operator: {
    AFTER: 'after',
    ALLOF: 'allof',
    ANY: 'any',
    ANYOF: 'anyof',
    BEFORE: 'before',
    BETWEEN: 'between',
    CONTAINS: 'contains',
    DOESNOTCONTAIN: 'doesnotcontain',
    DOESNOTSTARTWITH: 'doesnotstartwith',
    EQUALTO: 'equalto',
    GREATERTHAN: 'greaterthan',
    GREATERTHANOREQUALTO: 'greaterthanorequalto',
    HASKEYWORDS: 'haskeywords',
    IS: 'is',
    ISEMPTY: 'isempty',
    ISNOT: 'isnot',
    ISNOTEMPTY: 'isnotempty',
    LESSTHAN: 'lessthan',
    LESSTHANOREQUALTO: 'lessthanorequalto',
    NONEOF: 'noneof',
    NOTAFTER: 'notafter',
    NOTALLOF: 'notallof',
    NOTBEFORE: 'notbefore',
    NOTBETWEEN: 'notbetween',
    NOTEQUALTO: 'notequalto',
    NOTGREATERTHAN: 'notgreaterthan',
    NOTGREATERTHANOREQUALTO: 'notgreaterthanorequalto',
    NOTLESSTHAN: 'notlessthan',
    NOTLESSTHANOREQUALTO: 'notlessthanorequalto',
    NOTON: 'noton',
    NOTONORAFTER: 'notonorafter',
    NOTONORBEFORE: 'notonorbefore',
    NOTWITHIN: 'notwithin',
    ON: 'on',
    ONORAFTER: 'onorafter',
    ONORBEFORE: 'onorbefore',
    STARTSWITH: 'startswith',
    WITHIN: 'within',
  },

  Sort: {
    ASC: 'ASC',
    DESC: 'DESC',
    NONE: 'NONE',
  },

  Summary: {
    GROUP: 'GROUP',
    COUNT: 'COUNT',
    SUM: 'SUM',
    AVG: 'AVG',
    MIN: 'MIN',
    MAX: 'MAX',
  },

  create: jest.fn((options) => createSearch(options)),

  load: jest.fn((options) => {
    const id = typeof options === 'string' ? options : options.id;
    if (searchStore[id]) {
      return createSearch(searchStore[id]);
    }
    return createSearch({ id, ...options });
  }),

  delete: jest.fn((options) => {
    const id = typeof options === 'string' ? options : options.id;
    delete searchStore[id];
  }),

  duplicates: jest.fn((options) => []),

  global: jest.fn((options) => createResultSet(mockResults)),

  lookupFields: jest.fn((options) => {
    const { type, id, columns } = options;
    const key = `${type}_${id}`;
    if (mockLookupFields[key]) {
      return mockLookupFields[key];
    }
    // Return empty values for requested columns
    const result = {};
    (columns || []).forEach((col) => {
      result[col] = '';
    });
    return result;
  }),

  createFilter: jest.fn((options) => ({
    name: options.name,
    operator: options.operator,
    values: options.values,
    join: options.join,
    summary: options.summary,
    formula: options.formula,
    isor: options.isor || false,
    leftparens: options.leftparens || 0,
    rightparens: options.rightparens || 0,
  })),

  createColumn: jest.fn((options) => ({
    name: options.name,
    join: options.join,
    summary: options.summary,
    formula: options.formula,
    function: options.function,
    label: options.label,
    sort: options.sort,
    type: options.type,
  })),

  createSetting: jest.fn((options) => options),

  // 🔧 Test helpers
  __setMockResults: (results) => {
    mockResults = results;
  },

  __addMockResult: (result) => {
    mockResults.push(result);
  },

  __setLookupFields: (type, id, fields) => {
    mockLookupFields[`${type}_${id}`] = fields;
  },

  __saveSearch: (id, searchData) => {
    searchStore[id] = searchData;
  },

  __getState: () => ({
    results: [...mockResults],
    lookupFields: JSON.parse(JSON.stringify(mockLookupFields)),
    searches: JSON.parse(JSON.stringify(searchStore)),
  }),

  __reset: () => {
    mockResults = [];
    mockLookupFields = {};
    searchStore = {};
    nextSearchId = 1000;
    jest.clearAllMocks();
  },
};