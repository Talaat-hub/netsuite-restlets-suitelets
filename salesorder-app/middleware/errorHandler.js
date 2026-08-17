/**
 * middleware/errorHandler.js
 *
 * Central Express error handler. Always returns JSON; never leaks stack traces in production.
 */
'use strict';

const cfg = require('../config/env');

// 404 fallback
const notFound = (req, res) => {
    res.status(404).json({ ok: false, error: `Not found: ${req.method} ${req.originalUrl}` });
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    const status = err.status || 500;
    // eslint-disable-next-line no-console
    console.error('[error]', req.method, req.originalUrl, '->', status, err.message);

    const payload = { ok: false, error: err.message || 'Internal server error' };
    if (cfg.nodeEnv !== 'production' && err.stack) payload.stack = err.stack.split('\n').slice(0, 5);
    if (err.netsuite) payload.netsuite = err.netsuite;

    res.status(status).json(payload);
};

module.exports = { notFound, errorHandler };
