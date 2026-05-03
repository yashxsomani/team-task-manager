const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = bcrypt.hashSync('password123', 10);
  const user = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
    },
  });

  // Create project
  const project = await prisma.project.create({
    data: {
      name: 'Sample Project',
      description: 'A sample project for team task management',
      ownerId: user.id,
    },
  });

  // Create tasks
  await prisma.task.create({
    data: {
      title: 'Set up project structure',
      description: 'Initialize the project with necessary folders and files',
      status: 'DONE',
      projectId: project.id,
      assigneeId: user.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Implement user authentication',
      description: 'Add login and registration functionality',
      status: 'IN_PROGRESS',
      dueDate: new Date('2026-05-10'),
      projectId: project.id,
      assigneeId: user.id,
    },
  });

  console.log('Seeding completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });