const requireAuth = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: 'Vui lòng đăng nhập để thực hiện thao tác này.' });
    }

    // Kiểm tra nếu request yêu cầu ID người dùng cụ thể, ID đó phải khớp với Session
    const requestUserId = Number(req.params.userId || req.body.user_id);
    if (requestUserId && requestUserId !== req.session.userId) {
        return res.status(403).json({ message: 'Bạn không có quyền thao tác trên dữ liệu của người khác.' });
    }

    next();
};

module.exports = { requireAuth };
