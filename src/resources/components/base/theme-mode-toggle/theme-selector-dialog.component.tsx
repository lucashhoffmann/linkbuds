import type { ReactNode } from 'react';
import { useState } from 'react';
import {
  LucideCheck,
  LucideMoon,
  LucideSun,
  Palette,
  type LucideIcon,
} from 'lucide-react';

import {
  useTheme,
  type ColorTheme,
  type Theme,
} from '@/app/providers/theme-provider';
import { Button } from '@/resources/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/resources/components/ui/dialog';
import { cn } from '@/shared/lib/utils';

type ThemeOption = {
  value: Theme;
  label: string;
  description: string;
  icon: LucideIcon;
};

type ColorThemeOption = {
  value: ColorTheme;
  label: string;
  swatchClassName: string;
};

const themeOptions: ThemeOption[] = [
  {
    value: 'light',
    label: 'Claro',
    description: 'Interface limpa para ambientes bem iluminados.',
    icon: LucideSun,
  },
  {
    value: 'dark',
    label: 'Escuro',
    description: 'Visual confortável para uso prolongado.',
    icon: LucideMoon,
  },
  {
    value: 'system',
    label: 'Sistema',
    description: 'Segue automaticamente o tema do dispositivo.',
    icon: Palette,
  },
];

const colorThemeOptions: ColorThemeOption[] = [
  {
    value: 'default',
    label: 'Padrão',
    swatchClassName: 'bg-zinc-700 dark:bg-zinc-300',
  },
  {
    value: 'violet',
    label: 'Roxo',
    swatchClassName: 'bg-violet-600 dark:bg-violet-400',
  },
  {
    value: 'red',
    label: 'Vermelho',
    swatchClassName: 'bg-red-600 dark:bg-red-400',
  },
  {
    value: 'green',
    label: 'Verde',
    swatchClassName: 'bg-emerald-600 dark:bg-emerald-400',
  },
  {
    value: 'blue',
    label: 'Azul',
    swatchClassName: 'bg-blue-600 dark:bg-blue-400',
  },
];

const themeLabels: Record<Theme, string> = {
  light: 'Claro',
  dark: 'Escuro',
  system: 'Sistema',
};

const colorThemeLabels: Record<ColorTheme, string> = {
  default: 'Padrão',
  violet: 'Roxo',
  red: 'Vermelho',
  green: 'Verde',
  blue: 'Azul',
};

const themeIcons: Record<Theme, LucideIcon> = {
  light: LucideSun,
  dark: LucideMoon,
  system: Palette,
};

interface ThemeSelectorDialogProps {
  trigger: ReactNode;
}

export function getThemeLabel(theme: Theme) {
  return themeLabels[theme];
}

export function getColorThemeLabel(colorTheme: ColorTheme) {
  return colorThemeLabels[colorTheme];
}

interface ThemeIconProps {
  theme: Theme;
  className?: string;
}

export function ThemeIcon({ theme, className }: ThemeIconProps) {
  const Icon = themeIcons[theme];
  return <Icon className={className} />;
}

export function ThemeSelectorDialog({ trigger }: ThemeSelectorDialogProps) {
  const [open, setOpen] = useState(false);
  const { theme, setTheme, colorTheme, setColorTheme } = useTheme();

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className='p-2 sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Alterar tema</DialogTitle>
          <DialogDescription>
            Escolha aparência e cor principal do painel.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-5'>
          <div className='space-y-2'>
            <p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
              Modo de aparência
            </p>

            {themeOptions.map((option) => {
              const isActive = theme === option.value;
              const OptionIcon = option.icon;

              return (
                <Button
                  key={option.value}
                  type='button'
                  variant={isActive ? 'secondary' : 'outline'}
                  className={cn(
                    'h-auto w-full justify-start gap-3 py-3',
                    isActive && 'border-primary/40',
                  )}
                  onClick={() => setTheme(option.value)}
                >
                  <OptionIcon className='size-4' />
                  <div className='flex-1 text-left'>
                    <p className='text-sm font-medium'>{option.label}</p>
                    <p className='text-muted-foreground text-xs'>
                      {option.description}
                    </p>
                  </div>
                  {isActive && <LucideCheck className='text-primary size-4' />}
                </Button>
              );
            })}
          </div>

          <div className='space-y-2'>
            <p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
              Cor principal
            </p>

            <div className='grid grid-cols-2 gap-2 sm:grid-cols-3'>
              {colorThemeOptions.map((option) => {
                const isActive = colorTheme === option.value;

                return (
                  <Button
                    key={option.value}
                    type='button'
                    variant={isActive ? 'secondary' : 'outline'}
                    className={cn(
                      'h-auto justify-start gap-2 py-2',
                      isActive && 'border-primary/40',
                    )}
                    onClick={() => setColorTheme(option.value)}
                  >
                    <span
                      className={cn(
                        'size-3 rounded-full border border-black/10 dark:border-white/10',
                        option.swatchClassName,
                      )}
                    />
                    <span className='text-xs'>{option.label}</span>
                    {isActive && <LucideCheck className='ml-auto size-3.5' />}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
