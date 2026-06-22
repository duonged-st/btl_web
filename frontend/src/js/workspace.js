document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    let courseIdParam = urlParams.get('id');
    
    const storedUserId = Number(localStorage.getItem('userId'));
    const userId = Number.isInteger(storedUserId) && storedUserId > 0 ? storedUserId : 1;

    let courseId = Number(courseIdParam);

    if (!Number.isInteger(courseId) || courseId <= 0) {
        const enrollResponse = await API.getEnrolledCourses(userId);
        if (enrollResponse.success && enrollResponse.data && enrollResponse.data.length > 0) {
            UIUtils.showCourseSelectionModal(enrollResponse.data, 'learning.html', 'Vui lòng chọn khóa học bạn muốn học');
        } else {
            alert('Bạn chưa đăng ký khóa học nào!');
            window.location.href = 'index.html';
        }
        return;
    }

    // 1. Kiểm tra quyền học (người dùng đã đăng ký khóa học chưa)
    try {
        const enrollResponse = await API.getEnrolledCourses(userId);
        if (enrollResponse.success && enrollResponse.data) {
            const isEnrolled = enrollResponse.data.some(course => Number(course.id) === courseId);
            if (!isEnrolled) {
                alert('Bạn chưa đăng ký khóa học này!');
                window.location.href = `course-detail.html?id=${courseId}`;
                return;
            }
        } else {
            alert('Lỗi kiểm tra quyền truy cập khóa học.');
            window.location.href = 'index.html';
            return;
        }
    } catch (error) {
        console.error('Lỗi khi kiểm tra enroll:', error);
        alert('Không thể xác thực quyền truy cập.');
        window.location.href = 'index.html';
        return;
    }

    // Các phần tử DOM
    const courseTitleEl = document.getElementById('workspace-course-title');
    const mainVideoFrame = document.getElementById('main-video-frame');
    const videoStatusMessage = document.getElementById('video-status-message');
    const currentLessonTitleEl = document.getElementById('current-lesson-title');
    const currentLessonMetaEl = document.getElementById('current-lesson-meta');
    const progressCountEl = document.getElementById('lesson-progress-count');
    const lessonListContainer = document.getElementById('workspace-lesson-list');

    const btnPrev = document.getElementById('btn-prev-lesson');
    const btnNext = document.getElementById('btn-next-lesson');
    const btnMarkCompleted = document.getElementById('btn-mark-completed');

    let allLessons = [];
    let currentLessonId = null;
    let completedLessonIds = [];

    // Hàm tiện ích: Chuyển đổi link YouTube sang dạng embed
    function getYouTubeEmbedUrl(url) {
        if (!url) return '';
        let videoId = '';
        if (url.includes('youtube.com/watch?v=')) {
            videoId = url.split('v=')[1].split('&')[0];
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
        } else if (url.includes('youtube.com/embed/')) {
            return url;
        }
        return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
    }

    // 2. Tải thông tin khóa học
    async function loadCourseInfo() {
        const response = await API.getCourseDetail(courseId);
        if (response.success && response.data) {
            courseTitleEl.textContent = response.data.title;
            return true;
        } else {
            alert('Không thể tải thông tin khóa học.');
            window.location.href = 'index.html';
            return false;
        }
    }

    // 3. Tải tiến độ học tập
    async function loadProgress() {
        const response = await API.getLessonProgress(userId, courseId);
        if (response.success) {
            completedLessonIds = response.data.map(id => Number(id));
            return true;
        } else {
            if (response.error && response.error.includes('Người dùng chưa đăng ký')) {
                alert('Bạn chưa đăng ký khóa học này!');
                window.location.href = `course-detail.html?id=${courseId}`;
                return false;
            } else {
                alert('Không thể tải tiến độ học tập.');
                completedLessonIds = [];
                return true;
            }
        }
    }

    // 4. Tải danh sách bài học và hiển thị
    async function loadLessons() {
        const response = await API.getLessons(courseId);
        if (response.success && response.data) {
            allLessons = response.data;
            if (allLessons.length === 0) {
                lessonListContainer.innerHTML = '<p class="lesson-list-message">Khóa học này chưa có bài học nào.</p>';
                currentLessonTitleEl.textContent = 'Chưa có bài học';
                currentLessonMetaEl.textContent = 'Bài 0/0';
                progressCountEl.textContent = '0/0 bài';
                mainVideoFrame.src = '';
                mainVideoFrame.classList.add('hidden');
                videoStatusMessage.textContent = 'Khóa học này chưa có bài học nào.';
                videoStatusMessage.classList.remove('hidden');

                btnPrev.disabled = true;
                btnNext.disabled = true;
                btnMarkCompleted.disabled = true;
                return;
            }
            
            // Sắp xếp bài học theo thứ tự lesson_order
            allLessons.sort((a, b) => (a.lesson_order || 0) - (b.lesson_order || 0));

            renderLessons();
            updateProgressText();

            // Tìm bài đang học gần nhất hoặc mở bài đầu tiên
            let startLessonId = allLessons[0].id;
            for (let i = 0; i < allLessons.length; i++) {
                if (!completedLessonIds.includes(Number(allLessons[i].id))) {
                    startLessonId = allLessons[i].id;
                    break;
                }
            }
            playLesson(startLessonId);
        } else {
            lessonListContainer.innerHTML = '<p class="lesson-list-message error">Lỗi tải bài học.</p>';
        }
    }

    // 5. Hiển thị danh sách bài học trên sidebar
    function renderLessons() {
        lessonListContainer.innerHTML = '';
        allLessons.forEach((lesson, index) => {
            const isCompleted = completedLessonIds.includes(Number(lesson.id));
            const isActive = lesson.id === currentLessonId;

            const btn = document.createElement('button');
            btn.className = `workspace-lesson-item ${isActive ? 'active-lesson' : ''} ${isCompleted ? 'completed' : ''}`;
            
            const icon = isCompleted ? '✓' : '▶';

            const iconSpan = document.createElement('span');
            iconSpan.className = 'lesson-item-icon';
            iconSpan.textContent = icon;

            const titleSpan = document.createElement('span');
            titleSpan.className = 'lesson-item-title';
            titleSpan.textContent = `Bài ${index + 1}: ${lesson.title}`;

            btn.appendChild(iconSpan);
            btn.appendChild(titleSpan);

            btn.addEventListener('click', () => {
                playLesson(lesson.id);
            });

            lessonListContainer.appendChild(btn);
        });
    }

    // 6. Phát một bài học cụ thể
    async function playLesson(lessonId) {
        currentLessonId = lessonId;
        renderLessons(); // Cập nhật trạng thái active trên giao diện sidebar
        updateButtonStates();

        currentLessonTitleEl.textContent = 'Đang tải bài giảng...';
        currentLessonMetaEl.textContent = `Bài 0/0`;
        mainVideoFrame.src = '';
        mainVideoFrame.classList.add('hidden');
        videoStatusMessage.classList.add('hidden');

        const response = await API.getLessonDetail(lessonId);
        if (response.success && response.data) {
            const lesson = response.data;
            currentLessonTitleEl.textContent = lesson.title;
            const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
            currentLessonMetaEl.textContent = `Bài ${currentIndex + 1}/${allLessons.length}`;
            
            const embedUrl = getYouTubeEmbedUrl(lesson.video_url);
            if (embedUrl) {
                mainVideoFrame.src = embedUrl;
                mainVideoFrame.classList.remove('hidden');
            } else {
                videoStatusMessage.textContent = 'Bài học này chưa có video.';
                videoStatusMessage.classList.remove('hidden');
            }
        } else {
            currentLessonTitleEl.textContent = 'Lỗi khi tải bài học!';
            const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
            currentLessonMetaEl.textContent = `Bài ${currentIndex !== -1 ? currentIndex + 1 : 0}/${allLessons.length}`;
            videoStatusMessage.textContent = 'Không thể tải nội dung bài học.';
            videoStatusMessage.classList.remove('hidden');
            btnMarkCompleted.disabled = true;
        }
    }

    // 7. Cập nhật tiến độ text
    function updateProgressText() {
        const currentCourseLessonIds = allLessons.map(l => Number(l.id));
        const completedCount = completedLessonIds.filter(id => currentCourseLessonIds.includes(id)).length;
        progressCountEl.textContent = `${completedCount}/${allLessons.length} bài`;
    }

    // 8. Cập nhật trạng thái các nút điều hướng
    function updateButtonStates() {
        const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
        
        btnPrev.disabled = currentIndex <= 0;
        btnNext.disabled = currentIndex === -1 || currentIndex >= allLessons.length - 1;
        
        const isCompleted = completedLessonIds.includes(Number(currentLessonId));
        if (isCompleted) {
            btnMarkCompleted.textContent = 'Đã hoàn thành';
            btnMarkCompleted.disabled = true;
            btnMarkCompleted.classList.remove('btn-completed'); // Loại bỏ style nút nổi bật nếu đã học
        } else {
            btnMarkCompleted.textContent = 'Đánh dấu đã học';
            btnMarkCompleted.disabled = false;
            btnMarkCompleted.classList.add('btn-completed');
        }
    }

    // Sự kiện các nút
    btnPrev.addEventListener('click', () => {
        const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
        if (currentIndex > 0) {
            playLesson(allLessons[currentIndex - 1].id);
        }
    });

    btnNext.addEventListener('click', () => {
        const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
        if (currentIndex !== -1 && currentIndex < allLessons.length - 1) {
            playLesson(allLessons[currentIndex + 1].id);
        }
    });

    btnMarkCompleted.addEventListener('click', async () => {
        if (!currentLessonId) return;
        
        btnMarkCompleted.disabled = true;
        btnMarkCompleted.textContent = 'Đang lưu...';

        const response = await API.markLessonCompleted(userId, courseId, currentLessonId);
        
        if (response.success) {
            if (!completedLessonIds.includes(Number(currentLessonId))) {
                completedLessonIds.push(Number(currentLessonId));
            }
            updateProgressText();
            renderLessons();
            updateButtonStates();
        } else {
            alert('Lỗi khi lưu tiến độ: ' + response.error);
            btnMarkCompleted.disabled = false;
            btnMarkCompleted.textContent = 'Đánh dấu đã học';
        }
    });

    // Bắt đầu luồng
    const courseLoaded = await loadCourseInfo();
    if (!courseLoaded) return;

    const progressLoaded = await loadProgress();
    if (!progressLoaded) return;

    await loadLessons();
});
