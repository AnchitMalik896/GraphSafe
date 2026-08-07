export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiValidationError {
  path: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: ApiValidationError[];
}