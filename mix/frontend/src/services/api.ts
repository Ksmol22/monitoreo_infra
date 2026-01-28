import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login or refresh token
      localStorage.removeItem('access_token')
    }
    return Promise.reject(error)
  }
)

export default api

// System endpoints
export const systemsApi = {
  getAll: () => api.get('/v1/systems/'),
  getById: (id: number) => api.get(`/v1/systems/${id}/`),
  create: (data: any) => api.post('/v1/systems/', data),
  update: (id: number, data: any) => api.patch(`/v1/systems/${id}/`, data),
  delete: (id: number) => api.delete(`/v1/systems/${id}/`),
  getStats: () => api.get('/v1/systems/stats/'),
}

// Metrics endpoints
export const metricsApi = {
  getAll: (params?: any) => api.get('/v1/metrics/', { params }),
  getLatest: () => api.get('/v1/metrics/latest/'),
  create: (data: any) => api.post('/v1/metrics/', data),
  bulkCreate: (data: any[]) => api.post('/v1/metrics/bulk/', data),
}

// Logs endpoints
export const logsApi = {
  getAll: (params?: any) => api.get('/v1/logs/', { params }),
  getRecent: () => api.get('/v1/logs/recent/'),
  create: (data: any) => api.post('/v1/logs/', data),
}

// Dashboard endpoint
export const dashboardApi = {
  getStats: () => api.get('/v1/dashboard/'),
}
