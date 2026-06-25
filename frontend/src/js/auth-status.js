document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('userId');
    const name = localStorage.getItem('name');
    const username = localStorage.getItem('username');
    // Xác định xem trang hiện tại có ở trong thư mục con hay không
    const isSubFolder = window.location.pathname.includes('/auth/');
    // Đường dẫn tương đối dựa theo cấu trúc thư mục
    const loginPath = isSubFolder ? 'login.html' : 'auth/login.html';
    const registerPath = isSubFolder ? 'register.html' : 'auth/register.html';
    const homePath = isSubFolder ? '../index.html' : 'index.html';
    // 1. Kiểm tra quyền truy cập các trang riêng tư (Route Guard)
    const isProtectedPage = 
        window.location.pathname.endsWith('learning.html') || 
        window.location.pathname.endsWith('checkout.html');
    if (isProtectedPage && !userId) {
        alert('Vui lòng đăng nhập để tiếp tục học tập hoặc thanh toán.');
        window.location.href = loginPath;
        return;
    }
    // 2. Cập nhật thanh điều hướng (Navbar Header)
    const userNavContainer = document.querySelector('.user-navigation');
    if (userNavContainer) {
        if (userId && name) {
            // Trường hợp: ĐÃ đăng nhập
            const avatarChar = name.charAt(0).toUpperCase();
            userNavContainer.innerHTML = `
                <div id="user-profile" class="user-profile">
                    <div id="user-avatar" class="user-avatar">${avatarChar}</div>
                    <div class="user-info-text">
                        <div id="user-name" class="user-name">${name}</div>
                    </div>
                    <button id="btn-logout" class="button btn-logout">
                        Đăng xuất
                    </button>
                </div>
            `;
            // Gắn sự kiện đăng xuất
            const logoutBtn = document.getElementById('btn-logout');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', async () => {
                    try {
                        if (typeof API !== 'undefined' && API.logout) {
                            await API.logout();
                        }
                    } catch (e) {
                        console.error('Lỗi khi gọi API logout:', e);
                    }
                    localStorage.removeItem('userId');
                    localStorage.removeItem('name');
                    localStorage.removeItem('username');
                    alert('Bạn đã đăng xuất thành công.');
                    // Chuyển về trang chủ
                    window.location.href = homePath;
                });
            }
        } else {
            // Trường hợp: CHƯA đăng nhập
            userNavContainer.innerHTML = `
                <div class="user-nav-actions">
                    <a href="${loginPath}" class="button button-login">Đăng nhập</a>
                    <a href="${registerPath}" class="button button-register">Đăng ký</a>
                </div>
            `;
        }
    }
});
