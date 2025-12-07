// import * as React from 'react';
// import * as AvatarPrimitive from '@radix-ui/react-avatar';
// import { cn } from '@/lib/utils';

// interface AvatarProps extends AvatarPrimitive.RootProps {}
// interface AvatarImageProps extends AvatarPrimitive.ImageProps {}
// interface AvatarFallbackProps extends AvatarPrimitive.FallbackProps {}

// const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(({ className, ...props }, ref) => (
//   <AvatarPrimitive.Root
//     ref={ref}
//     className={cn(
//       'relative inline-flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
//       className
//     )}
//     {...props}
//   />
// ));
// Avatar.displayName = AvatarPrimitive.Root.displayName;

// const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
//   ({ className, ...props }, ref) => (
//     <AvatarPrimitive.Image
//       ref={ref}
//       className={cn('aspect-square h-full w-full', className)}
//       {...props}
//     />
//   )
// );
// AvatarImage.displayName = AvatarPrimitive.Image.displayName;

// const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
//   ({ className, ...props }, ref) => (
//     <AvatarPrimitive.Fallback
//       ref={ref}
//       className={cn('flex items-center justify-center bg-muted', className)}
//       {...props}
//     />
//   )
// );
// AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

// export { Avatar, AvatarImage, AvatarFallback };
