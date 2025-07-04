import axios from 'axios' ;

const BACKEND_URL = 'https://yw8wo8go8ow4g8c0c48g084w.apps.swecha.org:5002';

const publicAxios = axios.create({
    baseURL: BACKEND_URL,
});

const privateAxios = axios.create({
    baseURL: BACKEND_URL,
    });

privateAxios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error)=> Promise.reject(error)
);

export { publicAxios, privateAxios };