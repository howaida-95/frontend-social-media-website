import { Link } from 'react-router-dom';
import AuthPageLayout from '@/features/auth/components/AuthPageLayout';
import ForgotPasswordForm from '@/features/auth/components/ForgetPassword';
import { ROUTES } from '@/constants';

const ForgotPasswordPage = () => {
  return (
    <AuthPageLayout
      title="Forgot password"
      description="Enter your email and we'll send a reset link"
      footer={
        <>
          <span>Remembered it?</span>
          <Link to={ROUTES.SIGN_IN} className="auth-link font-semibold">
            Sign in
          </Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthPageLayout>
  );
};

export default ForgotPasswordPage;
