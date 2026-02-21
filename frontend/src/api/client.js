import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const client = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

function getToken() {
  return localStorage.getItem("fleetflow_token") || sessionStorage.getItem("fleetflow_token");
}

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("fleetflow_token");
      localStorage.removeItem("fleetflow_user");
      sessionStorage.removeItem("fleetflow_token");
      sessionStorage.removeItem("fleetflow_user");
      window.dispatchEvent(new Event("fleetflow_unauthorized"));
    }
    return Promise.reject(err);
  }
);

export default client;
