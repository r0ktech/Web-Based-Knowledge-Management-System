import { Router, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { authenticateToken, authorizeRoles, auditLog, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET all leaders with search, filter, and pagination
router.get('/', async (req, res) => {
  const { search, party, lga, position, status, sortBy = 'fullName', sortDir = 'asc', page = '1', limit = '10' } = req.query;

  const pageNum = parseInt(page as string) || 1;
  const limitNum = parseInt(limit as string) || 10;
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};

  if (search) {
    where.fullName = { contains: search as string, mode: 'insensitive' };
  }
  if (party) {
    where.politicalParty = party as string;
  }
  if (lga) {
    where.lga = lga as string;
  }
  if (position) {
    where.position = { contains: position as string, mode: 'insensitive' };
  }
  if (status) {
    where.status = status as string;
  }

  try {
    const total = await prisma.leader.count({ where });
    const leaders = await prisma.leader.findMany({
      where,
      orderBy: { [sortBy as string]: sortDir as string },
      skip,
      take: limitNum,
      include: {
        predecessor: {
          select: { id: true, fullName: true, position: true }
        }
      }
    });

    res.json({
      data: leaders,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error fetching leaders', error: error.message });
  }
});

// GET specific leader by ID + predecessor/successor links + related events
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const leader = await prisma.leader.findUnique({
      where: { id },
      include: {
        predecessor: true,
        successors: true,
        events: {
          include: {
            event: true
          }
        },
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!leader) {
      return res.status(404).json({ message: 'Leader not found' });
    }

    res.json(leader);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error fetching leader details', error: error.message });
  }
});

// CREATE leader
router.post(
  '/',
  authenticateToken as any,
  authorizeRoles(Role.SUPER_ADMIN, Role.ADMINISTRATOR, Role.HISTORIAN, Role.EDITOR) as any,
  auditLog('LEADER_CREATE', (req) => `Created leader biography for: ${req.body.fullName}`) as any,
  async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const {
      fullName, photograph, politicalParty, position, officeHeld,
      startDate, endDate, biography, achievements, policies, lga, status, predecessorId
    } = req.body;

    if (!fullName || !politicalParty || !position || !startDate || !biography || !lga) {
      return res.status(400).json({ message: 'Required fields missing: fullName, politicalParty, position, startDate, biography, lga' });
    }

    try {
      const leader = await prisma.leader.create({
        data: {
          fullName,
          photograph,
          politicalParty,
          position,
          officeHeld: officeHeld || position,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          biography,
          achievements: achievements || '',
          policies: policies || '',
          stateOfOrigin: 'Abia State',
          lga,
          status: status || 'Active',
          predecessorId: predecessorId || null,
          createdById: req.user.id
        }
      });

      res.status(201).json(leader);
    } catch (error: any) {
      res.status(500).json({ message: 'Server error creating leader', error: error.message });
    }
  }
);

// UPDATE leader
router.put(
  '/:id',
  authenticateToken as any,
  authorizeRoles(Role.SUPER_ADMIN, Role.ADMINISTRATOR, Role.HISTORIAN, Role.EDITOR) as any,
  auditLog('LEADER_UPDATE', (req) => `Updated leader details for ID: ${req.params.id}`) as any,
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const {
      fullName, photograph, politicalParty, position, officeHeld,
      startDate, endDate, biography, achievements, policies, lga, status, predecessorId
    } = req.body;

    try {
      const existing = await prisma.leader.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ message: 'Leader profile not found' });
      }

      const updated = await prisma.leader.update({
        where: { id },
        data: {
          fullName: fullName ?? existing.fullName,
          photograph: photograph ?? existing.photograph,
          politicalParty: politicalParty ?? existing.politicalParty,
          position: position ?? existing.position,
          officeHeld: officeHeld ?? existing.officeHeld,
          startDate: startDate ? new Date(startDate) : existing.startDate,
          endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : existing.endDate,
          biography: biography ?? existing.biography,
          achievements: achievements ?? existing.achievements,
          policies: policies ?? existing.policies,
          lga: lga ?? existing.lga,
          status: status ?? existing.status,
          predecessorId: predecessorId !== undefined ? predecessorId : existing.predecessorId
        }
      });

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: 'Server error updating leader', error: error.message });
    }
  }
);

// DELETE leader
router.delete(
  '/:id',
  authenticateToken as any,
  authorizeRoles(Role.SUPER_ADMIN, Role.ADMINISTRATOR) as any,
  auditLog('LEADER_DELETE', (req) => `Deleted leader profile ID: ${req.params.id}`) as any,
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
      const existing = await prisma.leader.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ message: 'Leader profile not found' });
      }

      await prisma.leader.delete({ where: { id } });
      res.json({ message: 'Leader profile deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ message: 'Server error deleting leader', error: error.message });
    }
  }
);

export default router;
