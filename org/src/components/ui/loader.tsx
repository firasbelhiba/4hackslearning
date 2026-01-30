'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function Loader({ size = 'md', className, text }: LoaderProps) {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
  };

  const imageSizes = {
    sm: { width: 70, height: 24 },
    md: { width: 100, height: 34 },
    lg: { width: 130, height: 44 },
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div className={cn('relative overflow-hidden', sizeClasses[size])}>
        {/* Base logo (grayscale/dimmed) */}
        <Image
          src="/images/logo-lg.png"
          alt="Loading..."
          width={imageSizes[size].width}
          height={imageSizes[size].height}
          className="h-full w-auto opacity-30 grayscale"
          priority
        />
        {/* Filling overlay with animation */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            animation: 'fillUp 1.5s ease-in-out infinite',
          }}
        >
          <Image
            src="/images/logo-lg.png"
            alt=""
            width={imageSizes[size].width}
            height={imageSizes[size].height}
            className="h-full w-auto"
            priority
          />
        </div>
        <style jsx>{`
          @keyframes fillUp {
            0% {
              clip-path: inset(100% 0 0 0);
            }
            50% {
              clip-path: inset(0 0 0 0);
            }
            100% {
              clip-path: inset(100% 0 0 0);
            }
          }
        `}</style>
      </div>

      {text && (
        <p className={cn('text-gray-600 animate-pulse font-medium', textSizeClasses[size])}>
          {text}
        </p>
      )}
    </div>
  );
}

// Full page loader variant - light theme for org portal
export function PageLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-[#FCFAF7] z-50 flex items-center justify-center">
      <Loader size="lg" text={text} />
    </div>
  );
}

// Inline loader for smaller contexts
export function InlineLoader({ text }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader size="md" text={text} />
    </div>
  );
}
