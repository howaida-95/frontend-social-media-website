import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useAppForm } from '@/features/auth/hooks/useForm';
import { signInSchema } from '@/features/auth/schemas/authSchemas';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ROUTES } from '@/constants';

const oauthErrorMessage = (code: string | null): string => {
  switch (code) {
    case 'google_denied':
      return 'Google sign-in was cancelled.';
    case 'google_invalid_state':
      return 'Google sign-in failed. Please try again.';
    case 'google_auth_failed':
      return 'Could not sign in with Google.';
    default:
      return code ? 'Sign-in failed. Please try again.' : '';
  }
};

/** Sign-in fields + submit only. Layout comes from AuthPageLayout. */
export default function SignInForm() {
  const { login, startGoogleLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oauthError = oauthErrorMessage(searchParams.get('error'));

  const { register, submitHandler, errors, isSubmitting, apiError } = useAppForm({
    schema: signInSchema,
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = submitHandler(async (data) => {
    await login(data);
    navigate(ROUTES.HOME, { replace: true });
  });

  return (
    <>
      {(oauthError || apiError) && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-center text-sm text-red-600" role="alert">
          {oauthError || apiError}
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

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <Link to={ROUTES.FORGOT_PASSWORD} className="auth-link text-(--color-content-muted)">
              Forgot?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Password here"
            className="auth-input"
            aria-invalid={errors.password ? 'true' : 'false'}
            {...register('password')}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-solid btn-lg w-full gap-1.5"
        >
          {isSubmitting ? 'Signing in...' : 'Continue'}
          {!isSubmitting && <ChevronRight className="h-4 w-4" aria-hidden="true" />}
        </button>

        <button type="button" onClick={startGoogleLogin} className="btn btn-outline w-full">
          Continue with Google
        </button>
      </form>
    </>
  );
}
