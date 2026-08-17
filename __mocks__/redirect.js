/**
 * N/redirect mock - NetSuite Redirect Module
 * @see https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4424287617.html
 */

let redirectHistory = [];

module.exports = {
  toRecord: jest.fn((options = {}) => {
    const redirect = {
      type: 'record',
      recordType: options.type,
      id: options.id,
      isEditMode: options.isEditMode ?? false,
      parameters: options.parameters || {},
    };
    redirectHistory.push(redirect);
    return redirect;
  }),

  toSuitelet: jest.fn((options = {}) => {
    const redirect = {
      type: 'suitelet',
      scriptId: options.scriptId,
      deploymentId: options.deploymentId,
      parameters: options.parameters || {},
      isExternal: options.isExternal || false,
    };
    redirectHistory.push(redirect);
    return redirect;
  }),

  toTaskLink: jest.fn((options = {}) => {
    const redirect = {
      type: 'tasklink',
      id: options.id,
      parameters: options.parameters || {},
    };
    redirectHistory.push(redirect);
    return redirect;
  }),

  toRecordTransform: jest.fn((options = {}) => {
    const redirect = {
      type: 'recordTransform',
      fromType: options.fromType,
      fromId: options.fromId,
      toType: options.toType,
      parameters: options.parameters || {},
    };
    redirectHistory.push(redirect);
    return redirect;
  }),

  toSavedSearch: jest.fn((options = {}) => {
    const redirect = {
      type: 'savedSearch',
      id: options.id,
    };
    redirectHistory.push(redirect);
    return redirect;
  }),

  toSavedSearchResult: jest.fn((options = {}) => {
    const redirect = {
      type: 'savedSearchResult',
      id: options.id,
    };
    redirectHistory.push(redirect);
    return redirect;
  }),

  toSearch: jest.fn((options = {}) => {
    const redirect = {
      type: 'search',
      search: options.search,
    };
    redirectHistory.push(redirect);
    return redirect;
  }),

  toSearchResult: jest.fn((options = {}) => {
    const redirect = {
      type: 'searchResult',
      search: options.search,
    };
    redirectHistory.push(redirect);
    return redirect;
  }),

  // 🔧 Test helpers
  __getHistory: () => [...redirectHistory],

  __getLastRedirect: () => redirectHistory[redirectHistory.length - 1],

  __reset: () => {
    redirectHistory = [];
    jest.clearAllMocks();
  },
};