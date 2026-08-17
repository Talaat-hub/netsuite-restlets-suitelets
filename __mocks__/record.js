/**
 * N/record mock - NetSuite Record Module
 * @see https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4267255811.html
 */

let recordStore = {};
let nextRecordId = 1000;

const createRecord = (options = {}) => {
  const recordId = options.id || nextRecordId++;
  const recordType = options.type || 'customrecord_test';
  const isDynamic = options.isDynamic !== false;

  let fields = { ...options.fields };
  let sublists = { ...options.sublists };
  let currentLine = {};

  const record = {
    id: recordId,
    type: recordType,
    isDynamic,

    // Field methods
    getValue: jest.fn((options) => {
      const fieldId = typeof options === 'string' ? options : options.fieldId;
      return fields[fieldId];
    }),

    setValue: jest.fn((options) => {
      const { fieldId, value, ignoreFieldChange } = options;
      fields[fieldId] = value;
      return record;
    }),

    getText: jest.fn((options) => {
      const fieldId = typeof options === 'string' ? options : options.fieldId;
      const val = fields[fieldId];
      return typeof val === 'object' ? val.text : val;
    }),

    setText: jest.fn((options) => {
      const { fieldId, text, ignoreFieldChange } = options;
      fields[fieldId] = { text, value: text };
      return record;
    }),

    getField: jest.fn((options) => {
      const fieldId = typeof options === 'string' ? options : options.fieldId;
      return {
        id: fieldId,
        label: fieldId,
        type: 'TEXT',
        isMandatory: false,
        isDisabled: false,
      };
    }),

    getFields: jest.fn(() => Object.keys(fields)),

    // Sublist methods
    getLineCount: jest.fn((options) => {
      const sublistId = typeof options === 'string' ? options : options.sublistId;
      return sublists[sublistId]?.length || 0;
    }),

    selectLine: jest.fn((options) => {
      const { sublistId, line } = options;
      currentLine[sublistId] = line;
    }),

    selectNewLine: jest.fn((options) => {
      const { sublistId } = options;
      if (!sublists[sublistId]) sublists[sublistId] = [];
      currentLine[sublistId] = sublists[sublistId].length;
      sublists[sublistId].push({});
    }),

    cancelLine: jest.fn((options) => {
      const { sublistId } = options;
      const idx = currentLine[sublistId];
      if (sublists[sublistId] && idx === sublists[sublistId].length - 1) {
        sublists[sublistId].pop();
      }
    }),

    commitLine: jest.fn((options) => {
      const { sublistId } = options;
      currentLine[sublistId] = null;
    }),

    removeLine: jest.fn((options) => {
      const { sublistId, line, ignoreRecalc } = options;
      if (sublists[sublistId]) {
        sublists[sublistId].splice(line, 1);
      }
    }),

    insertLine: jest.fn((options) => {
      const { sublistId, line, ignoreRecalc } = options;
      if (!sublists[sublistId]) sublists[sublistId] = [];
      sublists[sublistId].splice(line, 0, {});
    }),

    // Dynamic mode sublist methods
    getCurrentSublistValue: jest.fn((options) => {
      const { sublistId, fieldId } = options;
      const idx = currentLine[sublistId];
      return sublists[sublistId]?.[idx]?.[fieldId];
    }),

    setCurrentSublistValue: jest.fn((options) => {
      const { sublistId, fieldId, value, ignoreFieldChange } = options;
      const idx = currentLine[sublistId];
      if (sublists[sublistId]?.[idx]) {
        sublists[sublistId][idx][fieldId] = value;
      }
      return record;
    }),

    getCurrentSublistText: jest.fn((options) => {
      const { sublistId, fieldId } = options;
      const idx = currentLine[sublistId];
      const val = sublists[sublistId]?.[idx]?.[fieldId];
      return typeof val === 'object' ? val.text : val;
    }),

    setCurrentSublistText: jest.fn((options) => {
      const { sublistId, fieldId, text } = options;
      const idx = currentLine[sublistId];
      if (sublists[sublistId]?.[idx]) {
        sublists[sublistId][idx][fieldId] = { text, value: text };
      }
      return record;
    }),

    // Standard mode sublist methods
    getSublistValue: jest.fn((options) => {
      const { sublistId, fieldId, line } = options;
      return sublists[sublistId]?.[line]?.[fieldId];
    }),

    setSublistValue: jest.fn((options) => {
      const { sublistId, fieldId, line, value } = options;
      if (!sublists[sublistId]) sublists[sublistId] = [];
      while (sublists[sublistId].length <= line) {
        sublists[sublistId].push({});
      }
      sublists[sublistId][line][fieldId] = value;
      return record;
    }),

    getSublistText: jest.fn((options) => {
      const { sublistId, fieldId, line } = options;
      const val = sublists[sublistId]?.[line]?.[fieldId];
      return typeof val === 'object' ? val.text : val;
    }),

    setSublistText: jest.fn((options) => {
      const { sublistId, fieldId, line, text } = options;
      if (!sublists[sublistId]) sublists[sublistId] = [];
      while (sublists[sublistId].length <= line) {
        sublists[sublistId].push({});
      }
      sublists[sublistId][line][fieldId] = { text, value: text };
      return record;
    }),

    getSublistField: jest.fn((options) => ({
      id: options.fieldId,
      label: options.fieldId,
      type: 'TEXT',
    })),

    findSublistLineWithValue: jest.fn((options) => {
      const { sublistId, fieldId, value } = options;
      const lines = sublists[sublistId] || [];
      return lines.findIndex((line) => line[fieldId] === value);
    }),

    // Subrecord methods
    hasSublistSubrecord: jest.fn(() => false),
    getSublistSubrecord: jest.fn((options) => createRecord()),
    getCurrentSublistSubrecord: jest.fn((options) => createRecord()),
    createSublistSubrecord: jest.fn((options) => createRecord()),
    removeSublistSubrecord: jest.fn((options) => record),

    getSubrecord: jest.fn((options) => createRecord()),
    hasSubrecord: jest.fn(() => false),
    createSubrecord: jest.fn((options) => createRecord()),
    removeSubrecord: jest.fn((options) => record),

    // Matrix methods
    getMatrixHeaderCount: jest.fn((options) => 0),
    getMatrixHeaderField: jest.fn((options) => null),
    getMatrixHeaderValue: jest.fn((options) => null),
    getMatrixSublistValue: jest.fn((options) => null),
    setMatrixSublistValue: jest.fn((options) => record),
    getCurrentMatrixSublistValue: jest.fn((options) => null),
    setCurrentMatrixSublistValue: jest.fn((options) => record),

    // Save/Copy
    save: jest.fn((options) => {
      recordStore[recordId] = { id: recordId, type: recordType, fields, sublists };
      return recordId;
    }),

    // Internal state access for testing
    _getFields: () => fields,
    _getSublists: () => sublists,
  };

  return record;
};

module.exports = {
  Type: {
    // Transactions
    ASSEMBLY_BUILD: 'assemblybuild',
    ASSEMBLY_UNBUILD: 'assemblyunbuild',
    BIN_TRANSFER: 'bintransfer',
    BIN_WORKSHEET: 'binworksheet',
    BLANKET_PURCHASE_ORDER: 'blanketpurchaseorder',
    CASH_REFUND: 'cashrefund',
    CASH_SALE: 'cashsale',
    CHECK: 'check',
    CREDIT_MEMO: 'creditmemo',
    CUSTOMER_DEPOSIT: 'customerdeposit',
    CUSTOMER_PAYMENT: 'customerpayment',
    CUSTOMER_REFUND: 'customerrefund',
    DEPOSIT: 'deposit',
    DEPOSIT_APPLICATION: 'depositapplication',
    ESTIMATE: 'estimate',
    EXPENSE_REPORT: 'expensereport',
    INVENTORY_ADJUSTMENT: 'inventoryadjustment',
    INVENTORY_COST_REVALUATION: 'inventorycostrevaluation',
    INVENTORY_COUNT: 'inventorycount',
    INVENTORY_TRANSFER: 'inventorytransfer',
    INVOICE: 'invoice',
    ITEM_FULFILLMENT: 'itemfulfillment',
    ITEM_RECEIPT: 'itemreceipt',
    JOURNAL_ENTRY: 'journalentry',
    OPPORTUNITY: 'opportunity',
    PAYCHECK_JOURNAL: 'paycheckjournal',
    PURCHASE_ORDER: 'purchaseorder',
    PURCHASE_REQUISITION: 'purchaserequisition',
    RETURN_AUTHORIZATION: 'returnauthorization',
    SALES_ORDER: 'salesorder',
    TRANSFER_ORDER: 'transferorder',
    VENDOR_BILL: 'vendorbill',
    VENDOR_CREDIT: 'vendorcredit',
    VENDOR_PAYMENT: 'vendorpayment',
    VENDOR_RETURN_AUTHORIZATION: 'vendorreturnauthorization',
    WORK_ORDER: 'workorder',
    WORK_ORDER_CLOSE: 'workorderclose',
    WORK_ORDER_COMPLETION: 'workordercompletion',
    WORK_ORDER_ISSUE: 'workorderissue',

    // Entities
    CONTACT: 'contact',
    CUSTOMER: 'customer',
    EMPLOYEE: 'employee',
    ENTITY: 'entity',
    LEAD: 'lead',
    PARTNER: 'partner',
    PROJECT: 'job',
    PROSPECT: 'prospect',
    VENDOR: 'vendor',

    // Items
    ASSEMBLY_ITEM: 'assemblyitem',
    DESCRIPTION_ITEM: 'descriptionitem',
    DISCOUNT_ITEM: 'discountitem',
    DOWNLOAD_ITEM: 'downloaditem',
    GIFT_CERTIFICATE_ITEM: 'giftcertificateitem',
    INVENTORY_ITEM: 'inventoryitem',
    KIT_ITEM: 'kititem',
    LOT_NUMBERED_ASSEMBLY_ITEM: 'lotnumberedassemblyitem',
    LOT_NUMBERED_INVENTORY_ITEM: 'lotnumberedinventoryitem',
    MARKUP_ITEM: 'markupitem',
    NON_INVENTORY_ITEM: 'noninventoryitem',
    OTHER_CHARGE_ITEM: 'otherchargeitem',
    PAYMENT_ITEM: 'paymentitem',
    SERIALIZED_ASSEMBLY_ITEM: 'serializedassemblyitem',
    SERIALIZED_INVENTORY_ITEM: 'serializedinventoryitem',
    SERVICE_ITEM: 'serviceitem',
    SUBTOTAL_ITEM: 'subtotalitem',

    // CRM
    ACTIVITY: 'activity',
    CALENDAR_EVENT: 'calendarevent',
    CAMPAIGN: 'campaign',
    CASE: 'supportcase',
    ISSUE: 'issue',
    PHONE_CALL: 'phonecall',
    PROJECT_TASK: 'projecttask',
    TASK: 'task',

    // Lists/Setup
    ACCOUNT: 'account',
    ACCOUNTING_PERIOD: 'accountingperiod',
    BIN: 'bin',
    CLASSIFICATION: 'classification',
    CURRENCY: 'currency',
    CUSTOM_LIST: 'customlist',
    CUSTOM_RECORD: 'customrecord',
    DEPARTMENT: 'department',
    FILE: 'file',
    FOLDER: 'folder',
    LOCATION: 'location',
    MESSAGE: 'message',
    NOTE: 'note',
    PRICE_LEVEL: 'pricelevel',
    SUBSIDIARY: 'subsidiary',
    TAX_CODE: 'salestaxitem',
    TERM: 'term',
    UNITS_TYPE: 'unitstype',
  },

  create: jest.fn((options) => createRecord(options)),

  load: jest.fn((options) => {
    const id = typeof options === 'object' ? options.id : options;
    const type = typeof options === 'object' ? options.type : null;
    
    if (recordStore[id]) {
      return createRecord(recordStore[id]);
    }
    return createRecord({ id, type });
  }),

  copy: jest.fn((options) => createRecord({ type: options.type, id: null })),

  transform: jest.fn((options) => {
    const { fromType, fromId, toType } = options;
    return createRecord({ type: toType });
  }),

  delete: jest.fn((options) => {
    const id = typeof options === 'object' ? options.id : options;
    delete recordStore[id];
    return id;
  }),

  submitFields: jest.fn((options) => {
    const { type, id, values } = options;
    if (!recordStore[id]) {
      recordStore[id] = { id, type, fields: {}, sublists: {} };
    }
    Object.assign(recordStore[id].fields, values);
    return id;
  }),

  attach: jest.fn((options) => true),
  detach: jest.fn((options) => true),

  // 🔧 Test helpers
  __setRecord: (id, recordData) => {
    recordStore[id] = { id, ...recordData };
  },

  __setRecordValue: (id, fieldId, value) => {
    if (!recordStore[id]) recordStore[id] = { id, fields: {}, sublists: {} };
    if (!recordStore[id].fields) recordStore[id].fields = {};
    recordStore[id].fields[fieldId] = value;
  },

  __setRecordSublist: (id, sublistId, lines) => {
    if (!recordStore[id]) recordStore[id] = { id, fields: {}, sublists: {} };
    if (!recordStore[id].sublists) recordStore[id].sublists = {};
    recordStore[id].sublists[sublistId] = lines;
  },

  __getRecord: (id) => recordStore[id],

  __getState: () => JSON.parse(JSON.stringify(recordStore)),

  __reset: () => {
    recordStore = {};
    nextRecordId = 1000;
    jest.clearAllMocks();
  },
};
