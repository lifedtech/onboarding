const prisma = require('../lib/prisma');

/**
 * PATCH /api/tasks/:taskId/toggle
 * Toggles a task's completed status.
 * Verifies the task belongs to a healthmate owned by the requesting user.
 */
const toggleTask = async (req, res) => {
  const { taskId } = req.params;
  const { completed } = req.body;

  if (typeof completed !== 'boolean') {
    return res.status(400).json({ message: '`completed` must be a boolean.' });
  }

  try {
    // Verify ownership via the healthmate relation
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { healthmate: true },
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const isAdmin = req.user.role?.toLowerCase() === 'admin';
    if (!isAdmin && task.healthmate.opsUserId !== req.user.id) {
      return res.status(403).json({
        message: 'Access Denied: Only the assigned Operations coordinator or an Administrator can modify tasks for this partner.'
      });
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { completed },
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error('[toggleTask]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * POST /api/healthmates/:id/tasks
 * Creates a new task for a healthmate.
 */
const createTask = async (req, res) => {
  const { id } = req.params;
  const { title, dueDate, phase } = req.body;

  if (!title || !phase) {
    return res.status(400).json({ message: 'title and phase are required.' });
  }

  try {
    const healthmate = await prisma.healthmate.findUnique({
      where: { id },
    });

    if (!healthmate) {
      return res.status(404).json({ message: 'Healthmate not found.' });
    }

    const isAdmin = req.user.role?.toLowerCase() === 'admin';
    if (!isAdmin && healthmate.opsUserId !== req.user.id) {
      return res.status(403).json({
        message: 'Access Denied: Only the assigned Operations coordinator or an Administrator can modify tasks for this partner.'
      });
    }

    const task = await prisma.task.create({
      data: {
        title,
        phase,
        dueDate: dueDate ? new Date(dueDate) : null,
        healthmateId: id,
      },
    });

    return res.status(201).json(task);
  } catch (error) {
    console.error('[createTask]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * GET /api/tasks/pending
 * Fetches all uncompleted tasks for healthmates belonging to the authenticated OpsUser.
 */
const getPendingTasks = async (req, res) => {
  try {
    const isAdmin = req.user.role?.toLowerCase() === 'admin';
    const tasks = await prisma.task.findMany({
      where: {
        completed: false,
        ...(isAdmin ? {} : { healthmate: { opsUserId: req.user.id } }),
      },
      include: {
        healthmate: {
          select: {
            name: true,
            type: true,
            phase: true,
            opsUser: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });
    return res.status(200).json(tasks);
  } catch (error) {
    console.error('[getPendingTasks]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * PATCH /api/tasks/:taskId
 * Updates details of a task (title, dueDate, completed, phase).
 */
const updateTask = async (req, res) => {
  const { taskId } = req.params;
  const { title, dueDate, completed, phase } = req.body;

  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { healthmate: true },
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const isAdmin = req.user.role?.toLowerCase() === 'admin';
    if (!isAdmin && task.healthmate.opsUserId !== req.user.id) {
      return res.status(403).json({
        message: 'Access Denied: Only the assigned Operations coordinator or an Administrator can modify tasks for this partner.'
      });
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(title !== undefined && { title }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(completed !== undefined && { completed }),
        ...(phase !== undefined && { phase }),
      },
      include: {
        healthmate: {
          select: {
            name: true,
            type: true,
            phase: true,
            opsUser: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error('[updateTask]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = { toggleTask, createTask, getPendingTasks, updateTask };

