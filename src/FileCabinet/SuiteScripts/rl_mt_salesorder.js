/**
 * rl_mt_salesorder.js
 *
 * RESTlet — Sales Order create / list endpoint.
 *
 *  GET   ?id=<internalid>          -> returns one Sales Order
 *  GET   ?limit=<n>&offset=<n>     -> returns a list of recent Sales Orders
 *  POST  { entity, items:[{item,quantity,rate?}], memo? }
 *                                   -> creates a Sales Order, returns { id, tranid }
 *
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
define(['N/record', 'N/query', 'N/log', 'N/error'], (record, query, log, error) => {

    // ─── GET ──────────────────────────────────────────────────────────────
    const onGet = (params) => {
        try {
            if (params && params.id) {
                return loadOrder(params.id);
            }
            const limit  = clampInt(params && params.limit,  25, 1, 200);
            const offset = clampInt(params && params.offset,  0, 0, 10000);
            return listOrders(limit, offset);
        } catch (e) {
            log.error({ title: 'onGet failed', details: e });
            return { ok: false, error: e.message || String(e) };
        }
    };

    // ─── POST ─────────────────────────────────────────────────────────────
    const onPost = (body) => {
        try {
            const errors = validateOrderPayload(body);
            if (errors.length) {
                return { ok: false, error: 'Validation failed', details: errors };
            }

            const so = record.create({ type: record.Type.SALES_ORDER, isDynamic: true });
            so.setValue({ fieldId: 'entity', value: Number(body.entity) });
            if (body.memo) so.setValue({ fieldId: 'memo', value: String(body.memo) });

            body.items.forEach((line) => {
                so.selectNewLine({ sublistId: 'item' });
                so.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item',     value: Number(line.item) });
                so.setCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity', value: Number(line.quantity) });
                if (line.rate !== undefined && line.rate !== null && line.rate !== '') {
                    so.setCurrentSublistValue({ sublistId: 'item', fieldId: 'rate', value: Number(line.rate) });
                }
                so.commitLine({ sublistId: 'item' });
            });

            const id = so.save({ ignoreMandatoryFields: false });
            const saved = record.load({ type: record.Type.SALES_ORDER, id });

            return {
                ok: true,
                id,
                tranid: saved.getValue({ fieldId: 'tranid' }),
                total:  saved.getValue({ fieldId: 'total' }),
            };
        } catch (e) {
            log.error({ title: 'onPost failed', details: e });
            return { ok: false, error: e.message || String(e) };
        }
    };

    // ─── Helpers ──────────────────────────────────────────────────────────

    const loadOrder = (id) => {
        const rec = record.load({ type: record.Type.SALES_ORDER, id: Number(id) });
        const lineCount = rec.getLineCount({ sublistId: 'item' });
        const items = [];
        for (let i = 0; i < lineCount; i++) {
            items.push({
                item:        rec.getSublistValue({ sublistId: 'item', fieldId: 'item',        line: i }),
                item_text:   rec.getSublistText ({ sublistId: 'item', fieldId: 'item',        line: i }),
                quantity:    rec.getSublistValue({ sublistId: 'item', fieldId: 'quantity',    line: i }),
                rate:        rec.getSublistValue({ sublistId: 'item', fieldId: 'rate',        line: i }),
                amount:      rec.getSublistValue({ sublistId: 'item', fieldId: 'amount',      line: i }),
            });
        }
        return {
            ok: true,
            order: {
                id:       rec.id,
                tranid:   rec.getValue({ fieldId: 'tranid' }),
                entity:   rec.getValue({ fieldId: 'entity' }),
                entity_text: rec.getText({ fieldId: 'entity' }),
                trandate: rec.getValue({ fieldId: 'trandate' }),
                status:   rec.getValue({ fieldId: 'status' }),
                memo:     rec.getValue({ fieldId: 'memo' }),
                total:    rec.getValue({ fieldId: 'total' }),
                items,
            },
        };
    };

    const listOrders = (limit, offset) => {
        const sql = `
            SELECT t.id, t.tranid, t.trandate, t.status, t.entity, t.memo,
                   BUILTIN.DF(t.entity) AS entity_text,
                   t.foreigntotal AS total
            FROM transaction t
            WHERE t.type = 'SalesOrd'
            ORDER BY t.trandate DESC, t.id DESC
        `;
        const rs = query.runSuiteQL({ query: sql });
        const all = rs.asMappedResults();
        const slice = all.slice(offset, offset + limit);
        return { ok: true, orders: slice, totalRows: all.length, limit, offset };
    };

    const validateOrderPayload = (body) => {
        const errs = [];
        if (!body || typeof body !== 'object') { errs.push('body must be an object'); return errs; }
        if (!body.entity || isNaN(Number(body.entity))) errs.push('entity (customer internal id) is required');
        if (!Array.isArray(body.items) || body.items.length === 0) errs.push('items[] is required and must be non-empty');
        else {
            body.items.forEach((line, i) => {
                if (!line || typeof line !== 'object')           errs.push(`items[${i}] must be an object`);
                else {
                    if (!line.item     || isNaN(Number(line.item)))     errs.push(`items[${i}].item is required`);
                    if (!line.quantity || isNaN(Number(line.quantity))) errs.push(`items[${i}].quantity is required`);
                    if (Number(line.quantity) <= 0)                     errs.push(`items[${i}].quantity must be > 0`);
                    if (line.rate !== undefined && line.rate !== '' && isNaN(Number(line.rate)))
                        errs.push(`items[${i}].rate must be numeric`);
                }
            });
        }
        return errs;
    };

    const clampInt = (raw, dflt, min, max) => {
        const n = Number(raw);
        if (!Number.isFinite(n)) return dflt;
        return Math.max(min, Math.min(max, Math.trunc(n)));
    };

    return { get: onGet, post: onPost };
});
