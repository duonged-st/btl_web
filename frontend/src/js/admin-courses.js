// js/admin-courses.js
document.addEventListener('DOMContentLoaded', () => {
    fetchCourses();
    loadImagesDropdown();
    
    document.getElementById('btn-add-course').addEventListener('click', () => {
        openCourseModal('add');
    });
    
    document.getElementById('course-thumbnail').addEventListener('change', function() {
        const preview = document.getElementById('course-thumbnail-preview');
        if (this.value) {
            preview.src = this.value;
            preview.style.display = 'block';
        } else {
            preview.style.display = 'none';
        }
    });

    document.getElementById('course-form').addEventListener('submit', handleCourseSubmit);
    document.getElementById('lesson-form').addEventListener('submit', handleLessonSubmit);
});

async function loadImagesDropdown() {
    try {
        const select = document.getElementById('course-thumbnail');
        select.innerHTML = '<option value="">-- Không chọn ảnh --</option>';
        const response = await fetch(`${API_BASE_URL}/images`);
        if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
                result.data.forEach(img => {
                    const opt = document.createElement('option');
                    opt.value = `images/${img}`;
                    opt.textContent = img;
                    select.appendChild(opt);
                });
            }
        }
    } catch (e) {
        console.error('Lỗi tải danh sách ảnh', e);
    }
}

// --- QUẢN LÝ KHÓA HỌC ---

async function fetchCourses() {
    try {
        const response = await fetch(`${API_BASE_URL}/courses`);
        if (!response.ok) throw new Error('Không thể tải danh sách khóa học');
        const courses = await response.json();
        renderCourseTable(courses);
    } catch (error) {
        console.error('Lỗi fetchCourses:', error);
        alert('Lỗi tải danh sách khóa học.');
    }
}
// Hàm render danh sách khóa học ra table
function renderCourseTable(courses) {
    const tbody = document.getElementById('course-table-body');
    tbody.innerHTML = '';

    if (courses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Chưa có khóa học nào.</td></tr>';
        return;
    }

    courses.forEach(course => {
        const priceText = course.price > 0 ? course.price.toLocaleString('vi-VN') + ' đ' : 'Miễn phí';
        const tr = document.createElement('tr');
        const imgSrc = (course.thumbnail && course.thumbnail.trim() !== '') ? course.thumbnail : 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=100';
        tr.innerHTML = `
            <td>${course.id}</td>
            <td><img src="${imgSrc}" style="width: 80px; height: 50px; object-fit: cover; border-radius: 4px;"></td>
            <td><strong>${course.title}</strong></td>
            <td>${priceText}</td>
            <td>
                <button class="action-btn btn-manage" onclick="openLessonModal(${course.id}, '${course.title.replace(/'/g, "\\'")}')">Bài Học</button>
                <button class="action-btn btn-edit" onclick="openCourseModal('edit', ${course.id})">Sửa</button>
                <button class="action-btn btn-delete" onclick="deleteCourse(${course.id})">Xóa</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}
async function openCourseModal(mode, courseId = null) {
    const modal = document.getElementById('course-modal');
    const titleEl = document.getElementById('course-modal-title');
    const form = document.getElementById('course-form');   
    form.reset();
    document.getElementById('course-id').value = '';
    if (mode === 'edit' && courseId) {
        titleEl.textContent = 'Sửa Khóa Học';
        try {
            const response = await fetch(`${API_BASE_URL}/courses/${courseId}`);
            const course = await response.json();
            document.getElementById('course-id').value = course.id;
            document.getElementById('course-title').value = course.title;
            document.getElementById('course-description').value = course.description;
            document.getElementById('course-price').value = course.price;
            
            const thumbSelect = document.getElementById('course-thumbnail');
            if (course.thumbnail) {
                thumbSelect.value = course.thumbnail;
            } else {
                thumbSelect.value = '';
            }
            thumbSelect.dispatchEvent(new Event('change'));
        } catch (error) {
            console.error('Lỗi khi lấy thông tin khóa học:', error);
        }
    } else {
        titleEl.textContent = 'Thêm Khóa Học Mới';
    }
    modal.classList.add('active');
}
function closeCourseModal() {
    document.getElementById('course-modal').classList.remove('active');
}
async function handleCourseSubmit(e) {
    e.preventDefault();
    const courseId = document.getElementById('course-id').value;
    const courseData = {
        title: document.getElementById('course-title').value,
        description: document.getElementById('course-description').value,
        price: Number(document.getElementById('course-price').value),
        thumbnail: document.getElementById('course-thumbnail').value
    };
    const isEdit = !!courseId;
    const url = isEdit ? `${API_BASE_URL}/courses/${courseId}` : `${API_BASE_URL}/courses`;
    const method = isEdit ? 'PUT' : 'POST';
    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(courseData)
        });
        if (response.ok) {
            alert(isEdit ? 'Cập nhật thành công!' : 'Thêm khóa học thành công!');
            closeCourseModal();
            fetchCourses(); 
        } else {
            const resData = await response.json();
            alert(resData.message || 'Có lỗi xảy ra.');
        }
    } catch (error) {
        console.error('Lỗi submit khóa học:', error);
    }
}
async function deleteCourse(courseId) {
    if (!confirm('Bạn có chắc chắn muốn xóa khóa học này? Mọi bài học bên trong cũng sẽ bị xóa (nếu DB đã set cascade).')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            alert('Xóa khóa học thành công.');
            fetchCourses();
        } else {
            alert('Xóa thất bại.');
        }
    } catch (error) {
        console.error('Lỗi khi xóa:', error);
    }
}
// --- QUẢN LÝ BÀI HỌC ---
async function openLessonModal(courseId, courseTitle) {
    const modal = document.getElementById('lesson-modal');
    document.getElementById('lesson-modal-title').textContent = `Bài Học: ${courseTitle}`;
    document.getElementById('lesson-course-id').value = courseId;
    // reset form thêm bài
    document.getElementById('lesson-form').reset();
    await fetchLessonsForCourse(courseId);
    modal.classList.add('active');
}
function closeLessonModal() {
    document.getElementById('lesson-modal').classList.remove('active');
}
async function fetchLessonsForCourse(courseId) {
    const container = document.getElementById('lesson-list-container');
    container.innerHTML = '<li>Đang tải...</li>';   
    try {
        const response = await fetch(`${API_BASE_URL}/courses/${courseId}/lessons`);
        if (!response.ok) throw new Error('Failed to fetch');
        const lessons = await response.json();
        container.innerHTML = '';
        if (lessons.length === 0) {
            container.innerHTML = '<li>Chưa có bài học nào.</li>';
            return;
        }
        lessons.forEach(lesson => {
            const li = document.createElement('li');
            li.className = 'lesson-item';
            li.innerHTML = `
                <div class="lesson-item-title">
                    <strong>Bài ${lesson.lesson_order}:</strong> ${lesson.title}
                </div>
                <button class="action-btn btn-delete" onclick="deleteLesson(${lesson.id}, ${courseId})">Xóa</button>
            `;
            container.appendChild(li);
        });
    } catch (error) {
        console.error('Lỗi tải bài học:', error);
        container.innerHTML = '<li>Lỗi tải bài học.</li>';
    }
}
async function handleLessonSubmit(e) {
    e.preventDefault();
    const courseId = document.getElementById('lesson-course-id').value;
    const lessonData = {
        course_id: Number(courseId),
        title: document.getElementById('lesson-title').value,
        video_url: document.getElementById('lesson-video-url').value,
        lesson_order: Number(document.getElementById('lesson-order').value)
    };
    try {
        const response = await fetch(`${API_BASE_URL}/lessons`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lessonData)
        });
        if (response.ok) {
            document.getElementById('lesson-form').reset();
            fetchLessonsForCourse(courseId); 
        } else {
            alert('Thêm bài học thất bại.');
        }
    } catch (error) {
        console.error('Lỗi khi thêm bài học:', error);
    }
}
async function deleteLesson(lessonId, courseId) {
    if (!confirm('Bạn có chắc muốn xóa bài học này?')) return;
    try {
        const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            fetchLessonsForCourse(courseId); 
        } else {
            alert('Xóa bài học thất bại.');
        }
    } catch (error) {
        console.error('Lỗi khi xóa bài học:', error);
    }
}
