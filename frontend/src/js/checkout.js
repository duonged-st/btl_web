document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    let courseId = urlParams.get('id');
    if (!courseId) {
        const coursesRes = await API.getCourses();
        if (coursesRes.success && coursesRes.data && coursesRes.data.length > 0) {
            UIUtils.showCourseSelectionModal(coursesRes.data, 'checkout.html', 'Vui lòng chọn khóa học để thanh toán');
        } else {
            alert('Không tìm thấy thông tin khóa học cần thanh toán!');
        }
        return;
    }
    // Gọi API.getMe() để lấy userId thay vì localStorage
    let userId = null;
    try {
        const userRes = await API.getMe();
        if (userRes.success && userRes.data) {
            userId = userRes.data.id;
        }
    } catch (e) {}
    if (!userId) {
        window.location.href = 'auth/login.html';
        return;
    }
    const checkoutTitle = document.getElementById('checkout-title');
    const checkoutThumbnail = document.getElementById('checkout-thumbnail');
    const subtotalPrice = document.getElementById('subtotal-price');
    const totalPrice = document.getElementById('total-price');
    const paymentCode = document.getElementById('payment-code');
    const btnConfirmPayment = document.getElementById('btn-confirm-payment');
    let courseData = null;
    // 1. Tải thông tin đơn hàng khóa học
    async function loadOrderInfo() {
        const response = await API.getCourseDetail(courseId);
        if (response.success && response.data) {
            courseData = response.data;
            renderOrderInfo();
        } else {
            console.error('Không thể tải thông tin thanh toán khóa học:', response.error);
            alert('Lỗi tải dữ liệu thanh toán.');
        }
    }
    // 2. Điền thông tin lên giao diện
    function renderOrderInfo() {
        checkoutTitle.textContent = courseData.title;
        
        if (courseData.thumbnail) {
            checkoutThumbnail.src = courseData.thumbnail;
        }
        const formattedPrice = courseData.price.toLocaleString('vi-VN') + ' đ';
        subtotalPrice.textContent = formattedPrice;
        totalPrice.textContent = formattedPrice;
        // Tạo nội dung chuyển khoản động theo định dạng RECODE_[USER_ID]_[COURSE_ID]
        paymentCode.textContent = `RECODE_${userId}_${courseId}`;
    }
    // 3. Xác nhận đã chuyển khoản
    async function handlePaymentConfirmation() {
        btnConfirmPayment.disabled = true;
        btnConfirmPayment.textContent = 'Đang kiểm tra giao dịch...';
        // Gọi API enroll để chính thức ghi nhận người dùng đã đăng ký khóa học
        const response = await API.enrollCourse(courseId);
        btnConfirmPayment.disabled = false;
        btnConfirmPayment.textContent = 'Tôi đã hoàn thành thanh toán';
        if (response.success) {
            alert('Xác nhận thanh toán thành công! Hệ thống đã ghi danh bạn vào khóa học này.');
            window.location.href = `learning.html?id=${courseId}`;
        } else {
            alert('Xác thực giao dịch thất bại: ' + (response.error || 'Vui lòng kiểm tra lại.'));
        }
    }
    // Gắn sự kiện click vào nút xác nhận
    btnConfirmPayment.addEventListener('click', handlePaymentConfirmation);
    // Khởi chạy
    loadOrderInfo();
});