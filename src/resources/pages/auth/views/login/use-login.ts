import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loginSchema, type LoginSchemaType } from './login-schema';
import { authClient, isGoogleAuthEnabled } from '@/app/modules/auth/hooks';
import { Http } from '@/app/api/api';
import { axiosErrorHandler } from '@/shared/utils/axios-error-handler.util';
import { routes } from '@/shared/constants/router.constants';

export function useLogin() {
  const [searchParams] = useSearchParams();
  const emailFromQuery = searchParams.get('email') ?? '';

  const methods = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: emailFromQuery,
      password: '',
    },
  });

  const navigate = useNavigate();
  const [isPendingMutateAuth, setIsPendingMutateAuth] = useState(false);
  const googleAuthEnabled = isGoogleAuthEnabled();
  const { refetch: refetchSession } = authClient.useSession();

  useEffect(() => {
    if (!emailFromQuery) {
      return;
    }

    methods.setValue('email', emailFromQuery, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: true,
    });
  }, [emailFromQuery, methods]);

  async function onSubmit(data: LoginSchemaType) {
    setIsPendingMutateAuth(true);
    try {
      await Http.post('/api/auth/sign-in/email', data);
      // Raw sign-in doesn't touch better-auth's cached (null) session: the guard would bounce to login.
      await refetchSession();
      navigate(routes.home);
    } catch (error) {
      axiosErrorHandler(error);
    } finally {
      setIsPendingMutateAuth(false);
    }
  }

  async function handleGoogleLogin() {
    if (!googleAuthEnabled) {
      return;
    }

    try {
      const { error } = await authClient.signIn.social({
        provider: 'google',
        callbackURL: `${window.location.origin}${routes.home}`,
        newUserCallbackURL: `${window.location.origin}${routes.linkPages.welcome}`,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      axiosErrorHandler(error);
    }
  }

  const [email, password] = useWatch({
    control: methods.control,
    name: ['email', 'password'],
  });

  const disabledContinue = !email || !password;

  return {
    handleSubmit: methods.handleSubmit(onSubmit),
    methods,
    disabledContinue,
    isPendingMutateAuth,
    googleAuthEnabled,
    handleGoogleLogin,
  };
}
