import axios from "axios";

const adminAPI = axios.create({
  baseURL: "http://localhost:6500/cms/v1/admin",
  withCredentials: true
});

export const getAdminProfile = () => adminAPI.get("/me");
export const getActivityLogsAPI = () => adminAPI.get("/");
export const getTeachersAPI = () => adminAPI.get("/users/teacher");
export const getStudentsAPI = () => adminAPI.get("/users/student");

export const toggleUserBanAPI = (id) => adminAPI.patch(`/users/${id}/ban`);
export const toggleUserStatusAPI = (id) => adminAPI.patch(`/users/${id}/status`);

export default adminAPI;