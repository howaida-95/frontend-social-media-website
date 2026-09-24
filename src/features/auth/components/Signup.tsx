import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useAppForm } from '@/features/auth/hooks/useForm';
import { signUpSchema } from '@/features/auth/schemas/authSchemas';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ROUTES } from '@/constants';

/** Sign-up fields + submit only. Layout comes from AuthPageLayout. */
export default function SignUpForm() {
  const { register: registerUser, startGoogleLogin } = useAuth();
  const navigate = useNavigate();

  const { register, submitHandler, errors, isSubmitting, apiError } = useAppForm({
    schema: signUpSchema,
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = submitHandler(async (data) => {
    const { confirmPassword: _confirmPassword, ...payload } = data;
    await registerUser(payload);
    navigate(ROUTES.HOME, { replace: true });
  });

  return (
    <>
      {apiError && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-center text-sm text-red-600" role="alert">
          {apiError}
        </p>
      )}

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="firstName" className="form-label">
              First name
            </label>
            <input
              id="firstName"
              type="text"
              autoComplete="given-name"
              placeholder="First name"
              className="auth-input"
              aria-invalid={errors.firstName ? 'true' : 'false'}
              {...register('firstName')}
            />
            {errors.firstName && (
              <p className="text-sm text-red-500">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="lastName" className="form-label">
              Last name
            </label>
            <input
              id="lastName"
              type="text"
              autoComplete="family-name"
              placeholder="Last name"
              className="auth-input"
              aria-invalid={errors.lastName ? 'true' : 'false'}
              {...register('lastName')}
            />
            {errors.lastName && (
              <p className="text-sm text-red-500">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="username" className="form-label">
            Username
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            placeholder="Choose a username"
            className="auth-input"
            aria-invalid={errors.username ? 'true' : 'false'}
            {...register('username')}
          />
          {errors.username && (
            <p className="text-sm text-red-500">{errors.username.message}</p>
          )}
        </div>

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
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Create a password"
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
            placeholder="Confirm your password"
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
          {isSubmitting ? 'Creating account...' : 'Continue'}
          {!isSubmitting && <ChevronRight className="h-4 w-4" aria-hidden="true" />}
        </button>

        <button type="button" onClick={startGoogleLogin} className="btn btn-outline w-full">
          Continue with Google
        </button>
      </form>
    </>
  );
}
