'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Filter } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const categories = ['All', 'DeFi', 'Blockchain', 'Smart Contracts', 'Web3', 'NFTs'];
const levels = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];

const courses = [
  {
    id: '1',
    title: 'Hedera Certification',
    slug: 'hedera-certification-intermediate',
    description: 'Validate your blockchain expertise with our comprehensive certification program.',
    level: 'INTERMEDIATE',
    category: 'Blockchain',
    tags: ['Hedera', 'Blockchain'],
  },
  {
    id: '2',
    title: 'Hedera Certification',
    slug: 'hedera-certification-beginner',
    description: 'Start your blockchain journey with Hedera fundamentals.',
    level: 'BEGINNER',
    category: 'Blockchain',
    tags: ['Hedera', 'Beginner'],
  },
  {
    id: '3',
    title: 'Hedera Certification',
    slug: 'hedera-certification-advanced',
    description: 'Advanced Hedera development for experienced blockchain developers.',
    level: 'ADVANCED',
    category: 'Blockchain',
    tags: ['Hedera', 'Advanced'],
  },
  {
    id: '4',
    title: 'DeFi Fundamentals',
    slug: 'defi-fundamentals',
    description: 'Learn the core concepts of decentralized finance.',
    level: 'BEGINNER',
    category: 'DeFi',
    tags: ['DeFi', 'Finance'],
  },
  {
    id: '5',
    title: 'Smart Contract Security',
    slug: 'smart-contract-security',
    description: 'Master security patterns and auditing for smart contracts.',
    level: 'ADVANCED',
    category: 'Smart Contracts',
    tags: ['Security', 'Solidity'],
  },
  {
    id: '6',
    title: 'NFT Development',
    slug: 'nft-development',
    description: 'Build and deploy NFT marketplaces and collections.',
    level: 'INTERMEDIATE',
    category: 'NFTs',
    tags: ['NFT', 'ERC-721'],
  },
];

function getLevelVariant(level: string): 'beginner' | 'intermediate' | 'advanced' {
  switch (level) {
    case 'BEGINNER': return 'beginner';
    case 'INTERMEDIATE': return 'intermediate';
    case 'ADVANCED': return 'advanced';
    default: return 'beginner';
  }
}

function getLevelLabel(level: string): string {
  return level.charAt(0) + level.slice(1).toLowerCase();
}

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All Levels');

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All Levels' ||
      getLevelLabel(course.level) === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-white">
        {/* Hero Section */}
        <section className="bg-brand py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 font-display">
              Explore Courses
            </h1>
            <p className="text-center text-lg text-black/80 mb-8 max-w-2xl mx-auto">
              Master Web3 skills with hands-on courses designed for hackathon success
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-white border-2 border-black shadow-brutal"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Filters & Courses */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-8">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border-2 border-black transition-all ${
                      selectedCategory === category
                        ? 'bg-black text-white'
                        : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Level Filter */}
              <div className="flex flex-wrap gap-2 ml-auto">
                {levels.map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedLevel(level)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border-2 border-black transition-all ${
                      selectedLevel === level
                        ? 'bg-black text-white'
                        : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-sm transition-all">
                  <CardHeader className="pb-3">
                    <Badge variant={getLevelVariant(course.level)} className="w-fit mb-3">
                      {getLevelLabel(course.level)}
                    </Badge>
                    <h3 className="text-xl font-bold">{course.title}</h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {course.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-gray-100 rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Link href={`/courses/${course.slug}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        Start Learning
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredCourses.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No courses found matching your criteria.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
