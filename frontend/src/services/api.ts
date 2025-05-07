import axios from 'axios';
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
// import { useAuth } from '../auth/AuthContext'; // Not used here, can be removed or kept for future direct use if pattern changes

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add the access token to headers
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // We can't use useAuth() hook directly here as this is not a React component/hook.
    // Instead, we'll retrieve the token from localStorage directly or via a non-hook getter if AuthContext provides one.
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    // Assert error.config exists and add _retry property.
    // AxiosError's config is AxiosRequestConfig, but when an error occurs,
    // it's often the InternalAxiosRequestConfig that was used.
    // We add _retry to the config object itself.
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!originalRequest) {
        return Promise.reject(error);
    }

    // Check if it's a 401 error and not a retry request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark as retried to prevent infinite loops

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post<{ access: string }>(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          const { access: newAccessToken } = response.data;

          localStorage.setItem('accessToken', newAccessToken);
          // Update the Authorization header for the original request
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }


          // It's tricky to update AuthContext state from here directly.
          // The AuthContext itself should ideally have a mechanism to re-verify auth
          // or the app should react to localStorage changes if necessary.
          // For now, we just update localStorage and retry the request.

          return api(originalRequest); // Retry the original request with the new token
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          // If refresh fails, logout the user (or redirect to login)
          // This logic might be better handled in AuthContext or a top-level component
          // by listening to an event or checking auth status.
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          // Potentially call a logout function from AuthContext if accessible,
          // or redirect. For now, just clearing tokens.
          // window.location.href = '/login'; // Example redirect
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token available, cannot refresh.
        console.error('No refresh token available for refresh attempt.');
        // Redirect to login or handle as appropriate
        // window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

// Types for TaskConfig
export interface TaskConfigData {
  name: string;
  task_type: string;
  ai_provider: string; // Consider making this an enum if choices are fixed
  ai_model_name: string;
  prompt_template: string;
  output_constraints?: Record<string, unknown> | string; // Allow object or string for flexibility, API expects object
  refinement_iterations?: number;
  target_email_recipients?: string;
  email_subject_template?: string;
  linked_credentials_id?: number | string | null; // ID of the linked credential
}

export interface TaskConfig extends TaskConfigData {
  id: number | string;
  user: number | string; // User ID
  created_at: string;
  updated_at: string;
  // If linked_credentials comes back as an object, adjust here
  linked_credentials?: { id: number | string; name: string; provider: string; } | null;
}

const TASK_CONFIGS_ENDPOINT = '/task-configs/';

// API functions for TaskConfigs

export const getTaskConfigs = async (): Promise<TaskConfig[]> => {
  const response = await api.get<TaskConfig[]>(TASK_CONFIGS_ENDPOINT);
  return response.data;
};

export const createTaskConfig = async (data: TaskConfigData): Promise<TaskConfig> => {
  // Ensure output_constraints is an object if it's a string
  const payload = { ...data };
  if (typeof data.output_constraints === 'string') {
    try {
      payload.output_constraints = JSON.parse(data.output_constraints);
    } catch (error) {
      console.error('Failed to parse output_constraints string to JSON:', error);
      // Decide handling: throw error, or send as is, or clear it
      // For now, let's re-throw or wrap it
      throw new Error('Invalid JSON format for output_constraints.');
    }
  }
  const response = await api.post<TaskConfig>(TASK_CONFIGS_ENDPOINT, payload);
  return response.data;
};

export const getTaskConfigById = async (id: number | string): Promise<TaskConfig> => {
  const response = await api.get<TaskConfig>(`${TASK_CONFIGS_ENDPOINT}${id}/`);
  return response.data;
};

export const updateTaskConfig = async (id: number | string, data: Partial<TaskConfigData>): Promise<TaskConfig> => {
  const payload = { ...data };
  if (typeof data.output_constraints === 'string' && data.output_constraints.trim() !== '') {
    try {
      payload.output_constraints = JSON.parse(data.output_constraints);
    } catch (error) {
      console.error('Failed to parse output_constraints string to JSON for update:', error);
      throw new Error('Invalid JSON format for output_constraints.');
    }
  } else if (data.output_constraints === '') { // Handle empty string case if needed
    payload.output_constraints = undefined; // Or null, depending on API expectation for clearing
  }
  const response = await api.put<TaskConfig>(`${TASK_CONFIGS_ENDPOINT}${id}/`, payload);
  return response.data;
};

export const deleteTaskConfig = async (id: number | string): Promise<void> => {
  await api.delete(`${TASK_CONFIGS_ENDPOINT}${id}/`);
};

// Types for Schedule
export type ScheduleFrequency = 'once' | 'daily' | 'weekly' | 'monthly' | 'cron';

export interface ScheduleData {
  task_config_id: number | string; // ID of the linked TaskConfig
  frequency: ScheduleFrequency;
  cron_expression?: string | null;
  next_run_at: string; // ISO 8601 datetime string
  is_active?: boolean;
}

export interface Schedule extends ScheduleData {
  id: number | string;
  user: number | string; // User ID, or could be a user object if API populates it
  task_config: TaskConfig; // Assuming the API returns the full TaskConfig object or its ID
  created_at: string;
  updated_at: string;
  last_run_at?: string | null;
  status?: string; // e.g., 'pending', 'running', 'completed', 'failed'
}

const SCHEDULES_ENDPOINT = '/schedules/';

// API functions for Schedules

export const getSchedules = async (): Promise<Schedule[]> => {
  const response = await api.get<Schedule[]>(SCHEDULES_ENDPOINT);
  return response.data;
};

export const createSchedule = async (data: ScheduleData): Promise<Schedule> => {
  const response = await api.post<Schedule>(SCHEDULES_ENDPOINT, data);
  return response.data;
};

export const getScheduleById = async (id: number | string): Promise<Schedule> => {
  const response = await api.get<Schedule>(`${SCHEDULES_ENDPOINT}${id}/`);
  return response.data;
};

export const updateSchedule = async (id: number | string, data: Partial<ScheduleData>): Promise<Schedule> => {
  const response = await api.put<Schedule>(`${SCHEDULES_ENDPOINT}${id}/`, data);
  return response.data;
};

export const deleteSchedule = async (id: number | string): Promise<void> => {
  await api.delete(`${SCHEDULES_ENDPOINT}${id}/`);
};

export default api;