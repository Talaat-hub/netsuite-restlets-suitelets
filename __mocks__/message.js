/**
 * N/ui/message mock - NetSuite UI Message Module (Client-Side)
 * @see https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4497733700.html
 */

let messageHistory = [];

const createMessage = (options = {}) => {
  const message = {
    _id: messageHistory.length + 1,
    type: options.type || 'INFORMATION',
    title: options.title || '',
    message: options.message || '',
    duration: options.duration,
    _isVisible: false,

    show: jest.fn(function(options = {}) {
      this._isVisible = true;
      if (options.duration) {
        this.duration = options.duration;
      }
      messageHistory.push({
        action: 'show',
        id: this._id,
        type: this.type,
        title: this.title,
        message: this.message,
        duration: this.duration,
      });
    }),

    hide: jest.fn(function() {
      this._isVisible = false;
      messageHistory.push({
        action: 'hide',
        id: this._id,
      });
    }),
  };

  return message;
};

module.exports = {
  create: jest.fn((options) => createMessage(options)),

  Type: {
    CONFIRMATION: 'CONFIRMATION',
    INFORMATION: 'INFORMATION',
    WARNING: 'WARNING',
    ERROR: 'ERROR',
  },

  // 🔧 Test helpers
  __getHistory: () => [...messageHistory],

  __getLastMessage: () => messageHistory[messageHistory.length - 1],

  __reset: () => {
    messageHistory = [];
    jest.clearAllMocks();
  },
};