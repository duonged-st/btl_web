// 1. CẤU HÌNH CƠ BẢN (CONFIGURATION)
const API_BASE_URL = 'http://localhost:3000/api';
// 2. HÀM LÕI XỬ LÝ FETCH (CORE FETCH WRAPPER)
async function fetchAPI(endpoint, method = 'GET', body = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    if (body) {
        options.body = JSON.stringify(body);
    }
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Lỗi xử lý từ máy chủ!');
        }
        return { success: true, data: data };
    } catch (error) {
        console.error(`[Lỗi API] ${method} ${endpoint}:`, error);
        return { success: false, error: error.message };
    }
}
// 3. CÁC HÀM GIAO TIẾP NGHIỆP VỤ (API ENDPOINTS)
const API = {
    // --- CHỨC NĂNG 1: TRANG CHỦ DANH MỤC ---
    getCourses: async () => await fetchAPI('/courses'),
    // --- CHỨC NĂNG 2: CHI TIẾT KHÓA HỌC & GHI DANH ---
    getCourseDetail: async (courseId) => await fetchAPI(`/courses/${courseId}`),
    enrollCourse: async (userId, courseId) => await fetchAPI('/enroll', 'POST', {
        user_id: userId,
        course_id: courseId
    }),
    // --- CHỨC NĂNG 3: KHÔNG GIAN HỌC TẬP ---
    getLessons: async (courseId) => await fetchAPI(`/courses/${courseId}/lessons`, 'GET'),
    getLessonDetail: async (lessonId) => await fetchAPI(`/lessons/${lessonId}`, 'GET'),
    // --- CHỨC NĂNG 4: NGƯỜI DÙNG & HỒ SƠ ---
    getUserProfile: async (userId) => await fetchAPI(`/users/${userId}`),
    getUserEnrolledCourses: async (userId) => await fetchAPI(`/enroll/user/${userId}`)
};
