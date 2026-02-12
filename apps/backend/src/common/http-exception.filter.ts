import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Global exception filter that catches all HttpExceptions
 * and returns a standardized ApiResponse error format.
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: string;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      const raw = (exceptionResponse as { message: string | string[] }).message;
      message = Array.isArray(raw) ? raw.join('; ') : raw;
    } else {
      message = 'Internal server error';
    }

    response.status(status).json({
      success: false,
      message,
      statusCode: status,
    });
  }
}
