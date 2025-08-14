// controllers/analyticsController.js
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const Event = require('../models/Event');
const College = require('../models/College');

exports.getAdminAnalytics = async (req, res) => {
  try {
    // Only admin can access
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { startDate, endDate } = req.query;
    const dateFilter = {};
    
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // User statistics
    const userStats = await User.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Quiz engagement
    const quizStats = await Quiz.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalQuizzes: { $sum: 1 },
          totalParticipants: { $sum: '$totalParticipants' },
          averageScore: { $avg: '$averageScore' }
        }
      }
    ]);

    // Event statistics
    const eventStats = await Event.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalRegistrations: { $sum: { $size: '$registrations' } }
        }
      }
    ]);

    // College-wise user distribution
    const collegeStats = await User.aggregate([
      {
        $match: {
          role: { $in: ['student', 'alumni'] },
          'studentProfile.college': { $exists: true }
        }
      },
      {
        $group: {
          _id: '$studentProfile.college',
          students: {
            $sum: { $cond: [{ $eq: ['$role', 'student'] }, 1, 0] }
          },
          alumni: {
            $sum: { $cond: [{ $eq: ['$role', 'alumni'] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'colleges',
          localField: '_id',
          foreignField: '_id',
          as: 'college'
        }
      },
      { $unwind: '$college' },
      {
        $project: {
          collegeName: '$college.name',
          students: 1,
          alumni: 1,
          total: { $add: ['$students', '$alumni'] }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 10 }
    ]);

    // Active users in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUsers = await User.countDocuments({
      lastLoginAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      userStats,
      quizStats: quizStats[0] || { totalQuizzes: 0, totalParticipants: 0, averageScore: 0 },
      eventStats,
      collegeStats,
      activeUsers,
      totalUsers: await User.countDocuments(),
      totalColleges: await College.countDocuments({ verified: true })
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getCollegeAnalytics = async (req, res) => {
  try {
    // Only college admin can access their analytics
    if (req.user.role !== 'college') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const collegeId = req.user.collegeProfile.collegeId;

    // Student performance in quizzes
    const studentPerformance = await User.aggregate([
      {
        $match: {
          'studentProfile.college': collegeId,
          role: { $in: ['student', 'alumni'] }
        }
      },
      {
        $group: {
          _id: '$studentProfile.course',
          averageScore: { $avg: '$quizStats.averageScore' },
          totalStudents: { $sum: 1 },
          totalQuizzes: { $sum: '$quizStats.totalQuizzes' }
        }
      }
    ]);

    // Event participation
    const eventParticipation = await Event.aggregate([
      {
        $match: {
          targetColleges: collegeId
        }
      },
      {
        $group: {
          _id: '$type',
          eventCount: { $sum: 1 },
          totalRegistrations: { $sum: { $size: '$registrations' } }
        }
      }
    ]);

    res.json({
      studentPerformance,
      eventParticipation,
      totalStudents: await User.countDocuments({
        'studentProfile.college': collegeId,
        role: 'student'
      }),
      totalAlumni: await User.countDocuments({
        'studentProfile.college': collegeId,
        role: 'alumni'
      })
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
