/**
 * N/currentRecord mock - NetSuite Current Record Module (Client-Side)
 * @see https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4625600928.html
 */

let recordState = {};
let sublistState = {};
let currentLine = {};

const createCurrentRecord = () => ({
  id: recordState._id || null,
  type: recordState._type || null,
  isDynamic: true,

  // Field methods
  getValue: jest.fn((options) => {
    const fieldId = typeof options === 'string' ? options : options.fieldId;
    return recordState[fieldId];
  }),

  setValue: jest.fn((options) => {
    const { fieldId, value, ignoreFieldChange, fireSlavingSync } = options;
    recordState[fieldId] = value;
    return this;
  }),

  getText: jest.fn((options) => {
    const fieldId = typeof options === 'string' ? options : options.fieldId;
    const val = recordState[fieldId];
    return typeof val === 'object' ? val.text : val;
  }),

  setText: jest.fn((options) => {
    const { fieldId, text, ignoreFieldChange } = options;
    recordState[fieldId] = { text, value: text };
    return this;
  }),

  getField: jest.fn((options) => {
    const fieldId = typeof options === 'string' ? options : options.fieldId;
    return {
      id: fieldId,
      label: fieldId,
      isDisabled: false,
      isDisplay: true,
      isMandatory: false,
      type: 'TEXT',
      getSelectOptions: jest.fn(() => []),
      insertSelectOption: jest.fn(),
      removeSelectOption: jest.fn(),
    };
  }),

  getFields: jest.fn(() => Object.keys(recordState).filter(k => !k.startsWith('_'))),

  // Sublist methods
  getLineCount: jest.fn((options) => {
    const sublistId = typeof options === 'string' ? options : options.sublistId;
    return sublistState[sublistId]?.length || 0;
  }),

  selectLine: jest.fn((options) => {
    const { sublistId, line } = options;
    currentLine[sublistId] = line;
  }),

  selectNewLine: jest.fn((options) => {
    const { sublistId } = options;
    if (!sublistState[sublistId]) sublistState[sublistId] = [];
    currentLine[sublistId] = sublistState[sublistId].length;
    sublistState[sublistId].push({});
  }),

  cancelLine: jest.fn((options) => {
    const { sublistId } = options;
    const idx = currentLine[sublistId];
    if (sublistState[sublistId] && idx === sublistState[sublistId].length - 1) {
      sublistState[sublistId].pop();
    }
  }),

  commitLine: jest.fn((options) => {
    const { sublistId } = options;
    currentLine[sublistId] = null;
  }),

  removeLine: jest.fn((options) => {
    const { sublistId, line, ignoreRecalc } = options;
    if (sublistState[sublistId]) {
      sublistState[sublistId].splice(line, 1);
    }
  }),

  insertLine: jest.fn((options) => {
    const { sublistId, line, ignoreRecalc } = options;
    if (!sublistState[sublistId]) sublistState[sublistId] = [];
    sublistState[sublistId].splice(line, 0, {});
  }),

  getCurrentSublistValue: jest.fn((options) => {
    const { sublistId, fieldId } = options;
    const idx = currentLine[sublistId];
    return sublistState[sublistId]?.[idx]?.[fieldId];
  }),

  setCurrentSublistValue: jest.fn((options) => {
    const { sublistId, fieldId, value, ignoreFieldChange } = options;
    const idx = currentLine[sublistId];
    if (sublistState[sublistId]?.[idx]) {
      sublistState[sublistId][idx][fieldId] = value;
    }
  }),

  getCurrentSublistText: jest.fn((options) => {
    const { sublistId, fieldId } = options;
    const idx = currentLine[sublistId];
    const val = sublistState[sublistId]?.[idx]?.[fieldId];
    return typeof val === 'object' ? val.text : val;
  }),

  setCurrentSublistText: jest.fn((options) => {
    const { sublistId, fieldId, text } = options;
    const idx = currentLine[sublistId];
    if (sublistState[sublistId]?.[idx]) {
      sublistState[sublistId][idx][fieldId] = { text, value: text };
    }
  }),

  getSublistValue: jest.fn((options) => {
    const { sublistId, fieldId, line } = options;
    return sublistState[sublistId]?.[line]?.[fieldId];
  }),

  getSublistText: jest.fn((options) => {
    const { sublistId, fieldId, line } = options;
    const val = sublistState[sublistId]?.[line]?.[fieldId];
    return typeof val === 'object' ? val.text : val;
  }),

  getSublistField: jest.fn((options) => {
    const { sublistId, fieldId, line } = options;
    return {
      id: fieldId,
      label: fieldId,
      isDisabled: false,
      isDisplay: true,
      isMandatory: false,
      type: 'TEXT',
    };
  }),

  findSublistLineWithValue: jest.fn((options) => {
    const { sublistId, fieldId, value } = options;
    const lines = sublistState[sublistId] || [];
    return lines.findIndex((line) => line[fieldId] === value);
  }),

  getCurrentSublistIndex: jest.fn((options) => {
    const { sublistId } = options;
    return currentLine[sublistId] ?? -1;
  }),

  getSublistSubrecord: jest.fn((options) => createCurrentRecord()),
  getCurrentSublistSubrecord: jest.fn((options) => createCurrentRecord()),
  hasSublistSubrecord: jest.fn(() => false),

  getSubrecord: jest.fn((options) => createCurrentRecord()),
  hasSubrecord: jest.fn(() => false),

  // Record-level methods
  save: jest.fn(() => recordState._id || Math.floor(Math.random() * 10000)),
});

module.exports = {
  get: jest.fn(() => createCurrentRecord()),

  // 🔧 Test helpers
  __setValue: (fieldId, value) => {
    recordState[fieldId] = value;
  },

  __setValues: (values) => {
    Object.assign(recordState, values);
  },

  __setSublistValue: (sublistId, line, fieldId, value) => {
    if (!sublistState[sublistId]) sublistState[sublistId] = [];
    while (sublistState[sublistId].length <= line) {
      sublistState[sublistId].push({});
    }
    sublistState[sublistId][line][fieldId] = value;
  },

  __setSublistValues: (sublistId, lines) => {
    sublistState[sublistId] = lines;
  },

  __getState: () => ({
    record: { ...recordState },
    sublists: JSON.parse(JSON.stringify(sublistState)),
  }),

  __reset: () => {
    recordState = {};
    sublistState = {};
    currentLine = {};
    jest.clearAllMocks();
  },
};
