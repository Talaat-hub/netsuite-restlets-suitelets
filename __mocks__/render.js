/**
 * N/render mock - NetSuite Render Module
 * @see https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4405064418.html
 */

let renderHistory = [];

const createTemplateRenderer = () => {
  const renderer = {
    templateContent: '',
    _records: {},
    _customDataSources: {},

    setTemplateById: jest.fn(function(options) {
      this.templateContent = `template_${options.id}`;
      return this;
    }),

    setTemplateByScriptId: jest.fn(function(options) {
      this.templateContent = `script_template_${options.scriptId}`;
      return this;
    }),

    addRecord: jest.fn(function(options) {
      this._records[options.templateName] = options.record;
      return this;
    }),

    addSearchResults: jest.fn(function(options) {
      this._records[options.templateName] = options.searchResult;
      return this;
    }),

    addCustomDataSource: jest.fn(function(options) {
      this._customDataSources[options.alias] = {
        format: options.format,
        data: options.data,
      };
      return this;
    }),

    renderAsPdf: jest.fn(function() {
      renderHistory.push({
        type: 'pdf',
        content: this.templateContent,
        records: { ...this._records },
        customData: { ...this._customDataSources },
      });
      return {
        name: 'rendered.pdf',
        fileType: 'PDF',
        size: 1024,
        url: '/download/rendered.pdf',
        getContents: jest.fn(() => 'PDF_BINARY_CONTENT'),
        save: jest.fn(() => 1001),
      };
    }),

    renderAsString: jest.fn(function() {
      renderHistory.push({
        type: 'string',
        content: this.templateContent,
        records: { ...this._records },
        customData: { ...this._customDataSources },
      });
      return '<html>Rendered Content</html>';
    }),

    renderToResponse: jest.fn(function(options) {
      renderHistory.push({
        type: 'response',
        content: this.templateContent,
        records: { ...this._records },
        customData: { ...this._customDataSources },
      });
    }),
  };

  return renderer;
};

const createEmailMerger = () => ({
  _recipient: null,
  _customRecord: null,
  _transactionId: null,
  _entity: null,

  setTemplateId: jest.fn(function(id) {
    this._templateId = id;
    return this;
  }),

  setEntity: jest.fn(function(options) {
    this._entity = options;
    return this;
  }),

  setRecipient: jest.fn(function(options) {
    this._recipient = options;
    return this;
  }),

  setCustomRecord: jest.fn(function(options) {
    this._customRecord = options;
    return this;
  }),

  setTransaction: jest.fn(function(options) {
    this._transactionId = options;
    return this;
  }),

  merge: jest.fn(function() {
    return {
      subject: 'Merged Subject',
      body: '<html>Merged Body Content</html>',
    };
  }),
});

const createBOMNode = (options = {}) => ({
  item: options.item || null,
  quantity: options.quantity || 1,
  children: options.children || [],
  depth: options.depth || 0,

  getBOMItemList: jest.fn(function() {
    return this.children;
  }),
});

module.exports = {
  create: jest.fn(() => createTemplateRenderer()),

  mergeEmail: jest.fn((options) => {
    const merger = createEmailMerger();
    if (options.templateId) merger.setTemplateId(options.templateId);
    if (options.entity) merger.setEntity(options.entity);
    if (options.recipient) merger.setRecipient(options.recipient);
    if (options.transactionId) merger.setTransaction(options.transactionId);
    return merger.merge();
  }),

  createEmailMerger: jest.fn(() => createEmailMerger()),

  xmlToPdf: jest.fn((options) => {
    renderHistory.push({
      type: 'xmlToPdf',
      xmlString: options.xmlString,
    });
    return {
      name: 'converted.pdf',
      fileType: 'PDF',
      size: 1024,
      getContents: jest.fn(() => options.xmlString),
      save: jest.fn(() => 1002),
    };
  }),

  transaction: jest.fn((options) => {
    renderHistory.push({
      type: 'transaction',
      entityId: options.entityId,
      printMode: options.printMode,
      inCustLocale: options.inCustLocale,
    });
    return {
      name: 'transaction.pdf',
      fileType: 'PDF',
      size: 1024,
      getContents: jest.fn(() => 'TRANSACTION_PDF_CONTENT'),
      save: jest.fn(() => 1003),
    };
  }),

  statement: jest.fn((options) => {
    renderHistory.push({
      type: 'statement',
      entityId: options.entityId,
      printMode: options.printMode,
      formId: options.formId,
    });
    return {
      name: 'statement.pdf',
      fileType: 'PDF',
      size: 1024,
      getContents: jest.fn(() => 'STATEMENT_PDF_CONTENT'),
      save: jest.fn(() => 1004),
    };
  }),

  pickingTicket: jest.fn((options) => ({
    name: 'pickingticket.pdf',
    fileType: 'PDF',
    getContents: jest.fn(() => 'PICKING_TICKET_CONTENT'),
  })),

  packingSlip: jest.fn((options) => ({
    name: 'packingslip.pdf',
    fileType: 'PDF',
    getContents: jest.fn(() => 'PACKING_SLIP_CONTENT'),
  })),

  bom: jest.fn((options) => ({
    name: 'bom.pdf',
    fileType: 'PDF',
    getContents: jest.fn(() => 'BOM_CONTENT'),
  })),

  createBomNode: jest.fn((options) => createBOMNode(options)),

  TemplateType: {
    PDF: 'PDF',
    HTML: 'HTML',
  },

  PrintMode: {
    HTML: 'HTML',
    PDF: 'PDF',
    DEFAULT: 'DEFAULT',
  },

  DataSource: {
    OBJECT: 'OBJECT',
    RECORD: 'RECORD',
    JSON: 'JSON',
    XML_DOC: 'XML_DOC',
    XML_STRING: 'XML_STRING',
  },

  // 🔧 Test helpers
  __getHistory: () => [...renderHistory],

  __getLastRender: () => renderHistory[renderHistory.length - 1],

  __reset: () => {
    renderHistory = [];
    jest.clearAllMocks();
  },
};
