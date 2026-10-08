import { CircleCheck } from 'lucide-react';
import { Button } from '@/resources/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/resources/components/ui/dialog';
import { formatMoney } from './subscribe-dialog/payment-format.util';

export interface IUpgradeResult {
  planName: string;
  chargedCents: number;
  /** "A partir de dd/mm, R$ X/mês." */
  renewal: string;
}

interface IUpgradeSuccessDialogProps {
  result: IUpgradeResult | null;
  onClose: () => void;
}

/** Payment confirmation after an upgrade, same look as the checkout's. */
export function UpgradeSuccessDialog({
  result,
  onClose,
}: IUpgradeSuccessDialogProps) {
  return (
    <Dialog
      open={Boolean(result)}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className='p-0 sm:max-w-md'>
        {result && (
          <div className='grid justify-items-center gap-3 px-6 py-10 text-center'>
            <div className='bg-secondary text-primary flex size-14 items-center justify-center rounded-full'>
              <CircleCheck className='size-7' />
            </div>
            <DialogTitle className='text-xl'>Upgrade concluído</DialogTitle>
            <DialogDescription className='max-w-sm'>
              O plano {result.planName} já está liberado na sua conta.
              {result.chargedCents > 0
                ? ` Pagamento de ${formatMoney(result.chargedCents)} confirmado no cartão da assinatura.`
                : ' Sem cobrança agora.'}{' '}
              {result.renewal}
            </DialogDescription>
            <Button
              type='button'
              className='mt-2 rounded-full px-6'
              onClick={onClose}
            >
              Concluir
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
