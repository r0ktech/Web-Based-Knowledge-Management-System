import { Router } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET all audit trail entries (Admin only)
router.get('/', authenticateToken as any, authorizeRoles(Role.SUPER_ADMIN, Role.ADMINISTRATOR) as any, async (req, res) => {
  const { search, page = '1', limit = '20' } = req.query;

  const pageNum = parseInt(page as string) || 1;
  const limitNum = parseInt(limit as string) || 20;
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};

  if (search) {
    where.OR = [
      { action: { contains: search as string, mode: 'insensitive' } },
      { details: { contains: search as string, mode: 'insensitive' } },
      { user: { name: { contains: search as string, mode: 'insensitive' } } }
    ];
  }

  try {
    const total = await prisma.auditLog.count({ where });
    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      skip,
      take: limitNum,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });

    res.json({
      data: logs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving audit logs', error: error.message });
  }
});

export default router;
