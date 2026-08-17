/**
 * config/netsuiteClient.js
 *
 * NetSuite RESTlet HTTP client with **Token-Based Authentication (TBA)**.
 *
 * TBA is OAuth 1.0a with HMAC-SHA256:
 *   1. Build a base string from method + URL + sorted params (incl. oauth_*).
 *   2. Build a signing key  = consumerSecret + '&' + tokenSecret  (URL-encoded).
 *   3. signature = base64(HMAC-SHA256(baseString, signingKey)).
 *   4. Send `Authorization: OAuth realm="<account>", oauth_consumer_key=...,
 *           oauth_token=..., oauth_signature_method="HMAC-SHA256", ...,
 *           oauth_signature="<urlEncoded>"`.
 *
 * NetSuite-specific details:
 *   - The `realm` MUST be the account id in the **exact original casing**
 *     (e.g. `TSTDRV1234567` or `1234567_SB1`) — not the lowercase host form.
 *   - Query string params (script, deploy, ...) MUST be included in the base
 *     string alongside the oauth_* params.
 *   - JSON request bodies are NOT included in the base string.
 */
'use strict';

const crypto = require('crypto');
const axios  = require('axios');
const cfg    = require('./env');

// RFC 3986 percent-encoding (stricter than encodeURIComponent for !*'() ).
const rfc3986 = (s) => encodeURIComponent(String(s))
    .replace(/[!*'()]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());

const nonce = () => crypto.randomBytes(16).toString('hex');

/**
 * Build the OAuth 1.0a Authorization header value for a request.
 * @param {'GET'|'POST'} method
 * @param {object} queryParams - script/deploy/etc., already plain JS values
 */
const buildAuthHeader = (method, queryParams) => {
    const ns = cfg.netsuite;

    const oauth = {
        oauth_consumer_key:     ns.consumerKey,
        oauth_token:            ns.tokenId,
        oauth_nonce:            nonce(),
        oauth_timestamp:        Math.floor(Date.now() / 1000).toString(),
        oauth_signature_method: 'HMAC-SHA256',
        oauth_version:          '1.0',
    };

    // 1) Collect ALL params (query + oauth_*), encode each key/value, sort, join.
    const allParams = { ...queryParams, ...oauth };
    const paramString = Object.keys(allParams)
        .sort()
        .map((k) => `${rfc3986(k)}=${rfc3986(allParams[k])}`)
        .join('&');

    // 2) Base string: METHOD & encodedURL & encodedParams
    const baseString = [
        method.toUpperCase(),
        rfc3986(ns.restletUrl),
        rfc3986(paramString),
    ].join('&');

    // 3) Signing key & signature
    const signingKey = `${rfc3986(ns.consumerSecret)}&${rfc3986(ns.tokenSecret)}`;
    const signature  = crypto.createHmac('sha256', signingKey).update(baseString).digest('base64');

    // 4) Authorization header. Only oauth_* params go in the header.
    //    The realm uses the account id in its ORIGINAL casing.
    const headerParams = {
        ...oauth,
        oauth_signature: signature,
    };
    const headerStr = Object.keys(headerParams)
        .sort()
        .map((k) => `${rfc3986(k)}="${rfc3986(headerParams[k])}"`)
        .join(', ');

    return `OAuth realm="${ns.accountId}", ${headerStr}`;
};

/**
 * Call the NetSuite RESTlet.
 * @param {'GET'|'POST'} method
 * @param {object} [extraQuery] - extra query-string params beyond script/deploy
 * @param {object} [body]       - JSON body (POST only)
 * @returns {Promise<object>}   - parsed JSON response
 */
const callRestlet = async (method, extraQuery = {}, body = undefined) => {
    const ns = cfg.netsuite;
    const queryParams = {
        script: ns.scriptId,
        deploy: ns.deployId,
        ...extraQuery,
    };

    const authHeader = buildAuthHeader(method, queryParams);

    try {
        const res = await axios({
            method,
            url:     ns.restletUrl,
            params:  queryParams,
            data:    body,
            headers: {
                Authorization: authHeader,
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            // NetSuite occasionally responds slowly; allow up to 30s.
            timeout: 30_000,
            // Surface non-2xx as thrown errors for unified handling.
            validateStatus: (s) => s >= 200 && s < 300,
        });
        return res.data;
    } catch (err) {
        // Normalise NetSuite error responses into something the controller can use.
        const status = err.response && err.response.status;
        const data   = err.response && err.response.data;
        const msg    = (data && (data.error && data.error.message || data.message)) || err.message;
        const e = new Error(`NetSuite RESTlet error${status ? ' ' + status : ''}: ${msg}`);
        e.status      = status || 502;
        e.netsuite    = data;
        throw e;
    }
};

module.exports = { callRestlet };
