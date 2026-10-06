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
import { PasswordInput } from '@/resources/components/ui/password-input';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';

import { AuthFooter } from '../../components/auth-footer.component';
import { useLogin } from './use-login';
import { routes } from '@/shared/constants/router.constants';

export function LoginView() {
  const {
    methods,
    handleSubmit,
    disabledContinue,
    isPendingMutateAuth,
    googleAuthEnabled,
    handleGoogleLogin,
  } = useLogin();

  return (
    <div className='animate-in fade-in slide-in-from-bottom-6 mx-auto flex w-full flex-col gap-6 duration-300'>
      <div className='space-y-2'>
        <h1 className='text-foreground text-3xl leading-tight font-semibold tracking-tight'>
          Entrar na sua conta
        </h1>
        <p className='text-muted-foreground text-sm'>
          Insira seus dados abaixo para acessar o LinkBuds.
        </p>
      </div>

      <Form {...methods}>
        <form
          onSubmit={handleSubmit}
          className='flex flex-col gap-5'
        >
          <div className='space-y-4'>
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

            <FormField
              control={methods.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <div className='flex items-center justify-between'>
                    <FormLabel className='text-sm font-medium'>Senha</FormLabel>
                    <Link
                      to={routes.forgotPassword}
                      className='text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline'
                    >
                      Esqueci minha senha
                    </Link>
                  </div>
                  <FormControl>
                    <PasswordInput
                      placeholder='Sua senha'
                      autoComplete='current-password'
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
            disabled={disabledContinue || isPendingMutateAuth}
          >
            {isPendingMutateAuth && (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            )}
            Entrar
          </Button>
        </form>
      </Form>

      {googleAuthEnabled && (
        <Button
          type='button'
          variant='outline'
          className='h-11 w-full rounded-sm'
          onClick={handleGoogleLogin}
        >
          <FcGoogle className='mr-2 h-4 w-4' />
          Entrar com Google
        </Button>
      )}

      <p className='text-muted-foreground text-center text-sm'>
        Não possui uma conta ainda?{' '}
        <Link
          to={routes.register}
          className='text-foreground font-medium underline underline-offset-4 hover:opacity-80'
        >
          Começar agora.
        </Link>
      </p>

      <AuthFooter />
    </div>
  );
}
