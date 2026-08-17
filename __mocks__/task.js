/**
 * N/task mock - NetSuite Task Module
 * @see https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4345787858.html
 */

let taskStore = {};
let nextTaskId = 1000;

const createBaseTask = (taskType) => {
  const taskId = `task_${nextTaskId++}`;
  return {
    _taskId: taskId,
    _type: taskType,
    _status: 'PENDING',

    submit: jest.fn(function() {
      taskStore[taskId] = {
        id: taskId,
        type: taskType,
        status: 'PENDING',
        ...this,
      };
      return taskId;
    }),
  };
};

const createScheduledScriptTask = () => {
  const task = createBaseTask('SCHEDULED_SCRIPT');
  return {
    ...task,
    scriptId: null,
    deploymentId: null,
    params: {},
  };
};

const createMapReduceScriptTask = () => {
  const task = createBaseTask('MAP_REDUCE');
  return {
    ...task,
    scriptId: null,
    deploymentId: null,
    params: {},
  };
};

const createSearchTask = () => {
  const task = createBaseTask('SEARCH');
  return {
    ...task,
    savedSearchId: null,
    filePath: null,
    fileId: null,
  };
};

const createCsvImportTask = () => {
  const task = createBaseTask('CSV_IMPORT');
  return {
    ...task,
    importFile: null,
    mappingId: null,
    queueId: null,
    name: null,
  };
};

const createEntityDeduplicationTask = () => {
  const task = createBaseTask('ENTITY_DEDUPLICATION');
  return {
    ...task,
    entityType: null,
    masterRecordId: null,
    masterSelectionMode: null,
    dedupeMode: null,
    recordIds: [],
  };
};

const createWorkflowTriggerTask = () => {
  const task = createBaseTask('WORKFLOW_TRIGGER');
  return {
    ...task,
    recordType: null,
    recordId: null,
    workflowId: null,
    params: {},
  };
};

const createQueryTask = () => {
  const task = createBaseTask('QUERY');
  return {
    ...task,
    query: null,
    filePath: null,
    fileId: null,
    params: {},
  };
};

const createSuiteQLTask = () => {
  const task = createBaseTask('SUITEQL');
  return {
    ...task,
    query: null,
    filePath: null,
    fileId: null,
    params: [],
  };
};

const createRecordActionTask = () => {
  const task = createBaseTask('RECORD_ACTION');
  return {
    ...task,
    recordType: null,
    action: null,
    params: {},
    condition: null,
    paramCallback: null,
  };
};

const createPivotTask = () => {
  const task = createBaseTask('PIVOT');
  return {
    ...task,
    pivotId: null,
    params: {},
    fileId: null,
    filePath: null,
  };
};

module.exports = {
  create: jest.fn((options) => {
    switch (options.taskType) {
      case 'SCHEDULED_SCRIPT':
        return createScheduledScriptTask();
      case 'MAP_REDUCE':
        return createMapReduceScriptTask();
      case 'SEARCH':
        return createSearchTask();
      case 'CSV_IMPORT':
        return createCsvImportTask();
      case 'ENTITY_DEDUPLICATION':
        return createEntityDeduplicationTask();
      case 'WORKFLOW_TRIGGER':
        return createWorkflowTriggerTask();
      case 'QUERY':
        return createQueryTask();
      case 'SUITEQL':
        return createSuiteQLTask();
      case 'RECORD_ACTION':
        return createRecordActionTask();
      case 'PIVOT':
        return createPivotTask();
      default:
        return createScheduledScriptTask();
    }
  }),

  checkStatus: jest.fn((options) => {
    const taskId = typeof options === 'string' ? options : options.taskId;
    const task = taskStore[taskId];
    return {
      taskId,
      status: task?.status || 'COMPLETE',
      getCurrentTotalSize: jest.fn(() => 0),
      getPendingMapCount: jest.fn(() => 0),
      getPercentageCompleted: jest.fn(() => 100),
      getTotalMapCount: jest.fn(() => 0),
      getTotalReduceCount: jest.fn(() => 0),
      getPendingReduceCount: jest.fn(() => 0),
      getPendingOutputCount: jest.fn(() => 0),
      getTotalOutputCount: jest.fn(() => 0),
    };
  }),

  TaskType: {
    SCHEDULED_SCRIPT: 'SCHEDULED_SCRIPT',
    MAP_REDUCE: 'MAP_REDUCE',
    CSV_IMPORT: 'CSV_IMPORT',
    ENTITY_DEDUPLICATION: 'ENTITY_DEDUPLICATION',
    WORKFLOW_TRIGGER: 'WORKFLOW_TRIGGER',
    SEARCH: 'SEARCH',
    RECORD_ACTION: 'RECORD_ACTION',
    PIVOT: 'PIVOT',
    QUERY: 'QUERY',
    SUITEQL: 'SUITEQL',
  },

  TaskStatus: {
    PENDING: 'PENDING',
    PROCESSING: 'PROCESSING',
    COMPLETE: 'COMPLETE',
    FAILED: 'FAILED',
  },

  MasterSelectionMode: {
    CREATED_EARLIEST: 'CREATED_EARLIEST',
    MOST_RECENT_ACTIVITY: 'MOST_RECENT_ACTIVITY',
    MOST_POPULATED_FIELDS: 'MOST_POPULATED_FIELDS',
    SELECT_BY_ID: 'SELECT_BY_ID',
  },

  DedupeMode: {
    MERGE: 'MERGE',
    DELETE: 'DELETE',
    MAKE_MASTER_PARENT: 'MAKE_MASTER_PARENT',
    MARK_AS_NOT_DUPES: 'MARK_AS_NOT_DUPES',
  },

  DedupeEntityType: {
    CUSTOMER: 'CUSTOMER',
    CONTACT: 'CONTACT',
    VENDOR: 'VENDOR',
    PARTNER: 'PARTNER',
    LEAD: 'LEAD',
    PROSPECT: 'PROSPECT',
  },

  ActionCondition: {
    ALL_QUALIFIED_INSTANCES: 'ALL_QUALIFIED_INSTANCES',
  },

  // 🔧 Test helpers
  __setTaskStatus: (taskId, status) => {
    if (taskStore[taskId]) {
      taskStore[taskId].status = status;
    } else {
      taskStore[taskId] = { id: taskId, status };
    }
  },

  __getTask: (taskId) => taskStore[taskId],

  __getState: () => JSON.parse(JSON.stringify(taskStore)),

  __reset: () => {
    taskStore = {};
    nextTaskId = 1000;
    jest.clearAllMocks();
  },
};