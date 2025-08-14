const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: { type: String, enum: ['technical', 'aptitude', 'general'], required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  questions: [{
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true },
    explanation: String,
    points: { type: Number, default: 1 }
  }],
  timeLimit: { type: Number, required: true }, // in minutes
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isDaily: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score: Number,
    completedAt: Date,
    answers: [Number],
    timeTaken: Number // in seconds
  }],
  totalParticipants: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('Quiz', quizSchema);
