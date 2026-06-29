
document.addEventListener('DOMContentLoaded', () => {
    // 1. Lấy các phần tử (Elements) từ giao diện HTML
    const courseGrid = document.getElementById('course-grid');
    const loadingState = document.getElementById('loading-state');
    const emptyState = document.getElementById('empty-state');
    const searchInput = document.getElementById('search-input');
    const filterPrice = document.getElementById('filter-price');
    let allCourses = [];
    // 2. Hàm lọc và hiển thị khóa học theo từ khóa và giá
    function applyFilters() {
        const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
        const priceFilter = filterPrice ? filterPrice.value : 'all';
        let filtered = allCourses;
        // Lọc theo từ khóa (tên hoặc mô tả)
        if (keyword) {
            filtered = filtered.filter(course =>
                course.title.toLowerCase().includes(keyword) ||
                (course.description && course.description.toLowerCase().includes(keyword))
            );
        }
        // Lọc theo giá
        if (priceFilter === 'free') {
            filtered = filtered.filter(course => course.price === 0);
        } else if (priceFilter === 'paid') {
            filtered = filtered.filter(course => course.price > 0);
        }
        if (filtered.length > 0) {
            renderCourses(filtered);
            courseGrid.style.display = 'grid';
            emptyState.classList.add('hidden');
        } else {
            courseGrid.innerHTML = '';
            courseGrid.style.display = 'none';
            emptyState.classList.remove('hidden');
        }
    }
    // 3. Hàm gọi API và hiển thị dữ liệu
    // Gọi API lấy danh sách khóa học và hiển thị lên màn hình.
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
    // Hàm vẽ HTML cho từng khóa học (Dùng biến JS truyền vào HTML template)
    function renderCourses(courses) {
        courseGrid.innerHTML = '';
        courses.forEach(course => {
            const courseCard = document.createElement('div');
            courseCard.className = 'course-card';
            const formattedPrice = course.price === 0
                ? 'Miễn phí'
                : Number(course.price).toLocaleString('vi-VN') + ' đ';
            courseCard.innerHTML = `
                <div class="course-thumbnail-wrapper">
                    <img
                        class="course-thumbnail"
                        src="${course.thumbnail || 'default-image.jpg'}"
                        alt="${course.title}"
                    >
                    <span class="course-badge ${course.price === 0 ? 'free' : ''}">
                        ${formattedPrice}
                    </span>
                </div>
                <div class="course-info">
                    <h3 class="course-title">${course.title}</h3>
                    <p class="course-desc">
                        ${course.description || 'Khóa học giúp bạn xây dựng kiến thức và kỹ năng thực tế.'}
                    </p>
                    <div class="course-footer course-footer-single">
                        <button
                            class="btn-course-detail"
                            onclick="window.location.href='course-detail.html?id=${course.id}'"
                        >
                            Xem chi tiết
                            <span aria-hidden="true">→</span>
                        </button>
                    </div>
                </div>
            `;
            courseGrid.appendChild(courseCard);
        });
    }
    // 4. Gắn sự kiện search (có debounce 300ms để không gọi liên tục)
    let debounceTimer;
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(applyFilters, 300);
        });
    }
    // 5. Gắn sự kiện filter giá (tức thì)
    if (filterPrice) {
        filterPrice.addEventListener('change', applyFilters);
    }
    fetchAndRenderCourses();
});