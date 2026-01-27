import { PrismaClient, UserRole, CourseLevel, QuestionType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@4hacks.com' },
    update: {},
    create: {
      email: 'admin@4hacks.com',
      password: adminPassword,
      name: '4hacks Admin',
      role: UserRole.ADMIN,
      bio: 'Platform administrator',
    },
  });
  console.log('✅ Admin user created');

  // Create instructor
  const instructorPassword = await bcrypt.hash('Instructor123!', 10);
  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@4hacks.com' },
    update: {},
    create: {
      email: 'instructor@4hacks.com',
      password: instructorPassword,
      name: 'Dhaker',
      role: UserRole.INSTRUCTOR,
      bio: 'Web3 educator and hackathon mentor',
      avatar: '/avatars/dhaker.jpg',
    },
  });
  console.log('✅ Instructor user created');

  // Create student users
  const studentPassword = await bcrypt.hash('Student123!', 10);
  const students = await Promise.all([
    prisma.user.upsert({
      where: { email: 'student1@example.com' },
      update: {},
      create: {
        email: 'student1@example.com',
        password: studentPassword,
        name: 'Alice Johnson',
        role: UserRole.STUDENT,
        bio: 'Aspiring Web3 developer',
      },
    }),
    prisma.user.upsert({
      where: { email: 'student2@example.com' },
      update: {},
      create: {
        email: 'student2@example.com',
        password: studentPassword,
        name: 'Bob Smith',
        role: UserRole.STUDENT,
        bio: 'Learning blockchain development',
      },
    }),
  ]);
  console.log('✅ Student users created');

  // Create courses
  const hederaCourseIntermediate = await prisma.course.upsert({
    where: { slug: 'hedera-certification-intermediate' },
    update: {},
    create: {
      title: 'Hedera Certification',
      slug: 'hedera-certification-intermediate',
      description: `Validate your blockchain expertise with our comprehensive certification program. Stand out to employers and the community with verified skills.

This intermediate-level course covers:
- Hedera Hashgraph fundamentals
- Smart contract development on Hedera
- Token services and HCS
- Building dApps with Hedera SDKs
- Security best practices`,
      shortDescription: 'Validate your blockchain expertise with our comprehensive certification program.',
      thumbnail: '/courses/hedera-intermediate.jpg',
      level: CourseLevel.INTERMEDIATE,
      category: 'Blockchain',
      tags: ['Hedera', 'Blockchain', 'Smart Contracts', 'Certification'],
      price: 0,
      isFree: true,
      isPublished: true,
      instructorId: instructor.id,
    },
  });

  const hederaCourseBeginner = await prisma.course.upsert({
    where: { slug: 'hedera-certification-beginner' },
    update: {},
    create: {
      title: 'Hedera Certification',
      slug: 'hedera-certification-beginner',
      description: `Start your blockchain journey with Hedera. This beginner-friendly course covers all the basics you need to get started.

Learn:
- What is Hedera Hashgraph
- Differences from traditional blockchains
- Setting up your development environment
- Your first Hedera transactions`,
      shortDescription: 'Validate your blockchain expertise with our comprehensive certification program.',
      thumbnail: '/courses/hedera-beginner.jpg',
      level: CourseLevel.BEGINNER,
      category: 'Blockchain',
      tags: ['Hedera', 'Blockchain', 'Beginner'],
      price: 0,
      isFree: true,
      isPublished: true,
      instructorId: instructor.id,
    },
  });

  const hederaCourseAdvanced = await prisma.course.upsert({
    where: { slug: 'hedera-certification-advanced' },
    update: {},
    create: {
      title: 'Hedera Certification',
      slug: 'hedera-certification-advanced',
      description: `Advanced Hedera development for experienced blockchain developers. Master complex patterns and enterprise-grade solutions.

Topics include:
- Advanced smart contract patterns
- Cross-chain interoperability
- Enterprise integrations
- Performance optimization
- Security auditing`,
      shortDescription: 'Validate your blockchain expertise with our comprehensive certification program.',
      thumbnail: '/courses/hedera-advanced.jpg',
      level: CourseLevel.ADVANCED,
      category: 'Blockchain',
      tags: ['Hedera', 'Blockchain', 'Advanced', 'Enterprise'],
      price: 0,
      isFree: true,
      isPublished: true,
      instructorId: instructor.id,
    },
  });
  console.log('✅ Courses created');

  // Create modules for intermediate course
  const module1 = await prisma.module.create({
    data: {
      title: 'Introduction to Hedera',
      description: 'Get started with Hedera Hashgraph fundamentals',
      order: 1,
      courseId: hederaCourseIntermediate.id,
    },
  });

  const module2 = await prisma.module.create({
    data: {
      title: 'Smart Contracts on Hedera',
      description: 'Learn to build and deploy smart contracts',
      order: 2,
      courseId: hederaCourseIntermediate.id,
    },
  });

  const module3 = await prisma.module.create({
    data: {
      title: 'Token Services',
      description: 'Create and manage tokens on Hedera',
      order: 3,
      courseId: hederaCourseIntermediate.id,
    },
  });
  console.log('✅ Modules created');

  // Create lessons
  const lessons = await Promise.all([
    prisma.lesson.create({
      data: {
        title: 'What is Hedera Hashgraph?',
        description: 'Understanding the fundamentals of Hedera',
        content: `# What is Hedera Hashgraph?

Hedera Hashgraph is a decentralized public network that utilizes the hashgraph consensus algorithm...

## Key Features

- **Speed**: 10,000+ transactions per second
- **Security**: Asynchronous Byzantine Fault Tolerant
- **Fairness**: Fair ordering of transactions
- **Low Fees**: Predictable, low transaction costs`,
        videoUrl: 'https://example.com/videos/hedera-intro.mp4',
        videoDuration: 600,
        order: 1,
        moduleId: module1.id,
      },
    }),
    prisma.lesson.create({
      data: {
        title: 'Setting Up Your Development Environment',
        description: 'Configure your tools for Hedera development',
        content: `# Setting Up Your Development Environment

In this lesson, we'll set up everything you need to start building on Hedera.

## Prerequisites

- Node.js 18+
- npm or yarn
- A code editor (VS Code recommended)

## Installation

\`\`\`bash
npm install @hashgraph/sdk
\`\`\``,
        videoUrl: 'https://example.com/videos/hedera-setup.mp4',
        videoDuration: 480,
        order: 2,
        moduleId: module1.id,
      },
    }),
    prisma.lesson.create({
      data: {
        title: 'Your First Smart Contract',
        description: 'Deploy your first smart contract on Hedera',
        content: `# Your First Smart Contract

Let's deploy a simple smart contract on Hedera testnet.

## Solidity Contract

\`\`\`solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HelloHedera {
    string public message;

    constructor(string memory _message) {
        message = _message;
    }

    function setMessage(string memory _message) public {
        message = _message;
    }
}
\`\`\``,
        videoUrl: 'https://example.com/videos/hedera-smart-contract.mp4',
        videoDuration: 900,
        order: 1,
        moduleId: module2.id,
      },
    }),
  ]);
  console.log('✅ Lessons created');

  // Create quiz for module 1
  const quiz1 = await prisma.quiz.create({
    data: {
      title: 'Hedera Fundamentals Quiz',
      description: 'Test your understanding of Hedera basics',
      passingScore: 70,
      timeLimit: 15,
      moduleId: module1.id,
    },
  });

  // Create questions
  await Promise.all([
    prisma.question.create({
      data: {
        text: 'What consensus algorithm does Hedera use?',
        type: QuestionType.SINGLE_CHOICE,
        options: [
          { id: 'opt1', text: 'Proof of Work', isCorrect: false },
          { id: 'opt2', text: 'Proof of Stake', isCorrect: false },
          { id: 'opt3', text: 'Hashgraph', isCorrect: true },
          { id: 'opt4', text: 'Proof of Authority', isCorrect: false },
        ],
        explanation: 'Hedera uses the hashgraph consensus algorithm, which is aBFT.',
        points: 1,
        order: 1,
        quizId: quiz1.id,
      },
    }),
    prisma.question.create({
      data: {
        text: 'Hedera can process over 10,000 transactions per second.',
        type: QuestionType.TRUE_FALSE,
        options: [
          { id: 'opt1', text: 'True', isCorrect: true },
          { id: 'opt2', text: 'False', isCorrect: false },
        ],
        explanation: 'Hedera is capable of processing 10,000+ TPS with finality in seconds.',
        points: 1,
        order: 2,
        quizId: quiz1.id,
      },
    }),
    prisma.question.create({
      data: {
        text: 'Which of the following are features of Hedera? (Select all that apply)',
        type: QuestionType.MULTIPLE_CHOICE,
        options: [
          { id: 'opt1', text: 'High throughput', isCorrect: true },
          { id: 'opt2', text: 'Low fees', isCorrect: true },
          { id: 'opt3', text: 'Energy intensive mining', isCorrect: false },
          { id: 'opt4', text: 'Fair ordering', isCorrect: true },
        ],
        explanation: 'Hedera offers high throughput, low fees, and fair ordering without mining.',
        points: 2,
        order: 3,
        quizId: quiz1.id,
      },
    }),
  ]);
  console.log('✅ Quiz and questions created');

  // Create enrollments for students
  const enrollment1 = await prisma.enrollment.create({
    data: {
      userId: students[0].id,
      courseId: hederaCourseIntermediate.id,
      progress: 33.33,
      status: 'ACTIVE',
    },
  });

  // Create lesson progress
  await prisma.lessonProgress.create({
    data: {
      enrollmentId: enrollment1.id,
      lessonId: lessons[0].id,
      watchedSeconds: 600,
      completed: true,
      completedAt: new Date(),
    },
  });
  console.log('✅ Enrollments and progress created');

  console.log('🎉 Seed completed successfully!');
  console.log('\n📋 Test accounts:');
  console.log('  Admin: admin@4hacks.com / Admin123!');
  console.log('  Instructor: instructor@4hacks.com / Instructor123!');
  console.log('  Student: student1@example.com / Student123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
