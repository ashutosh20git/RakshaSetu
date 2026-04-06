const express = require('express');
const router = express.Router();
const { reportSafeZone, getSafeZones, verifySafeZone } = require('../controllers/safezone.controller');
const { verifyToken, authorizeRoles } = require('../middleware/auth.middleware');

router.post('/report', verifyToken, reportSafeZone);
router.get('/', verifyToken, getSafeZones);
router.patch('/:id/verify', verifyToken, authorizeRoles('AUTHORITY'), verifySafeZone);

module.exports = router;