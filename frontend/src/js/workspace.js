document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('id');

    if (!courseId) {
        alert('Không tìm thấy thông tin khóa học!');
        return;
    }

    const courseTitleEl = document.getElementById('workspace-course-title');
    const mainVideoPlayer = document.getElementById('main-video-player');
    const currentLessonTitleEl = document.getElementById('current-lesson-title');
    const progressCountEl = document.getElementById('lesson-progress-count');
    const lessonListContainer = document.getElementById('workspace-lesson-list');

    let allLessons = [];
    let currentLessonId = null;

    // Lấy danh sách bài học đã xem từ localStorage
    const storageKey = `viewed_lessons_${courseId}`;
    let viewedLessonIds = JSON.parse(localStorage.getItem(storageKey)) || [];

    // 1. Tải thông tin khóa học
    async function loadCourseInfo() {
        const response = await API.getCourseDetail(courseId);
        if (response.success && response.data) {
            courseTitleEl.textContent = response.data.title;
        } else {
            console.error('Không thể tải thông tin khóa học:', response.error);
        }
    }

    // 2. Tải danh sách bài học và hiển thị
    async function loadLessons() {
        const response = await API.getLessons(courseId);
        if (response.success && response.data) {
            allLessons = response.data;
            if (allLessons.length === 0) {
                lessonListContainer.innerHTML = '<p class="loading-text" style="padding: 1rem;">Khóa học này chưa có bài học nào.</p>';
                currentLessonTitleEl.textContent = 'Chưa có bài học';
                progressCountEl.textContent = '0/0 bài';
                return;
            }
            
            // Sắp xếp bài học theo thứ tự lesson_order
            allLessons.sort((a, b) => (a.lesson_order || 0) - (b.lesson_order || 0));

            renderLessons();
            updateProgress();

            // Tự động phát bài đầu tiên nếu chưa chọn bài nào
            if (allLessons.length > 0) {
                playLesson(allLessons[0].id);
            }
        } else {
            lessonListContainer.innerHTML = '<p class="loading-text" style="padding: 1rem; color: red;">Lỗi tải bài học.</p>';
            console.error('Không thể tải danh sách bài học:', response.error);
        }
    }

    // 3. Hiển thị danh sách bài học trên sidebar
    function renderLessons() {
        lessonListContainer.innerHTML = '';
        allLessons.forEach((lesson, index) => {
            const isCompleted = viewedLessonIds.includes(lesson.id);
            const isActive = lesson.id === currentLessonId;

            const btn = document.createElement('button');
            btn.className = `workspace-lesson-item ${isActive ? 'active-lesson' : ''}`;
            
            // Icon trạng thái (đã học hay chưa)
            const icon = isCompleted 
                ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="color: #22c55e; flex-shrink: 0;"><path d="M20 6 9 17l-5-5"/></svg>' 
                : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5; flex-shrink: 0;"><polygon points="6 3 20 12 6 21 6 3"/></svg>';

            btn.innerHTML = `
                <span style="display: flex; align-items: center; justify-content: center; margin-right: 0.5rem; flex-shrink: 0;">${icon}</span>
                <span style="flex-grow: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: left;">Bài ${index + 1}: ${lesson.title}</span>
            `;

            btn.addEventListener('click', () => {
                playLesson(lesson.id);
            });

            lessonListContainer.appendChild(btn);
        });
    }

    // 4. Phát một bài học cụ thể
    async function playLesson(lessonId) {
        currentLessonId = lessonId;
        renderLessons(); // Cập nhật trạng thái active trên giao diện sidebar

        currentLessonTitleEl.textContent = 'Đang tải bài giảng...';
        mainVideoPlayer.src = '';

        const response = await API.getLessonDetail(lessonId);
        if (response.success && response.data) {
            const lesson = response.data;
            currentLessonTitleEl.textContent = lesson.title;
            
            // Đưa video_url vào player
            if (lesson.video_url) {
                mainVideoPlayer.src = lesson.video_url;
            } else {
                // Video demo mặc định nếu bài học không chứa link video
                mainVideoPlayer.src = 'https://www.w3schools.com/html/mov_bbb.mp4'; 
            }
            mainVideoPlayer.load();
            mainVideoPlayer.play().catch(err => {
                console.log('Tự động phát bị chặn bởi trình duyệt:', err);
            });
        } else {
            currentLessonTitleEl.textContent = 'Lỗi khi tải bài học!';
            console.error('Lỗi chi tiết bài học:', response.error);
        }
    }

    // 5. Cập nhật tiến độ học tập
    function updateProgress() {
        const currentCourseLessonIds = allLessons.map(l => l.id);
        const completedCount = viewedLessonIds.filter(id => currentCourseLessonIds.includes(id)).length;
        progressCountEl.textContent = `${completedCount}/${allLessons.length} bài`;
    }

    // 6. Xử lý khi xem hết video bài học
    mainVideoPlayer.addEventListener('ended', () => {
        if (currentLessonId && !viewedLessonIds.includes(currentLessonId)) {
            viewedLessonIds.push(currentLessonId);
            localStorage.setItem(storageKey, JSON.stringify(viewedLessonIds));
            updateProgress();
            renderLessons();
        }

        // Tự động chuyển sang bài tiếp theo trong danh sách
        const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
        if (currentIndex !== -1 && currentIndex < allLessons.length - 1) {
            const nextLesson = allLessons[currentIndex + 1];
            setTimeout(() => {
                playLesson(nextLesson.id);
            }, 1000); // Đợi 1 giây rồi tự chuyển bài
        }
    });

    // Bắt đầu tải dữ liệu
    loadCourseInfo();
    loadLessons();
});
