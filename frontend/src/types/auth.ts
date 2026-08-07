export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponseData {
  user: User;
  token: string;
}

export interface RegisterResponseData {
  user: User;
}

export interface MeResponseData {
  user: User;
}