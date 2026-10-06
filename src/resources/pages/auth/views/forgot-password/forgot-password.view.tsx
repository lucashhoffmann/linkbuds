import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Loader2, MailCheck } from 'lucide-react';
import { z } from 'zod';
import { Http } from '@/app/api/api';
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
import { routes } from '@/shared/constants/router.constants';
import { axiosErrorHandler } from '@/shared/utils/axios-error-handler.util';
import { AuthFooter } from '../../components/auth-footer.component';

const forgotPasswordSchema = z.object({
  email: z.email('Informe um email valido.'),
});

type ForgotPasswordSchemaType = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordView() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const methods = useForm<ForgotPasswordSchemaType>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit({ email }: ForgotPasswordSchemaType) {
    try {
      await Http.post('/api/auth/request-password-reset', {
        email,
        redirectTo: `${window.location.origin}${routes.resetPassword}`,
      });
      setSentTo(email);
    } catch (error) {
      axiosErrorHandler(error);
    }
  }

  return (
    <div className='animate-in fade-in slide-in-from-bottom-6 mx-auto flex w-full flex-col gap-6 duration-300'>
      <div className='space-y-2'>
        <h1 className='text-foreground text-3xl leading-tight font-semibold tracking-tight'>
          Esqueceu sua senha?
        </h1>
        <p className='text-muted-foreground text-sm'>
          Informe o email da sua conta e enviaremos um link para criar uma nova
          senha.
        </p>
      </div>

      {sentTo ? (
        <div
          role='status'
          className='bg-muted flex gap-3 rounded-xl p-4 text-sm'
        >
          <MailCheck className='mt-0.5 size-4 shrink-0' />
          <p>
            Se existir uma conta com <strong>{sentTo}</strong>, você receberá o
            link em instantes. Confira também a caixa de spam.
          </p>
        </div>
      ) : (
        <Form {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className='flex flex-col gap-5'
          >
            <FormField
              control={methods.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium'>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Digite seu email'
                      type='email'
                      autoCapitalize='none'
                      autoComplete='email'
                      autoCorrect='off'
                      className='h-11'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type='submit'
              className='h-11 w-full'
              disabled={methods.formState.isSubmitting}
            >
              {methods.formState.isSubmitting && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
              Enviar link
            </Button>
          </form>
        </Form>
      )}

      <p className='text-muted-foreground text-center text-sm'>
        Lembrou a senha?{' '}
        <Link
          to={routes.login}
          className='text-foreground font-medium underline underline-offset-4 hover:opacity-80'
        >
          Voltar para o login.
        </Link>
      </p>

      <AuthFooter />
    </div>
  );
}
