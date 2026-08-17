/**
 * middleware/validateOrder.js
 *
 * Lightweight body validator for POST /api/orders. Mirrors the validation
 * inside the RESTlet so the user sees errors immediately without a NetSuite round-trip.
 */
'use strict';

const validateCreateOrder = (req, res, next) => {
    const errors = [];
    const body = req.body || {};

    if (!body.entity || isNaN(Number(body.entity))) {
        errors.push('entity (customer internal id) is required and must be numeric');
    }
    if (body.memo !== undefined && typeof body.memo !== 'string') {
        errors.push('memo must be a string');
    }
    if (!Array.isArray(body.items) || body.items.length === 0) {
        errors.push('items[] is required and must contain at least one line');
    } else {
        body.items.forEach((line, i) => {
            if (!line || typeof line !== 'object') {
                errors.push(`items[${i}] must be an object`);
                return;
            }
            if (!line.item || isNaN(Number(line.item)))         errors.push(`items[${i}].item is required and must be numeric`);
            if (!line.quantity || isNaN(Number(line.quantity))) errors.push(`items[${i}].quantity is required and must be numeric`);
            if (Number(line.quantity) <= 0)                     errors.push(`items[${i}].quantity must be > 0`);
            if (line.rate !== undefined && line.rate !== '' && isNaN(Number(line.rate))) {
                errors.push(`items[${i}].rate must be numeric when provided`);
            }
        });
    }

    if (errors.length) {
        return res.status(400).json({ ok: false, error: 'Validation failed', details: errors });
    }
    next();
};

module.exports = { validateCreateOrder };
