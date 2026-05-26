import Tenant from '../models/Tenant.js';
import User from '../models/User.js';

// @desc    Get tenant details
// @route   GET /api/tenants
export const getTenant = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    
    const tenant = await Tenant.findById(tenantId);
    const users = await User.find({ tenantId }).select('-password');
    
    res.json({
      success: true,
      data: {
        tenant,
        users,
        userCount: users.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update tenant settings
// @route   PUT /api/tenants
export const updateTenant = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { companyName, settings } = req.body;
    
    const tenant = await Tenant.findByIdAndUpdate(
      tenantId,
      {
        ...(companyName && { companyName }),
        ...(settings && { settings })
      },
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      data: tenant
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Invite team member
// @route   POST /api/tenants/invite
export const inviteUser = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { email, name, role } = req.body;
    const currentUserRole = req.user.role;
    
    // Check permissions
    if (currentUserRole !== 'owner' && currentUserRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only owners and admins can invite users'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }
    
    // Check tenant user limit
    const tenant = await Tenant.findById(tenantId);
    const userCount = await User.countDocuments({ tenantId });
    
    if (userCount >= tenant.maxUsers) {
      return res.status(400).json({
        success: false,
        error: `Maximum user limit (${tenant.maxUsers}) reached. Please upgrade your plan.`
      });
    }
    
    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    
    // TODO: Send invitation email with temporary password
    
    res.json({
      success: true,
      message: `Invitation sent to ${email}. They will receive an email with instructions.`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Remove team member
// @route   DELETE /api/tenants/users/:userId
export const removeUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const tenantId = req.user.tenantId;
    const currentUserRole = req.user.role;
    const currentUserId = req.user.id;
    
    if (currentUserRole !== 'owner') {
      return res.status(403).json({
        success: false,
        error: 'Only owners can remove team members'
      });
    }
    
    if (userId === currentUserId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot remove yourself. Transfer ownership first.'
      });
    }
    
    const user = await User.findOneAndDelete({ _id: userId, tenantId });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User removed successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update user role
// @route   PUT /api/tenants/users/:userId/role
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const tenantId = req.user.tenantId;
    const currentUserRole = req.user.role;
    
    if (currentUserRole !== 'owner') {
      return res.status(403).json({
        success: false,
        error: 'Only owners can change user roles'
      });
    }
    
    const user = await User.findOneAndUpdate(
      { _id: userId, tenantId },
      { role },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export default { getTenant, updateTenant, inviteUser, removeUser, updateUserRole };