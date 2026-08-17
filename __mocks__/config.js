/**
 * N/config mock - NetSuite Configuration Module
 * @see https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4261803498.html
 */

let configState = {
  companyinformation: {},
  accountingpreferences: {},
  generalpreferences: {},
  userpreferences: {},
  features: {},
};

const buildConfigRecord = (type) => ({
  type,

  getValue: jest.fn(({ fieldId }) => {
    return configState[type]?.[fieldId];
  }),

  setValue: jest.fn(({ fieldId, value }) => {
    if (!configState[type]) {
      configState[type] = {};
    }
    configState[type][fieldId] = value;
    return this;
  }),

  getText: jest.fn(({ fieldId }) => {
    const val = configState[type]?.[fieldId];
    return typeof val === 'object' ? val.text : val;
  }),

  setText: jest.fn(({ fieldId, text }) => {
    if (!configState[type]) {
      configState[type] = {};
    }
    configState[type][fieldId] = { text, value: text };
    return this;
  }),

  getField: jest.fn(({ fieldId }) => ({
    id: fieldId,
    label: fieldId,
    type: 'TEXT',
  })),

  save: jest.fn(() => true),
});

module.exports = {
  load: jest.fn(({ type }) => {
    return buildConfigRecord(type);
  }),

  Type: {
    COMPANY_INFORMATION: 'companyinformation',
    COMPANY_PREFERENCES: 'companypreferences',
    ACCOUNTING_PREFERENCES: 'accountingpreferences',
    GENERAL_PREFERENCES: 'generalpreferences',
    USER_PREFERENCES: 'userpreferences',
    FEATURES: 'features',
  },

  // 🔧 Test helpers
  __setValue: (type, fieldId, value) => {
    if (!configState[type]) {
      configState[type] = {};
    }
    configState[type][fieldId] = value;
  },

  __setValues: (type, values) => {
    if (!configState[type]) {
      configState[type] = {};
    }
    Object.assign(configState[type], values);
  },

  __getState: () => JSON.parse(JSON.stringify(configState)),

  __reset: () => {
    configState = {
      companyinformation: {},
      accountingpreferences: {},
      generalpreferences: {},
      userpreferences: {},
      features: {},
    };
    jest.clearAllMocks();
  },
};
