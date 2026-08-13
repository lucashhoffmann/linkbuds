import { Link } from 'react-router-dom';
import { Button } from '@/resources/components/ui/button';
import { routes } from '@/shared/constants/router.constants';

interface IErrorStatusPageProps {
  title: string;
  description: string;
  status: string;
}

export function ErrorStatusPage({
  title,
  description,
  status,
}: IErrorStatusPageProps) {
  return (
    <main className='bg-background text-foreground flex min-h-svh items-center justify-center p-6'>
      <div className='w-full max-w-md space-y-5 text-center'>
        <p className='text-muted-foreground text-sm font-medium'>{status}</p>
        <div className='space-y-2'>
          <h1 className='text-3xl font-semibold tracking-tight'>{title}</h1>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </div>
        <Button asChild>
          <Link to={routes.initial}>Voltar ao início</Link>
        </Button>
      </div>
    </main>
  );
}
