/**
 * N/runtime mock - NetSuite Runtime Module
 * @see https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4296359529.html
 */

let mockState = {
  executionContext: 'USERINTERFACE',
  user: {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: 3,
    roleId: '3',
    roleCenter: 'CLASSIC',
    location: 1,
    department: 1,
    subsidiary: 1,
  },
  script: {
    id: 'customscript_test',
    deploymentId: 'customdeploy_test',
    params: {},
    percentComplete: 0,
    logLevel: 'DEBUG',
    bundleIds: [],
    remainingUsage: 10000,
  },
  session: {},
};

const createCurrentScript = () => ({
  id: mockState.script.id,
  deploymentId: mockState.script.deploymentId,
  logLevel: mockState.script.logLevel,
  bundleIds: mockState.script.bundleIds,
  percentComplete: mockState.script.percentComplete,

  getParameter: jest.fn((options) => {
    const name = typeof options === 'string' ? options : options.name;
    return mockState.script.params[name];
  }),

  getRemainingUsage: jest.fn(() => mockState.script.remainingUsage),

  setPercentComplete: jest.fn((value) => {
    mockState.script.percentComplete = value;
  }),
});

const createCurrentUser = () => ({
  id: mockState.user.id,
  name: mockState.user.name,
  email: mockState.user.email,
  role: mockState.user.role,
  roleId: mockState.user.roleId,
  roleCenter: mockState.user.roleCenter,
  location: mockState.user.location,
  department: mockState.user.department,
  subsidiary: mockState.user.subsidiary,

  getPreference: jest.fn((options) => {
    const name = typeof options === 'string' ? options : options.name;
    return mockState.user[`pref_${name}`];
  }),

  getPermission: jest.fn((options) => 4), // FULL permission by default
});

const createCurrentSession = () => ({
  get: jest.fn((options) => {
    const name = typeof options === 'string' ? options : options.name;
    return mockState.session[name];
  }),

  set: jest.fn((options) => {
    const { name, value } = options;
    mockState.session[name] = value;
  }),
});

module.exports = {
  executionContext: mockState.executionContext,

  getCurrentScript: jest.fn(() => createCurrentScript()),
  getCurrentUser: jest.fn(() => createCurrentUser()),
  getCurrentSession: jest.fn(() => createCurrentSession()),

  isFeatureInEffect: jest.fn((options) => {
    const feature = typeof options === 'string' ? options : options.feature;
    return mockState[`feature_${feature}`] || false;
  }),

  accountId: '123456',
  envType: 'SANDBOX',
  queueCount: 0,
  version: '2024.1',

  ContextType: {
    USER_INTERFACE: 'USERINTERFACE',
    WEBSERVICES: 'WEBSERVICES',
    WEBSTORE: 'WEBSTORE',
    PORTLET: 'PORTLET',
    SCHEDULED: 'SCHEDULED',
    MAP_REDUCE: 'MAPREDUCE',
    SUITELET: 'SUITELET',
    RESTLET: 'RESTLET',
    CSV_IMPORT: 'CSVIMPORT',
    USER_EVENT: 'USEREVENT',
    WORKFLOW: 'WORKFLOW',
    BUNDLE_INSTALLATION: 'BUNDLEINSTALLATION',
    CUSTOM_MASS_UPDATE: 'CUSTOMMASSUPDATE',
    DEBUGGER: 'DEBUGGER',
    EXPORT: 'EXPORT',
    PLUGIN: 'PLUGIN',
    ACTION: 'ACTION',
    PROMOTION: 'PROMOTION',
    PAYMENTGATEWAY: 'PAYMENTGATEWAY',
    BANK_CONNECTIVITY: 'BANKCONNECTIVITY',
    FAM_ALLOCATION: 'FAM_ALLOCATION',
    CONSOLRATEADJUSTOR: 'CONSOLRATEADJUSTOR',
  },

  EnvType: {
    SANDBOX: 'SANDBOX',
    PRODUCTION: 'PRODUCTION',
    BETA: 'BETA',
    INTERNAL: 'INTERNAL',
  },

  Permission: {
    FULL: 4,
    EDIT: 3,
    CREATE: 2,
    VIEW: 1,
    NONE: 0,
  },

  // 🔧 Test helpers
  __setExecutionContext: (context) => {
    mockState.executionContext = context;
    module.exports.executionContext = context;
  },

  __setUser: (userData) => {
    Object.assign(mockState.user, userData);
  },

  __setScriptParameter: (name, value) => {
    mockState.script.params[name] = value;
  },

  __setScriptParameters: (params) => {
    Object.assign(mockState.script.params, params);
  },

  __setRemainingUsage: (usage) => {
    mockState.script.remainingUsage = usage;
  },

  __setSession: (name, value) => {
    mockState.session[name] = value;
  },

  __setFeature: (feature, enabled) => {
    mockState[`feature_${feature}`] = enabled;
  },

  __getState: () => JSON.parse(JSON.stringify(mockState)),

  __reset: () => {
    mockState = {
      executionContext: 'USERINTERFACE',
      user: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 3,
        roleId: '3',
        roleCenter: 'CLASSIC',
        location: 1,
        department: 1,
        subsidiary: 1,
      },
      script: {
        id: 'customscript_test',
        deploymentId: 'customdeploy_test',
        params: {},
        percentComplete: 0,
        logLevel: 'DEBUG',
        bundleIds: [],
        remainingUsage: 10000,
      },
      session: {},
    };
    module.exports.executionContext = 'USERINTERFACE';
    jest.clearAllMocks();
  },
};