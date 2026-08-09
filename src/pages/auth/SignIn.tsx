import { useState } from 'react';
import { login } from '@/features/auth/services/auth.service';
import { getApiError } from '@/utils/error';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await login({
        email: 'test@example.com',
        password: '123456',
      });

     /*
     localStorage.setItem(
        'accessToken',
        response.accessToken
      );
    */
      console.log('User:', response.user);
    } catch (error) {
      const apiError = getApiError(error);

      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <p>{error}</p>}

      <button
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </div>
  );
};

export default Login;