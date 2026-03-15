import { tokenInterceptor } from '@/utils/axios-interceptors';
import axios, { InternalAxiosRequestConfig } from 'axios';

export const applyClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APPLY_SERVICE_URL
});

applyClient.interceptors.request.use(
  tokenInterceptor,
  (error: Error) => Promise.reject(error)
);