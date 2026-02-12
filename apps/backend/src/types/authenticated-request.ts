import { Request } from 'express';

/**
 * Extended Express Request with authenticated user payload.
 * Used across all controllers that require JWT authentication.
 */
export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
  };
}
