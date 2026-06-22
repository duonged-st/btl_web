document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    if (!loginForm) {
        console.error('Không tìm thấy form đăng nhập (#login-form)');
        return;
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username || !password) {
            alert('Vui lòng điền đầy đủ tên đăng nhập và mật khẩu.');
            return;
        }

        // Vô hiệu hóa form và hiển thị trạng thái đang xử lý
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Đang đăng nhập...';

        try {
            const response = await API.login(username, password);

            if (response.success && response.data && response.data.user) {
                const user = response.data.user;
                
                // Lưu trạng thái đăng nhập vào localStorage
                localStorage.setItem('userId', user.id);
                localStorage.setItem('username', user.username);
                localStorage.setItem('name', user.name);

                alert('Đăng nhập thành công!');
                // Quay lại trang chủ
                window.location.href = '../index.html';
            } else {
                alert('Đăng nhập thất bại: ' + (response.error || 'Tên đăng nhập hoặc mật khẩu không chính xác.'));
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        } catch (error) {
            console.error('Lỗi khi đăng nhập:', error);
            alert('Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
});
