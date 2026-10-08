import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { HttpAuth } from '@/app/api/api';
import { useSession } from '@/app/modules/auth/hooks';
import { useAuthStore } from '@/app/store/auth-store/use-auth-store';
import { axiosErrorHandler } from '@/shared/utils/axios-error-handler.util';

const agencyNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Informe o nome da agência.')
    .max(120, 'Use no máximo 120 caracteres.'),
});

type AgencyNameSchemaType = z.infer<typeof agencyNameSchema>;

export function useAgencyNameSection() {
  const { company, userAuthenticated } = useSession();
  const isOwner = userAuthenticated?.role === 'OWNER';
  const methods = useForm<AgencyNameSchemaType>({
    resolver: zodResolver(agencyNameSchema),
    values: { name: company?.name ?? '' },
  });

  async function onSubmit({ name }: AgencyNameSchemaType) {
    try {
      await HttpAuth.patch('/company', { name });
      useAuthStore.setState((state) => ({
        companyAuthenticated: state.companyAuthenticated && {
          ...state.companyAuthenticated,
          name,
        },
      }));
      toast.success('Nome da agência atualizado');
    } catch (error) {
      axiosErrorHandler(error);
    }
  }

  return {
    isOwner,
    methods,
    onSubmit: methods.handleSubmit(onSubmit),
  };
}
