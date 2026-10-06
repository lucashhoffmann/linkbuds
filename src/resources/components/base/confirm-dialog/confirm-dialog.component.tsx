import { useSyncExternalStore } from 'react';

import { Button } from '@/resources/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/resources/components/ui/dialog';

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type ConfirmRequest = ConfirmOptions & { resolve: (ok: boolean) => void };

let current: ConfirmRequest | null = null;
const listeners = new Set<() => void>();

function setCurrent(next: ConfirmRequest | null) {
  current = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Drop-in replacement for window.confirm: `if (await confirmAction({...}))`. */
export function confirmAction(options: ConfirmOptions): Promise<boolean> {
  current?.resolve(false);
  return new Promise((resolve) => setCurrent({ ...options, resolve }));
}

function settle(ok: boolean) {
  current?.resolve(ok);
  setCurrent(null);
}

/** Mount once at the app root. */
export function ConfirmDialog() {
  const request = useSyncExternalStore(subscribe, () => current);

  return (
    <Dialog
      open={request !== null}
      onOpenChange={(open) => !open && settle(false)}
    >
      {request && (
        <DialogContent
          showCloseButton={false}
          className='sm:max-w-md'
        >
          <DialogHeader>
            <DialogTitle>{request.title}</DialogTitle>
            <DialogDescription className={request.description ? '' : 'sr-only'}>
              {request.description ?? request.title}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='outline'>
                {request.cancelLabel ?? 'Cancelar'}
              </Button>
            </DialogClose>
            <Button
              variant={request.destructive ? 'destructive' : 'default'}
              onClick={() => settle(true)}
            >
              {request.confirmLabel ?? 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}
