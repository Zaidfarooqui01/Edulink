const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { searchUsers } = require('../controllers/searchController');

// Search for users
router.get('/users', authenticate, searchUsers);

module.exports = router;
