
document.addEventListener('DOMContentLoaded', () => {
    // 1. Lấy các phần tử (Elements) từ giao diện HTML
    const courseGrid = document.getElementById('course-grid');
    const loadingState = document.getElementById('loading-state');
    const emptyState = document.getElementById('empty-state');
    const searchInput = document.getElementById('search-input');
    const filterPrice = document.getElementById('filter-price');
    let allCourses = [];
    // 2. Hàm gọi API và hiển thị dữ liệu
    async function fetchAndRenderCourses() {
        loadingState.classList.remove('hidden');
        courseGrid.style.display = 'none';
        emptyState.classList.add('hidden');
        const response = await API.getCourses();
        loadingState.classList.add('hidden');
        if (response.success && response.data.length > 0) {
            allCourses = response.data;
            renderCourses(allCourses);
            courseGrid.style.display = 'grid';
        } else {
            emptyState.classList.remove('hidden');
            console.error(response.error || "Không có dữ liệu khóa học");
        }
    }
    // Hàm vẽ HTML cho từng khóa học
    function renderCourses(courses) {
        courseGrid.innerHTML = '';
        courses.forEach(course => {
            const courseCard = document.createElement('div');
            courseCard.className = 'course-card';
            courseCard.innerHTML = `
                <img src="${course.thumbnail || 'default-image.jpg'}" alt="${course.title}">
                <div class="course-info">
                    <h3>${course.title}</h3>
                    <p class="price">${course.price === 0 ? 'Miễn phí' : course.price + ' VNĐ'}</p>
                    <button onclick="window.location.href='course-detail.html?id=${course.id}'">
                        Xem chi tiết
                    </button>
                </div>
            `;
            courseGrid.appendChild(courseCard);
        });
    }
    fetchAndRenderCourses();
});