/**
 * N/ui/serverWidget mock - NetSuite Server Widget Module
 * @see https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4321345532.html
 */

const createField = (options = {}) => ({
  id: options.id,
  label: options.label || options.id,
  type: options.type || 'TEXT',
  source: options.source || null,
  container: options.container || null,
  isMandatory: false,
  defaultValue: null,
  helpText: '',
  linkText: '',
  maxLength: null,
  padding: 0,
  breakType: null,
  layoutType: null,
  richTextHeight: null,
  richTextWidth: null,
  displayType: 'NORMAL',
  displaySize: null,
  alias: null,

  updateDisplayType: jest.fn(function(options) {
    this.displayType = options.displayType;
    return this;
  }),

  updateDisplaySize: jest.fn(function(options) {
    this.displaySize = options;
    return this;
  }),

  updateLayoutType: jest.fn(function(options) {
    this.layoutType = options.layoutType;
    return this;
  }),

  updateBreakType: jest.fn(function(options) {
    this.breakType = options.breakType;
    return this;
  }),

  addSelectOption: jest.fn(function(options) {
    if (!this._selectOptions) this._selectOptions = [];
    this._selectOptions.push(options);
    return this;
  }),

  getSelectOptions: jest.fn(function() {
    return this._selectOptions || [];
  }),

  setHelpText: jest.fn(function(options) {
    this.helpText = typeof options === 'string' ? options : options.help;
    return this;
  }),

  setDefaultValue: jest.fn(function(options) {
    this.defaultValue = typeof options === 'string' ? options : options.value;
    return this;
  }),
});

const createSublist = (options = {}) => ({
  id: options.id,
  label: options.label || options.id,
  type: options.type || 'LIST',
  displayType: 'NORMAL',
  lineCount: 0,
  _fields: [],
  _buttons: [],

  addField: jest.fn(function(options) {
    const field = createField(options);
    this._fields.push(field);
    return field;
  }),

  addButton: jest.fn(function(options) {
    this._buttons.push(options);
    return this;
  }),

  addMarkAllButtons: jest.fn(function() {
    return this;
  }),

  addRefreshButton: jest.fn(function() {
    return this;
  }),

  getField: jest.fn(function(options) {
    const id = typeof options === 'string' ? options : options.id;
    return this._fields.find((f) => f.id === id) || createField({ id });
  }),

  setSublistValue: jest.fn(function(options) {
    return this;
  }),

  getSublistValue: jest.fn(function(options) {
    return null;
  }),

  updateDisplayType: jest.fn(function(options) {
    this.displayType = options.displayType;
    return this;
  }),

  updateUniqueFieldId: jest.fn(function(options) {
    return this;
  }),

  updateTotallingFieldId: jest.fn(function(options) {
    return this;
  }),
});

const createTab = (options = {}) => ({
  id: options.id,
  label: options.label || options.id,
  helpText: '',

  setHelpText: jest.fn(function(options) {
    this.helpText = typeof options === 'string' ? options : options.help;
    return this;
  }),
});

const createFieldGroup = (options = {}) => ({
  id: options.id,
  label: options.label || options.id,
  isBorderHidden: false,
  isCollapsible: false,
  isCollapsed: false,
  isSingleColumn: false,
});

const createForm = (options = {}) => ({
  title: options.title || 'Form',
  clientScriptModulePath: null,
  clientScriptFileId: null,
  _fields: [],
  _sublists: [],
  _tabs: [],
  _fieldGroups: [],
  _buttons: [],

  addField: jest.fn(function(options) {
    const field = createField(options);
    this._fields.push(field);
    return field;
  }),

  addCredentialField: jest.fn(function(options) {
    return createField({ ...options, type: 'CREDENTIAL' });
  }),

  addSecretKeyField: jest.fn(function(options) {
    return createField({ ...options, type: 'SECRETKEY' });
  }),

  addSublist: jest.fn(function(options) {
    const sublist = createSublist(options);
    this._sublists.push(sublist);
    return sublist;
  }),

  addTab: jest.fn(function(options) {
    const tab = createTab(options);
    this._tabs.push(tab);
    return tab;
  }),

  addFieldGroup: jest.fn(function(options) {
    const group = createFieldGroup(options);
    this._fieldGroups.push(group);
    return group;
  }),

  addButton: jest.fn(function(options) {
    this._buttons.push(options);
    return this;
  }),

  addSubmitButton: jest.fn(function(options) {
    this._buttons.push({ ...options, type: 'submit' });
    return this;
  }),

  addResetButton: jest.fn(function(options) {
    this._buttons.push({ ...options, type: 'reset' });
    return this;
  }),

  removeButton: jest.fn(function(options) {
    const id = typeof options === 'string' ? options : options.id;
    this._buttons = this._buttons.filter((b) => b.id !== id);
    return this;
  }),

  updateDefaultValues: jest.fn(function(options) {
    return this;
  }),

  getField: jest.fn(function(options) {
    const id = typeof options === 'string' ? options : options.id;
    return this._fields.find((f) => f.id === id);
  }),

  getSublist: jest.fn(function(options) {
    const id = typeof options === 'string' ? options : options.id;
    return this._sublists.find((s) => s.id === id);
  }),

  getTabs: jest.fn(function() {
    return this._tabs.map((t) => t.id);
  }),

  insertTab: jest.fn(function(options) {
    const tab = createTab(options);
    this._tabs.splice(options.beforeIndex || 0, 0, tab);
    return tab;
  }),

  insertSublist: jest.fn(function(options) {
    const sublist = createSublist(options);
    this._sublists.splice(options.beforeIndex || 0, 0, sublist);
    return sublist;
  }),

  insertSubtab: jest.fn(function(options) {
    return createTab(options);
  }),

  addPageInitMessage: jest.fn(function(options) {
    return this;
  }),

  addPageLink: jest.fn(function(options) {
    return this;
  }),
});

const createList = (options = {}) => ({
  title: options.title || 'List',
  style: 'NORMAL',
  clientScriptModulePath: null,
  _columns: [],
  _rows: [],
  _buttons: [],

  addColumn: jest.fn(function(options) {
    const column = { id: options.id, label: options.label, type: options.type };
    this._columns.push(column);
    return column;
  }),

  addEditColumn: jest.fn(function(options) {
    return this;
  }),

  addRow: jest.fn(function(options) {
    this._rows.push(options);
    return this;
  }),

  addRows: jest.fn(function(options) {
    if (Array.isArray(options.rows)) {
      this._rows.push(...options.rows);
    }
    return this;
  }),

  addButton: jest.fn(function(options) {
    this._buttons.push(options);
    return this;
  }),

  addRefreshButton: jest.fn(),
  addMarkAllButtons: jest.fn(),

  addPageLink: jest.fn(function(options) {
    return this;
  }),
});

const createAssistant = (options = {}) => ({
  title: options.title || 'Assistant',
  hideStepNumber: false,
  isNotOrdered: false,
  currentStep: null,
  _steps: [],
  _fieldGroups: [],
  _fields: [],

  addStep: jest.fn(function(options) {
    const step = {
      id: options.id,
      label: options.label,
      helpText: options.helpText,
      stepNumber: this._steps.length + 1,
    };
    this._steps.push(step);
    return step;
  }),

  addField: jest.fn(function(options) {
    const field = createField(options);
    this._fields.push(field);
    return field;
  }),

  addSublist: jest.fn(function(options) {
    return createSublist(options);
  }),

  addFieldGroup: jest.fn(function(options) {
    const group = createFieldGroup(options);
    this._fieldGroups.push(group);
    return group;
  }),

  getField: jest.fn(function(options) {
    const id = typeof options === 'string' ? options : options.id;
    return this._fields.find((f) => f.id === id);
  }),

  getStep: jest.fn(function(options) {
    const id = typeof options === 'string' ? options : options.id;
    return this._steps.find((s) => s.id === id);
  }),

  getSteps: jest.fn(function() {
    return this._steps;
  }),

  getNextStep: jest.fn(),
  getLastStep: jest.fn(),
  hasErrorHtml: jest.fn(() => false),
  isFinished: jest.fn(() => false),

  sendRedirect: jest.fn(),
  setDefaultValues: jest.fn(),
});

module.exports = {
  FieldType: {
    CHECKBOX: 'CHECKBOX',
    CURRENCY: 'CURRENCY',
    DATE: 'DATE',
    DATETIME: 'DATETIME',
    DATETIMETZ: 'DATETIMETZ',
    EMAIL: 'EMAIL',
    FILE: 'FILE',
    FLOAT: 'FLOAT',
    HELP: 'HELP',
    IMAGE: 'IMAGE',
    INLINEHTML: 'INLINEHTML',
    INTEGER: 'INTEGER',
    LABEL: 'LABEL',
    LONGTEXT: 'LONGTEXT',
    MULTISELECT: 'MULTISELECT',
    PASSPORT: 'PASSPORT',
    PERCENT: 'PERCENT',
    PHONE: 'PHONE',
    RADIO: 'RADIO',
    RICHTEXT: 'RICHTEXT',
    SELECT: 'SELECT',
    TEXT: 'TEXT',
    TEXTAREA: 'TEXTAREA',
    TIMEOFDAY: 'TIMEOFDAY',
    URL: 'URL',
  },

  FieldDisplayType: {
    DISABLED: 'DISABLED',
    ENTRY: 'ENTRY',
    HIDDEN: 'HIDDEN',
    INLINE: 'INLINE',
    NORMAL: 'NORMAL',
    READONLY: 'READONLY',
  },

  FieldLayoutType: {
    ENDROW: 'ENDROW',
    NORMAL: 'NORMAL',
    MIDROW: 'MIDROW',
    OUTSIDE: 'OUTSIDE',
    OUTSIDEBELOW: 'OUTSIDEBELOW',
    OUTSIDEABOVE: 'OUTSIDEABOVE',
    STARTROW: 'STARTROW',
  },

  FieldBreakType: {
    NONE: 'NONE',
    STARTCOL: 'STARTCOL',
    STARTROW: 'STARTROW',
  },

  SublistType: {
    EDITOR: 'EDITOR',
    INLINEEDITOR: 'INLINEEDITOR',
    LIST: 'LIST',
    STATICLIST: 'STATICLIST',
  },

  SublistDisplayType: {
    HIDDEN: 'HIDDEN',
    NORMAL: 'NORMAL',
  },

  FormPageLinkType: {
    BREADCRUMB: 'BREADCRUMB',
    CROSSLINK: 'CROSSLINK',
  },

  ListStyle: {
    GRID: 'grid',
    REPORT: 'report',
    PLAIN: 'plain',
    NORMAL: 'normal',
  },

  AssistantSubmitAction: {
    BACK: 'back',
    CANCEL: 'cancel',
    FINISH: 'finish',
    JUMP: 'jump',
    NEXT: 'next',
  },

  createForm: jest.fn((options) => createForm(options)),
  createList: jest.fn((options) => createList(options)),
  createAssistant: jest.fn((options) => createAssistant(options)),
};