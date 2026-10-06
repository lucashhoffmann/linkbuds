import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { Http } from '@/app/api/api';
import { useSession } from '@/app/modules/auth/hooks';
import { useAuthStore } from '@/app/store/auth-store/use-auth-store';
import {
  newPasswordSchema,
  type NewPasswordSchemaType,
} from '@/resources/pages/auth/views/reset-password/reset-password-schema';
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
import { axiosErrorHandler } from '@/shared/utils/axios-error-handler.util';

const profileSchema = z.object({
  name: z.string().trim().min(1, 'Informe seu nome.'),
});

type ProfileSchemaType = z.infer<typeof profileSchema>;

const changePasswordSchema = newPasswordSchema.and(
  z.object({ currentPassword: z.string().min(1, 'Informe sua senha atual.') }),
);

type ChangePasswordSchemaType = NewPasswordSchemaType & {
  currentPassword: string;
};

function SubmitButton({ pending, label }: { pending: boolean; label: string }) {
  return (
    <Button
      type='submit'
      className='self-end'
      disabled={pending}
    >
      {pending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
      {label}
    </Button>
  );
}

function ProfileForm() {
  const { userAuthenticated } = useSession();
  const methods = useForm<ProfileSchemaType>({
    resolver: zodResolver(profileSchema),
    values: { name: userAuthenticated?.name ?? '' },
  });

  async function onSubmit({ name }: ProfileSchemaType) {
    try {
      await Http.post('/api/auth/update-user', { name });
      useAuthStore.setState((state) => ({
        userAuthenticated: state.userAuthenticated && {
          ...state.userAuthenticated,
          name,
        },
      }));
      toast.success('Nome atualizado');
    } catch (error) {
      axiosErrorHandler(error);
    }
  }

  return (
    <section className='bg-card rounded-2xl border p-4'>
      <h2 className='font-semibold'>Perfil</h2>
      <p className='text-muted-foreground text-sm'>
        {userAuthenticated?.email}
      </p>

      <Form {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className='mt-4 flex flex-col gap-4'
        >
          <FormField
            control={methods.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input
                    autoComplete='name'
                    className='h-11'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <SubmitButton
            pending={methods.formState.isSubmitting}
            label='Salvar nome'
          />
        </form>
      </Form>
    </section>
  );
}

const PASSWORD_FIELDS = [
  {
    name: 'currentPassword',
    label: 'Senha atual',
    autoComplete: 'current-password',
  },
  { name: 'newPassword', label: 'Nova senha', autoComplete: 'new-password' },
  {
    name: 'confirmPassword',
    label: 'Confirmar nova senha',
    autoComplete: 'new-password',
  },
] as const;

function PasswordForm() {
  const methods = useForm<ChangePasswordSchemaType>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  async function onSubmit({
    currentPassword,
    newPassword,
  }: ChangePasswordSchemaType) {
    try {
      await Http.post('/api/auth/change-password', {
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });
      methods.reset();
      toast.success('Senha alterada');
    } catch (error) {
      axiosErrorHandler(error);
    }
  }

  return (
    <section className='bg-card rounded-2xl border p-4'>
      <h2 className='font-semibold'>Senha</h2>
      <p className='text-muted-foreground text-sm'>
        Ao alterar, as sessões abertas em outros aparelhos são encerradas.
      </p>

      <Form {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className='mt-4 flex flex-col gap-4'
        >
          {PASSWORD_FIELDS.map(({ name, label, autoComplete }) => (
            <FormField
              key={name}
              control={methods.control}
              name={name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{label}</FormLabel>
                  <FormControl>
                    <PasswordInput
                      autoComplete={autoComplete}
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
          ))}

          <SubmitButton
            pending={methods.formState.isSubmitting}
            label='Alterar senha'
          />
        </form>
      </Form>
    </section>
  );
}

export function AccountSection() {
  return (
    <>
      <ProfileForm />
      <PasswordForm />
    </>
  );
}
