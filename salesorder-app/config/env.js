/**
 * config/env.js
 *
 * Centralised env loader & validator. Fails fast at startup if any required
 * NetSuite credential is missing — better than discovering it on the first API call.
 */
'use strict';

require('dotenv').config();

const required = [
    'NS_ACCOUNT_ID',
    'NS_RESTLET_SCRIPT_ID',
    'NS_RESTLET_DEPLOY_ID',
    'NS_CONSUMER_KEY',
    'NS_CONSUMER_SECRET',
    'NS_TOKEN_ID',
    'NS_TOKEN_SECRET',
];

const missing = required.filter((k) => !process.env[k] || /your_.*_here/i.test(process.env[k]));
if (missing.length) {
    // eslint-disable-next-line no-console
    console.error('[config] Missing/placeholder env vars:', missing.join(', '));
    console.error('[config] Copy .env.example to .env and fill in values.');
    process.exit(1);
}

// NetSuite RESTlet host: account id lowercased, underscores replaced by hyphens.
//   123456_SB1   ->   123456-sb1.restlets.api.netsuite.com
const accountHost = process.env.NS_ACCOUNT_ID.toLowerCase().replace(/_/g, '-');

module.exports = {
    port:        Number(process.env.PORT) || 3000,
    nodeEnv:     process.env.NODE_ENV || 'development',
    corsOrigin:  process.env.CORS_ORIGIN || '*',

    netsuite: {
        accountId:      process.env.NS_ACCOUNT_ID,
        scriptId:       process.env.NS_RESTLET_SCRIPT_ID,
        deployId:       process.env.NS_RESTLET_DEPLOY_ID,
        consumerKey:    process.env.NS_CONSUMER_KEY,
        consumerSecret: process.env.NS_CONSUMER_SECRET,
        tokenId:        process.env.NS_TOKEN_ID,
        tokenSecret:    process.env.NS_TOKEN_SECRET,
        restletUrl:     `https://${accountHost}.restlets.api.netsuite.com/app/site/hosting/restlet.nl`,
    },
};
