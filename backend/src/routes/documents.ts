import { Router, Response } from 'express';
import { PrismaClient, Role, DocStatus } from '@prisma/client';
import { authenticateToken, authorizeRoles, auditLog, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET all documents with search, category filtering, and status gates
router.get('/', authenticateToken as any, async (req: AuthRequest, res) => {
  const { search, category, fileType, status, page = '1', limit = '10' } = req.query;

  const pageNum = parseInt(page as string) || 1;
  const limitNum = parseInt(limit as string) || 10;
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};

  if (search) {
    where.OR = [
      { title: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } }
    ];
  }

  if (category) {
    where.category = category as string;
  }

  if (fileType) {
    where.fileType = fileType as string;
  }

  // Gatekeeper: guests and contributors can only see APPROVED documents or their own uploaded documents.
  // Admins and editors/researchers/historians can see pending ones.
  const userRole = req.user?.role;
  const userId = req.user?.id;

  if (userRole === Role.GUEST || userRole === Role.CONTRIBUTOR) {
    where.OR = [
      { status: DocStatus.APPROVED },
      { uploaderId: userId }
    ];
  } else {
    if (status && Object.values(DocStatus).includes(status as DocStatus)) {
      where.status = status as DocStatus;
    }
  }

  try {
    const total = await prisma.document.count({ where });
    const documents = await prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
      include: {
        uploader: {
          select: { id: true, name: true, role: true }
        },
        approvedBy: {
          select: { id: true, name: true }
        }
      }
    });

    res.json({
      data: documents,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error fetching documents', error: error.message });
  }
});

// GET specific document by ID
router.get('/:id', authenticateToken as any, async (req: AuthRequest, res) => {
  const { id } = req.params;

  try {
    const doc = await prisma.document.findUnique({
      where: { id },
      include: {
        uploader: {
          select: { id: true, name: true, email: true }
        },
        approvedBy: {
          select: { id: true, name: true }
        }
      }
    });

    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Role-based details security
    const userRole = req.user?.role;
    if (doc.status !== DocStatus.APPROVED && userRole === Role.GUEST && doc.uploaderId !== req.user?.id) {
      return res.status(403).json({ message: 'Forbidden: Document pending archive verification' });
    }

    res.json(doc);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error fetching document', error: error.message });
  }
});

// CREATE (UPLOAD) document metadata
router.post(
  '/',
  authenticateToken as any,
  auditLog('DOCUMENT_UPLOAD', (req) => `Uploaded document draft: ${req.body.title}`) as any,
  async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { title, description, fileUrl, fileType, fileSize, category } = req.body;

    if (!title || !description || !fileUrl || !fileType || !fileSize || !category) {
      return res.status(400).json({ message: 'Required fields missing: title, description, fileUrl, fileType, fileSize, category' });
    }

    try {
      // Contributors start with PENDING_APPROVAL. Admins and Historians auto-approve their own uploads.
      const canAutoApprove = [Role.SUPER_ADMIN, Role.ADMINISTRATOR, Role.HISTORIAN, Role.RESEARCHER].includes(req.user.role);
      
      const doc = await prisma.document.create({
        data: {
          title,
          description,
          fileUrl,
          fileType: fileType.toUpperCase(),
          fileSize: parseInt(fileSize),
          category,
          status: canAutoApprove ? DocStatus.APPROVED : DocStatus.PENDING_APPROVAL,
          uploaderId: req.user.id,
          approvedById: canAutoApprove ? req.user.id : null
        }
      });

      res.status(201).json(doc);
    } catch (error: any) {
      res.status(500).json({ message: 'Server error uploading document details', error: error.message });
    }
  }
);

// APPROVE document
router.put(
  '/:id/approve',
  authenticateToken as any,
  authorizeRoles(Role.SUPER_ADMIN, Role.ADMINISTRATOR, Role.EDITOR) as any,
  auditLog('DOCUMENT_APPROVE', (req) => `Approved document ID: ${req.params.id}`) as any,
  async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { id } = req.params;

    try {
      const doc = await prisma.document.findUnique({ where: { id } });
      if (!doc) {
        return res.status(404).json({ message: 'Document not found' });
      }

      const updated = await prisma.document.update({
        where: { id },
        data: {
          status: DocStatus.APPROVED,
          approvedById: req.user.id
        }
      });

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: 'Server error approving document', error: error.message });
    }
  }
);

// REJECT document
router.put(
  '/:id/reject',
  authenticateToken as any,
  authorizeRoles(Role.SUPER_ADMIN, Role.ADMINISTRATOR, Role.EDITOR) as any,
  auditLog('DOCUMENT_REJECTED', (req) => `Rejected document ID: ${req.params.id}`) as any,
  async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { id } = req.params;

    try {
      const doc = await prisma.document.findUnique({ where: { id } });
      if (!doc) {
        return res.status(404).json({ message: 'Document not found' });
      }

      const updated = await prisma.document.update({
        where: { id },
        data: {
          status: DocStatus.REJECTED,
          approvedById: req.user.id
        }
      });

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: 'Server error rejecting document', error: error.message });
    }
  }
);

// DELETE document
router.delete(
  '/:id',
  authenticateToken as any,
  auditLog('DOCUMENT_DELETE', (req) => `Deleted document ID: ${req.params.id}`) as any,
  async (req: AuthRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { id } = req.params;

    try {
      const doc = await prisma.document.findUnique({ where: { id } });
      if (!doc) {
        return res.status(404).json({ message: 'Document not found' });
      }

      // Check permissions: only uploader or administrators can delete
      const isAdmin = [Role.SUPER_ADMIN, Role.ADMINISTRATOR].includes(req.user.role);
      const isUploader = doc.uploaderId === req.user.id;

      if (!isAdmin && !isUploader) {
        return res.status(403).json({ message: 'Forbidden: You do not have permission to delete this file' });
      }

      await prisma.document.delete({ where: { id } });
      res.json({ message: 'Document deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ message: 'Server error deleting document', error: error.message });
    }
  }
);

export default router;
