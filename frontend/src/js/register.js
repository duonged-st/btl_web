document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    if (!registerForm) {
        console.error('Không tìm thấy form đăng ký (#register-form)');
        return;
    }
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('name');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirm-password');
        const name = nameInput.value.trim();
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        if (!name || !username || !password || !confirmPassword) {
            alert('Vui lòng điền đầy đủ các thông tin yêu cầu.');
            return;
        }
        if (password.length < 6) {
            alert('Mật khẩu phải chứa ít nhất 6 ký tự.');
            return;
        }
        if (password !== confirmPassword) {
            alert('Mật khẩu xác nhận không trùng khớp.');
            return;
        }
        // Vô hiệu hóa form và hiển thị trạng thái đang xử lý
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Đang đăng ký tài khoản...';
        try {
            const response = await API.register(name, username, password);
            if (response.success && response.data && response.data.user) {
                const user = response.data.user;
                // Không cần lưu localStorage nữa vì đã dùng Session 100%
                alert('Đăng ký tài khoản thành công!');
                // Chuyển hướng về trang chủ
                window.location.href = '../index.html';
            } else {
                alert('Đăng ký thất bại: ' + (response.error || 'Có lỗi xảy ra. Vui lòng thử lại.'));
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        } catch (error) {
            console.error('Lỗi khi đăng ký:', error);
            alert('Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
});