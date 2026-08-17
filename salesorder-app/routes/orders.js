/**
 * routes/orders.js
 *
 * REST routes for Sales Orders. Thin layer — delegates to controller.
 */
'use strict';

const express = require('express');
const router  = express.Router();

const { listOrders, getOrder, createOrder } = require('../controllers/ordersController');
const { validateCreateOrder }                = require('../middleware/validateOrder');

router.get ('/',     listOrders);
router.get ('/:id',  getOrder);
router.post('/',     validateCreateOrder, createOrder);

module.exports = router;
