import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loginSchema, type LoginSchemaType } from './login-schema';
import { useAuthStore } from '@/app/store/auth-store/use-auth-store';
import { useLoginUseCase } from '@/app/modules/auth/use-cases';
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
  const handleSetUserAuth = useAuthStore((state) => state.handleSetUserAuth);
  const handleLogout = useAuthStore((state) => state.handleLogout);
  const { mutateAuth, isPendingMutateAuth } = useLoginUseCase();

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
    try {
      const response = await mutateAuth(data);

      handleSetUserAuth({ token: response.token });
      navigate(routes.home);
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
    handleLogout,
    navigate,
  };
}
