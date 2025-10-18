import { useState, useEffect } from 'react';
import {
  useForm,
  type UseFormReturn,
  type FieldValues,
  type DefaultValues
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodType, ZodTypeAny } from 'zod';

interface UseFormValidationOptions<T extends FieldValues> {
  // Accept either a properly typed Zod schema or a generic ZodTypeAny for max compatibility
  schema: ZodType<T, any, any> | ZodTypeAny;
  // Use react-hook-form's DefaultValues<T> type so defaultValues matches RHF expectation
  defaultValues?: DefaultValues<T>;
  mode?: 'onChange' | 'onBlur' | 'onSubmit';
}

type UseFormValidationReturn<T extends FieldValues> = UseFormReturn<T> & {
  isValidating: boolean;
  validateField: (fieldName: keyof T, value: any) => Promise<boolean>;
  getFieldError: (fieldName: keyof T) => string | undefined;
  hasFieldError: (fieldName: keyof T) => boolean;
  isFormValid: boolean;
  hasChanges: boolean;
};

export const useFormValidation = <T extends FieldValues>({
  schema,
  defaultValues,
  mode = 'onChange'
}: UseFormValidationOptions<T>): UseFormValidationReturn<T> => {
  const [isValidating, setIsValidating] = useState(false);

  const form = useForm<T>({
    // zodResolver's type expectations vary by versions. Cast to `any` at this boundary
    // so TypeScript doesn't error when zod's input/output generics differ from RHF's FieldValues.
    resolver: zodResolver(schema as any) as any,
    // ensure defaultValues has the exact type RHF expects
    defaultValues: defaultValues as DefaultValues<T> | undefined,
    mode
  });

  const { formState: { errors, isValid, isDirty } } = form;

  // Track validation state
  useEffect(() => {
    setIsValidating(form.formState.isValidating);
  }, [form.formState.isValidating]);

  const validateField = async (fieldName: keyof T, value: any) => {
    try {
      // Work with schema in a defensive way — cast to `any` for runtime calls
      const anySchema: any = schema;
      // If schema supports .pick and parseAsync (Zod >= 3), use pick to narrow
      if (anySchema?.pick && anySchema?.parseAsync) {
        await anySchema.pick({ [fieldName as string]: true }).parseAsync({ [fieldName as string]: value });
      } else if (anySchema?.parseAsync) {
        await anySchema.parseAsync({ [fieldName as string]: value });
      } else {
        // fallback to sync parse if parseAsync not present
        anySchema.parse({ [fieldName as string]: value });
      }
      return true;
    } catch {
      return false;
    }
  };

  const getFieldError = (fieldName: keyof T) => {
    // errors is a FieldErrors<T>, index access can be typed as unknown; cast to any to get message
    return (errors[fieldName as any]?.message as string) || undefined;
  };

  const hasFieldError = (fieldName: keyof T) => {
    return !!errors[fieldName as any];
  };

  // Spread form but cast to unknown first to avoid TypeScript complaining about subtle generic mismatches
  const api = {
    ...(form as unknown as UseFormReturn<T>),
    isValidating,
    validateField,
    getFieldError,
    hasFieldError,
    isFormValid: isValid,
    hasChanges: isDirty
  } as UseFormValidationReturn<T>;

  return api;
};
