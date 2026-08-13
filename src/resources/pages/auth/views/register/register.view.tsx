import { Button } from '@/resources/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/resources/components/ui/form';
import { Input } from '@/resources/components/ui/input';
import { PasswordInput } from '@/resources/components/ui/password-input';
import { FormProvider } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import { AuthFooter } from '../../components/auth-footer.component';
import { useRegister } from './use-register';
import { routes } from '@/shared/constants/router.constants';

export function RegisterView() {
  const { methods, disabledContinue, isPendingRegister, handleSubmit } =
    useRegister();

  return (
    <div className='animate-in fade-in slide-in-from-bottom-6 mx-auto flex w-full flex-col gap-6 duration-300'>
      <div className='space-y-2'>
        <h1 className='text-3xl leading-tight font-semibold tracking-tight text-zinc-900 dark:text-zinc-100'>
          Criar uma conta
        </h1>
        <p className='text-sm text-zinc-600 dark:text-zinc-400'>
          Insira suas informações abaixo para criar sua conta.
        </p>
      </div>

      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit}
          className='flex flex-col gap-5'
        >
          <div className='space-y-4'>
            <FormField
              control={methods.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium text-zinc-700 dark:text-zinc-300'>
                    Nome completo
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Digite seu nome'
                      type='text'
                      autoCapitalize='words'
                      autoComplete='name'
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
              name='companyName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium text-zinc-700 dark:text-zinc-300'>
                    Empresa
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Nome da empresa'
                      type='text'
                      autoComplete='organization'
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
                      autoComplete='new-password'
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
            disabled={disabledContinue || isPendingRegister}
          >
            {isPendingRegister && (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            )}
            Criar conta
          </Button>
        </form>
      </FormProvider>

      <p className='text-center text-sm text-zinc-600 dark:text-zinc-400'>
        Já possui uma conta?{' '}
        <Link
          to={routes.login}
          className='text-zinc-800 underline underline-offset-4 hover:text-zinc-600 dark:text-zinc-200 dark:hover:text-zinc-300'
        >
          Entre aqui.
        </Link>
      </p>

      <AuthFooter />
    </div>
  );
}
