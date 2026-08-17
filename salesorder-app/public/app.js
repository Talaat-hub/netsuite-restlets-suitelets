/* public/app.js — dashboard logic.  No build step, no framework. */
'use strict';

const $  = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const fmtMoney = (v) => v == null || v === '' ? '' : Number(v).toLocaleString(undefined, { style: 'currency', currency: 'USD' });
const fmtDate  = (v) => v ? String(v).split(' ')[0] : '';

// ─── API helpers ──────────────────────────────────────────────────────────
const api = {
    list: () => fetch('/api/orders').then(handleJson),
    create: (payload) => fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    }).then(handleJson),
};

async function handleJson(res) {
    let data; try { data = await res.json(); } catch { data = null; }
    if (!res.ok || (data && data.ok === false)) {
        const err = new Error((data && data.error) || `HTTP ${res.status}`);
        err.details = data && data.details;
        err.status  = res.status;
        throw err;
    }
    return data;
}

// ─── Form state — line items ──────────────────────────────────────────────
const linesBody = $('#linesBody');

function addLine(initial) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><input type="number" name="item"     min="1" required placeholder="Item ID" /></td>
        <td><input type="number" name="quantity" min="1" step="1" required placeholder="Qty" /></td>
        <td><input type="number" name="rate"     min="0" step="0.01" placeholder="Rate (optional)" /></td>
        <td><button type="button" class="btn-icon" title="Remove" aria-label="Remove line">&times;</button></td>
    `;
    if (initial) {
        tr.querySelector('[name=item]').value     = initial.item     || '';
        tr.querySelector('[name=quantity]').value = initial.quantity || '';
        tr.querySelector('[name=rate]').value     = initial.rate     || '';
    }
    tr.querySelector('button').addEventListener('click', () => {
        if (linesBody.rows.length > 1) tr.remove();
    });
    linesBody.appendChild(tr);
}

function readLines() {
    return Array.from(linesBody.rows).map((tr) => ({
        item:     tr.querySelector('[name=item]').value,
        quantity: tr.querySelector('[name=quantity]').value,
        rate:     tr.querySelector('[name=rate]').value || undefined,
    })).filter(l => l.item && l.quantity);
}

// ─── Messaging ────────────────────────────────────────────────────────────
function showMsg(el, kind, text) {
    el.className = `msg show ${kind}`;
    el.textContent = text;
}
function clearMsg(el) { el.className = 'msg'; el.textContent = ''; }

// ─── Submit handler ───────────────────────────────────────────────────────
const form    = $('#orderForm');
const formMsg = $('#formMsg');
const submitBtn = $('#submitBtn');

form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    clearMsg(formMsg);

    const payload = {
        entity: $('input[name=entity]').value,
        memo:   $('input[name=memo]').value || undefined,
        items:  readLines(),
    };
    if (!payload.entity) return showMsg(formMsg, 'error', 'Customer ID is required.');
    if (payload.items.length === 0) return showMsg(formMsg, 'error', 'Add at least one line item.');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating…';
    try {
        const out = await api.create(payload);
        showMsg(formMsg, 'success', `Created Sales Order #${out.tranid || out.id} (id=${out.id}).`);
        form.reset();
        linesBody.innerHTML = '';
        addLine();
        loadOrders();
    } catch (err) {
        const detail = err.details ? ' — ' + err.details.join('; ') : '';
        showMsg(formMsg, 'error', `${err.message}${detail}`);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Order';
    }
});

form.addEventListener('reset', () => {
    setTimeout(() => { linesBody.innerHTML = ''; addLine(); clearMsg(formMsg); }, 0);
});

$('#addLineBtn').addEventListener('click', () => addLine());

// ─── Orders list ──────────────────────────────────────────────────────────
const ordersBody = $('#ordersBody');
const ordersMsg  = $('#ordersMsg');

async function loadOrders() {
    clearMsg(ordersMsg);
    ordersBody.innerHTML = '<tr><td colspan="7" class="muted">Loading…</td></tr>';
    try {
        const data = await api.list();
        const orders = data.orders || [];
        if (!orders.length) {
            ordersBody.innerHTML = '<tr><td colspan="7" class="muted">No orders found.</td></tr>';
            return;
        }
        ordersBody.innerHTML = orders.map((o) => `
            <tr>
                <td>${escape(o.id)}</td>
                <td>${escape(o.tranid)}</td>
                <td>${escape(fmtDate(o.trandate))}</td>
                <td>${escape(o.entity_text || o.entity)}</td>
                <td>${escape(o.memo || '')}</td>
                <td>${escape(fmtMoney(o.total))}</td>
                <td>${escape(o.status || '')}</td>
            </tr>
        `).join('');
    } catch (err) {
        ordersBody.innerHTML = '';
        showMsg(ordersMsg, 'error', `Could not load orders: ${err.message}`);
    }
}

// Escape HTML — never trust strings in template literals.
function escape(s) {
    if (s == null) return '';
    return String(s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

$('#refreshBtn').addEventListener('click', loadOrders);

// ─── Init ────────────────────────────────────────────────────────────────
addLine();
loadOrders();
