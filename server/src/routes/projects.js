const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const router = express.Router();

// Apply authMiddleware to all routes
router.use(authMiddleware);

// GET /api/projects - List projects where user is member or owner
router.get('/', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: req.user.id },
          {
            members: {
              some: {
                userId: req.user.id
              }
            }
          }
        ]
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        _count: {
          select: { tasks: true }
        }
      }
    });

    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/projects - Create project
router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').optional()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }

  const { name, description } = req.body;

  try {
    const project = await prisma.project.create({
      data: {
        name,
        description,
        ownerId: req.user.id,
        members: {
          create: {
            userId: req.user.id,
            role: 'ADMIN'
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        _count: {
          select: { tasks: true }
        }
      }
    });

    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/projects/:id - Get project details
router.get('/:id', requireRole(['ADMIN', 'MEMBER']), async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        _count: {
          select: { tasks: true }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/projects/:id - Update project
router.put('/:id', requireRole(['ADMIN']), [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('description').optional()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }

  const { name, description } = req.body;

  try {
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: { name, description },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        _count: {
          select: { tasks: true }
        }
      }
    });

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/projects/:id - Delete project
router.delete('/:id', requireRole(['ADMIN']), async (req, res) => {
  try {
    await prisma.project.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/projects/:id/members - Add member
router.post('/:id/members', requireRole(['ADMIN']), [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('role').isIn(['ADMIN', 'MEMBER']).withMessage('Role must be ADMIN or MEMBER')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }

  const { userId, role } = req.body;

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already member
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: req.params.id,
          userId
        }
      }
    });

    if (existingMember) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId: req.params.id,
        userId,
        role
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json(member);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/projects/:id/members/:userId - Remove member
router.delete('/:id/members/:userId', requireRole(['ADMIN']), async (req, res) => {
  try {
    // Cannot remove owner
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      select: { ownerId: true }
    });

    if (project.ownerId === req.params.userId) {
      return res.status(400).json({ message: 'Cannot remove project owner' });
    }

    await prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId: req.params.id,
          userId: req.params.userId
        }
      }
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;