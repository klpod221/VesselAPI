/**
 * JWT secret from environment variable.
 * Falls back to a dev-only key in non-production environments.
 */
export class AuthConstants {
  static readonly secret: string = (() => {
    const secret = process.env.JWT_SECRET;
    if (!secret && process.env.NODE_ENV === 'production') {
      throw new Error(
        'JWT_SECRET environment variable is required in production',
      );
    }
    return secret || 'vessel-dev-secret-key';
  })();
}
