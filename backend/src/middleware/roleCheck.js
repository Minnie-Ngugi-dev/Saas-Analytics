export const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Not authenticated' 
      });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied. Insufficient permissions.' 
      });
    }
    
    next();
  };
};

export const isOwner = checkRole('owner');
export const isAdminOrOwner = checkRole('owner', 'admin');
export const isViewerOrAbove = checkRole('owner', 'admin', 'viewer');

export default { checkRole, isOwner, isAdminOrOwner, isViewerOrAbove };