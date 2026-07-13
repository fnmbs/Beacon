import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Track if we're currently refreshing the token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  isRefreshing = false;
  failedQueue = [];
};

// JWT interceptor - Add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - Handle 401s and token refresh
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    // If 401 and not already refreshing, try to refresh token
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        return api
          .post("/auth/refresh-token", { refreshToken })
          .then((res) => {
            const { token: newAccessToken, refreshToken: newRefreshToken } =
              res.data.data;
            localStorage.setItem("token", newAccessToken);
            localStorage.setItem("refreshToken", newRefreshToken);
            api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            processQueue(null, newAccessToken);
            return api(originalRequest);
          })
          .catch((err) => {
            processQueue(err, null);
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            window.location.href = "/login";
            return Promise.reject(err);
          });
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

// Auth endpoints
export const authAPI = {
  register: (email, password, fullName) =>
    api.post("/auth/register", { email, password, fullName }),
  login: (email, password) => api.post("/auth/login", { email, password }),
  getCurrentUser: () => api.get("/auth/me"),
  logout: (refreshToken) => api.post("/auth/logout", { refreshToken }),
  refreshToken: (refreshToken) =>
    api.post("/auth/refresh-token", { refreshToken }),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, newPassword) =>
    api.post("/auth/reset-password", { token, newPassword }),
  verifyEmail: (token) => api.post("/auth/verify-email", { token }),
  resendVerificationEmail: () => api.post("/auth/resend-verification-email"),
};

// Admin auth endpoints
export const adminAuthAPI = {
  register: (email, password, fullName, privileges = []) =>
    api.post(`/admin/auth/register`, { email, password, fullName, privileges }),
  login: (email, password) =>
    api.post(`/admin/auth/login`, { email, password }),
  getCurrentAdmin: () => api.get(`/admin/auth/me`),
};

// Locations
export const getLocations = (page = 1, limit = 6) =>
  api.get("/locations", {
    params: { page, limit },
  });

export const searchLocations = (name) =>
  api.get(`/locations/search?name=${name}`);

export const addLocation = (data) => api.post("/locations", data);
export const deleteLocation = (id) => api.delete(`/locations/${id}`);
export const getLocationById = (id) => api.get(`/locations/${id}`);

// Paths
export const getPaths = (page = 1, limit = 5) =>
  api.get("/paths", {
    params: { page, limit },
  });
export const addPath = (data) => api.post("/paths", data);
export const deletePath = (id) => api.delete(`/paths/${id}`);
export const getPathById = (id) => api.get(`/paths/${id}`);

// Navigation
export const navigateRoute = (fromId, toId) =>
  api.get(`/navigation?from=${fromId}&to=${toId}`);

// Campus boundary
export const getCampusBoundary = () => api.get("/campus/boundary");
export const updateCampusBoundary = (data) => api.put("/campus/boundary", data);

// Timetable
export const getAllTimetable = () => api.get("/timetable");
export const createTimetableEntry = (data) => api.post("/timetable", data);
export const deleteTimetableEntry = (id) => api.delete(`/timetable/${id}`);
export const updateTimetableEntry = (id, data) => api.put(`/timetable/${id}`, data);

export default api;

//lecturers
export const getAllLecturers = (page = 1, limit = 10) =>
  api.get("/lecturers", {
    params: { page, limit },
  });

export const getLecturersByDepartment = (departmentId, page = 1, limit = 10) =>
  api.get(`/departments/${departmentId}/lecturers`, {
    params: { page, limit },
  });

export const getLecturersTeachingCourse = (courseId) =>
  api.get(`/courses/${courseId}/lecturers`);

export const getLecturersByFaculty = (facultyId, page = 1, limit = 10) =>
  api.get(`/faculties/${facultyId}/lecturers`, {
    params: { page, limit },
  });

export const searchLecturers = (name) =>
  api.get("/lecturers/search", { params: { name } });

export const deleteLecturer = (id) => api.delete(`/lecturers/${id}`);

export const updateLecturer = (id, form) => api.put(`/lecturers/${id}`, form);

//faculties
export const getAllFaculties = (page = 1, limit = 10) =>
  api.get("/faculties", {
    params: { page, limit },
  });

export const getFacultyById = (id) => api.get(`/faculties/${id}`);

export const createFaculty = (data) => api.post("/faculties", data);

export const updateFaculty = (id, data) => api.put(`/faculties/${id}`, data);

export const deleteFaculty = (id) => api.delete(`/faculties/${id}`);

export const searchFaculties = (query) =>
  api.get("/faculties/search", { params: { query } });

//departments
export const getDepartmentsByFaculty = (facultyId) =>
  api.get(`/faculties/${facultyId}/departments`);

export const getDepartmentsByFacultyFilter = (
  facultyId,
  page = 1,
  limit = 10,
) =>
  api.get(`/departments/faculty/${facultyId}`, {
    params: { page, limit },
  });

export const getAllDepartments = (page = 1, limit = 10) =>
  api.get("/departments", {
    params: { page, limit },
  });

export const getDepartmentById = (id) => api.get(`/departments/${id}`);

export const createDepartment = (data) => api.post("/departments", data);

export const updateDepartment = (id, data) =>
  api.put(`/departments/${id}`, data);

export const deleteDepartment = (id) => api.delete(`/departments/${id}`);

export const searchDepartments = (query) =>
  api.get("/departments/search", { params: { query } });

//courses
export const getAllCourses = (page = 1, limit = 10) =>
  api.get("/courses", {
    params: { page, limit },
  });

export const getCoursesByDepartment = (departmentId, page = 1, limit = 10) =>
  api.get(`/courses/department/${departmentId}`, {
    params: { page, limit },
  });

export const searchCourses = (query) =>
  api.get("/courses/search", { params: { query } });

export const createCourse = (data) => api.post("/courses", data);

export const updateCourse = (id, data) => api.put(`/courses/${id}`, data);

export const deleteCourse = (id) => api.delete(`/courses/${id}`);

export const assignLecturersToCourse = (courseId, lecturerIds) =>
  api.post(`/courses/${courseId}/lecturers`, { lecturer_ids: lecturerIds });
