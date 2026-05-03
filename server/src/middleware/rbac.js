const prisma = require('../lib/prisma');

const requireRole = (roles) => {
  return async (req, res, next) => {
    const projectId = req.params.id || req.params.projectId;

    if (!projectId) {
      // For routes without projectId, skip role check
      return next();
    }

    try {
      // Check if user is owner
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { ownerId: true }
      });

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      if (project.ownerId === req.user.id) {
        // Owner has all permissions
        return next();
      }

      // Check membership
      const membership = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId: req.user.id
          }
        }
      });

      if (!membership || !roles.includes(membership.role)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };
};

module.exports = { requireRole };