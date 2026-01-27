'use client';

import Image from 'next/image';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const tags = ['Defi', 'Blockchain', 'Wallets', 'DeFi'];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-brand py-16 sm:py-20 md:py-28 lg:py-32 pb-32 sm:pb-40 md:pb-48 lg:pb-56">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-black mb-5 sm:mb-7 leading-tight">
            Learn, Build, and Compete
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            in One Platform
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl md:text-2xl text-black/80 mb-8 sm:mb-10 md:mb-12 max-w-2xl mx-auto px-2">
            Your complete learning ecosystem for mastering skills, earning
            certifications, and applying them in real hackathons.
          </p>

          {/* Search Bar */}
          <div className="max-w-md sm:max-w-lg md:max-w-2xl mx-auto mb-8 sm:mb-10 px-2">
            <div className="relative">
              <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
              <Input
                type="text"
                placeholder="Search courses"
                className="pl-12 sm:pl-14 h-14 sm:h-16 text-lg sm:text-xl bg-white/90 backdrop-blur border-2 border-black shadow-brutal focus:outline-none focus:ring-2 focus:ring-black/20"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 px-2">
            {tags.map((tag) => (
              <button
                key={tag}
                className="px-4 sm:px-6 py-2 sm:py-2.5 bg-white border-2 border-black rounded-full text-sm sm:text-base font-medium shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative Shape - Left */}
      <div className="absolute -bottom-1 left-0 w-[180px] sm:w-[280px] md:w-[400px] lg:w-[550px] xl:w-[650px] pointer-events-none select-none origin-bottom-left animate-wobble-slow">
        <Image
          src="/images/Vector 70.png"
          alt=""
          width={700}
          height={500}
          className="w-full h-auto"
          priority
        />
      </div>

      {/* Decorative Shape - Right */}
      <div className="absolute -bottom-1 right-0 w-[180px] sm:w-[280px] md:w-[400px] lg:w-[550px] xl:w-[650px] pointer-events-none select-none origin-bottom-right animate-wobble-slow-alt">
        <Image
          src="/images/Vector 71.png"
          alt=""
          width={700}
          height={500}
          className="w-full h-auto"
          priority
        />
      </div>
    </section>
  );
}
