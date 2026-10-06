// this will help connect backend with frontend
// Axios allows React to make HTTP requests such as: GET, POST, PUT, DELETE

import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000"
});

export default api;