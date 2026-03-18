// Types partagés Front/Back — source unique de vérité

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string; // ISO string en transit JSON
}

export interface CreateUserDto {
  name: string;
  email: string;
  role?: 'USER' | 'ADMIN';
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
}