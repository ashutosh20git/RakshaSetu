const express = require('express');
const router = express.Router();
const { ping } = require('../controllers/heartbeat.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/ping', verifyToken, ping);

module.exports = router;