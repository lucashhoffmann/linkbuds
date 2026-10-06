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
        <h1 className='text-foreground text-2xl leading-tight sm:text-3xl font-semibold tracking-tight'>
          Criar uma conta
        </h1>
        <p className='text-muted-foreground text-sm'>
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
                  <FormLabel className='text-sm font-medium'>
                    Nome completo
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Digite seu nome'
                      type='text'
                      autoCapitalize='words'
                      autoComplete='name'
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
              name='companyName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium'>
                    Nome da agência
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Ex.: Agência Sol'
                      type='text'
                      autoCapitalize='words'
                      autoComplete='organization'
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
                  <FormLabel className='text-sm font-medium'>Senha</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder='Sua senha'
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
            disabled={disabledContinue || isPendingRegister}
          >
            {isPendingRegister && (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            )}
            Começar agora
          </Button>
        </form>
      </FormProvider>

      <p className='text-muted-foreground text-center text-sm'>
        Já possui uma conta?{' '}
        <Link
          to={routes.login}
          className='text-foreground font-medium underline underline-offset-4 hover:opacity-80'
        >
          Entre aqui.
        </Link>
      </p>

      <AuthFooter />
    </div>
  );
}
