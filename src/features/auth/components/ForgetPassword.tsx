import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useAppForm } from '@/features/auth/hooks/useForm';
import { forgotPasswordSchema } from '@/features/auth/schemas/authSchemas';
import { authService } from '@/features/auth/api/auth.service';
import { getApiError } from '@/utils/error';

const DEFAULT_RESEND_COOLDOWN_SECONDS = 60;

/** Forgot-password fields + submit only. Layout comes from AuthPageLayout. */
export default function ForgotPasswordForm() {
  const [successMessage, setSuccessMessage] = useState('');
  const [remaining, setRemaining] = useState(0);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  const { register, submitHandler, errors, isSubmitting, apiError, setApiError, reset } =
    useAppForm({
      schema: forgotPasswordSchema,
      defaultValues: {
        email: '',
      },
    });

  useEffect(() => {
    if (remaining <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setRemaining((prev) => prev - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [remaining]);

  const startCooldown = (seconds?: number) => {
    setRemaining(seconds && seconds > 0 ? seconds : DEFAULT_RESEND_COOLDOWN_SECONDS);
  };

  const onSubmit = submitHandler(async (data) => {
    try {
      const response = await authService.forgotPassword(data);
      setSuccessMessage(
        response.message || 'If that email exists, a reset link has been sent',
      );
      setSubmittedEmail(data.email);
      startCooldown(response.retryAfter);
      setApiError('');
      reset({ email: data.email });
    } catch (error) {
      const apiErr = getApiError(error);

      if (apiErr.status === 429) {
        startCooldown(apiErr.retryAfter);
        setApiError(apiErr.message);
        return;
      }

      throw error;
    }
  });

  const handleResend = async () => {
    if (!submittedEmail || remaining > 0 || isSubmitting || isResending) {
      return;
    }

    setApiError('');
    setIsResending(true);

    try {
      const response = await authService.forgotPassword({ email: submittedEmail });
      setSuccessMessage(
        response.message || 'If that email exists, a reset link has been sent',
      );
      startCooldown(response.retryAfter);
    } catch (error) {
      const apiErr = getApiError(error);

      if (apiErr.status === 429) {
        startCooldown(apiErr.retryAfter);
      }

      setApiError(apiErr.message);
    } finally {
      setIsResending(false);
    }
  };

  const canResend =
    Boolean(submittedEmail) && remaining <= 0 && !isSubmitting && !isResending;

  return (
    <>
      {successMessage && (
        <p
          className="rounded-md bg-emerald-50 px-3 py-2 text-center text-sm text-emerald-700"
          role="status"
        >
          {successMessage}
        </p>
      )}

      {apiError && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-center text-sm text-red-600" role="alert">
          {apiError}
        </p>
      )}

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="form-label">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email address"
            className="auth-input"
            aria-invalid={errors.email ? 'true' : 'false'}
            {...register('email')}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-solid btn-lg w-full gap-1.5"
        >
          {isSubmitting ? 'Sending...' : 'Send reset link'}
          {!isSubmitting && <ChevronRight className="h-4 w-4" aria-hidden="true" />}
        </button>
      </form>

      {submittedEmail && (
        <div className="mt-4 space-y-1 text-center text-sm text-slate-600">
          <p>Didn&apos;t receive the email?</p>
          {remaining > 0 ? (
            <p className="font-medium text-slate-800" aria-live="polite">
              Resend in {remaining}s
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={!canResend}
              className="auth-link font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isResending ? 'Sending...' : 'Resend'}
            </button>
          )}
        </div>
      )}
    </>
  );
}
