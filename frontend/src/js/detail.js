document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('id');

    if (!courseId) {
        alert('Không tìm thấy thông tin khóa học!');
        return;
    }

    // Lấy userId của học viên từ localStorage
    const userId = localStorage.getItem('userId');

    const detailTitle = document.getElementById('detail-title');
    const detailDesc = document.getElementById('detail-desc');
    const detailThumbnail = document.getElementById('detail-thumbnail');
    const detailPrice = document.getElementById('detail-price');
    const btnAction = document.getElementById('btn-action');
    const lessonPreviewList = document.getElementById('lesson-preview-list');

    let courseData = null;

    // 1. Tải thông tin chi tiết khóa học
    async function fetchCourseDetails() {
        const response = await API.getCourseDetail(courseId);
        if (response.success && response.data) {
            courseData = response.data;
            renderCourseDetails();
            checkEnrollmentStatus();
        } else {
            console.error('Không thể tải chi tiết khóa học:', response.error);
            alert('Lỗi tải dữ liệu khóa học.');
        }
    }

    // 2. Tải danh sách bài giảng để hiển thị đề cương học tập
    async function fetchCurriculum() {
        const response = await API.getLessons(courseId);
        if (response.success && response.data) {
            const lessons = response.data;
            lessonPreviewList.innerHTML = '';
            
            if (lessons.length === 0) {
                lessonPreviewList.innerHTML = '<p class="loading-text" style="font-size: 0.875rem;">Đề cương khóa học đang được cập nhật.</p>';
                return;
            }

            // Sắp xếp bài giảng theo thứ tự bài học
            lessons.sort((a, b) => (a.lesson_order || 0) - (b.lesson_order || 0));

            lessons.forEach((lesson, index) => {
                const item = document.createElement('button');
                item.type = 'button';
                item.className = 'lesson-preview-item';
                item.setAttribute('aria-pressed', 'false');

                item.innerHTML = `
                    <span class="lesson-preview-main">
                        <span class="lesson-preview-number">${index + 1}</span>
                        <span class="lesson-preview-title">Bài ${index + 1}: ${lesson.title}</span>
                    </span>
                    <span class="lesson-preview-status">Chọn bài</span>
                `;

                // [THÊM MỚI] Khi bấm vào một bài:
                // 1. Bỏ trạng thái được chọn ở tất cả bài khác.
                // 2. Đánh dấu bài vừa bấm là bài đang được chọn.
                // 3. Đổi chữ "Chọn bài" thành "Đã chọn".
                item.addEventListener('click', () => {
                    const allLessonItems =
                        lessonPreviewList.querySelectorAll('.lesson-preview-item');

                    allLessonItems.forEach(lessonItem => {
                        lessonItem.classList.remove('selected');
                        lessonItem.setAttribute('aria-pressed', 'false');

                        const status =
                            lessonItem.querySelector('.lesson-preview-status');

                        if (status) {
                            status.textContent = 'Chọn bài';
                        }
                    });

                    item.classList.add('selected');
                    item.setAttribute('aria-pressed', 'true');

                    const selectedStatus =
                        item.querySelector('.lesson-preview-status');

                    if (selectedStatus) {
                        selectedStatus.textContent = 'Đã chọn ✓';
                    }
                });

                lessonPreviewList.appendChild(item);
            });
        } else {
            console.error('Không thể tải đề cương bài giảng:', response.error);
        }
    }

    // 3. Hiển thị thông tin khóa học lên HTML
    function renderCourseDetails() {
        detailTitle.textContent = courseData.title;
        detailDesc.textContent = courseData.description || 'Chưa có mô tả chi tiết cho khóa học này.';
        
        if (courseData.thumbnail) {
            detailThumbnail.src = courseData.thumbnail;
        }

        if (courseData.price === 0) {
            detailPrice.textContent = 'Miễn phí';
        } else {
            detailPrice.textContent = courseData.price.toLocaleString('vi-VN') + ' đ';
        }
    }

    // 4. Kiểm tra trạng thái đăng ký và thiết lập hành động cho Button
    async function checkEnrollmentStatus() {
        let isEnrolled = false;

        if (userId) {
            btnAction.disabled = true;
            btnAction.textContent = 'Đang kiểm tra...';

            const response = await API.getEnrolledCourses(userId);
            btnAction.disabled = false;

            if (response.success && response.data) {
                // Kiểm tra xem ID khóa học này đã nằm trong danh sách đăng ký chưa
                isEnrolled = response.data.some(course => course.id == courseId);
            }
        }

        if (isEnrolled) {
            // Trường hợp 1: Đã đăng ký rồi -> Vào học ngay
            btnAction.textContent = 'Vào học ngay';
            btnAction.style.backgroundColor = '#22c55e'; // Màu xanh lá biểu thị trạng thái đã mua
            
            btnAction.addEventListener('click', () => {
                window.location.href = `learning.html?id=${courseId}`;
            });
        } else {
            // Trường hợp 2: Chưa đăng ký
            if (!userId) {
                // Chưa đăng nhập -> Yêu cầu đăng nhập trước
                btnAction.textContent = 'Đăng nhập để đăng ký học';
                btnAction.addEventListener('click', () => {
                    window.location.href = 'auth/login.html';
                });
            } else if (courseData.price === 0) {
                // Khóa học miễn phí -> Đăng ký trực tiếp
                btnAction.textContent = 'Đăng ký học ngay (Miễn phí)';
                btnAction.addEventListener('click', enrollFreeCourse);
            } else {
                // Khóa học trả phí -> Chuyển hướng sang trang thanh toán Checkout
                btnAction.textContent = 'Đăng ký học ngay';
                btnAction.addEventListener('click', () => {
                    window.location.href = `checkout.html?id=${courseId}`;
                });
            }
        }
    }

    // 5. Đăng ký trực tiếp cho khóa học miễn phí
    async function enrollFreeCourse() {
        if (!userId) {
            window.location.href = 'auth/login.html';
            return;
        }

        btnAction.disabled = true;
        btnAction.textContent = 'Đang xử lý đăng ký...';

        const response = await API.enrollCourse(userId, courseId);
        btnAction.disabled = false;

        if (response.success) {
            alert('Đăng ký khóa học thành công! Chúc bạn học tập tốt.');
            window.location.href = `learning.html?id=${courseId}`;
        } else {
            alert('Đăng ký thất bại: ' + (response.error || 'Vui lòng thử lại sau.'));
            btnAction.textContent = 'Đăng ký học ngay (Miễn phí)';
        }
    }

    // Khởi chạy
    fetchCourseDetails();
    fetchCurriculum();
});
