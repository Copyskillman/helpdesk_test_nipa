import type { AxiosResponse } from 'axios';

// Helper to create complete Axios response objects
export const createAxiosResponse = <T = any>(data: T, status = 200): AxiosResponse<T> => ({
  data,
  status,
  statusText: 'OK',
  headers: {},
  config: {
    headers: {} as any,
  } as any,
});

// Helper for error responses
export const createAxiosError = (status: number, data?: any) => ({
  response: {
    status,
    statusText: status === 404 ? 'Not Found' : 'Bad Request',
    data: data || { detail: 'Error occurred' },
    headers: {},
    config: {} as any,
  },
  request: {},
  message: `Request failed with status code ${status}`,
});