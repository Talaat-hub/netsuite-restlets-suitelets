/**
 * N/url mock - NetSuite URL Module
 * @see https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4345790498.html
 */

let urlConfig = {
  domain: 'https://123456.app.netsuite.com',
};

module.exports = {
  resolveScript: jest.fn((options = {}) => {
    const base = `${urlConfig.domain}/app/site/hosting/scriptlet.nl`;
    const params = new URLSearchParams();
    params.set('script', options.scriptId);
    params.set('deploy', options.deploymentId);
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        params.set(key, value);
      });
    }
    return options.returnExternalUrl
      ? `${base}?${params.toString()}`
      : `/app/site/hosting/scriptlet.nl?${params.toString()}`;
  }),

  resolveRecord: jest.fn((options = {}) => {
    const base = `${urlConfig.domain}/app/common/entity/entity.nl`;
    const params = new URLSearchParams();
    params.set('id', options.recordId);
    if (options.recordType) {
      params.set('rectype', options.recordType);
    }
    if (options.isEditMode) {
      params.set('e', 'T');
    }
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        params.set(key, value);
      });
    }
    return options.returnExternalUrl
      ? `${base}?${params.toString()}`
      : `/app/common/entity/entity.nl?${params.toString()}`;
  }),

  resolveTaskLink: jest.fn((options = {}) => {
    const params = new URLSearchParams();
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        params.set(key, value);
      });
    }
    const queryString = params.toString();
    return queryString
      ? `/app/common/custom/custrecordentry.nl?${queryString}`
      : `/app/common/custom/custrecordentry.nl`;
  }),

  resolveDomain: jest.fn((options = {}) => {
    const { hostType, accountId } = options;
    switch (hostType) {
      case 'APPLICATION':
        return `${accountId || '123456'}.app.netsuite.com`;
      case 'FORM':
        return `${accountId || '123456'}.extforms.netsuite.com`;
      case 'RESTLET':
        return `${accountId || '123456'}.restlets.api.netsuite.com`;
      case 'SUITETALK':
        return `${accountId || '123456'}.suitetalk.api.netsuite.com`;
      default:
        return `${accountId || '123456'}.app.netsuite.com`;
    }
  }),

  format: jest.fn((options = {}) => {
    const { domain, params } = options;
    const base = domain || urlConfig.domain;
    if (!params || Object.keys(params).length === 0) {
      return base;
    }
    const queryString = new URLSearchParams(params).toString();
    return `${base}?${queryString}`;
  }),

  HostType: {
    APPLICATION: 'APPLICATION',
    CUSTOMER_CENTER: 'CUSTOMER_CENTER',
    FORM: 'FORM',
    RESTLET: 'RESTLET',
    SUITETALK: 'SUITETALK',
  },

  // 🔧 Test helpers
  __setDomain: (domain) => {
    urlConfig.domain = domain;
  },

  __reset: () => {
    urlConfig = {
      domain: 'https://123456.app.netsuite.com',
    };
    jest.clearAllMocks();
  },
};