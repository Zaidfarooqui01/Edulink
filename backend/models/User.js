// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['student', 'alumni', 'college', 'company', 'admin'],
    required: true 
  },
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    phone: String,
    bio: String
  },
  studentProfile: {
    college: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
    graduationYear: Number,
    course: String,
    skills: [String],
    interests: [String],
    cgpa: Number,
    isProfilePublic: { type: Boolean, default: false },
    shareQuizResults: { type: Boolean, default: false }
  },
  companyProfile: {
    companyName: String,
    industry: String,
    website: String,
    description: String,
    verified: { type: Boolean, default: false }
  },
  collegeProfile: {
    collegeName: String,
    location: String,
    establishedYear: Number,
    website: String,
    verified: { type: Boolean, default: false }
  },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  friendRequests: [{
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
  }],
  quizStats: {
    totalQuizzes: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    badges: [String],
    rank: Number
  },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
