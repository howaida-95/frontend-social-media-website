import { Link } from 'react-router-dom';
import AuthPageLayout from '@/features/auth/components/AuthPageLayout';
import SignUpForm from '@/features/auth/components/Signup';
import { ROUTES } from '@/constants';

const SignUpPage = () => {
  return (
    <AuthPageLayout
      title="Create account"
      description="Join pingup and connect with your community"
      footer={
        <>
          <span>Already have an account?</span>
          <Link to={ROUTES.SIGN_IN} className="auth-link font-semibold">
            Sign in
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthPageLayout>
  );
};

export default SignUpPage;
