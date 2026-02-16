import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sample videos from Google's public sample videos
const sampleVideos = [
  {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: 596,
  },
  {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration: 653,
  },
  {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    duration: 888,
  },
  {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    duration: 734,
  },
  {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration: 15,
  },
];

async function main() {
  console.log('🎬 Updating lessons with sample videos...');

  // Get all lessons
  const lessons = await prisma.lesson.findMany({
    orderBy: { order: 'asc' },
  });

  console.log(`Found ${lessons.length} lessons to update`);

  // Update each lesson with a sample video
  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];
    const video = sampleVideos[i % sampleVideos.length];

    await prisma.lesson.update({
      where: { id: lesson.id },
      data: {
        videoUrl: video.url,
        videoDuration: video.duration,
        status: 'PUBLISHED',
        isFreePreview: i === 0, // First lesson is free preview
      },
    });

    console.log(`✅ Updated lesson: ${lesson.title}`);
  }

  console.log('\n🎉 All lessons updated with sample videos!');
}

main()
  .catch((e) => {
    console.error('❌ Update failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
