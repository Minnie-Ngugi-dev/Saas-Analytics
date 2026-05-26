import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import Tenant from '../models/Tenant.js';
import { hashPassword } from '../utils/hashPassword.js';

export const configurePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
        scope: ['profile', 'email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ 
            $or: [
              { googleId: profile.id },
              { email: profile.emails[0].value }
            ]
          }).populate('tenantId');
          
          if (!user) {
            // Create tenant for new user
            const tenant = await Tenant.create({
              companyName: profile.displayName + "'s Company",
              companyEmail: profile.emails[0].value
            });
            
            // Create user
            user = await User.create({
              name: profile.displayName,
              email: profile.emails[0].value,
              password: await hashPassword(Math.random().toString(36)),
              role: 'owner',
              tenantId: tenant._id,
              googleId: profile.id,
              isVerified: true
            });
          }
          
          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
  
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).populate('tenantId');
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};

export default configurePassport;