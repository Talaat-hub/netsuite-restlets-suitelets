/**
 * controllers/ordersController.js
 *
 * Business logic — translates Express requests into NetSuite RESTlet calls
 * and shapes responses for the frontend.
 */
'use strict';

const { callRestlet } = require('../config/netsuiteClient');

// GET /api/orders          -> list
// GET /api/orders/:id      -> single
const listOrders = async (req, res, next) => {
    try {
        const limit  = Number(req.query.limit)  || 25;
        const offset = Number(req.query.offset) || 0;
        const data = await callRestlet('GET', { limit, offset });
        if (!data || data.ok === false) {
            return res.status(502).json({ ok: false, error: (data && data.error) || 'NetSuite returned an error' });
        }
        res.json(data);
    } catch (err) { next(err); }
};

const getOrder = async (req, res, next) => {
    try {
        const data = await callRestlet('GET', { id: req.params.id });
        if (!data || data.ok === false) {
            return res.status(404).json({ ok: false, error: (data && data.error) || 'Order not found' });
        }
        res.json(data);
    } catch (err) { next(err); }
};

// POST /api/orders         -> create
const createOrder = async (req, res, next) => {
    try {
        const data = await callRestlet('POST', {}, req.body);
        if (!data || data.ok === false) {
            return res.status(400).json({
                ok: false,
                error:   (data && data.error)   || 'Failed to create Sales Order',
                details: (data && data.details) || undefined,
            });
        }
        res.status(201).json(data);
    } catch (err) { next(err); }
};

module.exports = { listOrders, getOrder, createOrder };
