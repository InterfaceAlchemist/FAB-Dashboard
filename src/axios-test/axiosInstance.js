import axios from "axios";
import router from "../router.js";

const api = axios.create({
  baseURL: "https://bcda.itbsstudio.com/BCDA/api",
  headers: {
    "Content-Type": "application/json",
    "X-Authorization": import.meta.env.VITE_API_TOKEN,
  }
});

// Intercept every response
api.interceptors.response.use(
  (response) => response, // if success, just return it normally

  (error) => {
    console.log("Interceptor error status:", error.response?.status);
    // If the server returns 401 Unauthorized — token expired
    if (error.response?.status === 401) {
      localStorage.removeItem("isLoggedIn"); // clear login flag
      router.push("/login"); // redirect to login page
    }
    return Promise.reject(error);
  }
);

export default api;