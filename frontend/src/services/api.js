import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const API = axios.create({
    baseURL: BASE_URL
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const login = (username, password) => {
    const params = new URLSearchParams();
    params.append("username", username);
    params.append("password", password);
    return API.post("/auth/login", params, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
};

export const signup = (email, username, password) => {
    return API.post("/auth/signup", { email, username, password });
};

export default API;