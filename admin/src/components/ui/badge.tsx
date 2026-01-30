import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md px-3 py-1 text-xs font-bold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-black text-white',
        beginner: 'bg-green-500 text-black border-2 border-black',
        intermediate: 'bg-yellow-400 text-black border-2 border-black',
        advanced: 'bg-red-500 text-white border-2 border-black',
        outline: 'border-2 border-black bg-white text-black',
        brand: 'bg-brand text-black border-2 border-black',
        success: 'bg-green-500 text-white border-2 border-black',
        warning: 'bg-yellow-400 text-black border-2 border-black',
        danger: 'bg-red-500 text-white border-2 border-black',
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
