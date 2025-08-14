// controllers/quizController.js
const Quiz = require('../models/Quiz');
const User = require('../models/User');

exports.createQuiz = async (req, res) => {
  try {
    const quizData = {
      ...req.body,
      createdBy: req.user._id
    };

    const quiz = new Quiz(quizData);
    await quiz.save();

    res.status(201).json({
      message: 'Quiz created successfully',
      quiz
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getActiveQuizzes = async (req, res) => {
  try {
    const now = new Date();
    const quizzes = await Quiz.find({
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).populate('createdBy', 'profile.firstName profile.lastName');

    res.json({ quizzes });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers, timeTaken } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if quiz is still active
    const now = new Date();
    if (now < quiz.startDate || now > quiz.endDate) {
      return res.status(400).json({ message: 'Quiz is not active' });
    }

    // Check if user already participated
    const existingParticipation = quiz.participants.find(
      p => p.user.toString() === req.user._id.toString()
    );
    if (existingParticipation) {
      return res.status(400).json({ message: 'You have already participated in this quiz' });
    }

    // Calculate score
    let score = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        score += question.points;
      }
    });

    const maxScore = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = (score / maxScore) * 100;

    // Add participation
    quiz.participants.push({
      user: req.user._id,
      score: percentage,
      completedAt: new Date(),
      answers,
      timeTaken
    });

    // Update quiz statistics
    quiz.totalParticipants = quiz.participants.length;
    quiz.averageScore = quiz.participants.reduce((sum, p) => sum + p.score, 0) / quiz.totalParticipants;

    await quiz.save();

    // Update user quiz stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'quizStats.totalQuizzes': 1 },
      $push: { 'quizStats.recentScores': percentage }
    });

    // Recalculate user's average score
    const user = await User.findById(req.user._id);
    const allQuizzes = await Quiz.find({ 'participants.user': req.user._id });
    let totalScore = 0;
    let quizCount = 0;

    allQuizzes.forEach(q => {
      const userParticipation = q.participants.find(p => p.user.toString() === req.user._id.toString());
      if (userParticipation) {
        totalScore += userParticipation.score;
        quizCount++;
      }
    });

    await User.findByIdAndUpdate(req.user._id, {
      'quizStats.averageScore': quizCount > 0 ? totalScore / quizCount : 0
    });

    res.json({
      message: 'Quiz submitted successfully',
      score: percentage,
      correctAnswers: score,
      totalQuestions: quiz.questions.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const { period = 'all', limit = 10 } = req.query;
    
    let users = await User.find({ 
      role: { $in: ['student', 'alumni'] },
      'quizStats.totalQuizzes': { $gt: 0 }
    })
    .select('profile quizStats studentProfile')
    .populate('studentProfile.college', 'name')
    .sort({ 'quizStats.averageScore': -1 })
    .limit(parseInt(limit));

    res.json({ leaderboard: users });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
