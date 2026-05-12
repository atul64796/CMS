import axios from "axios";

// ================= USER API =================
const API = axios.create({
  baseURL: "http://localhost:7500/cms/v1/user",
  withCredentials: true
});

// ================= ASSIGNMENT API =================
const assignmentAPI = axios.create({
  baseURL: "http://localhost:7500/cms/v1/assignment",
  withCredentials: true
});

// ================= USER APIs =================

// Register
export const registerUser = (data) =>
  API.post("/register", data, {
    headers: { "Content-Type": "multipart/form-data" }
  });

// Login
export const loginUser = (data) => API.post("/loginUser", data);

// Logout
export const logoutUser = () => API.post("/logoutUser");

// Profile
export const getUserProfile = () => API.get("/getuser");

// Update account
export const updateAccount = (data) => API.patch("/updateAccount", data);

// Update password
export const updatePassword = (data) => API.patch("/updatePassword", data);

// Update avatar
export const updateAvatar = (formData) =>
  API.patch("/updateAvatar", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });


// ================= ASSIGNMENT APIs =================

// Create assignment
export const createAssignment = (data) =>
  assignmentAPI.post("/create-assignment", data);

// Update assignment
export const updateAssignment = (assignmentId, data) =>
  assignmentAPI.put(
    `/update-assignment/${assignmentId}`,
    data
  );

// Delete assignment
export const deleteAssignment = (assignmentId) =>
  assignmentAPI.delete(
    `/delete-assignment/${assignmentId}`
  );


export const getMyAssignments = () =>
  assignmentAPI.get("/my-assignments");

// Get submissions
export const getSubmissions = (assignmentId) =>
  assignmentAPI.get(`/submission/${assignmentId}`);


// ================= NOTIFICATION API =================
const notificationAPI = axios.create({
  baseURL: "http://localhost:7500/cms/v1/assignment",
  withCredentials: true
});

// Get notifications
export const getNotifications = () =>
  notificationAPI.get("/notifications");

// submit assignment
export const submitAssignmentAPI = (formData) =>
  assignmentAPI.post("/submit-assignment", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

  

// Download zip
export const downloadZip = (assignmentId) =>
  assignmentAPI.get(`/download-zip/${assignmentId}`, {
    responseType: "blob"
  });




// Admin Api

// ================= ADMIN API =================
const adminAPI = axios.create({
  baseURL: "http://localhost:7500/cms/v1/admin",
  withCredentials: true
});

// Admin profile
export const getAdminProfile = () => adminAPI.get("/me");

// Activity logs
export const getActivityLogsAPI = () => adminAPI.get("/");

// Teachers
export const getTeachersAPI = () => adminAPI.get("/users/teacher");

// Students
export const getStudentsAPI = () => adminAPI.get("/users/student");

// Ban / Unban
export const toggleUserBanAPI = (userId) =>
  adminAPI.patch(`/users/${userId}/ban`);

// Toggle Status
export const toggleUserStatusAPI = (userId) =>
  adminAPI.patch(`/users/${userId}/status`);

// services/api.js
export const verifyUserAPI = (userId) => adminAPI.patch(`/verify/${userId}`);

export default API;