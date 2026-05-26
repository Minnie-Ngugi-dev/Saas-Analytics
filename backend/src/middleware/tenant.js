import Tenant from '../models/Tenant.js';

export const checkTenantAccess = async (req, res, next) => {
  try {
    const tenantId = req.params.tenantId || req.body.tenantId || req.user?.tenantId;
    
    if (!tenantId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Tenant ID required' 
      });
    }
    
    const tenant = await Tenant.findById(tenantId);
    
    if (!tenant) {
      return res.status(404).json({ 
        success: false, 
        error: 'Tenant not found' 
      });
    }
    
    // Check if user belongs to this tenant
    if (req.user.tenantId !== tenantId && req.user.role !== 'owner') {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied to this tenant' 
      });
    }
    
    req.tenant = tenant;
    next();
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

export default checkTenantAccess;