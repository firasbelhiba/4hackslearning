'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, X } from 'lucide-react';
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
  const [showFilters, setShowFilters] = useState(false);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All Levels' ||
      getLevelLabel(course.level) === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const hasActiveFilters = selectedCategory !== 'All' || selectedLevel !== 'All Levels';

  const clearFilters = () => {
    setSelectedCategory('All');
    setSelectedLevel('All Levels');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-white">
        {/* Hero Section */}
        <section className="bg-brand py-8 sm:py-10 md:py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-3 sm:mb-4">
              Explore Courses
            </h1>
            <p className="text-center text-base sm:text-lg text-black/80 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
              Master Web3 skills with hands-on courses designed for hackathon success
            </p>

            {/* Search Bar */}
            <div className="max-w-md sm:max-w-lg md:max-w-xl mx-auto px-2">
              <div className="relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 sm:pl-12 h-11 sm:h-12 text-base bg-white border-2 border-black shadow-brutal"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Filters & Courses */}
        <section className="py-8 sm:py-10 md:py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Mobile Filter Toggle */}
            <div className="flex items-center justify-between mb-4 md:hidden">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border-2 border-black bg-white"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-brand rounded-full">
                    {(selectedCategory !== 'All' ? 1 : 0) + (selectedLevel !== 'All Levels' ? 1 : 0)}
                  </span>
                )}
              </button>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-black"
                >
                  <X className="h-4 w-4" />
                  Clear
                </button>
              )}
            </div>

            {/* Filters - Collapsible on mobile */}
            <div className={`${showFilters ? 'block' : 'hidden'} md:block mb-6 sm:mb-8`}>
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                {/* Category Filter */}
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 mb-2 md:hidden">Category</p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg border-2 border-black transition-all active:translate-x-[1px] active:translate-y-[1px] ${
                          selectedCategory === category
                            ? 'bg-black text-white'
                            : 'bg-white hover:bg-gray-100'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Level Filter */}
                <div className="md:ml-auto">
                  <p className="text-xs font-medium text-gray-500 mb-2 md:hidden">Level</p>
                  <div className="flex flex-wrap gap-2">
                    {levels.map((level) => (
                      <button
                        key={level}
                        onClick={() => setSelectedLevel(level)}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg border-2 border-black transition-all active:translate-x-[1px] active:translate-y-[1px] ${
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
              </div>
            </div>

            {/* Results count */}
            <p className="text-sm text-gray-600 mb-4 sm:mb-6">
              {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} found
            </p>

            {/* Course Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredCourses.map((course) => (
                <Card
                  key={course.id}
                  className="hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-brutal-sm transition-all h-full flex flex-col"
                >
                  <CardHeader className="pb-3">
                    <Badge variant={getLevelVariant(course.level)} className="w-fit mb-3">
                      {getLevelLabel(course.level)}
                    </Badge>
                    <h3 className="text-lg sm:text-xl font-bold">{course.title}</h3>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                      {course.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4">
                      {course.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 sm:py-1 text-xs bg-gray-100 rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Link href={`/courses/${course.slug}`} className="mt-auto">
                      <Button variant="outline" size="sm" className="w-full">
                        Start Learning
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredCourses.length === 0 && (
              <div className="text-center py-12 sm:py-16">
                <p className="text-gray-500 text-base sm:text-lg mb-4">
                  No courses found matching your criteria.
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
