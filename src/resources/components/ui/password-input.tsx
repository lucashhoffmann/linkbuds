import { forwardRef, useState } from 'react';

import { LuEye, LuEyeOff } from 'react-icons/lu';

import { cn } from '@/shared/lib/utils';

import { Button } from './button';
import { Input, type IInputProps } from './input';

interface IPasswordInputProps extends IInputProps {
  iconOn?: string;
  iconOff?: string;
}

const PasswordInput = forwardRef<HTMLInputElement, IPasswordInputProps>(
  ({ className, errorMessage, iconOn, iconOff, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const disabled = props.disabled;

    return (
      <div className='relative'>
        <Input
          type={showPassword ? 'text' : 'password'}
          className={cn('hide-password-toggle pr-10', className)}
          ref={ref}
          {...props}
          errorMessage={errorMessage}
        />

        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='absolute top-0 right-0 h-full max-h-[50px] cursor-pointer px-3 py-2 hover:bg-transparent'
          onClick={() =>
            setShowPassword((prev: boolean) => {
              return !prev;
            })
          }
          disabled={disabled}
        >
          {showPassword && !disabled ? (
            <LuEye
              className={cn('h-4 w-4', iconOn)}
              aria-hidden='true'
            />
          ) : (
            <LuEyeOff
              className={cn('h-4 w-4', iconOff)}
              aria-hidden='true'
            />
          )}

          <span className='sr-only'>
            {showPassword ? 'Hide password' : 'Show password'}
          </span>
        </Button>

        {/* hides browsers password toggles */}
        <style>{`
					.hide-password-toggle::-ms-reveal,
					.hide-password-toggle::-ms-clear {
						visibility: hidden;
						pointer-events: none;
						display: none;
					}
				`}</style>
      </div>
    );
  },
);

PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
