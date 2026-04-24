import axios from "axios"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
    withCredentials: true
})

// Inject token from localStorage as Bearer on every request
api.interceptors.request.use(config => {
    const token = localStorage.getItem("auth_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`Auth API Request: ${config.method.toUpperCase()} ${config.url}`, config.data);
    return config;
});

api.interceptors.response.use(
    response => {
        console.log(`Auth API Success: ${response.config.url}`, response.data);
        return response;
    },
    error => {
        const isSilentUnauthorizedGetMe =
            error.config?.silentAuthError &&
            error.config?.url?.includes("/auth/get-me") &&
            error.response?.status === 401;

        if (!isSilentUnauthorizedGetMe) {
            console.error(`Auth API Error: ${error.config?.url}`, error.response?.data || error.message);
        }
        return Promise.reject(error);
    }
);

export async function register(username, email, password) {
    const response = await api.post("/auth/register", { username, email, password })
    return response.data
}

export async function login(email, password) {
    const response = await api.post("/auth/login", { email, password })
    return response.data
}

export async function logout() {
    const response = await api.get("/auth/logout")
    return response.data
}

export async function upgradeToPro() {
    const response = await api.put("/auth/upgrade")
    return response.data
}

export async function getMe() {
    try {
        const response = await api.get("/auth/get-me", { silentAuthError: true })
        return response.data
    } catch {
        // Expected when not logged in — return undefined silently
        return undefined
    }
}