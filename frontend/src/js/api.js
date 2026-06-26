// 1. CẤU HÌNH CƠ BẢN (CONFIGURATION)
const API_BASE_URL = 'http://localhost:3000/api';
// 2. HÀM LÕI XỬ LÝ FETCH (CORE FETCH WRAPPER)
async function fetchAPI(endpoint, method = 'GET', body = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
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
    enrollCourse: async (courseId) => await fetchAPI('/enroll', 'POST', {
        course_id: courseId
    }),
    // --- CHỨC NĂNG 3: KHÔNG GIAN HỌC TẬP ---
    getLessons: async (courseId) => await fetchAPI(`/courses/${courseId}/lessons`, 'GET'),
    getLessonDetail: async (lessonId) => await fetchAPI(`/lessons/${lessonId}`, 'GET'),
    // --- CHỨC NĂNG 4: NGƯỜI DÙNG & HỒ SƠ ---
    getUserProfile: async (userId) => await fetchAPI(`/users/${userId}`),
    getUserEnrolledCourses: async () => await fetchAPI(`/enroll/user`),
    getEnrolledCourses: async () => await fetchAPI(`/enroll/user`),
    // --- CHỨC NĂNG 5: XÁC THỰC (AUTHENTICATION) ---
    getMe: async () => await fetchAPI('/auth/me'),
    login: async (username, password) => await fetchAPI('/auth/login', 'POST', {
        username: username,
        password: password
    }),
    register: async (name, username, password) => await fetchAPI('/auth/register', 'POST', {
        name: name,
        username: username,
        password: password
    }),
    logout: async () => await fetchAPI('/auth/logout', 'POST'),
    // --- CHỨC NĂNG 6: TIẾN ĐỘ HỌC TẬP ---
    getLessonProgress: async (courseId) => await fetchAPI(`/progress/${courseId}`, 'GET'),
    markLessonCompleted: async (courseId, lessonId) => await fetchAPI('/progress/complete', 'POST', {
        course_id: courseId,
        lesson_id: lessonId
    })
};

// 4. TIỆN ÍCH UI CHUNG
const UIUtils = {
    showCourseSelectionModal: (courses, baseUrl, title = 'Vui lòng chọn một khóa học') => {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.style.zIndex = '9999';
        const content = document.createElement('div');
        content.className = 'modal-content';
        content.style.width = '500px';
        const header = document.createElement('h3');
        header.textContent = title;
        header.style.marginBottom = '20px';
        const list = document.createElement('ul');
        list.className = 'lesson-list';
        list.style.maxHeight = '60vh';
        list.style.overflowY = 'auto';
        courses.forEach(c => {
            const li = document.createElement('li');
            li.className = 'lesson-item';
            li.style.cursor = 'pointer';
            li.style.transition = 'background-color 0.2s';
            li.onmouseover = () => li.style.backgroundColor = 'var(--bg-gray-50)';
            li.onmouseout = () => li.style.backgroundColor = '';
            const priceText = c.price !== undefined ? (c.price === 0 ? 'Miễn phí' : c.price.toLocaleString('vi-VN') + ' đ') : '';
            li.innerHTML = `
                <div style="display: flex; align-items: center; gap: 15px; width: 100%;">
                    ${c.thumbnail ? `<img src="${c.thumbnail}" style="width: 60px; height: 40px; object-fit: cover; border-radius: 4px;">` : ''}
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: var(--text-gray-900);">${c.title}</div>
                        ${priceText ? `<div style="font-size: 12px; color: var(--blue-600);">${priceText}</div>` : ''}
                    </div>
                </div>
            `;
            li.onclick = () => {
                window.location.href = `${baseUrl}?id=${c.id}`;
            };
            list.appendChild(li);
        });
        content.appendChild(header);
        content.appendChild(list);
        const closeBtn = document.createElement('button');
        closeBtn.className = 'btn-cancel';
        closeBtn.textContent = 'Quay về trang chủ';
        closeBtn.style.marginTop = '20px';
        closeBtn.style.width = '100%';
        closeBtn.onclick = () => window.location.href = 'index.html';
        content.appendChild(closeBtn);
        modal.appendChild(content);
        document.body.appendChild(modal);
    }
};
