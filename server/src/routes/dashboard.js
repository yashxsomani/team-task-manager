const express = require('express')
const router = express.Router()
const prisma = require('../lib/prisma')
const authMiddleware = require('../middleware/auth')

router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id

    const memberships = await prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true }
    })
    const projectIds = memberships.map(m => m.projectId)

    const totalTasks = await prisma.task.count({
      where: { projectId: { in: projectIds } }
    })

    const completedTasks = await prisma.task.count({
      where: { projectId: { in: projectIds }, status: 'DONE' }
    })

    const now = new Date()
    const overdueTasks = await prisma.task.findMany({
      where: {
        projectId: { in: projectIds },
        status: { not: 'DONE' },
        dueDate: { lt: now }
      },
      include: {
        project: { select: { name: true } },
        assignee: { select: { name: true } }
      }
    })

    const todoCount = await prisma.task.count({
      where: { projectId: { in: projectIds }, status: 'TODO' }
    })
    const inProgressCount = await prisma.task.count({
      where: { projectId: { in: projectIds }, status: 'IN_PROGRESS' }
    })

    const recentProjects = await prisma.project.findMany({
      where: { id: { in: projectIds } },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, createdAt: true }
    })

    res.json({
      totalTasks,
      completedTasks,
      overdueTasks,
      tasksByStatus: {
        TODO: todoCount,
        IN_PROGRESS: inProgressCount,
        DONE: completedTasks
      },
      recentProjects
    })

  } catch (err) {
    console.error('Dashboard error:', err)
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
