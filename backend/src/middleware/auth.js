import { verifyAccessToken } from '../utils/generateToken.js';

export const protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Not authorized. No token provided.' 
      });
    }
    
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        error: 'Token expired. Please refresh.' 
      });
    }
    return res.status(401).json({ 
      success: false, 
      error: 'Not authorized. Invalid token.' 
    });
  }
};

export default protect;