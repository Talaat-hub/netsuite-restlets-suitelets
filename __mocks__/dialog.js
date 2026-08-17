/**
 * N/ui/dialog mock - NetSuite UI Dialog Module (Client-Side)
 * @see https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4497726498.html
 */

let dialogState = {
  confirm: true,
  prompt: 'ok',
  alertShown: false,
};

let dialogHistory = [];

const createDialogResponse = (type, options = {}) => {
  dialogHistory.push({
    type,
    title: options.title,
    message: options.message,
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  alert: jest.fn((options = {}) => {
    createDialogResponse('alert', options);
    dialogState.alertShown = true;
    return Promise.resolve(true);
  }),

  confirm: jest.fn((options = {}) => {
    createDialogResponse('confirm', options);
    return Promise.resolve(dialogState.confirm);
  }),

  prompt: jest.fn((options = {}) => {
    createDialogResponse('prompt', options);
    return Promise.resolve({
      value: dialogState.prompt,
    });
  }),

  create: jest.fn((options = {}) => {
    const buttons = options.buttons || [];
    return {
      title: options.title || '',
      message: options.message || '',
      buttons: buttons.map((btn, idx) => ({
        label: btn.label,
        value: btn.value || idx,
      })),
      addButton: jest.fn(function(button) {
        this.buttons.push(button);
        return this;
      }),
      open: jest.fn(function() {
        createDialogResponse('custom', options);
        return Promise.resolve(dialogState.prompt);
      }),
    };
  }),

  // 🔧 Test helpers
  __setConfirm: (val) => {
    dialogState.confirm = val;
  },

  __setPrompt: (val) => {
    dialogState.prompt = val;
  },

  __setAlertResponse: () => {
    dialogState.alertShown = false;
  },

  __reject: (err) => {
    module.exports.alert.mockImplementation(() => Promise.reject(err));
    module.exports.confirm.mockImplementation(() => Promise.reject(err));
    module.exports.prompt.mockImplementation(() => Promise.reject(err));
  },

  __getHistory: () => [...dialogHistory],

  __getLastDialog: () => dialogHistory[dialogHistory.length - 1],

  __reset: () => {
    dialogState = { confirm: true, prompt: 'ok', alertShown: false };
    dialogHistory = [];
    // Reset mock implementations to default
    module.exports.alert.mockImplementation((options = {}) => {
      createDialogResponse('alert', options);
      return Promise.resolve(true);
    });
    module.exports.confirm.mockImplementation((options = {}) => {
      createDialogResponse('confirm', options);
      return Promise.resolve(dialogState.confirm);
    });
    module.exports.prompt.mockImplementation((options = {}) => {
      createDialogResponse('prompt', options);
      return Promise.resolve({ value: dialogState.prompt });
    });
    jest.clearAllMocks();
  },
};