import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

// ================= USER API =================
const API = axios.create({
  baseURL: `${BASE_URL}/cms/v1/user`,
  withCredentials: true
});

// ================= ASSIGNMENT API =================
const assignmentAPI = axios.create({
  baseURL: `${BASE_URL}/cms/v1/assignment`,
  withCredentials: true
});

// ================= NOTIFICATION API =================
const notificationAPI = axios.create({
  baseURL: `${BASE_URL}/cms/v1/assignment`,
  withCredentials: true
});

// ================= ADMIN API =================
const adminAPI = axios.create({
  baseURL: `${BASE_URL}/cms/v1/admin`,
  withCredentials: true
});