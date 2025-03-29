import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./supabase-storage";
import { User as SelectUser } from "@shared/schema";
import { generateToken, sendVerificationEmail, sendPasswordResetEmail } from "./email";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "silver-circles-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username or password" });
        }
        
        try {
          const isPasswordMatch = await comparePasswords(password, user.password);
          
          if (!isPasswordMatch) {
            return done(null, false, { message: "Incorrect username or password" });
          }
          
          // Check if user email is verified
          if (!user.isVerified) {
            return done(null, false, { message: "Please verify your email address before logging in" });
          }
          
          return done(null, user);
        } catch (passwordError) {
          console.error("Error comparing passwords:", passwordError);
          return done(null, false, { message: "Authentication error" });
        }
      } catch (error) {
        console.error("Error in LocalStrategy:", error);
        return done(null, false, { message: "Authentication error" });
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        // User not found, return null instead of throwing an error
        return done(null, null);
      }
      return done(null, user);
    } catch (error) {
      console.error("Error deserializing user:", error);
      return done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      // Check if username already exists
      const existingUsername = await storage.getUserByUsername(req.body.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(req.body.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Generate verification token
      const verificationToken = generateToken();
      const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
        isVerified: false,
        verificationToken,
        verificationTokenExpiry
      });

      // Send verification email
      try {
        await sendVerificationEmail(user.email, verificationToken);
      } catch (emailError) {
        console.error("Error sending verification email:", emailError);
        // Continue registration process even if email fails
      }

      req.login(user, (err) => {
        if (err) return next(err);
        // Don't send the password in the response
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: any, info: { message: string } | undefined) => {
      if (err) {
        console.error("Error during authentication:", err);
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      
      req.login(user, (loginErr: Error | null) => {
        if (loginErr) {
          console.error("Error during login:", loginErr);
          return next(loginErr);
        }
        // Don't send the password in the response
        const { password, ...userWithoutPassword } = user;
        return res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err: Error | null) => {
      if (err) {
        console.error("Error during logout:", err);
        return next(err);
      }
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    // Don't send the password in the response
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
  
  // Middleware to check if the user has premium access
  app.use("/api/premium", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    if (!req.user.isPremium) {
      return res.status(403).json({ message: "Premium subscription required" });
    }
    
    next();
  });
  
  // Middleware to check if the user is an admin
  app.use("/api/admin", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    next();
  });

  // Email verification routes
  app.get("/api/verify-email", async (req, res, next) => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== 'string') {
        return res.status(400).json({ message: "Invalid verification token" });
      }
      
      const user = await storage.getUserByVerificationToken(token);
      
      if (!user) {
        return res.status(400).json({ message: "Invalid verification token" });
      }
      
      if (user.isVerified) {
        return res.status(400).json({ message: "Email already verified" });
      }
      
      // Check if token is expired
      if (user.verificationTokenExpiry && new Date(user.verificationTokenExpiry) < new Date()) {
        return res.status(400).json({ message: "Verification token has expired" });
      }
      
      // Update user as verified
      await storage.updateUser(user.id, {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null
      });
      
      return res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/resend-verification", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const user = await storage.getUser(req.user.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.isVerified) {
        return res.status(400).json({ message: "Email already verified" });
      }
      
      // Generate new verification token
      const verificationToken = generateToken();
      const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      // Update user with new token
      await storage.updateUser(user.id, {
        verificationToken,
        verificationTokenExpiry
      });
      
      // Send verification email
      try {
        await sendVerificationEmail(user.email, verificationToken);
        return res.status(200).json({ message: "Verification email sent" });
      } catch (emailError) {
        console.error("Error sending verification email:", emailError);
        return res.status(500).json({ message: "Failed to send verification email" });
      }
    } catch (error) {
      next(error);
    }
  });
  
  // Password reset routes
  app.post("/api/forgot-password", async (req, res, next) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        // For security reasons, always return success even if email doesn't exist
        return res.status(200).json({ message: "Password reset email sent if account exists" });
      }
      
      // Generate reset token
      const resetToken = generateToken();
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      
      // Update user with reset token
      await storage.updateUser(user.id, {
        passwordResetToken: resetToken,
        passwordResetExpiry: resetTokenExpiry
      });
      
      // Send password reset email
      try {
        await sendPasswordResetEmail(user.email, resetToken);
      } catch (emailError) {
        console.error("Error sending password reset email:", emailError);
        // Still return success for security reasons
      }
      
      return res.status(200).json({ message: "Password reset email sent if account exists" });
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/reset-password", async (req, res, next) => {
    try {
      const { token, password } = req.body;
      
      if (!token || !password) {
        return res.status(400).json({ message: "Token and password are required" });
      }
      
      const user = await storage.getUserByPasswordResetToken(token);
      
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }
      
      // Check if token is expired
      if (user.passwordResetExpiry && new Date(user.passwordResetExpiry) < new Date()) {
        return res.status(400).json({ message: "Reset token has expired" });
      }
      
      // Update user's password
      await storage.updateUser(user.id, {
        password: await hashPassword(password),
        passwordResetToken: null,
        passwordResetExpiry: null
      });
      
      return res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
      next(error);
    }
  });
}
