import { describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useAppForm } from '@/features/auth/hooks/useForm';
import { signInSchema } from '@/features/auth/schemas/authSchemas';
import axios from 'axios';

describe('useAppForm', () => {
  it('exposes field errors when validation fails', async () => {
    const { result } = renderHook(() =>
      useAppForm({
        schema: signInSchema,
        defaultValues: { email: '', password: '' },
      }),
    );

    const onValid = vi.fn();
    const submit = result.current.submitHandler(onValid);

    await act(async () => {
      await submit({
        preventDefault: () => undefined,
      } as unknown as React.FormEvent);
    });

    await waitFor(() => {
      expect(result.current.errors.email?.message).toMatch(/email is required/i);
      expect(result.current.errors.password?.message).toMatch(/password is required/i);
    });
    expect(onValid).not.toHaveBeenCalled();
  });

  it('calls onValid with validated data', async () => {
    const { result } = renderHook(() =>
      useAppForm({
        schema: signInSchema,
        defaultValues: { email: 'user@example.com', password: 'secret' },
      }),
    );

    const onValid = vi.fn().mockResolvedValue(undefined);
    const submit = result.current.submitHandler(onValid);

    await act(async () => {
      await submit({
        preventDefault: () => undefined,
      } as unknown as React.FormEvent);
    });

    await waitFor(() => {
      expect(onValid).toHaveBeenCalledTimes(1);
    });
    expect(onValid.mock.calls[0][0]).toEqual({
      email: 'user@example.com',
      password: 'secret',
    });
    expect(result.current.apiError).toBe('');
  });

  it('maps thrown API errors into apiError', async () => {
    const { result } = renderHook(() =>
      useAppForm({
        schema: signInSchema,
        defaultValues: { email: 'user@example.com', password: 'secret' },
      }),
    );

    const apiError = new axios.AxiosError(
      'Request failed',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      {
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config: { headers: {} } as never,
        data: { message: 'Invalid email or password' },
      },
    );

    const onValid = vi.fn().mockRejectedValue(apiError);
    const submit = result.current.submitHandler(onValid);

    await act(async () => {
      await submit({
        preventDefault: () => undefined,
      } as unknown as React.FormEvent);
    });

    await waitFor(() => {
      expect(result.current.apiError).toBe('Invalid email or password');
    });
  });
});
