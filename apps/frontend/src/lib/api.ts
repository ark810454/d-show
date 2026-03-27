import axios from "axios";

const LOCAL_API_URL = "http://127.0.0.1:4000/api";

function getApiBaseUrl() {
  if (typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname)) {
    return LOCAL_API_URL;
  }

  return process.env.NEXT_PUBLIC_API_URL ?? LOCAL_API_URL;
}

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const rawStore = window.localStorage.getItem("dshow-app-store");
    const parsed = rawStore ? JSON.parse(rawStore)?.state : null;
    const token = parsed?.accessToken ?? null;
    const companyId = parsed?.activeContext?.companyId ?? null;
    const activityId = parsed?.activeContext?.activityId ?? null;
    const skipActivityScope = config.headers["x-skip-activity-scope"] === "true";
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (companyId && !config.headers["x-company-id"]) {
      config.headers["x-company-id"] = companyId;
    }
    if (activityId && !skipActivityScope && !config.headers["x-activity-id"]) {
      config.headers["x-activity-id"] = activityId;
    }
    if (skipActivityScope) {
      delete config.headers["x-skip-activity-scope"];
    }
  }
  return config;
});
