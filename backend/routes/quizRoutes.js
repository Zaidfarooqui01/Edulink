const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { createQuiz, getActiveQuizzes, submitQuiz } = require('../controllers/quizController');

// Get all active quizzes (any logged-in user)
router.get('/active', authenticate, getActiveQuizzes);

// Create quiz (only admin, college, or company)
router.post('/', authenticate, authorize('admin', 'college', 'company'), createQuiz);

// Submit quiz answers (students/alumni)
router.post('/:quizId/submit', authenticate, authorize('student', 'alumni'), submitQuiz);

module.exports = router;
