const express = require('express');
const router = express.Router();
const { createRequest, getRequests, fulfillRequest } = require('../controllers/supply.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/request', verifyToken, createRequest);
router.get('/requests', verifyToken, getRequests);
router.patch('/request/:id/fulfill', verifyToken, fulfillRequest);

module.exports = router;