'use client';

import Image from 'next/image';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const tags = ['Defi', 'Blockchain', 'Wallets', 'DeFi'];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-brand pt-16 pb-32 lg:pt-24 lg:pb-40">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-black mb-6">
            Learn, Build, and Compete
            <br />
            in One Platform
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-black/80 mb-10 max-w-2xl mx-auto">
            Your complete learning ecosystem for mastering skills, earning
            certifications, and applying them in real hackathons.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search courses"
                className="pl-12 h-14 text-lg bg-white/90 backdrop-blur border-2 border-black shadow-brutal"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap justify-center gap-3">
            {tags.map((tag) => (
              <button
                key={tag}
                className="px-5 py-2 bg-white border-2 border-black rounded-full text-sm font-medium shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative Shape - Left */}
      <div className="absolute -bottom-2 left-0 w-[320px] md:w-[450px] lg:w-[600px] xl:w-[700px] pointer-events-none">
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
      <div className="absolute -bottom-2 right-0 w-[320px] md:w-[450px] lg:w-[600px] xl:w-[700px] pointer-events-none">
        <Image
          src="/images/Vector 70.png"
          alt=""
          width={700}
          height={500}
          className="w-full h-auto transform scale-x-[-1]"
          priority
        />
      </div>
    </section>
  );
}
