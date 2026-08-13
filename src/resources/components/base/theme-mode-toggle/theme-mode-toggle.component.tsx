import { Button } from '@/resources/components/ui/button';
import { useTheme } from '@/app/providers/theme-provider';

import {
  getThemeLabel,
  ThemeIcon,
  ThemeSelectorDialog,
} from './theme-selector-dialog.component';

export function ThemeModeToggle() {
  const { theme } = useTheme();
  const currentThemeLabel = getThemeLabel(theme);

  return (
    <ThemeSelectorDialog
      trigger={
        <Button
          variant='outline'
          size='icon'
          className='flex items-center justify-center'
          aria-label={`Tema atual: ${currentThemeLabel}. Abrir seleção de tema`}
        >
          <ThemeIcon
            theme={theme}
            className='size-[1.1rem]'
          />
        </Button>
      }
    />
  );
}
