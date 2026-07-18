import axios from "axios";

const backendBaseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

let accessToken = "";
let refreshPromise = null;
let onSessionLost = () => {};

export function setAccessToken(token) {
  accessToken = token || "";
}

export function getAccessToken() {
  return accessToken;
}

export function clearAccessToken() {
  accessToken = "";
}

export function configureAuthHandlers({ onLostSession } = {}) {
  if (typeof onLostSession === "function") {
    onSessionLost = onLostSession;
  }
}

export const api = axios.create({
  baseURL: backendBaseUrl,
  withCredentials: true
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isUnauthorized = error.response?.status === 401;
    const isRefreshRequest = originalRequest?.url?.includes("/api/auth/refresh");
    const isAuthRequest =
      originalRequest?.url?.includes("/api/auth/login") ||
      originalRequest?.url?.includes("/api/auth/register");

    if (!isUnauthorized || !originalRequest || originalRequest._retry || isRefreshRequest || isAuthRequest) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!refreshPromise) {
      refreshPromise = api
        .post("/api/auth/refresh")
        .then((response) => {
          setAccessToken(response.data.token);
          return response.data.token;
        })
        .catch((refreshError) => {
          clearAccessToken();
          onSessionLost();
          return Promise.reject(refreshError);
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    try {
      const token = await refreshPromise;
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return api(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  }
);

export { backendBaseUrl };
