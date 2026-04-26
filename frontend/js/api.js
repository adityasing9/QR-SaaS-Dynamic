const API_BASE_URL = "http://localhost:8000";

const api = {
    async fetch(endpoint, options = {}) {
        const token = localStorage.getItem("token");
        const headers = {
            "Content-Type": "application/json",
            ...options.headers,
        };

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (response.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "index.html";
            return;
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Something went wrong");
        }

        return response.json();
    },

    auth: {
        async login(email, password) {
            const formData = new FormData();
            formData.append("username", email);
            formData.append("password", password);

            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Login failed");
            }

            const data = await response.json();
            localStorage.setItem("token", data.access_token);
            return data;
        },

        async signup(email, password) {
            return api.fetch("/auth/signup", {
                method: "POST",
                body: JSON.stringify({ email, password }),
            });
        },
        
        logout() {
            localStorage.removeItem("token");
            window.location.href = "index.html";
        }
    },

    links: {
        async getAll() {
            return api.fetch("/links/");
        },
        async create(data) {
            return api.fetch("/links/", {
                method: "POST",
                body: JSON.stringify(data),
            });
        },
        async delete(id) {
            return api.fetch(`/links/${id}`, {
                method: "DELETE",
            });
        },
        async getQR(id) {
            return api.fetch(`/links/${id}/qr`);
        }
    },

    analytics: {
        async get(id) {
            return api.fetch(`/analytics/${id}`);
        }
    }
};
