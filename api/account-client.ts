import { tokenInterceptor } from '@/utils/axios-interceptors';
import axios, { InternalAxiosRequestConfig } from 'axios';

// Create the axios instance
export const accountClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_ACCOUNT_SERVICE_URL
});

// Add a request interceptor to attach the access token
accountClient.interceptors.request.use(
  tokenInterceptor,
  (error: Error) => Promise.reject(error)
);