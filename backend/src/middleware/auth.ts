import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { Role, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
    name: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'abia_state_kms_secret_key_2026_super_secure') as any;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name
    };
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export const authorizeRoles = (...allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient privileges' });
    }

    next();
  };
};

export const auditLog = (action: string, getDetails: (req: AuthRequest) => string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Capture details inside standard response interceptor or before route handler
    const originalSend = res.send;
    res.send = function (body) {
      res.send = originalSend;
      
      // Check if request succeeded before logging
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        const userId = req.user?.id || null;
        
        prisma.auditLog.create({
          data: {
            userId,
            action,
            details: getDetails(req),
            ipAddress: typeof ip === 'string' ? ip : JSON.stringify(ip)
          }
        }).catch(err => console.error('Error writing audit log:', err));
      }
      
      return res.send(body);
    };

    next();
  };
};
