import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { registerSchema, type RegisterSchemaType } from './register-schema';
import { axiosErrorHandler } from '@/shared/utils/axios-error-handler.util';
import { useRegisterUseCase } from '@/app/modules/auth/use-cases';
import { Http } from '@/app/api/api';
import { routes } from '@/shared/constants/router.constants';

export function useRegister() {
  const methods = useForm<RegisterSchemaType>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      companyName: '',
    },
  });

  const navigate = useNavigate();
  const { mutateRegister, isPendingRegister } = useRegisterUseCase();

  async function onSubmit(data: RegisterSchemaType) {
    try {
      await mutateRegister(data);

      await Http.post('/api/auth/sign-in/email', {
        email: data.email,
        password: data.password,
      });

      toast.success('Conta criada com sucesso');
      navigate(routes.linkPages.welcome);
    } catch (error) {
      axiosErrorHandler(error);
    }
  }

  const [email, password, name, companyName] = useWatch({
    control: methods.control,
    name: ['email', 'password', 'name', 'companyName'],
  });

  const disabledContinue = !email || !password || !name || !companyName;

  return {
    methods,
    disabledContinue,
    isPendingRegister,
    handleSubmit: methods.handleSubmit(onSubmit),
  };
}
