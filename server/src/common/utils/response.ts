import type { Response } from 'express';

type ApiResponse<T> = {
  success: true;
  data: T;
};

export const sendSuccess = <T>(res: Response, data: T, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    data,
  } satisfies ApiResponse<T>);
};
