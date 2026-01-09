const User = require('../models/User.model');
const SolarRequest = require('../models/SolarRequest.model');
const { apiResponse } = require('../utils/apiResponse');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    return apiResponse(res, 200, true, 'Users retrieved successfully', users);
  } catch (error) {
    console.error('Get all users error:', error);
    return apiResponse(res, 500, false, 'Server error while fetching users');
  }
};

// Get all analysis requests
const getAllRequests = async (req, res) => {
  try {
    const requests = await SolarRequest.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    return apiResponse(res, 200, true, 'Requests retrieved successfully', requests);
  } catch (error) {
    console.error('Get all requests error:', error);
    return apiResponse(res, 500, false, 'Server error while fetching requests');
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['Customer', 'Admin', 'Installer'].includes(role)) {
      return apiResponse(res, 400, false, 'Invalid role. Must be Customer, Admin, or Installer');
    }

    // Prevent admin from demoting themselves
    if (req.user.id === userId && role !== 'Admin') {
      return apiResponse(res, 400, false, 'You cannot change your own role');
    }

    const user = await User.findById(userId);
    if (!user) {
      return apiResponse(res, 404, false, 'User not found');
    }

    user.role = role;
    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.password;

    return apiResponse(res, 200, true, 'User role updated successfully', updatedUser);
  } catch (error) {
    console.error('Update user role error:', error);
    return apiResponse(res, 500, false, 'Server error while updating user role');
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent admin from deleting themselves
    if (req.user.id === userId) {
      return apiResponse(res, 400, false, 'You cannot delete your own account');
    }

    const user = await User.findById(userId);
    if (!user) {
      return apiResponse(res, 404, false, 'User not found');
    }

    // Delete all associated requests
    await SolarRequest.deleteMany({ userId });

    await User.findByIdAndDelete(userId);

    return apiResponse(res, 200, true, 'User deleted successfully');
  } catch (error) {
    console.error('Delete user error:', error);
    return apiResponse(res, 500, false, 'Server error while deleting user');
  }
};

// Get dashboard statistics
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRequests = await SolarRequest.countDocuments();
    const pendingRequests = await SolarRequest.countDocuments({ status: { $in: ['pending', 'processing'] } });
    const processedRequests = await SolarRequest.countDocuments({ status: 'processed' });
    const failedRequests = await SolarRequest.countDocuments({ status: 'failed' });

    const stats = {
      totalUsers,
      totalRequests,
      pendingRequests,
      processedRequests,
      failedRequests
    };

    return apiResponse(res, 200, true, 'Stats retrieved successfully', stats);
  } catch (error) {
    console.error('Get stats error:', error);
    return apiResponse(res, 500, false, 'Server error while fetching statistics');
  }
};

module.exports = {
  getAllUsers,
  getAllRequests,
  updateUserRole,
  deleteUser,
  getStats
};
