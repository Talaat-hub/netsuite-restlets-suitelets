/**
 * server.js — main entry point.
 */
'use strict';

const path     = require('path');
const express  = require('express');
const cors     = require('cors');
const morgan   = require('morgan');
const rateLimit = require('express-rate-limit');

const cfg                       = require('./config/env');
const ordersRouter              = require('./routes/orders');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// ─── Core middleware ──────────────────────────────────────────────────────
app.use(express.json({ limit: '256kb' }));
app.use(cors({ origin: cfg.corsOrigin === '*' ? true : cfg.corsOrigin.split(',').map(s => s.trim()) }));
app.use(morgan(cfg.nodeEnv === 'production' ? 'combined' : 'dev'));

// Throttle the API to mitigate accidental abuse / runaway frontends.
app.use('/api/', rateLimit({ windowMs: 60_000, max: 120, standardHeaders: true, legacyHeaders: false }));

// ─── Static frontend ──────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ─── API ──────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ ok: true, ts: new Date().toISOString() }));
app.use('/api/orders', ordersRouter);

// ─── Errors ───────────────────────────────────────────────────────────────
app.use('/api', notFound);
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────
app.listen(cfg.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] listening on http://localhost:${cfg.port}  (env=${cfg.nodeEnv})`);
    console.log(`[server] NetSuite RESTlet target: ${cfg.netsuite.restletUrl}`);
    console.log(`[server] script=${cfg.netsuite.scriptId}  deploy=${cfg.netsuite.deployId}`);
});
