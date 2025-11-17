import { isAxiosError } from 'axios';

export type ApiErrorResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};

export const resolveApiErrorMessage = (
  cause: unknown,
  fallback = 'Unable to complete the request'
): string => {
  if (isAxiosError<ApiErrorResponse>(cause)) {
    const responseMessage = cause.response?.data?.message;
    if (responseMessage) {
      return responseMessage;
    }

    const validationErrors = cause.response?.data?.errors;
    if (validationErrors) {
      const firstEntry = Object.values(validationErrors)[0];
      if (Array.isArray(firstEntry) && firstEntry.length > 0) {
        return firstEntry[0];
      }
    }
  }

  if (cause instanceof Error) {
    return cause.message;
  }

  return fallback;
};
