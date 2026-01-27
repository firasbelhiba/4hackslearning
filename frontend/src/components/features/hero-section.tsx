'use client';

import Image from 'next/image';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const tags = ['Defi', 'Blockchain', 'Wallets', 'DeFi'];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-brand py-12 sm:py-16 md:py-20 lg:py-24 pb-28 sm:pb-32 md:pb-36 lg:pb-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-black mb-4 sm:mb-6 leading-tight">
            Learn, Build, and Compete
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            in One Platform
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-black/80 mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto px-2">
            Your complete learning ecosystem for mastering skills, earning
            certifications, and applying them in real hackathons.
          </p>

          {/* Search Bar */}
          <div className="max-w-md sm:max-w-lg md:max-w-xl mx-auto mb-6 sm:mb-8 px-2">
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search courses"
                className="pl-10 sm:pl-12 h-12 sm:h-14 text-base sm:text-lg bg-white/90 backdrop-blur border-2 border-black shadow-brutal focus:outline-none focus:ring-2 focus:ring-black/20"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 px-2">
            {tags.map((tag) => (
              <button
                key={tag}
                className="px-3 sm:px-5 py-1.5 sm:py-2 bg-white border-2 border-black rounded-full text-xs sm:text-sm font-medium shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
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
      <div className="absolute -bottom-1 right-0 w-[180px] sm:w-[280px] md:w-[400px] lg:w-[550px] xl:w-[650px] pointer-events-none select-none origin-bottom-right animate-wobble-slow-reverse">
        <Image
          src="/images/Vector 70.png"
          alt=""
          width={700}
          height={500}
          className="w-full h-auto -scale-x-100"
          priority
        />
      </div>
    </section>
  );
}
