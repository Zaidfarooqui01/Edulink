// controllers/searchController.js
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const Event = require('../models/Event');

exports.searchUsers = async (req, res) => {
  try {
    const { 
      query, 
      college, 
      skills, 
      graduationYear, 
      course,
      minScore,
      page = 1, 
      limit = 20 
    } = req.query;

    let searchFilter = {
      role: { $in: ['student', 'alumni'] },
      'studentProfile.isProfilePublic': true
    };

    // Text search
    if (query) {
      searchFilter.$or = [
        { 'profile.firstName': { $regex: query, $options: 'i' } },
        { 'profile.lastName': { $regex: query, $options: 'i' } },
        { 'studentProfile.skills': { $regex: query, $options: 'i' } }
      ];
    }

    // College filter
    if (college) {
      searchFilter['studentProfile.college'] = college;
    }

    // Skills filter
    if (skills) {
      const skillsArray = skills.split(',');
      searchFilter['studentProfile.skills'] = { $in: skillsArray };
    }

    // Graduation year filter
    if (graduationYear) {
      searchFilter['studentProfile.graduationYear'] = parseInt(graduationYear);
    }

    // Course filter
    if (course) {
      searchFilter['studentProfile.course'] = { $regex: course, $options: 'i' };
    }

    // Quiz performance filter
    if (minScore) {
      searchFilter['quizStats.averageScore'] = { $gte: parseFloat(minScore) };
    }

    const users = await User.find(searchFilter)
      .populate('studentProfile.college', 'name location')
      .select('profile studentProfile quizStats')
      .sort({ 'quizStats.averageScore': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(searchFilter);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate('studentProfile.college');

    if (!user || !user.studentProfile) {
      return res.status(400).json({ message: 'User profile not found' });
    }

    // Find users with similar interests/skills from same college
    const collegeRecommendations = await User.find({
      _id: { $ne: userId },
      role: { $in: ['student', 'alumni'] },
      'studentProfile.college': user.studentProfile.college._id,
      'studentProfile.isProfilePublic': true,
      'studentProfile.skills': { $in: user.studentProfile.skills }
    })
    .populate('studentProfile.college', 'name')
    .select('profile studentProfile quizStats')
    .limit(5);

    // Find users with similar quiz performance
    const performanceRecommendations = await User.find({
      _id: { $ne: userId },
      role: { $in: ['student', 'alumni'] },
      'studentProfile.isProfilePublic': true,
      'quizStats.averageScore': {
        $gte: user.quizStats.averageScore - 10,
        $lte: user.quizStats.averageScore + 10
      }
    })
    .populate('studentProfile.college', 'name')
    .select('profile studentProfile quizStats')
    .limit(5);

    // Combine and deduplicate recommendations
    const allRecommendations = [...collegeRecommendations, ...performanceRecommendations];
    const uniqueRecommendations = allRecommendations.filter((user, index, self) =>
      index === self.findIndex(u => u._id.toString() === user._id.toString())
    );

    res.json({
      recommendations: uniqueRecommendations.slice(0, 10),
      categories: {
        collegemates: collegeRecommendations,
        similarPerformance: performanceRecommendations
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
