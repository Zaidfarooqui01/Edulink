const jwt = require('jsonwebtoken');
const User = require('../models/User');
const College = require('../models/College');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  try {
    const { email, password, role, profile, studentProfile, companyProfile, collegeProfile } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    const userData = { email, password, role, profile };

    if (role === 'student' || role === 'alumni') {
      userData.studentProfile = studentProfile;

      if (studentProfile.college) {
        const college = await College.findById(studentProfile.college);
        if (!college) {
          return res.status(400).json({ message: 'Invalid college selected.' });
        }
      }
    } else if (role === 'company') {
      userData.companyProfile = companyProfile;
    } else if (role === 'college') {
      userData.collegeProfile = collegeProfile;
    }

    const user = new User(userData);
    await user.save();

    if (role === 'student' && studentProfile.college) {
      await College.findByIdAndUpdate(studentProfile.college, { $inc: { studentsCount: 1 } });
    } else if (role === 'alumni' && studentProfile.college) {
      await College.findByIdAndUpdate(studentProfile.college, { $inc: { alumniCount: 1 } });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile
      },
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate('studentProfile.college');
    if (!user || !await user.comparePassword(password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        studentProfile: user.studentProfile,
        companyProfile: user.companyProfile,
        collegeProfile: user.collegeProfile
      },
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
