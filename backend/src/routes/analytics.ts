import { Router } from 'express';
import { PrismaClient, DocStatus } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/summary', async (req, res) => {
  try {
    const [
      totalLeaders,
      totalEvents,
      totalDocuments,
      totalUsers,
      pendingDocuments,
      approvedDocuments
    ] = await prisma.$transaction([
      prisma.leader.count(),
      prisma.historicalEvent.count(),
      prisma.document.count(),
      prisma.user.count(),
      prisma.document.count({ where: { status: DocStatus.PENDING_APPROVAL } }),
      prisma.document.count({ where: { status: DocStatus.APPROVED } })
    ]);

    // Party Distribution
    const partyStats = await prisma.leader.groupBy({
      by: ['politicalParty'],
      _count: {
        _all: true
      }
    });

    const partyDistribution = partyStats.map(stat => ({
      name: stat.politicalParty,
      value: stat._count._all
    }));

    // Event Category Distribution
    const categoryStats = await prisma.historicalEvent.groupBy({
      by: ['category'],
      _count: {
        _all: true
      }
    });

    const categoryDistribution = categoryStats.map(stat => ({
      name: stat.category,
      value: stat._count._all
    }));

    // Document Category Distribution
    const docCatStats = await prisma.document.groupBy({
      by: ['category'],
      _count: {
        _all: true
      }
    });

    const docCategoryDistribution = docCatStats.map(stat => ({
      name: stat.category,
      value: stat._count._all
    }));

    // Recent Activites (Latest Audit Logs)
    const recentActivities = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 6,
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    res.json({
      totals: {
        leaders: totalLeaders,
        events: totalEvents,
        documents: totalDocuments,
        users: totalUsers,
        pendingDocs: pendingDocuments,
        approvedDocs: approvedDocuments
      },
      partyDistribution,
      categoryDistribution,
      docCategoryDistribution,
      recentActivities
    });

  } catch (error: any) {
    res.status(500).json({ message: 'Server error aggregating metrics', error: error.message });
  }
});

// CSV Export Endpoint for Reports Page
router.get('/export-csv', async (req, res) => {
  try {
    const leaders = await prisma.leader.findMany({
      select: {
        fullName: true,
        politicalParty: true,
        position: true,
        officeHeld: true,
        startDate: true,
        endDate: true,
        lga: true
      }
    });

    let csvContent = 'Full Name,Political Party,Position,Office Held,Start Date,End Date,LGA\n';
    leaders.forEach(l => {
      const startStr = l.startDate.toISOString().split('T')[0];
      const endStr = l.endDate ? l.endDate.toISOString().split('T')[0] : 'Present';
      const cleanName = l.fullName.replace(/,/g, '');
      const cleanOffice = l.officeHeld.replace(/,/g, '');
      csvContent += `"${cleanName}","${l.politicalParty}","${l.position}","${cleanOffice}","${startStr}","${endStr}","${l.lga}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=leaders_trajectory_report.csv');
    res.status(200).send(csvContent);
  } catch (error: any) {
    res.status(500).json({ message: 'Error exporting report', error: error.message });
  }
});

export default router;
