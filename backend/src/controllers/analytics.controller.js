const prisma = require('../lib/prisma');

/**
 * GET /api/analytics/summary
 * Computes high-level aggregated operational metrics for the authenticated OpsUser.
 */
const getDashboardSummary = async (req, res) => {
  try {
    // 1. Total active onboarding partners
    const totalHealthmates = await prisma.healthmate.count({});

    // 2. Breakdown count per Phase
    const phases = ['PRE_QUALIFY', 'PREPARE', 'REGISTER', 'REVIEW', 'LIVE'];
    const phaseBreakdown = {};
    for (const phase of phases) {
      phaseBreakdown[phase] = await prisma.healthmate.count({
        where: { phase }
      });
    }

    // 3. Bottleneck Analysis: Average daysInPhase per Phase
    const phaseAverages = [];
    for (const phase of phases) {
      const agg = await prisma.healthmate.aggregate({
        where: { phase },
        _avg: { daysInPhase: true }
      });
      phaseAverages.push({
        phase,
        avgDays: Math.round((agg._avg.daysInPhase || 0) * 10) / 10
      });
    }

    // Identify the phase with the highest average daysInPhase as the bottleneck
    const sortedBottlenecks = [...phaseAverages].sort((a, b) => b.avgDays - a.avgDays);
    const bottleneck = sortedBottlenecks[0] && sortedBottlenecks[0].avgDays > 0
      ? sortedBottlenecks[0]
      : { phase: 'None', avgDays: 0 };

    // 4. Overall percentage of completed tasks
    const totalTasks = await prisma.task.count({});
    const completedTasks = await prisma.task.count({
      where: { completed: true }
    });
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // 5. Action Required: Count of partners with overdue tasks OR overdue recall reminders
    const actionRequiredCount = await prisma.healthmate.count({
      where: {
        OR: [
          {
            tasks: {
              some: {
                completed: false,
                dueDate: { lt: new Date() }
              }
            }
          },
          {
            recallReminder: { lt: new Date() }
          }
        ]
      }
    });

    // 6. Recent Activity Log: 5 most recently updated healthmates
    const recentActivity = await prisma.healthmate.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: {
        tasks: {
          orderBy: { createdAt: 'asc' }
        },
        opsUser: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return res.status(200).json({
      metrics: {
        totalHealthmates,
        phaseBreakdown,
        bottleneck,
        taskCompletionRate,
        actionRequiredCount
      },
      recentActivity
    });
  } catch (error) {
    console.error('[getDashboardSummary]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = { getDashboardSummary };
