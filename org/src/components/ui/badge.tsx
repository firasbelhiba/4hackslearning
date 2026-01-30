import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-lg border-2 border-black px-3 py-1 text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'bg-black text-white shadow-brutal-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none',
        primary:
          'bg-brand text-black shadow-brutal-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none',
        secondary:
          'bg-purple-500 text-white shadow-brutal-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none',
        destructive:
          'bg-red-500 text-white shadow-brutal-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none',
        outline:
          'bg-white text-black shadow-brutal-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none',
        success:
          'bg-green-500 text-white shadow-brutal-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none',
        warning:
          'bg-yellow-400 text-black shadow-brutal-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
