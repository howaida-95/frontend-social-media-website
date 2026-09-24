import { Link } from 'react-router-dom';
import AuthPageLayout from '@/features/auth/components/AuthPageLayout';
import SignInForm from '@/features/auth/components/SignIn';
import { ROUTES } from '@/constants';

const SignInPage = () => {
  return (
    <AuthPageLayout
      title="Sign in to"
      description="Welcome back! Please sign in to continue"
      footer={
        <>
          <span>Don&apos;t have an account?</span>
          <Link to={ROUTES.SIGN_UP} className="auth-link font-semibold">
            Sign up
          </Link>
        </>
      }
    >
      <SignInForm />
    </AuthPageLayout>
  );
};

export default SignInPage;
