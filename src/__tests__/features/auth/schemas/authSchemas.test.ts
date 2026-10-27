import { describe, expect, it } from 'vitest';
import {
  forgotPasswordSchema,
  signInSchema,
  signUpSchema,
} from '@/features/auth/schemas/authSchemas';

describe('authSchemas', () => {
  it('accepts a valid sign-in payload', () => {
    const result = signInSchema.safeParse({
      email: 'user@example.com',
      password: 'secret',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email on sign-in', () => {
    const result = signInSchema.safeParse({
      email: 'not-an-email',
      password: 'secret',
    });
    expect(result.success).toBe(false);
  });

  it('rejects weak sign-up password', () => {
    const result = signUpSchema.safeParse({
      firstName: 'Ada',
      lastName: 'Lovelace',
      username: 'ada123',
      email: 'ada@example.com',
      password: 'short',
      confirmPassword: 'short',
    });
    expect(result.success).toBe(false);
  });

  it('rejects mismatched confirm password on sign-up', () => {
    const result = signUpSchema.safeParse({
      firstName: 'Ada',
      lastName: 'Lovelace',
      username: 'ada123',
      email: 'ada@example.com',
      password: 'Password1',
      confirmPassword: 'Password2',
    });
    expect(result.success).toBe(false);
  });

  it('accepts a valid forgot-password email', () => {
    const result = forgotPasswordSchema.safeParse({
      email: 'user@example.com',
    });
    expect(result.success).toBe(true);
  });
});
