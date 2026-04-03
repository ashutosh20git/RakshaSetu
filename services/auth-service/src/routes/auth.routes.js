const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.controller');
const { verifyToken, authorizeRoles } = require('../middleware/auth.middleware');


router.post('/register', register);
router.post('/login', login);

router.get('/me', verifyToken, (req, res) => {
  res.json({ message: 'Token valid', user: req.user });
});

router.get('/admin', verifyToken, authorizeRoles('AUTHORITY'), (req,res)=>{
    res.json({ message: 'Welcome authority' });
});

module.exports = router;