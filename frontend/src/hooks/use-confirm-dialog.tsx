import { useCallback, useMemo, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type ConfirmDialogVariant = 'default' | 'destructive';

type ConfirmDialogOptions = {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmDialogVariant;
};

const defaultOptions: ConfirmDialogOptions = {
  title: 'Are you sure?',
  description: 'This action cannot be undone.',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  variant: 'default',
};

type ConfirmResolver = (value: boolean) => void;

export const useConfirmDialog = () => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmDialogOptions>(defaultOptions);
  const [resolver, setResolver] = useState<ConfirmResolver | null>(null);

  const closeDialog = useCallback(
    (result: boolean) => {
      if (resolver) {
        resolver(result);
        setResolver(null);
      }
      setOpen(false);
    },
    [resolver],
  );

  const confirm = useCallback(
    (opts: ConfirmDialogOptions) =>
      new Promise<boolean>((resolve) => {
        setOptions({ ...defaultOptions, ...opts });
        setResolver(() => resolve);
        setOpen(true);
      }),
    [],
  );

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        closeDialog(false);
        return;
      }
      setOpen(true);
    },
    [closeDialog],
  );

  const confirmButtonClass = useMemo(() => {
    if (options.variant === 'destructive') {
      return 'bg-destructive text-destructive-foreground hover:bg-destructive/90';
    }
    return '';
  }, [options.variant]);

  const ConfirmDialog = (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{options.title}</AlertDialogTitle>
          {options.description ? <AlertDialogDescription>{options.description}</AlertDialogDescription> : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => closeDialog(false)}>{options.cancelText}</AlertDialogCancel>
          <AlertDialogAction className={confirmButtonClass} onClick={() => closeDialog(true)}>
            {options.confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { confirm, ConfirmDialog };
};



