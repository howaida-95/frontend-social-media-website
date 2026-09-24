import { Link } from 'react-router-dom';
import AuthPageLayout from '@/features/auth/components/AuthPageLayout';
import ResetPasswordForm from '@/features/auth/components/ResetPassword';
import { ROUTES } from '@/constants';

const ResetPasswordPage = () => {
  return (
    <AuthPageLayout
      title="Reset password"
      description="Choose a new password for your account"
      footer={
        <>
          <span>Back to</span>
          <Link to={ROUTES.SIGN_IN} className="auth-link font-semibold">
            Sign in
          </Link>
        </>
      }
    >
      <ResetPasswordForm />
    </AuthPageLayout>
  );
};

export default ResetPasswordPage;
