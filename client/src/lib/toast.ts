import toast, { type ToastOptions } from 'react-hot-toast';

type ToastMessage<TData = unknown> = string | ((data: TData) => string);
type ToastErrorMessage = string | ((error: unknown) => string);

type ToastPromiseMessages<TData> = {
  loading: string;
  success: ToastMessage<TData>;
  error: ToastErrorMessage;
};

const resolveMessage = <TData>(message: ToastMessage<TData>, data: TData) => {
  return typeof message === 'function' ? message(data) : message;
};

export const getErrorMessage = (error: unknown, fallback = 'Something went wrong.') => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export const appToast = {
  message: (message: string, options?: ToastOptions) => toast(message, options),
  success: (message: string, options?: ToastOptions) => toast.success(message, options),
  error: (message: string, options?: ToastOptions) => toast.error(message, options),
  loading: (message: string, options?: ToastOptions) => toast.loading(message, options),
  dismiss: (id?: string) => toast.dismiss(id),
};

export const notifyAsync = async <TData>(
  promise: Promise<TData>,
  messages: ToastPromiseMessages<TData>
) => {
  const toastId = appToast.loading(messages.loading);

  try {
    const data = await promise;
    appToast.success(resolveMessage(messages.success, data), { id: toastId });
    return data;
  } catch (error) {
    appToast.error(
      typeof messages.error === 'function' ? messages.error(error) : getErrorMessage(error, messages.error),
      { id: toastId }
    );
    throw error;
  }
};
