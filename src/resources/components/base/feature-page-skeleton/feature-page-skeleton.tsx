import { Skeleton } from '@/resources/components/ui/skeleton';

export function FeaturePageSkeleton() {
  return (
    <div className='bg-background flex min-h-svh items-center justify-center p-6'>
      <div className='w-full max-w-3xl space-y-4'>
        <Skeleton className='h-6 w-40' />
        <div className='grid gap-4 md:grid-cols-2'>
          <Skeleton className='h-28 w-full' />
          <Skeleton className='h-28 w-full' />
        </div>
        <Skeleton className='h-48 w-full' />
      </div>
    </div>
  );
}
