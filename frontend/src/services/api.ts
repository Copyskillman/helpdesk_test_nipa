import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

const API_BASE_URL = 'http://localhost:8000';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.api.interceptors.request.use(
      (config) => {
        console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
        return config;
      },
      (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`Response from ${response.config.url}:`, response.status);
        return response;
      },
      (error: AxiosError) => {
        console.error('Response error:', error);
        
        if (error.response) {
          switch (error.response.status) {
            case 400:
              console.error('Bad Request:', error.response.data);
              break;
            case 404:
              console.error('Resource not found');
              break;
            case 500:
              console.error('Server error');
              break;
            default:
              console.error('Unknown error occurred');
          }
        } else if (error.request) {
          console.error('No response received:', error.request);
        } else {
          console.error('Request setup error:', error.message);
        }
        
        return Promise.reject(error);
      }
    );
  }

  public get<T = any>(url: string, params?: Record<string, any>): Promise<AxiosResponse<T>> {
    return this.api.get(url, { params });
  }

  public post<T = any>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.api.post(url, data);
  }

  public put<T = any>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.api.put(url, data);
  }

  public patch<T = any>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.api.patch(url, data);
  }

  public delete<T = any>(url: string): Promise<AxiosResponse<T>> {
    return this.api.delete(url);
  }
}

export const apiService = new ApiService();
export default apiService;