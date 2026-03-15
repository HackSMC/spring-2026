import { tokenInterceptor } from "@/utils/axios-interceptors";
import axios, { InternalAxiosRequestConfig } from "axios";

export const outreachClient = axios.create({
    baseURL:
        process.env.NEXT_PUBLIC_OUTREACH_SERVICE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

outreachClient.interceptors.request.use(
    tokenInterceptor,
    (error: Error) => Promise.reject(error)
);
