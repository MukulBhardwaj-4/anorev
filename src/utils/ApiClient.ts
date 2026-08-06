import axios from "axios";

export const api = axios.create({
    baseURL: "/api",
});


api.interceptors.response.use(
    (response) => {
        response.data = response.data?.data;
        return response;
    },
    (error) => {

        const message = error.response?.data?.message || "Something went wrong";
        error.message = message;
        return Promise.reject(error);
    }
);