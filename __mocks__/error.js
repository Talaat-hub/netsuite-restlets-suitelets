/**
 * N/error mock - NetSuite Error Module
 * @see https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4243782825.html
 */

class SuiteScriptError extends Error {
  constructor({ name, message, notifyOff, cause }) {
    super(message);
    this.name = name || 'CUSTOM_ERROR';
    this.id = name || 'CUSTOM_ERROR';
    this.type = 'error.SuiteScriptError';
    this.notifyOff = notifyOff || false;
    this.cause = cause || null;
    this.stack = new Error().stack;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      id: this.id,
    };
  }
}

class UserEventError extends Error {
  constructor({ name, message, recordId, notifyOff }) {
    super(message);
    this.name = name || 'USER_EVENT_ERROR';
    this.type = 'error.UserEventError';
    this.recordId = recordId || null;
    this.notifyOff = notifyOff || false;
    this.stack = new Error().stack;
  }
}

module.exports = {
  create: jest.fn((options) => new SuiteScriptError(options)),

  // Additional error types commonly used
  Type: {
    ABORT_SEARCH: 'ABORT_SEARCH',
    COMMIT_LINE_ERROR: 'COMMIT_LINE_ERROR',
    CUSTOM_ERROR: 'CUSTOM_ERROR',
    FILE_NOT_FOUND: 'FILE_NOT_FOUND',
    INSUFFICIENT_PERMISSION: 'INSUFFICIENT_PERMISSION',
    INVALID_FLD_VALUE: 'INVALID_FLD_VALUE',
    INVALID_KEY_OR_REF: 'INVALID_KEY_OR_REF',
    INVALID_RECORD_TYPE: 'INVALID_RECORD_TYPE',
    INVALID_SUBLIST_OPERATION: 'INVALID_SUBLIST_OPERATION',
    MISSING_REQ_ARGUMENT: 'MISSING_REQ_ARGUMENT',
    RECORD_NOT_FOUND: 'RECORD_NOT_FOUND',
    SSS_APP_SERVER_RESTART: 'SSS_APP_SERVER_RESTART',
    SSS_INVALID_SRCH_FILTER: 'SSS_INVALID_SRCH_FILTER',
    SSS_INVALID_SRCH_COL: 'SSS_INVALID_SRCH_COL',
    SSS_MISSING_REQD_ARGUMENT: 'SSS_MISSING_REQD_ARGUMENT',
    UNEXPECTED_ERROR: 'UNEXPECTED_ERROR',
    USER_ERROR: 'USER_ERROR',
  },

  // Expose classes for instanceof checks
  SuiteScriptError,
  UserEventError,
};