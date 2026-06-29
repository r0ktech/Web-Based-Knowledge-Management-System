import { Router, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { authenticateToken, authorizeRoles, auditLog, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET all events with search, category filters, and pagination
router.get('/', async (req, res) => {
  const { search, category, startDate, endDate, page = '1', limit = '10' } = req.query;

  const pageNum = parseInt(page as string) || 1;
  const limitNum = parseInt(limit as string) || 10;
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};

  if (search) {
    where.OR = [
      { title: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
      { location: { contains: search as string, mode: 'insensitive' } }
    ];
  }

  if (category) {
    where.category = category as string;
  }

  if (startDate || endDate) {
    where.date = {};
    if (startDate) {
      where.date.gte = new Date(startDate as string);
    }
    if (endDate) {
      where.date.lte = new Date(endDate as string);
    }
  }

  try {
    const total = await prisma.historicalEvent.count({ where });
    const events = await prisma.historicalEvent.findMany({
      where,
      orderBy: { date: 'asc' }, // Always chronological by default
      skip,
      take: limitNum,
      include: {
        leaders: {
          include: {
            leader: {
              select: { id: true, fullName: true, position: true }
            }
          }
        }
      }
    });

    res.json({
      data: events,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error fetching events', error: error.message });
  }
});

// GET timeline explorer (lightweight format for timeline charting)
router.get('/timeline', async (req, res) => {
  try {
    const events = await prisma.historicalEvent.findMany({
      orderBy: { date: 'asc' },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        date: true,
        location: true
      }
    });
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error fetching timeline events', error: error.message });
  }
});

// GET map markers (locations with coordinates)
router.get('/map-locations', async (req, res) => {
  try {
    const events = await prisma.historicalEvent.findMany({
      select: {
        id: true,
        title: true,
        category: true,
        date: true,
        location: true,
        latitude: true,
        longitude: true
      }
    });
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error fetching coordinates', error: error.message });
  }
});

// GET event by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const event = await prisma.historicalEvent.findUnique({
      where: { id },
      include: {
        leaders: {
          include: {
            leader: true
          }
        },
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error fetching event details', error: error.message });
  }
});

// CREATE event
router.post(
  '/',
  authenticateToken as any,
  authorizeRoles(Role.SUPER_ADMIN, Role.ADMINISTRATOR, Role.HISTORIAN, Role.RESEARCHER) as any,
  auditLog('EVENT_CREATE', (req) => `Created historical event: ${req.body.title}`) as any,
  async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { title, description, category, date, location, latitude, longitude, image, leaderIds } = req.body;

    if (!title || !description || !category || !date || !location || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: 'Required fields missing: title, description, category, date, location, latitude, longitude' });
    }

    try {
      const event = await prisma.historicalEvent.create({
        data: {
          title,
          description,
          category,
          date: new Date(date),
          location,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          image: image || null,
          createdById: req.user.id
        }
      });

      if (leaderIds && Array.isArray(leaderIds)) {
        for (const leaderId of leaderIds) {
          await prisma.leaderEventRelation.create({
            data: {
              leaderId,
              eventId: event.id
            }
          });
        }
      }

      res.status(201).json(event);
    } catch (error: any) {
      res.status(500).json({ message: 'Server error creating event', error: error.message });
    }
  }
);

// UPDATE event
router.put(
  '/:id',
  authenticateToken as any,
  authorizeRoles(Role.SUPER_ADMIN, Role.ADMINISTRATOR, Role.HISTORIAN, Role.RESEARCHER) as any,
  auditLog('EVENT_UPDATE', (req) => `Updated historical event ID: ${req.params.id}`) as any,
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { title, description, category, date, location, latitude, longitude, image, leaderIds } = req.body;

    try {
      const existing = await prisma.historicalEvent.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ message: 'Event not found' });
      }

      const updated = await prisma.historicalEvent.update({
        where: { id },
        data: {
          title: title ?? existing.title,
          description: description ?? existing.description,
          category: category ?? existing.category,
          date: date ? new Date(date) : existing.date,
          location: location ?? existing.location,
          latitude: latitude !== undefined ? parseFloat(latitude) : existing.latitude,
          longitude: longitude !== undefined ? parseFloat(longitude) : existing.longitude,
          image: image ?? existing.image
        }
      });

      if (leaderIds && Array.isArray(leaderIds)) {
        // Clear previous linking relations and reinsert
        await prisma.leaderEventRelation.deleteMany({ where: { eventId: id } });
        for (const leaderId of leaderIds) {
          await prisma.leaderEventRelation.create({
            data: {
              leaderId,
              eventId: id
            }
          });
        }
      }

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: 'Server error updating event', error: error.message });
    }
  }
);

// DELETE event
router.delete(
  '/:id',
  authenticateToken as any,
  authorizeRoles(Role.SUPER_ADMIN, Role.ADMINISTRATOR) as any,
  auditLog('EVENT_DELETE', (req) => `Deleted historical event ID: ${req.params.id}`) as any,
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
      const existing = await prisma.historicalEvent.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ message: 'Event not found' });
      }

      await prisma.historicalEvent.delete({ where: { id } });
      res.json({ message: 'Event deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ message: 'Server error deleting event', error: error.message });
    }
  }
);

export default router;
