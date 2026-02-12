import { getApiClient } from "@vessel/network";

interface AuthResponseData {
  access_token: string;
  user: {
    id: string;
    email: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface SafeUser {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAuthService {
  login(email: string, password: string): Promise<AuthResponseData>;
  register(email: string, password: string): Promise<SafeUser>;
}

/**
 * Service for authentication API calls.
 * Uses the singleton ApiClient — no manual token passing.
 */
class AuthService implements IAuthService {
  async login(email: string, password: string): Promise<AuthResponseData> {
    const client = getApiClient();
    const response = await client.post<AuthResponseData>("/auth/login", {
      email,
      password,
    });
    return response.data;
  }

  async register(email: string, password: string): Promise<SafeUser> {
    const client = getApiClient();
    const response = await client.post<SafeUser>("/auth/register", {
      email,
      password,
    });
    return response.data;
  }
}

export const authService = new AuthService();
