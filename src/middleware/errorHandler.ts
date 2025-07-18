import { Request, Response, NextFunction } from 'express';

export interface CustomError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // 개발 환경에서는 스택 트레이스 포함
  const errorResponse = {
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  };

  // 에러 로깅
  // eslint-disable-next-line no-console
  console.error(`Error ${statusCode}: ${message}`);
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.error(err.stack);
  }

  res.status(statusCode).json(errorResponse);
};
