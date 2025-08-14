const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  location: {
    city: String,
    state: String,
    country: String
  },
  establishedYear: Number,
  website: String,
  logo: String,
  description: String,
  courses: [String],
  verified: { type: Boolean, default: false },
  adminUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  studentsCount: { type: Number, default: 0 },
  alumniCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('College', collegeSchema);
