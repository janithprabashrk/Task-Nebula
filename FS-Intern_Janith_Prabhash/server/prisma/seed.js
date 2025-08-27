/* eslint-env node */
import { PrismaClient, Role, TaskStatus } from '@prisma/client';
import argon2 from 'argon2';
const prisma = new PrismaClient();
async function main() {
    // Users
    const adminPass = await argon2.hash('Passw0rd!');
    const memberPass = await argon2.hash('Passw0rd!');
    const [admin, alice, bob] = await Promise.all([
        prisma.user.upsert({
            where: { email: 'admin@demo.test' },
            update: { passwordHash: adminPass },
            create: {
                name: 'Admin',
                email: 'admin@demo.test',
                passwordHash: adminPass,
                role: Role.admin,
            },
        }),
        prisma.user.upsert({
            where: { email: 'alice@demo.test' },
            update: { passwordHash: memberPass },
            create: {
                name: 'Alice',
                email: 'alice@demo.test',
                passwordHash: memberPass,
                role: Role.member,
            },
        }),
        prisma.user.upsert({
            where: { email: 'bob@demo.test' },
            update: { passwordHash: memberPass },
            create: {
                name: 'Bob',
                email: 'bob@demo.test',
                passwordHash: memberPass,
                role: Role.member,
            },
        }),
    ]);
    // Project
    const project = await prisma.project.create({
        data: {
            name: 'Sample Project',
            description: 'A sample project for the take-home.',
        },
    });
    // Tasks
    await prisma.task.createMany({
        data: [
            {
                projectId: project.id,
                title: 'Set up repo',
                status: TaskStatus.todo,
                assigneeUserId: alice.id,
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
            {
                projectId: project.id,
                title: 'Design DB schema',
                status: TaskStatus.in_progress,
                assigneeUserId: bob.id,
            },
            {
                projectId: project.id,
                title: 'Implement auth',
                status: TaskStatus.todo,
                assigneeUserId: alice.id,
            },
        ],
    });
    console.log('Seed complete');
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
