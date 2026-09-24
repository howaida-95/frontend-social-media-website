/*
this hooks used for all auth forms (SignIn, SignUp, Forgot, Reset)
It wraps react-hook-form + Zod so every auth form (SignIn, SignUp, Forgot, Reset) 
doesn’t repeat the same setup.
What it does:
- Validation -> zodResolver(schema)
- Field wiring -> register, errors 
- submit loading -> isSubmitting
- API failures -> catch → getApiError → apiError
*/

import { useState } from 'react';
import {
  useForm,
  type DefaultValues,
  type FieldValues,
  type Resolver,
  type SubmitHandler,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { getApiError } from '@/utils/error';

type UseAppFormOptions<TValues extends FieldValues> = {
  schema: z.ZodType<TValues, TValues>;
  defaultValues: DefaultValues<TValues>;
};

/**
 * Shared form helper for auth screens:
 * - Zod validation via react-hook-form
 * - field errors
 * - submit loading
 * - API error string (from getApiError)
 *
 * Auth actions (login/register) stay in useAuth / the form component.
 */
export function useAppForm<TValues extends FieldValues>({
  schema,
  defaultValues,
}: UseAppFormOptions<TValues>) {
  const [apiError, setApiError] = useState('');

  const {
    register, // Connect an input to the form
    handleSubmit, // Run validation, then your submit fn
    reset, // Reset the form to its initial state
    formState: { errors, isSubmitting }, // Field error messages & Disable button while submitting
  } = useForm<TValues>({
    // Validate with a schema before submit
    resolver: zodResolver(schema) as Resolver<TValues>,
    defaultValues, // Initial values for the form
  });

  const submitHandler = (onValid: SubmitHandler<TValues>) =>
    handleSubmit(async (data) => {
      setApiError('');
      try {
        await onValid(data);
      } catch (error) {
        setApiError(getApiError(error).message);
      }
    });

  return {
    register,
    handleSubmit,
    submitHandler,
    errors,
    isSubmitting,
    apiError,
    setApiError,
    reset,
  };
}
