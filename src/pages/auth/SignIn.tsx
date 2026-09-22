import { useState } from 'react';
import { useAuth } from '@/features/auth/context/useAuth';
import { getApiError } from '@/utils/error';

const SignIn = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');

      const user = await login({
        email: 'test@example.com',
        password: '123456',
      });

      console.log('User:', user);
    } catch (err) {
      const apiError = getApiError(err);
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <p>{error}</p>}

      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </div>
  );
};

export default SignIn;
