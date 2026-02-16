import { PrismaClient, CourseLevel, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Free sample videos that actually work
const sampleVideos = [
  {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: 596,
    title: 'Big Buck Bunny',
  },
  {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration: 653,
    title: 'Elephants Dream',
  },
  {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    duration: 888,
    title: 'Sintel',
  },
  {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    duration: 734,
    title: 'Tears of Steel',
  },
];

async function main() {
  console.log('🌱 Seeding demo course with real videos...');

  // Get or create instructor
  let instructor = await prisma.user.findUnique({
    where: { email: 'instructor@4hacks.com' },
  });

  if (!instructor) {
    const password = await bcrypt.hash('Instructor123!', 10);
    instructor = await prisma.user.create({
      data: {
        email: 'instructor@4hacks.com',
        password,
        name: 'Dhaker',
        role: UserRole.INSTRUCTOR,
        bio: 'Web3 educator and hackathon mentor',
      },
    });
  }

  // Get or create organization
  let org = await prisma.organization.findUnique({
    where: { slug: 'dar-blockchain' },
  });

  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: 'Dar Blockchain',
        slug: 'dar-blockchain',
        description: 'Leading blockchain education platform',
        status: 'ACTIVE',
      },
    });
  }

  // Delete existing demo course if exists
  const existingCourse = await prisma.course.findUnique({
    where: { slug: 'web3-fundamentals-demo' },
  });
  if (existingCourse) {
    await prisma.course.delete({ where: { id: existingCourse.id } });
    console.log('🗑️ Deleted existing demo course');
  }

  // Create the demo course
  const course = await prisma.course.create({
    data: {
      title: 'Web3 Fundamentals - Demo Course',
      slug: 'web3-fundamentals-demo',
      description: `This is a demo course to showcase the video learning platform.

Learn the fundamentals of Web3 development including:
- Blockchain basics
- Smart contracts
- Decentralized applications
- Token standards

This course includes working video lessons that you can watch and track your progress.`,
      shortDescription: 'A demo course with working video lessons to showcase the learning platform.',
      thumbnail: '/courses/web3-demo.jpg',
      level: CourseLevel.BEGINNER,
      category: 'Web3',
      tags: ['Web3', 'Blockchain', 'Demo', 'Beginner'],
      price: 0,
      isFree: true,
      isPublished: true,
      instructorId: instructor.id,
      organizationId: org.id,
    },
  });
  console.log('✅ Created course:', course.title);
  console.log('   Course ID:', course.id);

  // Create Module 1 with lessons
  const module1 = await prisma.module.create({
    data: {
      title: 'Getting Started with Web3',
      description: 'Introduction to blockchain and Web3 concepts',
      order: 1,
      courseId: course.id,
    },
  });

  // Create lessons for module 1
  await prisma.lesson.create({
    data: {
      title: 'Introduction to Blockchain',
      description: 'Learn what blockchain is and why it matters for the future of the internet.',
      content: `# Introduction to Blockchain

Blockchain is a revolutionary technology that enables secure, transparent, and decentralized record-keeping.

## What is Blockchain?

A blockchain is a distributed database that maintains a continuously growing list of ordered records called blocks. Each block contains a timestamp and a link to the previous block.

## Key Features

- **Decentralization**: No single point of control
- **Transparency**: All transactions are visible
- **Immutability**: Records cannot be altered
- **Security**: Cryptographic protection

## Why Web3?

Web3 represents the next evolution of the internet, built on blockchain technology. It promises:

1. User ownership of data
2. Decentralized applications
3. Token-based economics
4. Trustless interactions`,
      videoUrl: sampleVideos[0].url,
      videoDuration: sampleVideos[0].duration,
      order: 1,
      type: 'VIDEO',
      status: 'PUBLISHED',
      isFreePreview: true,
      moduleId: module1.id,
    },
  });

  await prisma.lesson.create({
    data: {
      title: 'Understanding Smart Contracts',
      description: 'Discover how smart contracts automate agreements on the blockchain.',
      content: `# Understanding Smart Contracts

Smart contracts are self-executing contracts with the terms directly written into code.

## How They Work

1. Code is deployed to blockchain
2. Conditions are defined
3. Automatic execution when conditions are met
4. Results are immutable

## Use Cases

- **DeFi**: Automated lending and trading
- **NFTs**: Digital ownership verification
- **DAOs**: Decentralized governance
- **Supply Chain**: Tracking and verification`,
      videoUrl: sampleVideos[1].url,
      videoDuration: sampleVideos[1].duration,
      order: 2,
      type: 'VIDEO',
      status: 'PUBLISHED',
      isFreePreview: false,
      moduleId: module1.id,
    },
  });

  console.log('✅ Created Module 1 with 2 lessons');

  // Create Module 2 with lessons
  const module2 = await prisma.module.create({
    data: {
      title: 'Building Your First DApp',
      description: 'Hands-on development of decentralized applications',
      order: 2,
      courseId: course.id,
    },
  });

  await prisma.lesson.create({
    data: {
      title: 'Setting Up Your Development Environment',
      description: 'Configure the tools needed to build Web3 applications.',
      content: `# Setting Up Your Development Environment

Let's set up everything you need to start building decentralized applications.

## Required Tools

- **Node.js**: Runtime environment
- **MetaMask**: Browser wallet
- **Hardhat**: Development framework
- **VS Code**: Code editor

## Installation Steps

\`\`\`bash
# Install Hardhat
npm install --save-dev hardhat

# Create a new project
npx hardhat init
\`\`\`

## Testing Your Setup

After installation, verify everything works by running:

\`\`\`bash
npx hardhat compile
npx hardhat test
\`\`\``,
      videoUrl: sampleVideos[2].url,
      videoDuration: sampleVideos[2].duration,
      order: 1,
      type: 'VIDEO',
      status: 'PUBLISHED',
      isFreePreview: false,
      moduleId: module2.id,
    },
  });

  await prisma.lesson.create({
    data: {
      title: 'Deploying Your First Contract',
      description: 'Deploy a smart contract to a test network.',
      content: `# Deploying Your First Contract

Now let's deploy our first smart contract to a test network.

## The Contract

\`\`\`solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HelloWeb3 {
    string public message;

    constructor(string memory _message) {
        message = _message;
    }

    function setMessage(string memory _message) public {
        message = _message;
    }
}
\`\`\`

## Deployment Script

\`\`\`javascript
async function main() {
  const HelloWeb3 = await ethers.getContractFactory("HelloWeb3");
  const hello = await HelloWeb3.deploy("Hello, Web3!");
  console.log("Deployed to:", hello.address);
}
\`\`\`

Congratulations! You've deployed your first smart contract!`,
      videoUrl: sampleVideos[3].url,
      videoDuration: sampleVideos[3].duration,
      order: 2,
      type: 'VIDEO',
      status: 'PUBLISHED',
      isFreePreview: false,
      moduleId: module2.id,
    },
  });

  console.log('✅ Created Module 2 with 2 lessons');

  // Create a student user for testing
  let student = await prisma.user.findUnique({
    where: { email: 'demo@example.com' },
  });

  if (!student) {
    const studentPassword = await bcrypt.hash('Demo123!', 10);
    student = await prisma.user.create({
      data: {
        email: 'demo@example.com',
        password: studentPassword,
        name: 'Demo User',
        role: UserRole.STUDENT,
        bio: 'Testing the learning platform',
      },
    });
    console.log('✅ Created demo student user');
  }

  // Create enrollment for the student
  const existingEnrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: student.id,
        courseId: course.id,
      },
    },
  });

  if (!existingEnrollment) {
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: student.id,
        courseId: course.id,
        progress: 0,
        status: 'ACTIVE',
      },
    });

    // Get all lessons and create progress entries
    const lessons = await prisma.lesson.findMany({
      where: { module: { courseId: course.id } },
    });

    await prisma.lessonProgress.createMany({
      data: lessons.map((lesson) => ({
        enrollmentId: enrollment.id,
        lessonId: lesson.id,
        watchedSeconds: 0,
        completed: false,
      })),
    });

    console.log('✅ Created enrollment for demo user');
  }

  console.log('\n🎉 Demo course seeded successfully!');
  console.log('\n📋 Access details:');
  console.log('   Course URL: http://localhost:3000/courses/web3-fundamentals-demo');
  console.log('   Learning URL: http://localhost:3000/dashboard/courses/' + course.id);
  console.log('\n   Demo Login:');
  console.log('   Email: demo@example.com');
  console.log('   Password: Demo123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
