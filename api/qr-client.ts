import axios, { InternalAxiosRequestConfig } from 'axios'
import { tokenInterceptor } from '@/utils/axios-interceptors'

export const qrClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_QR_SERVICE_URL
})

qrClient.interceptors.request.use(
  tokenInterceptor,
  (error: Error) => Promise.reject(error)
);