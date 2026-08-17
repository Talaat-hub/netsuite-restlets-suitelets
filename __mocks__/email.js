/**
 * N/email mock - NetSuite Email Module
 * @see https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4358552361.html
 */

let mockConfig = {
  sentEmails: [],
  throwError: null,
};

const send = jest.fn((options = {}) => {
  if (mockConfig.throwError) {
    throw mockConfig.throwError;
  }

  const emailRecord = {
    author: options.author,
    recipients: options.recipients,
    cc: options.cc || [],
    bcc: options.bcc || [],
    subject: options.subject,
    body: options.body,
    attachments: options.attachments || [],
    relatedRecords: options.relatedRecords || {},
    replyTo: options.replyTo,
    isInternalOnly: options.isInternalOnly || false,
  };

  mockConfig.sentEmails.push(emailRecord);
  return undefined; // send() returns void
});

const sendBulk = jest.fn((options = {}) => {
  if (mockConfig.throwError) {
    throw mockConfig.throwError;
  }

  const emailRecord = {
    author: options.author,
    recipients: options.recipients,
    cc: options.cc || [],
    bcc: options.bcc || [],
    subject: options.subject,
    body: options.body,
    attachments: options.attachments || [],
    relatedRecords: options.relatedRecords || {},
    replyTo: options.replyTo,
    isInternalOnly: options.isInternalOnly || false,
  };

  mockConfig.sentEmails.push(emailRecord);
  return options.recipients.length; // returns number of emails queued
});

const sendCampaignEvent = jest.fn((options = {}) => {
  if (mockConfig.throwError) {
    throw mockConfig.throwError;
  }

  const campaignRecord = {
    campaignEventId: options.campaignEventId,
    recipientId: options.recipientId,
  };

  mockConfig.sentEmails.push(campaignRecord);
  return undefined; // sendCampaignEvent() returns void
});

module.exports = {
  // Email methods
  send,
  sendBulk,
  sendCampaignEvent,

  // Enums
  RelatedRecordsType: {
    TRANSACTION: 'TRANSACTION',
    ACTIVITY: 'ACTIVITY',
    CUSTOM: 'CUSTOM',
    ENTITY: 'ENTITY',
  },

  // 🔧 test controls
  __getSentEmails: () => mockConfig.sentEmails,

  __getLastSentEmail: () => mockConfig.sentEmails[mockConfig.sentEmails.length - 1],

  __throwError: (error) => {
    mockConfig.throwError = error;
  },

  __reset: () => {
    mockConfig = {
      sentEmails: [],
      throwError: null,
    };
    send.mockClear();
    sendBulk.mockClear();
    sendCampaignEvent.mockClear();
  },
};
