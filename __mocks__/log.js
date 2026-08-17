/**
 * N/log mock - NetSuite Log Module
 * @see https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4574548135.html
 */

let logHistory = [];

const createLogFn = (level) => jest.fn((options) => {
  const { title, details } = typeof options === 'object'
    ? options
    : { title: options, details: arguments[1] };
  
  logHistory.push({
    level,
    title,
    details,
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  debug: createLogFn('DEBUG'),
  audit: createLogFn('AUDIT'),
  error: createLogFn('ERROR'),
  emergency: createLogFn('EMERGENCY'),

  // 🔧 Test helpers
  __getHistory: () => [...logHistory],

  __getLastLog: () => logHistory[logHistory.length - 1],

  __findLogs: (filter) => {
    return logHistory.filter((log) => {
      if (filter.level && log.level !== filter.level) return false;
      if (filter.title && !log.title?.includes(filter.title)) return false;
      if (filter.details && !JSON.stringify(log.details)?.includes(filter.details)) return false;
      return true;
    });
  },

  __reset: () => {
    logHistory = [];
    jest.clearAllMocks();
  },
};