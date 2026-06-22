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
// =============================================================
// PHẦN BỔ SUNG: KHÓA HỌC MIỄN PHÍ "THIẾT KẾ VÀ LẬP TRÌNH WEB"
// Giữ nguyên toàn bộ API cũ, chỉ bổ sung dữ liệu dự phòng phía frontend.
// Khi backend đã có khóa học cùng ID, dữ liệu backend vẫn được ưu tiên.
// =============================================================
const WEB_DESIGN_COURSE_ID = 'web-design-programming-free';

const WEB_DESIGN_COURSE = {
    id: WEB_DESIGN_COURSE_ID,
    title: 'Thiết kế và lập trình web',
    description: 'Khóa học miễn phí giúp người mới học cách xây dựng một website hoàn chỉnh từ HTML, CSS và JavaScript. Nội dung đi từ cấu trúc trang web, thiết kế giao diện responsive đến xử lý tương tác và hoàn thiện sản phẩm cuối khóa.',
    price: 0,
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200'
};

const WEB_DESIGN_LESSONS = [
    {
        id: 'web-lesson-1',
        course_id: WEB_DESIGN_COURSE_ID,
        lesson_order: 1,
        title: 'Tổng quan về thiết kế và lập trình web',
        video_url: 'https://www.w3schools.com/html/mov_bbb.mp4'
    },
    {
        id: 'web-lesson-2',
        course_id: WEB_DESIGN_COURSE_ID,
        lesson_order: 2,
        title: 'Xây dựng cấu trúc trang web bằng HTML',
        video_url: 'https://www.w3schools.com/html/movie.mp4'
    },
    {
        id: 'web-lesson-3',
        course_id: WEB_DESIGN_COURSE_ID,
        lesson_order: 3,
        title: 'Trang trí giao diện bằng CSS',
        video_url: 'https://www.w3schools.com/html/mov_bbb.mp4'
    },
    {
        id: 'web-lesson-4',
        course_id: WEB_DESIGN_COURSE_ID,
        lesson_order: 4,
        title: 'Thiết kế responsive cho điện thoại và máy tính',
        video_url: 'https://www.w3schools.com/html/movie.mp4'
    },
    {
        id: 'web-lesson-5',
        course_id: WEB_DESIGN_COURSE_ID,
        lesson_order: 5,
        title: 'Tạo tương tác bằng JavaScript',
        video_url: 'https://www.w3schools.com/html/mov_bbb.mp4'
    }
];

// Lưu lại các hàm API cũ để không làm mất chức năng backend hiện có.
const originalGetCourses = API.getCourses;
const originalGetCourseDetail = API.getCourseDetail;
const originalEnrollCourse = API.enrollCourse;
const originalGetLessons = API.getLessons;
const originalGetLessonDetail = API.getLessonDetail;
const originalGetUserEnrolledCourses = API.getUserEnrolledCourses;

// Bổ sung khóa học vào danh mục, nhưng không tạo bản trùng nếu backend đã có.
API.getCourses = async () => {
    const response = await originalGetCourses();
    const backendCourses = response.success && Array.isArray(response.data) ? response.data : [];
    const courseExists = backendCourses.some(course => String(course.id) === WEB_DESIGN_COURSE_ID);

    return {
        success: true,
        data: courseExists ? backendCourses : [...backendCourses, WEB_DESIGN_COURSE]
    };
};

// Trả về chi tiết khóa học mới ngay trên frontend.
API.getCourseDetail = async (courseId) => {
    if (String(courseId) === WEB_DESIGN_COURSE_ID) {
        return { success: true, data: WEB_DESIGN_COURSE };
    }
    return await originalGetCourseDetail(courseId);
};

// Trả về đề cương của khóa học mới.
API.getLessons = async (courseId) => {
    if (String(courseId) === WEB_DESIGN_COURSE_ID) {
        return { success: true, data: WEB_DESIGN_LESSONS };
    }
    return await originalGetLessons(courseId);
};

// Trả về chi tiết từng bài học của khóa học mới.
API.getLessonDetail = async (lessonId) => {
    const lesson = WEB_DESIGN_LESSONS.find(item => String(item.id) === String(lessonId));
    if (lesson) {
        return { success: true, data: lesson };
    }
    return await originalGetLessonDetail(lessonId);
};

// Với khóa học miễn phí, ghi danh được lưu tạm bằng localStorage.
API.enrollCourse = async (userId, courseId) => {
    if (String(courseId) === WEB_DESIGN_COURSE_ID) {
        const storageKey = `enrolled_courses_${userId}`;
        const enrolledIds = JSON.parse(localStorage.getItem(storageKey) || '[]');

        if (!enrolledIds.includes(WEB_DESIGN_COURSE_ID)) {
            enrolledIds.push(WEB_DESIGN_COURSE_ID);
            localStorage.setItem(storageKey, JSON.stringify(enrolledIds));
        }

        return {
            success: true,
            data: { user_id: userId, course_id: WEB_DESIGN_COURSE_ID }
        };
    }
    return await originalEnrollCourse(userId, courseId);
};

// Ghép khóa học đã đăng ký cục bộ với danh sách từ backend.
API.getUserEnrolledCourses = async (userId) => {
    const response = await originalGetUserEnrolledCourses(userId);
    const backendCourses = response.success && Array.isArray(response.data) ? response.data : [];
    const storageKey = `enrolled_courses_${userId}`;
    const localEnrolledIds = JSON.parse(localStorage.getItem(storageKey) || '[]');

    const hasLocalWebCourse = localEnrolledIds.includes(WEB_DESIGN_COURSE_ID);
    const alreadyInBackend = backendCourses.some(course => String(course.id) === WEB_DESIGN_COURSE_ID);

    return {
        success: true,
        data: hasLocalWebCourse && !alreadyInBackend
            ? [...backendCourses, WEB_DESIGN_COURSE]
            : backendCourses
    };
};
