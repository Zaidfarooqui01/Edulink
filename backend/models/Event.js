const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  type: { 
    type: String, 
    enum: ['campus-drive', 'hackathon', 'webinar', 'sports', 'workshop'],
    required: true 
  },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetColleges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'College' }],
  targetAudience: {
    roles: [{ type: String, enum: ['student', 'alumni'] }],
    courses: [String],
    graduationYears: [Number],
    skills: [String]
  },
  eventDetails: {
    startDate: { type: Date, required: true },
    endDate: Date,
    location: String,
    isOnline: { type: Boolean, default: false },
    meetingLink: String,
    registrationDeadline: Date,
    maxParticipants: Number
  },
  companyDetails: {
    companyName: String,
    jobProfiles: [String],
    eligibilityCriteria: String,
    packageDetails: String
  },
  registrations: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    registeredAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['registered', 'attended', 'selected'], default: 'registered' }
  }],
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);
