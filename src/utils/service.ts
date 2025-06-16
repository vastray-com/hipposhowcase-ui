import { ls, LS_KEY } from '@/utils/localStorage.ts'
import axios from 'axios'

const service = axios.create({
  baseURL: import.meta.env.DEV ? '/api' : import.meta.env.VITE_API_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

service.interceptors.request.use(
  (config) => {
    const token = ls.get(LS_KEY.ACCESS_TOKEN)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  async (error) => {
    // Handle request error
    return Promise.reject(error)
  },
)

service.interceptors.response.use(
  (response) => {
    // Handle response data
    return response.data
  },
  async (error) => {
    // Handle response error
    return Promise.reject(error)
  },
)

export default service
