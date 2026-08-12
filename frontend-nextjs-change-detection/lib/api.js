import axios from "axios";

const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL}/`,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

let isRefreshing = false;
let pendingQueue = [];

function processQueue(error, token = null) {
    pendingQueue.forEach((p) => {
        if (error) {
            p.reject(error);
        } else {
            p.resolve(token);
        }
    });
    pendingQueue = [];
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                pendingQueue.push({ resolve, reject });
            }).then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return api(originalRequest);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = localStorage.getItem("refresh");

        if (!refreshToken) {
            isRefreshing = false;
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            window.location.href = "/login";
            return Promise.reject(error);
        }

        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/token/refresh/`, {
                refresh: refreshToken,
            });

            const newAccess = res.data.access;
            localStorage.setItem("access", newAccess);

            processQueue(null, newAccess);
            isRefreshing = false;

            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
            return api(originalRequest);
        } catch (refreshError) {
    processQueue(refreshError, null);
    isRefreshing = false;
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.setItem(
        "logout_notice",
        "Sesi kamu telah berakhir — kemungkinan karena login dari perangkat lain, atau sesi sudah kedaluwarsa. Silakan login kembali."
    );
    window.location.href = "/login";
    return Promise.reject(refreshError);
}
    }
);

export default api;