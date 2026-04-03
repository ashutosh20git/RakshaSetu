const express = require('express');
const router = express.Router();
const { triggerSos, getNearbySos } = require('../controllers/sos.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/trigger', verifyToken, triggerSos);
router.get('/nearby', verifyToken, getNearbySos);

module.exports = router;