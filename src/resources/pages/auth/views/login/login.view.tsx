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
        <h1 className='text-3xl leading-tight font-semibold tracking-tight text-zinc-900 dark:text-zinc-100'>
          Entrar na sua conta
        </h1>
        <p className='text-sm text-zinc-600 dark:text-zinc-400'>
          Insira seus dados abaixo para acessar o Linkbuds.
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
                  <FormLabel className='text-sm font-medium text-zinc-700 dark:text-zinc-300'>
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Digite seu email'
                      type='email'
                      autoCapitalize='none'
                      autoComplete='email'
                      autoCorrect='off'
                      className='h-11 rounded-sm border-zinc-300 bg-white text-zinc-900 shadow-none placeholder:text-zinc-400 focus-visible:ring-0 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500'
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
                  <FormLabel className='text-sm font-medium text-zinc-700 dark:text-zinc-300'>
                    Senha
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder='Sua senha'
                      autoComplete='current-password'
                      className='h-11 rounded-sm border-zinc-300 bg-white text-zinc-900 shadow-none placeholder:text-zinc-400 focus-visible:ring-0 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500'
                      iconOn='text-zinc-500'
                      iconOff='text-zinc-500'
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
            className='h-11 w-full rounded-sm bg-zinc-900 text-zinc-100 shadow-none transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200'
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

      <p className='text-center text-sm text-zinc-600 dark:text-zinc-400'>
        Não possui uma conta ainda?{' '}
        <Link
          to={routes.register}
          className='text-zinc-800 underline underline-offset-4 hover:text-zinc-600 dark:text-zinc-200 dark:hover:text-zinc-300'
        >
          Começar agora.
        </Link>
      </p>

      <AuthFooter />
    </div>
  );
}
