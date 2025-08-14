const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getAdminAnalytics } = require('../controllers/analyticsController');

// Admin analytics
router.get('/admin', authenticate, getAdminAnalytics);

module.exports = router;
