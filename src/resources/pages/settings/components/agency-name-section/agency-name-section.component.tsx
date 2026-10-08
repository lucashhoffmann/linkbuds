import { Loader2 } from 'lucide-react';
import { Button } from '@/resources/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/resources/components/ui/form';
import { Input } from '@/resources/components/ui/input';
import { useAgencyNameSection } from './use-agency-name-section.component';

export function AgencyNameSection() {
  const { isOwner, methods, onSubmit } = useAgencyNameSection();

  if (!isOwner) return null;

  const pending = methods.formState.isSubmitting;

  return (
    <section className='bg-card rounded-2xl border p-4'>
      <h2 className='font-semibold'>Agência</h2>
      <p className='text-muted-foreground text-sm'>
        Nome exibido para a equipe e nos convites.
      </p>

      <Form {...methods}>
        <form
          onSubmit={onSubmit}
          className='mt-4 flex flex-col gap-4'
        >
          <FormField
            control={methods.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da agência</FormLabel>
                <FormControl>
                  <Input
                    autoComplete='organization'
                    className='h-11'
                    maxLength={120}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type='submit'
            className='self-end'
            disabled={pending}
          >
            {pending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Salvar nome da agência
          </Button>
        </form>
      </Form>
    </section>
  );
}
