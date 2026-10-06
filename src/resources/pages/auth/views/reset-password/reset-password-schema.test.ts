import { describe, expect, it } from 'vitest';
import { newPasswordSchema } from './reset-password-schema';

describe('newPasswordSchema', () => {
  it('accepts matching passwords', () => {
    expect(
      newPasswordSchema.safeParse({
        newPassword: 'abc123',
        confirmPassword: 'abc123',
      }).success,
    ).toBe(true);
  });

  it('rejects mismatch on confirmPassword', () => {
    const result = newPasswordSchema.safeParse({
      newPassword: 'abc123',
      confirmPassword: 'abc124',
    });

    expect(result.error?.issues[0].path).toEqual(['confirmPassword']);
  });

  it('rejects short passwords', () => {
    expect(
      newPasswordSchema.safeParse({
        newPassword: '123',
        confirmPassword: '123',
      }).success,
    ).toBe(false);
  });
});
