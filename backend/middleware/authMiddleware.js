const requireAuth = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: 'Vui lòng đăng nhập để thực hiện thao tác này.' });
    }
    next();
};
const requireAdmin = (req, res, next) => {
    if (!req.session || !req.session.userId || req.session.userRole !== 'admin') {
        return res.status(403).json({ message: 'Bạn không có quyền quản trị.' });
    }
    next();
};
module.exports = { requireAuth, requireAdmin };