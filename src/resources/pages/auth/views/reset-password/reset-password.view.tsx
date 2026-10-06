import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
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
import { PasswordInput } from '@/resources/components/ui/password-input';
import { routes } from '@/shared/constants/router.constants';
import { axiosErrorHandler } from '@/shared/utils/axios-error-handler.util';
import { AuthFooter } from '../../components/auth-footer.component';
import {
  newPasswordSchema,
  type NewPasswordSchemaType,
} from './reset-password-schema';

/** Landing of the emailed link: better-auth redirects here with `?token=` or `?error=`. */
export function ResetPasswordView() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const methods = useForm<NewPasswordSchemaType>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  async function onSubmit({ newPassword }: NewPasswordSchemaType) {
    try {
      await Http.post('/api/auth/reset-password', { newPassword, token });
      toast.success('Senha redefinida. Entre com a nova senha.');
      navigate(routes.login, { replace: true });
    } catch (error) {
      axiosErrorHandler(error);
    }
  }

  return (
    <div className='animate-in fade-in slide-in-from-bottom-6 mx-auto flex w-full flex-col gap-6 duration-300'>
      <div className='space-y-2'>
        <h1 className='text-foreground text-2xl leading-tight sm:text-3xl font-semibold tracking-tight'>
          Criar nova senha
        </h1>
        <p className='text-muted-foreground text-sm'>
          Ao salvar, as sessões abertas em outros aparelhos são encerradas.
        </p>
      </div>

      {!token ? (
        <div
          role='alert'
          className='bg-muted space-y-3 rounded-xl p-4 text-sm'
        >
          <p>Este link é inválido ou expirou.</p>
          <Button
            asChild
            className='w-full'
          >
            <Link to={routes.forgotPassword}>Pedir novo link</Link>
          </Button>
        </div>
      ) : (
        <Form {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className='flex flex-col gap-5'
          >
            <div className='space-y-4'>
              <FormField
                control={methods.control}
                name='newPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm font-medium'>
                      Nova senha
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder='Mínimo de 6 caracteres'
                        autoComplete='new-password'
                        className='h-11'
                        iconOn='text-muted-foreground'
                        iconOff='text-muted-foreground'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={methods.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm font-medium'>
                      Confirmar nova senha
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder='Repita a nova senha'
                        autoComplete='new-password'
                        className='h-11'
                        iconOn='text-muted-foreground'
                        iconOff='text-muted-foreground'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type='submit'
              className='h-11 w-full'
              disabled={methods.formState.isSubmitting}
            >
              {methods.formState.isSubmitting && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
              Salvar nova senha
            </Button>
          </form>
        </Form>
      )}

      <AuthFooter />
    </div>
  );
}
