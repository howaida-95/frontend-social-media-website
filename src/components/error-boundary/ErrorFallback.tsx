interface ErrorFallbackProps {
  onRetry: () => void;
  title?: string;
  message?: string;
}

const ErrorFallback = ({
  onRetry,
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
}: ErrorFallbackProps) => {
  return (
    <div role="alert">
      <h2>{title}</h2>

      <p>{message}</p>

      <button onClick={onRetry}>
        Try again
      </button>
    </div>
  );
};

export default ErrorFallback;