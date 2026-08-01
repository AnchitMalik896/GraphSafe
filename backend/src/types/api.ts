export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: unknown[];
}

export interface HealthCheckResponse {
  status: 'ok';
  timestamp: string;
  environment: string;
}
