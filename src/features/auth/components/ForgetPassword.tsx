import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useAppForm } from '@/features/auth/hooks/useForm';
import { forgotPasswordSchema } from '@/features/auth/schemas/authSchemas';
import { authService } from '@/features/auth/api/auth.service';

/** Forgot-password fields + submit only. Layout comes from AuthPageLayout. */
export default function ForgotPasswordForm() {
  const [successMessage, setSuccessMessage] = useState('');

  const { register, submitHandler, errors, isSubmitting, apiError, reset } = useAppForm({
    schema: forgotPasswordSchema,
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = submitHandler(async (data) => {
    // call the api to send the reset link
    const response = await authService.forgotPassword(data);
    // if the response is successful, set the success message
    setSuccessMessage(
      response.message || 'If that email exists, a reset link has been sent',
    );
    // reset the form
    reset();
  });

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
    </>
  );
}
