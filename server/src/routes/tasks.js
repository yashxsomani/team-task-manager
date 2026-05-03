const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

const router = express.Router();

// Apply authMiddleware to all routes
router.use(authMiddleware);

// GET /api/projects/:id/tasks - List tasks for project
router.get('/projects/:projectId/tasks', requireRole(['ADMIN', 'MEMBER']), async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { projectId: req.params.projectId },
      include: {
        assignee: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/projects/:id/tasks - Create task
router.post('/projects/:projectId/tasks', requireRole(['ADMIN']), [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').optional(),
  body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'DONE']).withMessage('Invalid status'),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
  body('assigneeId').optional()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }

  const { title, description, status = 'TODO', dueDate, assigneeId } = req.body;

  try {
    // If assigneeId provided, check if user is member
    if (assigneeId) {
      const isMember = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: req.params.projectId,
            userId: assigneeId
          }
        }
      });

      if (!isMember) {
        return res.status(400).json({ message: 'Assignee must be a project member' });
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId: req.params.projectId,
        assigneeId
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/projects/:id/tasks/:tid - Update task
router.put('/projects/:projectId/tasks/:taskId', requireRole(['ADMIN', 'MEMBER']), [
  body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'DONE']).withMessage('Invalid status'),
  body('assigneeId').optional()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }

  const { status, assigneeId } = req.body;

  try {
    // If assigneeId provided, check if user is member
    if (assigneeId) {
      const isMember = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: req.params.projectId,
            userId: assigneeId
          }
        }
      });

      if (!isMember) {
        return res.status(400).json({ message: 'Assignee must be a project member' });
      }
    }

    const task = await prisma.task.update({
      where: { id: req.params.taskId },
      data: {
        status,
        assigneeId
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/projects/:id/tasks/:tid - Delete task
router.delete('/projects/:projectId/tasks/:taskId', requireRole(['ADMIN']), async (req, res) => {
  try {
    await prisma.task.delete({
      where: { id: req.params.taskId }
    });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;