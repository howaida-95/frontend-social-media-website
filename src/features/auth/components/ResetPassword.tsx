import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useAppForm } from '@/features/auth/hooks/useForm';
import { resetPasswordSchema } from '@/features/auth/schemas/authSchemas';
import { authService } from '@/features/auth/api/auth.service';
import { ROUTES } from '@/constants';

/** Reset-password fields + submit only. Layout comes from AuthPageLayout. */
export default function ResetPasswordForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';

  const { register, submitHandler, errors, isSubmitting, apiError } = useAppForm({
    schema: resetPasswordSchema,
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = submitHandler(async (data) => {
    await authService.resetPassword({
      token,
      password: data.password,
    });
    navigate(ROUTES.SIGN_IN, { replace: true });
  });

  if (!token) {
    return (
      <p className="rounded-md bg-red-50 px-3 py-2 text-center text-sm text-red-600" role="alert">
        Invalid or missing reset link. Request a new password reset email.
      </p>
    );
  }

  return (
    <>
      {apiError && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-center text-sm text-red-600" role="alert">
          {apiError}
        </p>
      )}

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="password" className="form-label">
            New password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Enter a new password"
            className="auth-input"
            aria-invalid={errors.password ? 'true' : 'false'}
            {...register('password')}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Confirm your new password"
            className="auth-input"
            aria-invalid={errors.confirmPassword ? 'true' : 'false'}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-solid btn-lg w-full gap-1.5"
        >
          {isSubmitting ? 'Updating...' : 'Reset password'}
          {!isSubmitting && <ChevronRight className="h-4 w-4" aria-hidden="true" />}
        </button>
      </form>
    </>
  );
}
