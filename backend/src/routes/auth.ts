import { Router, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'abia_state_kms_secret_key_2026_super_secure';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'abia_state_kms_refresh_secret_key_2026_super_secure';

// Helper to generate tokens
const generateTokens = (user: { id: string; email: string; role: Role; name: string }) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

// Register
router.post('/register', async (req, res) => {
  const { email, password, name, role, stateOfOrigin, lga } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Email, password, and name are required' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const assignedRole = role && Object.values(Role).includes(role as Role) ? (role as Role) : Role.GUEST;

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: assignedRole,
        profile: {
          create: {
            stateOfOrigin: stateOfOrigin || 'Abia State',
            lga: lga || '',
            biography: '',
            avatarUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${name.replace(/\s+/g, '')}`
          }
        }
      },
      include: {
        profile: true
      }
    });

    // Create seed audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTER',
        details: `Successfully registered new account for ${name} (${user.email}) as role ${user.role}.`
      }
    });

    const { accessToken, refreshToken } = generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    res.status(201).json({
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true }
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    // Log Activity
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        details: `User logged in. IP address recorded.`
      }
    });

    res.json({
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Refresh Token
router.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { profile: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const tokens = generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    res.json({
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (err) {
    res.status(403).json({ message: 'Invalid refresh token' });
  }
});

// Fetch current user Details
router.get('/me', authenticateToken as any, async (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { profile: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update Profile
router.put('/profile', authenticateToken as any, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  
  const { name, stateOfOrigin, lga, biography, avatarUrl } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: name,
        profile: {
          upsert: {
            create: {
              stateOfOrigin,
              lga,
              biography,
              avatarUrl
            },
            update: {
              stateOfOrigin,
              lga,
              biography,
              avatarUrl
            }
          }
        }
      },
      include: { profile: true }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'PROFILE_UPDATE',
        details: `Updated personal profile parameters.`
      }
    });

    res.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        profile: updatedUser.profile
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Change Password
router.put('/change-password', authenticateToken as any, async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: 'Old and new passwords are required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || !(await bcrypt.compare(oldPassword, user.passwordHash))) {
      return res.status(400).json({ message: 'Invalid current password' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'PASSWORD_CHANGE',
        details: `Successfully changed account password.`
      }
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
