import { config } from '../config';
import type { HealthCheckResponse } from '../types/api';

/**
 * Returns basic liveness information. Deliberately does not touch the
 * database — this endpoint should stay fast and dependency-free so it
 * can be used as a simple uptime/liveness probe.
 */
export function getHealthStatus(): HealthCheckResponse {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.env,
  };
}
