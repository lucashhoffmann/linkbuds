import { ArrowLeft } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { Button } from '@/resources/components/ui/button';

/** Default "back" action for sub-pages (pages not in the main nav). */
export function BackButton({ to, label }: { to: string; label: string }) {
  return (
    <Button
      asChild
      variant='ghost'
      size='icon'
      aria-label={label}
      title={label}
    >
      <RouterLink to={to}>
        <ArrowLeft className='size-4' />
      </RouterLink>
    </Button>
  );
}
