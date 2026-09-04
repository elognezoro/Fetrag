'use client'

import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'

import { cn } from '../lib/cn'

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  size?: 'sm' | 'md'
}

/** Interrupteur (Radix Switch). Vert FETRAG à l'état actif. */
export const Switch = React.forwardRef<React.ComponentRef<typeof SwitchPrimitive.Root>, SwitchProps>(function Switch(
  { className, size = 'md', ...props },
  ref,
) {
  const isSmall = size === 'sm'
  return (
    <SwitchPrimitive.Root
      ref={ref}
      className={cn(
        'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-neutral-300',
        'transition-colors duration-180 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40 focus-visible:ring-offset-2',
        'data-[state=checked]:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50',
        isSmall ? 'h-5 w-9' : 'h-7 w-12',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          'pointer-events-none block rounded-full bg-white shadow-soft ring-0 transition-transform duration-180 ease-out-expo',
          isSmall
            ? 'size-4 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0'
            : 'size-6 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
        )}
      />
    </SwitchPrimitive.Root>
  )
})
